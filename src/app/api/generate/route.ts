import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiStreamingModel, withRetry, geminiErrorMessage, isRetryableError } from "@/lib/gemini";
import { buildGenerateSystemPrompt, buildGenerateUserPrompt } from "@/lib/prompts/generate";

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
 * Multi-strategy JSON parser that handles common LLM quirks:
 * 1. Parse as-is (Gemini followed instructions perfectly)
 * 2. Fix lone backslashes that aren't valid JSON escapes (most common LaTeX issue: \alpha, \vec, etc.)
 * 3. Fix ALL lone backslashes including \f, \b ambiguous ones (aggressive fallback)
 */
function robustParse(text: string): unknown {
  // Strategy 1: clean parse
  try { return JSON.parse(text); } catch { /* continue */ }

  // Strategy 2: fix backslashes not part of a valid JSON escape sequence
  // Valid: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
  try {
    const fixed = text.replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  } catch { /* continue */ }

  // Strategy 3: fix ALL backslashes that aren't already doubled
  // Converts \frac → \\frac, handles \f ambiguity by brute-force
  try {
    const fixed = text
      .replace(/\\{2,}/g, "\\\\")          // normalise multiple backslashes → \\
      .replace(/\\(?!["\\\/bfnrtu])/g, "\\\\"); // fix remaining lone ones
    return JSON.parse(fixed);
  } catch { /* continue */ }

  // Strategy 4: strip control characters that can invalidate JSON, then retry
  try {
    const fixed = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ")  // strip non-printable except \t \n \r
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

    const { context } = parsed.data;
    const model = getGeminiStreamingModel();

    const systemPrompt = buildGenerateSystemPrompt(context);
    const userPrompt = buildGenerateUserPrompt(context);

    // Streaming response via Gemini — retry on 503/429
    let streamResult: Awaited<ReturnType<typeof model.generateContentStream>>;
    try {
      streamResult = await withRetry(() =>
        model.generateContentStream({
          systemInstruction: systemPrompt,
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        })
      );
    } catch (geminiErr) {
      console.error("[/api/generate] Gemini call failed after retries:", geminiErr);
      return NextResponse.json(
        { success: false, errors: [geminiErrorMessage(geminiErr)] },
        { status: 503 }
      );
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
        } catch (err) {
          console.error("[/api/generate] JSON parse failed. First 500 chars:", accumulated.slice(0, 500));
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
      },
    });
  } catch (error) {
    console.error("[/api/generate]", error);
    return NextResponse.json(
      { success: false, errors: ["Unexpected error during generation. Please try again."] },
      { status: 500 }
    );
  }
}
