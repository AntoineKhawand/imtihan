import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GEMINI_MODEL_PRIMARY, getGeminiModel } from "@/lib/gemini";
import { verifySession } from "@/lib/firebase-admin";

// FOUNDER_DECISIONS.md #8: distinct from src/app/api/exam/translate/route.ts
// (the real, already-authenticated translate feature actually wired to the
// UI) — this top-level route has no current caller anywhere in src/
// (confirmed by search, 2026-09-27), no auth, and no request-shape
// validation. Closing all three with zero regression risk, since nothing
// depends on the current unauthenticated/unvalidated behavior.
const RequestSchema = z.object({
  exercise: z.any(),
  targetLanguage: z.string().min(1).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const uid = await verifySession(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Exercise and target language are required" }, { status: 400 });
    }
    const { exercise, targetLanguage } = parsed.data;

    const model = getGeminiModel(GEMINI_MODEL_PRIMARY);

    const prompt = `
      You are an expert educational translator. 
      Translate the following exercise object into ${targetLanguage}.
      
      Rules:
      1. Preserve all LaTeX notations exactly as they are ($...$ or \\ce{...}).
      2. Preserve all Markdown formatting.
      3. Do NOT change the meaning or the numbers.
      4. Translate the title, statement, sub-questions (labels and statements), finalAnswer, and methodology.
      5. Translate the "label" of sub-questions to match the target language convention if necessary (e.g. "أ." for Arabic).
      6. Return the result as a JSON object matching the input structure.

      Input: ${JSON.stringify(exercise)}
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
