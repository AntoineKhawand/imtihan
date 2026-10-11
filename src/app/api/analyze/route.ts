import { UploadIntentSchema, DocumentStructureSchema, DocumentBase64Schema, DocumentMimeSchema } from "@/lib/schemas/sourceDocument";
import { documentFingerprint } from "@/lib/sourceDocument";
import { HARD_DIFFICULTY, normalizeDifficulty } from "@/lib/difficulty";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback, geminiErrorMessage } from "@/lib/gemini";
import { getAnthropicClient, isAnthropicConfigured, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { buildAnalyzeSystemPrompt, buildAnalyzeUserPrompt, buildCurriculaReference } from "@/lib/prompts/analyze";
import { getAllChapterIds } from "@/data/curricula";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";
import { verifySession } from "@/lib/firebase-admin";

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
  }).catch(HARD_DIFFICULTY),
  // Optional fields — null/undefined both fine
  documentStructure: z.unknown().optional(),
  teacherNotes: z.string().nullable().optional().transform(v => v ?? undefined),
  layoutPreferences: z.string().default(""),
  visualPreference: z.string().default(""),
  geographicContext: z.string().default("Global"),
  // Gemini/Claude occasionally returns the old flat-string shape despite the
  // prompt — coerce a bare string into { field: "general", message } instead
  // of dropping the note entirely.
  warnings: z.array(
    z.union([
      z.object({ field: z.string().default("general"), message: z.string() }),
      z.string().transform((message) => ({ field: "general", message })),
    ])
  ).default([]),
  confidence: z.coerce.number().min(0).max(1).default(0.8),
});

