import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback, geminiErrorMessage } from "@/lib/gemini";
import { buildAnalyzeSystemPrompt, buildAnalyzeUserPrompt, buildCurriculaReference } from "@/lib/prompts/analyze";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}

// ---------------------------------------------------------------------------
// All valid subject values
// ---------------------------------------------------------------------------
const SUBJECT_VALUES = [
  "mathematics", "physics", "chemistry", "biology", "svt", "informatics", "nsi", "environmental-systems",
  "history", "geography", "history-geography", "philosophy", "civic-education",
  "economics", "ses", "sociology", "psychology", "global-politics", "law",
  "arabic", "french", "english", "spanish", "german",
  "accounting", "management", "business",
  "visual-arts", "music",
  "medicine", "engineering", "architecture", "nursing",
] as const;

// ---------------------------------------------------------------------------
// Gemini-tolerant Zod schema
// z.coerce.number() accepts "120" → 120 and z.coerce.boolean() "false" → false
// ---------------------------------------------------------------------------
const ExamContextSchema = z.object({
  curriculumId: z.enum(["bac-libanais", "bac-francais", "ib", "university"]),
  levelId: z.string().min(1),
  subject: z.enum(SUBJECT_VALUES),
  // Gemini sometimes returns [] for university — allow it, we patch below
  chapterIds: z.array(z.string()).default([]),
  language: z.enum(["french", "english", "arabic"]),
  examType: z.enum(["quiz", "homework", "midterm", "final", "practice"])
    .catch("midterm"),                        // unknown value → default midterm
  // Coerce: Gemini occasionally returns "120" (string) instead of 120
  duration: z.coerce.number().min(10).max(360).catch(60),
  exerciseCount: z.coerce.number().min(1).max(20).catch(2),
  totalPoints: z.coerce.number().min(1).max(200).catch(20),
  difficultyMix: z.object({
    easy:   z.coerce.number().min(0).max(1),
    medium: z.coerce.number().min(0).max(1),
    hard:   z.coerce.number().min(0).max(1),
  }).catch({ easy: 0.3, medium: 0.5, hard: 0.2 }),
  // Optional fields — null/undefined both fine
  teacherNotes: z.string().nullable().optional().transform(v => v ?? undefined),
  generateVersionB: z.coerce.boolean().default(false),
  warnings: z.array(z.string()).default([]),
  confidence: z.coerce.number().min(0).max(1).default(0.8),
});

/** Request body schema */
const RequestSchema = z.object({
  description: z.string().min(10, "Description is too short — please add more detail."),
  documentBase64: z.string().optional(),
  documentMimeType: z.string().optional(),
});

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------
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

function robustParse(text: string): unknown {
  try { return JSON.parse(text); } catch { /* continue */ }
  try {
    const fixed = text.replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  } catch { /* continue */ }
  try {
    const fixed = text
      .replace(/\\{2,}/g, "\\\\")
      .replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
    return JSON.parse(fixed);
  } catch { /* continue */ }
  throw new Error("All JSON parse strategies failed");
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { description, documentBase64, documentMimeType } = parsed.data;

    // 2. Build prompts — curricula reference lives in system prompt only
    const availableCurricula = buildCurriculaReference();
    const systemPrompt = buildAnalyzeSystemPrompt() + "\n" + availableCurricula;
    const userText = buildAnalyzeUserPrompt({
      teacherDescription: description,
      hasUploadedDocument: !!documentBase64,
      availableCurricula: "", // already in system prompt — don't duplicate
    });

    // 3. Assemble Gemini content parts (optional document + text)
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    if (documentBase64 && documentMimeType) {
      parts.push({ inlineData: { mimeType: documentMimeType, data: documentBase64 } });
    }
    parts.push({ text: userText });

    // 4. Call Gemini — retry on 503/429, fallback to 2.0-flash if 2.5-flash overloaded
    let rawText: string;
    try {
      const result = await withRetryAndFallback((model) =>
        model.generateContent({
          systemInstruction: systemPrompt,
          contents: [{ role: "user", parts }],
        })
      );
      rawText = result.response.text();
    } catch (geminiErr) {
      console.error("[/api/analyze] Gemini call failed after retries:", geminiErr);
      return NextResponse.json(
        { success: false, errors: [geminiErrorMessage(geminiErr)] },
        { status: 503 }
      );
    }

    // 5. Parse Gemini's JSON response
    let rawParsed: unknown;
    try {
      rawParsed = robustParse(extractJSON(rawText));
    } catch {
      console.error("[/api/analyze] JSON parse failed. Raw text slice:", rawText.slice(0, 400));
      return NextResponse.json(
        { success: false, errors: ["AI returned an unexpected response. Please try again or rephrase your description."] },
        { status: 500 }
      );
    }

    // 6. Validate and coerce — log details on failure so we can debug
    const validated = ExamContextSchema.safeParse(rawParsed);
    if (!validated.success) {
      console.error("[/api/analyze] Schema validation failed:", JSON.stringify(validated.error.flatten(), null, 2));
      console.error("[/api/analyze] Raw parsed object:", JSON.stringify(rawParsed));
      return NextResponse.json(
        {
          success: false,
          errors: ["AI response did not match expected format. Please try again."],
          details: validated.error.flatten(),
        },
        { status: 500 }
      );
    }

    const ctx = validated.data;

    // 7. Post-process: normalise difficulty mix to sum exactly 1.0
    const { easy, medium, hard } = ctx.difficultyMix;
    const sum = easy + medium + hard;
    if (Math.abs(sum - 1.0) > 0.01) {
      ctx.difficultyMix.easy   = sum === 0 ? 0.3 : easy   / sum;
      ctx.difficultyMix.medium = sum === 0 ? 0.5 : medium  / sum;
      ctx.difficultyMix.hard   = sum === 0 ? 0.2 : hard    / sum;
    }

    // 8. Post-process: if chapterIds is empty and not university, add a warning
    //    and fill in a placeholder so downstream steps don't break
    if (ctx.chapterIds.length === 0 && ctx.curriculumId !== "university") {
      ctx.chapterIds = ["general"];
      ctx.warnings = [
        ...ctx.warnings,
        "Chapters could not be identified from your description. Please select them on the next screen.",
      ];
      ctx.confidence = Math.min(ctx.confidence, 0.6);
    }

    return NextResponse.json({ success: true, context: ctx });
  } catch (error) {
    console.error("[/api/analyze]", error);
    return NextResponse.json(
      { success: false, errors: [sanitizeError(error)] },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
