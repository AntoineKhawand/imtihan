import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback, geminiErrorMessage, isRetryableError } from "@/lib/gemini";
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from "@/lib/prompts/generate";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";
import { adminDb, verifySession } from "@/lib/firebase-admin";

const MONTHLY_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
const MONTHLY_LIMITS = { free: 2, pro: 100 } as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}

const ExamContextSchema = z.object({
  curriculumId: z.enum(["bac-libanais", "bac-francais", "ib", "university"]),
  levelId: z.string(),
  subject: z.enum([
    // Sciences
    "mathematics", "physics", "chemistry", "biology", "svt", "informatics", "nsi", "environmental-systems",
    // Humanities & Social Sciences
    "history", "geography", "history-geography", "philosophy", "civic-education",
    "economics", "ses", "sociology", "psychology", "global-politics", "law",
    // Languages
    "arabic", "french", "english", "spanish", "german",
    // Business & Management
    "accounting", "management", "business",
    // Arts
    "visual-arts", "music",
    // University / Professional
    "medicine", "engineering", "architecture", "nursing",
  ]),
  chapterIds: z.array(z.string()),
  language: z.enum(["french", "english", "arabic"]),
  examType: z.enum(["quiz", "homework", "midterm", "final", "practice"]),
  duration: z.number(),
  exerciseCount: z.number(),
  totalPoints: z.number(),
  difficultyMix: z.object({ easy: z.number(), medium: z.number(), hard: z.number() }),
  teacherNotes: z.string().optional(),
  generateVersionB: z.boolean().optional(),
});

const RequestSchema = z.object({
  context: ExamContextSchema,
  templateId: z.string().default("default"),
  documentBase64: z.string().optional(),
  documentMimeType: z.string().optional(),
});

/**
 * Extract the first JSON array or object from a string, string-aware so
 * brackets inside string literals don't throw off the depth counter.
 */
function extractJSON(raw: string): string {
  const stripped = raw.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  let start = -1;
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === "[" || stripped[i] === "{") { start = i; break; }
  }
  if (start === -1) return stripped;
  const open = stripped[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\" && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return stripped.slice(start, i + 1);
  }
  return stripped.slice(start);
}

/**
 * Walk the text char-by-char with string-awareness. Inside a string literal:
 * - escape raw newlines / tabs / carriage returns that must be \n \t \r in JSON
 * - escape lone backslashes that aren't part of a valid JSON escape sequence
 * - leave already-valid escapes alone
 * Outside a string literal, normalize smart quotes to regular quotes and
 * strip trailing commas before } or ].
 */
function sanitizeJSON(input: string): string {
  // Normalize smart quotes and non-breaking spaces globally first.
  let text = input
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/\u00A0/g, " ");

  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (!inString) {
      if (ch === '"') { inString = true; out += ch; continue; }
      // strip trailing commas: `, }` or `, ]`
      if (ch === ",") {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (text[j] === "}" || text[j] === "]") continue;
      }
      out += ch;
      continue;
    }

    // inside a string literal
    if (ch === "\\") {
      const next = text[i + 1];
      const validEscapes = '"\\/bfnrtu';
      if (next !== undefined && validEscapes.includes(next)) {
        out += ch + next;
        i++;
      } else {
        out += "\\\\"; // lone backslash (e.g. \alpha) → double it
      }
      continue;
    }
    if (ch === '"') { inString = false; out += ch; continue; }
    if (ch === "\n") { out += "\\n"; continue; }
    if (ch === "\r") { out += "\\r"; continue; }
    if (ch === "\t") { out += "\\t"; continue; }
    // other control chars → drop
    const code = ch.charCodeAt(0);
    if (code < 0x20) continue;
    out += ch;
  }

  // If we ended mid-string (truncated output), close the string.
  if (inString) out += '"';

  // If braces/brackets don't balance (truncation), pad with closers.
  let depthObj = 0, depthArr = 0, inStr = false, esc = false;
  for (let i = 0; i < out.length; i++) {
    const c = out[i];
    if (esc) { esc = false; continue; }
    if (c === "\\" && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") depthObj++;
    else if (c === "}") depthObj--;
    else if (c === "[") depthArr++;
    else if (c === "]") depthArr--;
  }
  while (depthObj-- > 0) out += "}";
  while (depthArr-- > 0) out += "]";

  return out;
}

