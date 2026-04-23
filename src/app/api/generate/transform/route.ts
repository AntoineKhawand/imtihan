import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback } from "@/lib/gemini";
import type { Exercise } from "@/types/exam";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";

const RequestSchema = z.object({
  exercise: z.any(), // Not strictly typed here, but we pass it as Exercise
  type: z.enum(["table", "image"]),
  language: z.string(),
});

function sanitizeJSON(input: string): string {
  const stripped = input.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  let start = -1;
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === "[" || stripped[i] === "{") { start = i; break; }
  }
  if (start === -1) return stripped;
  return stripped.slice(start);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { exercise, type, language } = parsed.data;

    let instruction = "";
    if (type === "table") {
      instruction = `Transform the statement of this exercise into a well-formatted Markdown Table if applicable, or restructure its data points into a clear Markdown Table within the statement. Do not change the core academic difficulty or points, just improve the layout by using a markdown table for the data/context.`;
    } else {
      instruction = `Add a suitable image or graph placeholder to the exercise statement using standard markdown image syntax, e.g., ![Graph of velocity over time](placeholder). Ensure it makes sense within the context of the question.`;
    }

    const systemPrompt = `You are an expert exam designer and editor. 
You will receive a JSON representing a single academic exercise.
Your task is to:
1. ${instruction}
2. Ensure the language remains in ${language}.
3. Return the EXACT SAME JSON structure for the exercise, but with the 'statement' field updated. Do not wrap the JSON in markdown code blocks. Just return the JSON object.

Original Exercise JSON:
${JSON.stringify(exercise, null, 2)}`;

    const result = await withRetryAndFallback(async (model) => {
      const response = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: "Return the updated JSON object for the exercise." }] }
        ]
      });
      return response.response;
    });

    const raw = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleanRaw = sanitizeJSON(raw);
    
    try {
      const updatedExercise = JSON.parse(cleanRaw) as Exercise;
      return NextResponse.json({ success: true, exercise: updatedExercise });
    } catch (e) {
      console.error("[/api/generate/transform] JSON parse error:", e);
      return NextResponse.json({ error: "Failed to parse LLM response" }, { status: 500 });
    }
  } catch (error) {
    console.error("[/api/generate/transform]", error);
    return NextResponse.json({ error: "Transformation failed" }, { status: 500 });
  }
}
