import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { adminDb, adminStorage, verifySession } from "@/lib/firebase-admin";
import { buildExamIllustrationPrompt } from "@/lib/prompts/examIllustration";

export const runtime = "nodejs";
export const maxDuration = 180;
const ImageResponse = z.object({ data: z.array(z.object({ b64_json: z.string().min(1).max(20000000) })).min(1) });
const pending = new Map<string, Promise<Buffer>>();

/** Public reads reuse persisted illustrations; only signed-in teachers can incur generation costs. */
export async function GET(request: NextRequest) {
  const prompt = new URL(request.url).searchParams.get("prompt")?.trim();
  if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  if (prompt.length > 2000) return NextResponse.json({ error: "Prompt too long" }, { status: 413 });
  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2.5-sunburst";
  // Seed is deliberately excluded: old saved exams use random display IDs.
  const key = createHash("sha256").update(`v1:${model}:${prompt}`).digest("hex");
  try {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) return NextResponse.json({ error: "Illustration storage is not configured." }, { status: 503 });
    const file = adminStorage.bucket(bucketName).file(`exam-illustrations/${key}.png`);
    let buffer: Buffer;
    const [exists] = await file.exists();
    if (exists) [buffer] = await file.download();
    else {
      // Lax session cookies are sent on cross-site top-level navigations.
      // Public cache reads are safe, but a GET must not let another site incur cost.
      const site = request.headers.get("sec-fetch-site");
      const destination = request.headers.get("sec-fetch-dest");
      const requestOrigin = new URL(request.url).origin;
      const origins = [request.headers.get("origin"), request.headers.get("referer")].filter(Boolean);
      const foreignOrigin = origins.some(value => {
        try { return new URL(value!).origin !== requestOrigin; } catch { return true; }
      });
      const sameOriginEvidence = site === "same-origin" || (origins.length > 0 && !foreignOrigin);
      if (!sameOriginEvidence || (site && site !== "same-origin" && site !== "none") ||
          (destination && destination !== "image" && destination !== "empty") || foreignOrigin) {
        return NextResponse.json({ error: "Generate illustrations from the exam editor." }, { status: 403 });
      }
      const uid = await verifySession(request);
      if (!uid) return NextResponse.json({ error: "Sign in to generate this illustration." }, { status: 401 });
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (!apiKey) return NextResponse.json({ error: "Image generation is not configured." }, { status: 503 });
      let job = pending.get(key);
      if (!job) {
        job = (async () => {
          // Transactional daily budget across serverless invocations, not a process counter.
          const day = new Date().toISOString().slice(0, 10);
          const quota = adminDb.collection("rateLimits").doc(`exam-images:${uid}:${day}`);
          const allowed = await adminDb.runTransaction(async tx => {
            const snapshot = await tx.get(quota);
            const count = Number(snapshot.data()?.count ?? 0);
            if (count >= 20) return false;
            tx.set(quota, { count: count + 1, day, route: "exam-images", updatedAt: Date.now() }, { merge: true });
            return true;
          });
          if (!allowed) throw new Error("image_daily_limit");
          const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt: buildExamIllustrationPrompt(prompt), n: 1,
              size: "1536x1024", quality: "medium", output_format: "png" }),
            signal: AbortSignal.timeout(150000), cache: "no-store",
          });
          if (!response.ok) throw new Error("image_provider_failed");
          const parsed = ImageResponse.parse(await response.json());
          const image = Buffer.from(parsed.data[0].b64_json, "base64");
          if (!image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error("Invalid PNG");
          await file.save(image, { resumable: false, metadata: { contentType: "image/png", cacheControl: "public, max-age=31536000, immutable" } });
          return image;
        })();
        pending.set(key, job);
        void job.finally(() => pending.delete(key)).catch(() => {});
      }
      buffer = await job;
    }
    return new NextResponse(new Uint8Array(buffer), { headers: {
      "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    const limited = error instanceof Error && error.message === "image_daily_limit";
    console.warn("[/api/image/generate] Illustration unavailable.");
    return NextResponse.json({ error: limited ? "Daily illustration limit reached. Try again tomorrow." : "Could not load the illustration. Please retry." }, { status: limited ? 429 : 502 });
  }
}
