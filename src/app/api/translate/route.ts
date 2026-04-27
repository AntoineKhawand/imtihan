import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL_PRIMARY, getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { exercise, targetLanguage } = await req.json();

    if (!exercise || !targetLanguage) {
      return NextResponse.json({ error: "Exercise and target language are required" }, { status: 400 });
    }

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
