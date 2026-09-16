import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as admin from "firebase-admin";
import { getAnthropicClient, isAnthropicConfigured, GENERATE_MODEL } from "@/lib/anthropic";
import {
  buildRegenerateFragmentSystemPrompt,
  buildRegenerateFragmentUserPrompt,
  FRAGMENT_INSTRUCTION_PRESETS,
} from "@/lib/prompts/regenerateFragment";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";
import { adminDb, verifySession } from "@/lib/firebase-admin";
import { ExamContextSchema } from "@/app/api/generate/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Daily fragment-regen cap ────────────────────────────────────────────────
// Same reasoning as /api/exam/translate's daily cap: a real, billed AI call,
// so auth is non-negotiable — but it's a tiny transform (one short fragment,
// max_tokens capped well below a full exercise), not new curriculum-grounded
// generation, so it doesn't touch the monthly exam quota. Its own generous
// daily cap bounds cost from a compromised/malicious session instead.
const DAILY_PERIOD_MS = 24 * 60 * 60 * 1000;
const DAILY_FRAGMENT_REGEN_LIMIT = 60;

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}

const RequestSchema = z.object({
  context: ExamContextSchema,
  fullText: z.string().min(1).max(8000),
  selection: z.string().min(1).max(2000),
  instruction: z.enum(["rephrase", "simplify", "harder", "change-numbers", "custom"]),
  customInstruction: z.string().max(300).optional(),
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
    const { context, fullText, selection, instruction, customInstruction } = parsed.data;

    if (instruction === "custom" && !customInstruction?.trim()) {
      return NextResponse.json(
        { success: false, error: "Describe what you'd like changed." },
        { status: 400, headers: createSecurityHeaders() }
      );
    }
    const instructionText = instruction === "custom" ? customInstruction!.trim() : FRAGMENT_INSTRUCTION_PRESETS[instruction];

    // ── Auth (mandatory, no exceptions) + daily cap ────────────────────────
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
    const periodStart: number = userData.fragmentRegenPeriodStart ?? now;
    const periodExpired = now - periodStart > DAILY_PERIOD_MS;
    const usedToday: number = periodExpired ? 0 : (userData.fragmentRegensToday ?? 0);

    if (usedToday >= DAILY_FRAGMENT_REGEN_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          errors: [`You've reached your daily limit of ${DAILY_FRAGMENT_REGEN_LIMIT} quick edits. Please try again tomorrow.`],
        },
        { status: 429, headers: createSecurityHeaders() }
      );
    }

    if (periodExpired) {
      await userRef.update({ fragmentRegensToday: 0, fragmentRegenPeriodStart: now });
    }
    // ─────────────────────────────────────────────────────────────────────

    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { success: false, error: "AI service not configured." },
        { status: 503, headers: createSecurityHeaders() }
      );
    }

    const systemPrompt = buildRegenerateFragmentSystemPrompt(context);
    const userPrompt = buildRegenerateFragmentUserPrompt(fullText, selection, instructionText);

    // Deliberately small — this is a short-fragment rewrite, not a full
    // exercise. No Gemini fallback: unlike /api/generate and
    // /api/exam/translate, this isn't the primary path to a usable exam
    // (the teacher already has a working exercise before touching this), so
    // a transient failure just means "try again" rather than blocking them.
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: GENERATE_MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    const replacement = textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";

    if (!replacement) {
      return NextResponse.json(
        { success: false, error: "The AI returned nothing. Please try again." },
        { status: 502, headers: createSecurityHeaders() }
      );
    }

    // Only burn a slot on genuine success — fire-and-forget, same convention
    // as /api/exam/translate's counter increment.
    userRef
      .update({ fragmentRegensToday: admin.firestore.FieldValue.increment(1) })
      .catch((e) => console.error("[/api/exam/regenerate-fragment] Failed to update counter:", e));

    return NextResponse.json({ success: true, replacement }, { headers: createSecurityHeaders() });
  } catch (error) {
    console.error("[/api/exam/regenerate-fragment]", error);
    return NextResponse.json(
      { success: false, error: sanitizeError(error) },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
