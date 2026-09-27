import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as admin from "firebase-admin";
import { withRetryAndFallback, geminiErrorMessage } from "@/lib/gemini";
import { getAnthropicClient, isAnthropicConfigured, GENERATE_MODEL, GENERATE_MAX_TOKENS } from "@/lib/anthropic";
import { buildVariantExamSystemPrompt, buildVariantExamUserPrompt } from "@/lib/prompts/variantExam";
import { mergeVariantExercises } from "@/lib/variant";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";
import { adminDb, verifySession } from "@/lib/firebase-admin";
import { AIExerciseSchema } from "@/lib/schemas/exercise";
import {
  ExamContextSchema,
  extractJSON,
  robustParse,
  MONTHLY_LIMITS,
  MONTHLY_PERIOD_MS,
} from "@/app/api/generate/route";
import type { Exercise } from "@/types/exam";

/**
 * Real, AI-generated "Version B" of an already-finished exam — see
 * FOUNDER_DECISIONS.md #9 (option (a)) and BUGS.md BUG-036/BUG-042 for why
 * the previous client-side reorder-only implementation was replaced.
 *
 * This is deliberately its own route rather than a flag on /api/generate:
 * it takes an already-generated exercise list as input (a transform, not a
 * fresh generation), same shape as /api/exam/translate — not the streaming,
 * from-scratch curriculum-grounded generation flow.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: Date.now() }, { headers: createSecurityHeaders() });
}

// BUG-048: this used to be z.array(z.any()) on the theory that "exercises"
// are already-generated, already-trusted output from the same session — but
// nothing actually enforces that a caller sends real prior /api/generate
// output rather than crafted garbage. mergeVariantExercise() (src/lib/variant.ts)
// only guards the AI's response shape, never `original`, so a malformed
// element (e.g. `null`, or an object missing `solution`) crashed with a
// plain TypeError — AFTER a real, billed Claude/Gemini call had already run,
// and the quota-increment above only fires on the success path, so this was
// a repeatable, unlimited, unbilled-to-quota AI-cost drain. Validating the
// same shape used for the AI's OWN response (AIExerciseSchema) closes this
// at the boundary — a malformed `exercises` element is now rejected with a
// 400 before any AI call is made, at zero cost.
const RequestSchema = z.object({
  context: ExamContextSchema,
  exercises: z.array(AIExerciseSchema).min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const { context, exercises } = parsed.data;
    const originalExercises = exercises as Exercise[];

    // ── Auth (mandatory) ────────────────────────────────────────────────────
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
    const isPro = userData.proExpiresAt && userData.proExpiresAt > now;

    // ── Pro gate (server-side — the UI already hides/disables this for
    //    free-tier accounts, but that alone never stops a direct request) ──
    if (!isPro) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Version B generation is a Pro feature. Upgrade to Pro to generate a real second exam variant."],
        },
        { status: 403, headers: createSecurityHeaders() }
      );
    }

    // ── Quota — a real Version B is a full second AI generation call, of
    //    comparable cost to a fresh /api/generate call, so it is charged
    //    against the exact same monthly counter (not a separate, cheaper cap
    //    like /api/exam/translate's). Flagged in this session's report for
    //    the founder — this is a reasonable technical default, but the
    //    exact cost/quota tradeoff is ultimately a pricing question. ─────────
    const quotaUsed = userData.monthlyExamsGenerated ?? 0;
    const extraQuota = userData.extraExamsQuota ?? 0;
    const proLimit = userData.planType === "yearly" ? 20 : MONTHLY_LIMITS.pro;
    const limit = proLimit + extraQuota;
    const periodStart: number = userData.monthlyPeriodStart ?? now;

    if (now - periodStart > MONTHLY_PERIOD_MS) {
      await userRef.update({ monthlyExamsGenerated: 0, monthlyPeriodStart: now });
    } else if (quotaUsed >= limit) {
      return NextResponse.json(
        {
          success: false,
          errors: [`You have reached your monthly limit of ${limit} exams. Contact support if you need more.`],
        },
        { status: 429, headers: createSecurityHeaders() }
      );
    }
    // ─────────────────────────────────────────────────────────────────────

    const systemPrompt = buildVariantExamSystemPrompt(context);
    const userPrompt = buildVariantExamUserPrompt({ context, exercises: originalExercises });

    // Same scaling rationale as /api/generate and /api/exam/translate — a
    // variant's output is roughly the same size as the source exam.
    const maxTokens = Math.min(
      GENERATE_MAX_TOKENS,
      Math.max(6000, originalExercises.length * 6000 + 3000)
    );

    let rawText: string | null = null;
    let providerName: "Claude" | "Gemini" = "Gemini";

    // ── AI Generation (Primary: Claude, Fallback: Gemini) ───────────────────
    if (isAnthropicConfigured()) {
      try {
        console.log("[/api/generate/version-b] Attempting Claude...");
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
        console.warn("[/api/generate/version-b] Claude failed, falling back to Gemini:", claudeErr);
      }
    }

    if (!rawText) {
      try {
        console.log("[/api/generate/version-b] Using Gemini...");
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
        console.error("[/api/generate/version-b] Gemini fallback failed:", geminiErr);
        return NextResponse.json(
          { success: false, errors: [geminiErrorMessage(geminiErr)] },
          { status: 503, headers: createSecurityHeaders() }
        );
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { success: false, errors: ["The AI returned no content. Please try again."] },
        { status: 502, headers: createSecurityHeaders() }
      );
    }

    try {
      const parsedResult = robustParse(extractJSON(rawText)) as { exercises?: unknown };
      const variantRaw = Array.isArray(parsedResult?.exercises) ? parsedResult.exercises : null;

      if (!variantRaw || variantRaw.length === 0) {
        return NextResponse.json(
          { success: false, errors: ["Version B generation returned no exercises. Please try again."] },
          { status: 502, headers: createSecurityHeaders() }
        );
      }

      if (variantRaw.length !== originalExercises.length) {
        console.error(
          `[/api/generate/version-b] ${providerName} returned ${variantRaw.length} exercises, expected ${originalExercises.length}.`
        );
        return NextResponse.json(
          {
            success: false,
            errors: ["Version B did not preserve the exact number of exercises. Please try again."],
          },
          { status: 502, headers: createSecurityHeaders() }
        );
      }

      // Zod-validate the AI's response the same way /api/generate validates
      // a fresh generation. A single malformed exercise is logged and passed
      // through as raw JSON rather than aborting the whole response —
      // mergeVariantExercises() below is the real safety net regardless,
      // since it force-copies every structural/gradable field from the
      // original and only ever reads content fields from this object.
      const variantValidated = variantRaw.map((raw, i) => {
        const result = AIExerciseSchema.safeParse(raw);
        if (!result.success) {
          console.warn(
            `[/api/generate/version-b] Variant exercise #${i} failed response validation, merging raw:`,
            result.error.flatten()
          );
          return raw;
        }
        return result.data;
      });

      const mergedExercises = mergeVariantExercises(originalExercises, variantValidated);

      // Only burn a slot on a genuinely successful Version B — fire-and-forget,
      // same convention as /api/generate's own quota increment.
      userRef
        .update({
          monthlyExamsGenerated: admin.firestore.FieldValue.increment(1),
          examsGenerated: admin.firestore.FieldValue.increment(1),
        })
        .catch((e) => console.error("[/api/generate/version-b] Failed to update quota:", e));

      return NextResponse.json(
        { success: true, exercises: mergedExercises },
        { headers: createSecurityHeaders() }
      );
    } catch (parseErr) {
      console.error(`[/api/generate/version-b] ${providerName} JSON parse failed:`, parseErr);
      return NextResponse.json(
        { success: false, errors: ["Failed to parse Version B. Please try again."] },
        { status: 502, headers: createSecurityHeaders() }
      );
    }
  } catch (error) {
    console.error("[/api/generate/version-b]", error);
    return NextResponse.json(
      { success: false, errors: [sanitizeError(error)] },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