/** Request body schema */
const RequestSchema = z.object({
  description: z.string().min(10, "Description is too short — please add more detail."),
  documentBase64: DocumentBase64Schema.optional(),
  documentMimeType: DocumentMimeSchema.optional(),
  documentName: z.string().max(250).optional(),
  uploadIntent: UploadIntentSchema.optional(),
}).refine(input => !!input.documentBase64 === !!input.documentMimeType, { message: "Document bytes and file type must be provided together." });

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
    const startedAt = Date.now();
    // 0. Auth check
    const uid = await verifySession(request);
    if (!uid) {
      return NextResponse.json(
        { success: false, errors: ["Unauthorized. Please sign in."] },
        { status: 401, headers: createSecurityHeaders() }
      );
    }

    // 1. Parse and validate request body
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { description, documentBase64, documentMimeType, documentName, uploadIntent } = parsed.data;
    const effectiveIntent = uploadIntent ?? { purposes: ["content" as const], instructions: "" };

    // 2. Build prompts — include curricula reference so the AI returns valid level IDs
    const systemPrompt = buildAnalyzeSystemPrompt();
    const userText = buildAnalyzeUserPrompt({
      teacherDescription: description,
      hasUploadedDocument: !!documentBase64,
      availableCurricula: buildCurriculaReference(),
      uploadIntent: documentBase64 ? effectiveIntent : undefined,
    });

    // ── AI Analysis (Primary: Claude, Fallback: Gemini) ─────────────────────
    let rawText: string = "";
    let providerName: "Claude" | "Gemini" = "Gemini";

    const isClaudeCompatible = !documentBase64 || 
      (documentMimeType && (documentMimeType.startsWith("image/") || documentMimeType === "application/pdf"));

    if (isAnthropicConfigured() && isClaudeCompatible) {
      try {
        console.log("[/api/analyze] Attempting Claude 3.5 Sonnet...");
        const anthropic = getAnthropicClient();
        
        const content: any[] = [];
        if (documentBase64 && documentMimeType) {
          const data = documentBase64.replace(/^data:[^;]+;base64,/, "");
          const isImage = documentMimeType.startsWith("image/");
          
          content.push({
            type: isImage ? "image" : "document",
            source: {
              type: "base64",
              media_type: documentMimeType as any,
              data: data,
            },
          } as any);
        }
        content.push({ type: "text", text: userText });

        const message = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 2000,
          // Cache the static system prompt — buildAnalyzeSystemPrompt() takes
          // no arguments, so this block is byte-identical across EVERY
          // analyze request (an even broader cache key than /api/generate's
          // per (language, curriculum, subject) scope). Same pattern as
          // src/app/api/generate/route.ts. The per-request content
          // (teacher description, curricula reference, uploaded document)
          // stays in the user message, which is never cached.
          system: [
            {
              type: "text" as const,
              text: systemPrompt,
              cache_control: { type: "ephemeral" } as any,
            },
          ],
          messages: [{ role: "user", content: content }],
        }, {
          headers: {
            "anthropic-beta": "prompt-caching-2024-07-31,pdfs-2024-09-25"
          }
        });

        // @ts-ignore
        rawText = message.content[0].text;
        providerName = "Claude";
      } catch (claudeErr) {
        console.warn("[/api/analyze] Claude failed, falling back to Gemini:", claudeErr);
      }
    }

    if (!rawText) {
      try {
        console.log("[/api/analyze] Using Gemini...");
        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
        if (documentBase64 && documentMimeType) {
          const data = documentBase64.replace(/^data:[^;]+;base64,/, "");
          parts.push({ inlineData: { mimeType: documentMimeType, data } });
        }
        parts.push({ text: userText });

        const result = await withRetryAndFallback((model) =>
          model.generateContent({
            systemInstruction: systemPrompt,
            contents: [{ role: "user", parts }],
          })
        );
        rawText = result.response.text();
        providerName = "Gemini";
      } catch (geminiErr) {
        console.error("[/api/analyze] Gemini fallback failed:", geminiErr);
        return NextResponse.json(
          { success: false, errors: [geminiErrorMessage(geminiErr)] },
          { status: 503 }
        );
      }
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

    ctx.difficultyMix = normalizeDifficulty(ctx.difficultyMix);

    // 8. Post-process: chapterIds must be real, matching the curriculum's
    //    actual chapter data. The prompt tells the model to copy real
    //    CHAPTER_ID values from <curriculum_reference>, but nothing enforced
    //    that until now — the exact same class of gap already fixed for
    //    /api/generate's response handling (see CURRICULUM_COVERAGE_STRATEGY.md).
    //    Only filters when the subject actually has defined chapters; a
    //    subject/level with none yet is left to the model's own inference
    //    (already flagged low-confidence by the prompt's own warnings rule).
    if (ctx.curriculumId !== "university") {
      const realChapterIds = new Set(getAllChapterIds(ctx.curriculumId, ctx.levelId, ctx.subject));
      if (realChapterIds.size > 0) {
        const invented = ctx.chapterIds.filter((cid) => !realChapterIds.has(cid));
        if (invented.length > 0) {
          console.warn(`[/api/analyze] Dropping invented chapterIds not in the real curriculum data: ${invented.join(", ")}`);
        }
        ctx.chapterIds = ctx.chapterIds.filter((cid) => realChapterIds.has(cid));
      }
    }

    // 9. Post-process: if chapterIds is empty and not university, add a warning
    //    so the teacher selects real curriculum chapters before generation
    if (ctx.chapterIds.length === 0 && ctx.curriculumId !== "university") {
      ctx.chapterIds = [];
      ctx.warnings = [
        ...ctx.warnings,
        { field: "chapterIds", message: "Chapters could not be identified from your description. Please select them on the next screen." },
      ];
      ctx.confidence = Math.min(ctx.confidence, 0.6);
    }

    console.log(
      "[api/analyze] request_completed",
      JSON.stringify({
        uid,
        provider: providerName,
        curriculumId: ctx.curriculumId,
        levelId: ctx.levelId,
        subject: ctx.subject,
        language: ctx.language,
        chapterCount: ctx.chapterIds.length,
        warningCount: ctx.warnings.length,
        confidence: ctx.confidence,
        durationMs: Date.now() - startedAt,
      })
    );

    const { documentStructure, ...examContext } = ctx;
    const extracted = DocumentStructureSchema.safeParse(documentStructure);
    const sourceDocument = documentBase64 ? {
      id: documentFingerprint(documentBase64), name: documentName ?? "Uploaded document", intent: effectiveIntent,
      ...(extracted.success ? { structure: extracted.data } : { structure: { title: "", sections: [], instructions: [], footerText: "", uncertainties: ["Document details were not extracted reliably. Review the source and enter the structure manually if needed."] } }),
    } : undefined;
    return NextResponse.json({ success: true, context: { ...examContext, teacherNotes: description, ...(sourceDocument ? { sourceDocument } : {}) } });
  } catch (error) {
    console.error("[/api/analyze]", error);
    return NextResponse.json(
      { success: false, errors: [sanitizeError(error)] },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
