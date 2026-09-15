import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as admin from "firebase-admin";
import { withRetryAndFallback, geminiErrorMessage } from "@/lib/gemini";
import { getAnthropicClient, isAnthropicConfigured, GENERATE_MODEL, GENERATE_MAX_TOKENS } from "@/lib/anthropic";
import { buildTranslateExamSystemPrompt, buildTranslateExamUserPrompt } from "@/lib/prompts/translateExam";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";
import { adminDb, verifySession } from "@/lib/firebase-admin";
import { ExamContextSchema, extractJSON, robustParse } from "@/app/api/generate/route";
import type { Exercise } from "@/types/exam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Daily translation cap ──────────────────────────────────────────────────
// This is a real, billed AI call (Claude/Gemini), so it must never be
// reachable without a valid session — same non-negotiable as /api/generate.
// It is NOT counted against the monthly exam-generation quota, though:
// translating an exam the user already paid quota for once shouldn't cost a
// second full "exam" against their monthly limit — that would be too harsh
// for what is, from the AI's perspective, a much cheaper transform (no
// curriculum grounding, no exercise design, just prose translation).
// Instead it gets its own low, generous-for-a-real-teacher daily cap, reset
// every 24h, tracked on the user doc (translationsToday / translationsPeriodStart)
// — same pattern as /api/generate's monthly counters — to bound cost from a
// compromised or malicious session without ever touching the exam quota.
const DAILY_PERIOD_MS = 24 * 60 * 60 * 1000;
const DAILY_TRANSLATION_LIMIT = 20;

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}

// exercises is intentionally z.any() passthrough — same convention as
// src/app/api/export/send/route.ts. There is no standalone Zod schema for
// the Exercise type anywhere in the codebase (it's a TS type contract, see
// src/types/exam.ts); this endpoint transforms already-generated,
// already-trusted exercises rather than validating their exact shape from
// scratch — the AI-facing prompt (translateExam.ts) is what enforces field
// preservation, and the response is re-checked for exercise count below.
const RequestSchema = z.object({
  context: ExamContextSchema,
  header: z
    .object({
      schoolName: z.string().optional(),
      className: z.string().optional(),
      teacherName: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
  exercises: z.array(z.any()).min(1),
  targetLanguage: z.enum(["french", "english", "arabic"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request.", errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const { context, header, exercises, targetLanguage } = parsed.data;

    if (targetLanguage === context.language) {
      return NextResponse.json(
        { success: false, error: `This exam is already in ${context.language}.` },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    // ── Auth (mandatory, no exceptions) + daily translation cap ────────────
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
    const now = Date.now();
    const translationsPeriodStart: number = userData.translationsPeriodStart ?? now;
    const periodExpired = now - translationsPeriodStart > DAILY_PERIOD_MS;
    const translationsToday: number = periodExpired ? 0 : (userData.translationsToday ?? 0);

    if (translationsToday >= DAILY_TRANSLATION_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          errors: [`You have reached your daily limit of ${DAILY_TRANSLATION_LIMIT} translations. Please try again tomorrow.`],
        },
        { status: 429, headers: createSecurityHeaders() }
      );
    }

    if (periodExpired) {
      await userRef.update({ translationsToday: 0, translationsPeriodStart: now });
    }
    // ─────────────────────────────────────────────────────────────────────

    const systemPrompt = buildTranslateExamSystemPrompt(targetLanguage);
    const userPrompt = buildTranslateExamUserPrompt(
      { context, header, exercises: exercises as Exercise[] },
      targetLanguage
    );

    // max_tokens scaled to exercise count — translation output is roughly
    // the same size as the source, scaled a bit up since some target
    // languages (French, Arabic) read longer than the source. Same pattern
    // as /api/generate's maxTokens scaling.
    const maxTokens = Math.min(
      GENERATE_MAX_TOKENS,
      Math.max(4000, exercises.length * 2000 + 1500)
    );

    let rawText: string | null = null;
    let providerName: "Claude" | "Gemini" = "Gemini";

    // ── AI Translation (Primary: Claude, Fallback: Gemini) ──────────────────
    // Same dual-provider pattern as /api/generate — this is a bounded,
    // non-streaming transform, so we just await the full response.
    if (isAnthropicConfigured()) {
      try {
        console.log("[/api/exam/translate] Attempting Claude...");
        const anthropic = getAnthropicClient();
        const message = await anthropic.messages.create({
          model: GENERATE_MODEL,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
        const textBlock = message.content.find((b) => b.type === "text");
        if (textBlock && textBlock.type === "text" && textBlock.text) {
          rawText = textBlock.text;
          providerName = "Claude";
        }
      } catch (claudeErr) {
        console.warn("[/api/exam/translate] Claude failed, falling back to Gemini:", claudeErr);
      }
    }

    if (!rawText) {
      try {
        console.log("[/api/exam/translate] Using Gemini...");
        const result = await withRetryAndFallback((model) =>
          model.generateContent({
            systemInstruction: systemPrompt,
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          })
        );
        rawText = result.response.text();
        providerName = "Gemini";
      } catch (geminiErr) {
        console.error("[/api/exam/translate] Gemini fallback failed:", geminiErr);
        return NextResponse.json(
          { success: false, error: geminiErrorMessage(geminiErr) },
          { status: 503, headers: createSecurityHeaders() }
        );
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: "The AI returned no content. Please try again." },
        { status: 502, headers: createSecurityHeaders() }
      );
    }

    try {
      const parsedResult = robustParse(extractJSON(rawText)) as {
        header?: unknown;
        exercises?: unknown;
      };

      const translatedExercises = Array.isArray(parsedResult?.exercises) ? parsedResult.exercises : null;

      if (!translatedExercises || translatedExercises.length === 0) {
        return NextResponse.json(
          { success: false, error: "The translated exam had no exercises. Please try again." },
          { status: 502, headers: createSecurityHeaders() }
        );
      }

      if (translatedExercises.length !== exercises.length) {
        console.error(
          `[/api/exam/translate] ${providerName} returned ${translatedExercises.length} exercises, expected ${exercises.length}.`
        );
        return NextResponse.json(
          {
            success: false,
            error: "The translation did not preserve the exact number of exercises. Please try again.",
          },
          { status: 502, headers: createSecurityHeaders() }
        );
      }

      // Only burn a slot on a genuinely successful translation — fire-and-forget,
      // same convention as /api/generate's quota increment.
      userRef
        .update({ translationsToday: admin.firestore.FieldValue.increment(1) })
        .catch((e) => console.error("[/api/exam/translate] Failed to update translation counter:", e));

      return NextResponse.json(
        { success: true, exercises: translatedExercises, header: parsedResult?.header ?? header ?? null },
        { headers: createSecurityHeaders() }
      );
    } catch (parseErr) {
      console.error(`[/api/exam/translate] ${providerName} JSON parse failed:`, parseErr);
      return NextResponse.json(
        { success: false, error: "Failed to parse the translated exam. Please try again." },
        { status: 502, headers: createSecurityHeaders() }
      );
    }
  } catch (error) {
    console.error("[/api/exam/translate]", error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
