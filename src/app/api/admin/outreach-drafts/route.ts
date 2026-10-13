import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { isOpenAIConfigured, openaiErrorMessage, withRetryAndFallback } from "@/lib/openai";
import { OutreachBriefSchema, OutreachSequenceSchema, outreachIssues } from "@/lib/outreach";
import { buildOutreachPrompt } from "@/lib/prompts/outreach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  const brief = OutreachBriefSchema.safeParse(await request.json().catch(() => null));
  if (!brief.success) return NextResponse.json({ error: "Provide an audience, language and public context." }, { status: 400, headers });
  if (!isOpenAIConfigured()) return NextResponse.json({ error: "Configure OpenAI before generating outreach drafts." }, { status: 503, headers });
  try {
    // Atomic per-admin budget; failed attempts count too, bounding provider cost.
    const ref = adminDb.collection("rateLimits").doc(`outreach:${uid}:${new Date().toISOString().slice(0, 10)}`);
    const allowed = await adminDb.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const count = snap.exists ? Number(snap.data()?.count ?? 0) : 0;
      if (count >= 20) return false;
      tx.set(ref, { count: count + 1, updatedAt: Date.now() }, { merge: true });
      return true;
    });
    if (!allowed) return NextResponse.json({ error: "Daily limit reached: 20 draft sequences per admin (UTC)." }, { status: 429, headers });
    const raw = await withRetryAndFallback(async model => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: buildOutreachPrompt(brief.data) }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1600, temperature: 0.5 },
      });
      return result.response.text();
    });
    const sequence = OutreachSequenceSchema.safeParse(JSON.parse(raw));
    if (!sequence.success || sequence.data.messages.some((message, index) => outreachIssues(message, index === 2 ? 40 : 75).length)) {
      return NextResponse.json({ error: "The drafts did not pass content checks. Refine the context and try again." }, { status: 422, headers });
    }
    return NextResponse.json(sequence.data, { headers });
  } catch (error) {
    return NextResponse.json({ error: openaiErrorMessage(error) }, { status: 502, headers });
  }
}
