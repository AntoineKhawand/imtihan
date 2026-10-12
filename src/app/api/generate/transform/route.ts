import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback } from "@/lib/openai";
import { getAnthropicClient, isAnthropicConfigured, GENERATE_MODEL } from "@/lib/anthropic";
import { createSecurityHeaders } from "@/lib/security";
import { verifySession } from "@/lib/firebase-admin";
import { AIExerciseSchema } from "@/lib/schemas/exercise";
import { buildTransformExercisePrompt } from "@/lib/prompts/transformExercise";
import { parseExerciseTransform } from "@/lib/exerciseTransform";
import type { Exercise } from "@/types/exam";

export const runtime = "nodejs";
export const maxDuration = 120;

const RequestSchema = z.object({
  exercise: AIExerciseSchema.extend({ type: z.enum(["multiple_choice", "short_answer", "problem_solving", "proof", "essay", "calculation", "lab_analysis"]), statement: z.string().min(1).max(50000) }),
  type: z.enum(["table", "visual", "image", "plot", "insertPlot"]),
  language: z.enum(["french", "english", "arabic"]),
  prompt: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const headers = createSecurityHeaders();
  try {
    if (!await verifySession(request)) return NextResponse.json({ error: "Your session expired. Sign in again to edit this exercise." }, { status: 401, headers });
    const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid exercise or transformation request." }, { status: 400, headers });
    const { exercise, type, language, prompt } = parsed.data;
    const original = exercise as Exercise;
    const instruction = buildTransformExercisePrompt(original, type, language, prompt);

    // Validate every provider attempt before applying any changes.
    try {
      const updated = await withRetryAndFallback(async model => {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: instruction }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 12000 },
        });
        return parseExerciseTransform(result.response.text(), original, type);
      }, 2, 1000);
      return NextResponse.json({ success: true, exercise: updated }, { headers });
    } catch {
      if (!isAnthropicConfigured()) throw new Error("No available provider");
      const message = await getAnthropicClient().messages.create({
        model: GENERATE_MODEL, max_tokens: 12000, system: instruction,
        messages: [{ role: "user", content: "Return the updated exercise statement as JSON." }],
      });
      if (message.stop_reason === "max_tokens") throw new Error("Truncated transformation");
      const raw = message.content.filter(block => block.type === "text").map(block => block.text).join("");
      return NextResponse.json({ success: true, exercise: parseExerciseTransform(raw, original, type) }, { headers });
    }
  } catch {
    console.error("[/api/generate/transform] All transformation attempts failed.");
    return NextResponse.json({ error: "The AI could not complete this edit. Your exercise has been kept unchanged. Please retry." }, { status: 502, headers });
  }
}
