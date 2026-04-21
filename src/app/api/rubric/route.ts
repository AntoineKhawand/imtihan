import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback, geminiErrorMessage } from "@/lib/gemini";
import { buildRubricSystemPrompt, buildRubricUserPrompt } from "@/lib/prompts/rubric";
import type { Exercise } from "@/types/exam";

const ExerciseSchema = z.object({
  id: z.string(),
  number: z.number(),
  type: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number(),
  statement: z.string(),
  subQuestions: z
    .array(z.object({ label: z.string(), statement: z.string(), points: z.number() }))
    .nullable()
    .optional(),
  solution: z.object({
    finalAnswer: z.string(),
    methodology: z.string(),
    commonMistakes: z.array(z.string()).optional(),
  }),
  chapterIds: z.array(z.string()),
  estimatedMinutes: z.number(),
});

const RequestSchema = z.object({
  exercise: ExerciseSchema,
  language: z.enum(["french", "english", "arabic"]).default("french"),
});

const RubricResponseSchema = z.object({
  totalPoints: z.number(),
  criteria: z.array(
    z.object({
      label: z.string(),
      description: z.string(),
      points: z.number(),
      markType: z.enum(["method", "answer", "presentation"]).catch("method"),
    })
  ),
  partialCredit: z
    .array(z.object({ scenario: z.string(), award: z.string() }))
    .default([]),
  commonErrors: z
    .array(z.object({ error: z.string(), penalty: z.string() }))
    .default([]),
});

function extractJSONObject(raw: string): string {
  const stripped = raw.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  const start = stripped.indexOf("{");
  if (start === -1) return stripped;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\" && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return stripped.slice(start, i + 1);
  }
  return stripped.slice(start);
}

function robustParse(text: string): unknown {
  try { return JSON.parse(text); } catch { /* continue */ }
  try { return JSON.parse(text.replace(/\\(?!["\\\/bfnrtu])/g, "\\\\")); } catch { /* continue */ }
  try {
    const fixed = text
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
      return NextResponse.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    const { exercise, language } = parsed.data;
    const systemPrompt = buildRubricSystemPrompt(language);
    const userPrompt = buildRubricUserPrompt(exercise as Exercise);

    const result = await withRetryAndFallback((model) =>
      model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      })
    );

    const text = result.response.text();
    const jsonStr = extractJSONObject(text);
    const rubricRaw = robustParse(jsonStr);
    const rubric = RubricResponseSchema.parse(rubricRaw);

    return NextResponse.json({ success: true, rubric });
  } catch (err) {
    console.error("[/api/rubric]", err);
    return NextResponse.json(
      { success: false, errors: [geminiErrorMessage(err)] },
      { status: 503 }
    );
  }
}