function robustParse(text: string): unknown {
  try { return JSON.parse(text); } catch { /* continue */ }
  try { return JSON.parse(sanitizeJSON(text)); } catch { /* continue */ }
  // Legacy fallback: brute-force double all lone backslashes globally.
  try {
    const fixed = sanitizeJSON(text)
      .replace(/\\{2,}/g, "\\\\")
      .replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  } catch { /* continue */ }
  throw new Error("All JSON parse strategies failed");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { context, documentBase64, documentMimeType } = parsed.data;

    // ── Monthly quota check ──────────────────────────────────────────────────
    const uid = await verifySession(request);
    if (!uid) {
      return NextResponse.json(
        { success: false, errors: ["Unauthorized. Please sign in."] },
        { status: 401, headers: createSecurityHeaders() }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, errors: ["User profile not found."] },
        { status: 404, headers: createSecurityHeaders() }
      );
    }

    const userData = userSnap.data()!;
    const isPro = userData.proExpiresAt && userData.proExpiresAt > Date.now();
    const limit = isPro ? MONTHLY_LIMITS.pro : MONTHLY_LIMITS.free;
    const now = Date.now();

    let monthlyCount: number = userData.monthlyExamsGenerated ?? 0;
    const periodStart: number = userData.monthlyPeriodStart ?? now;

    if (now - periodStart > MONTHLY_PERIOD_MS) {
      monthlyCount = 0;
      await userRef.update({ monthlyExamsGenerated: 0, monthlyPeriodStart: now });
    }

    if (monthlyCount >= limit) {
      const msg = isPro
        ? `You have reached your monthly limit of ${limit} exams. Contact support if you need more.`
        : `You have reached your monthly limit of ${limit} free exams. Upgrade to Pro for 100 exams per month.`;
      return NextResponse.json(
        { success: false, errors: [msg] },
        { status: 429, headers: createSecurityHeaders() }
      );
    }
    // ────────────────────────────────────────────────────────────────────────

    const hasDocument = !!(documentBase64 && documentMimeType);
    const systemPrompt = buildGenerateSystemPrompt(context, hasDocument);
    const userPrompt = buildGenerateUserPrompt(context);

    // Build user parts — prepend teacher's document when provided (NotebookLM-style grounding)
    type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
    const parts: Part[] = [];
    if (documentBase64 && documentMimeType) {
      // Strip data URL prefix if present (e.g. "data:application/pdf;base64,")
      const data = documentBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({ inlineData: { mimeType: documentMimeType, data } });
    }
    parts.push({ text: userPrompt });

    // Streaming response via Gemini — retry on 503/429, fallback to 2.0-flash
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let streamResult: any;
    try {
      streamResult = await withRetryAndFallback((model) =>
        model.generateContentStream({
          systemInstruction: systemPrompt,
          contents: [{ role: "user", parts }],
          // Force pure JSON output — eliminates "Failed to parse" errors from markdown fences or prose
          generationConfig: { responseMimeType: "application/json" },
        })
      );
    } catch (geminiErr) {
      console.error("[/api/generate] Gemini call failed after retries:", geminiErr);
      return NextResponse.json(
        { success: false, errors: [geminiErrorMessage(geminiErr)] },
        { status: 503 }
      );
    }

    // The SDK exposes both `stream` and a `response` promise. We only consume
    // `stream`; attach a noop catch to `response` so a stream-parse failure
    // doesn't surface as an unhandledRejection after we've already closed the
    // SSE response to the client.
    if (streamResult?.response && typeof streamResult.response.catch === "function") {
      streamResult.response.catch((err: unknown) => {
        console.warn("[/api/generate] streamResult.response rejected:", (err as Error)?.message ?? err);
      });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let accumulated = "";

        try {
          for await (const chunk of streamResult.stream) {
            const text = chunk.text();
            if (text) {
              accumulated += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`));
            }
          }
        } catch (streamErr) {
          const msg = isRetryableError(streamErr)
            ? "The AI model is overloaded. Please try again in a moment."
            : "Stream interrupted. Please try again.";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, error: msg })}\n\n`));
          controller.close();
          return;
        }

        // Stream ended — parse accumulated JSON
        try {
          const exercises = robustParse(extractJSON(accumulated));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, exercises })}\n\n`)
          );
          // Increment monthly counter (fire-and-forget)
          userRef.update({ monthlyExamsGenerated: monthlyCount + 1 })
            .catch((e) => console.error("[/api/generate] Failed to increment monthly count:", e));
        } catch (err) {
          console.error("[/api/generate] JSON parse failed. Length:", accumulated.length);
          console.error("[/api/generate] First 400 chars:", accumulated.slice(0, 400));
          console.error("[/api/generate] Last 400 chars:", accumulated.slice(-400));
          console.error("[/api/generate] Parse error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, error: "Failed to parse generated exercises. Please try again." })}\n\n`)
          );
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...createSecurityHeaders(),
      },
    });
  } catch (error) {
    console.error("[/api/generate]", error);
    return NextResponse.json(
      { success: false, errors: [sanitizeError(error)] },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
