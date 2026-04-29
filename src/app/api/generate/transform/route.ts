import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback } from "@/lib/gemini";
import type { Exercise } from "@/types/exam";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";

const RequestSchema = z.object({
  exercise: z.any(),
  type: z.enum(["table", "visual", "image", "plot"]),
  language: z.string(),
  prompt: z.string().optional(),
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

    const { exercise, type, language, prompt } = parsed.data;

    let instruction = "";
    if (type === "table") {
      instruction = `Transform the statement of this exercise into a well-formatted Markdown Table if applicable, or restructure its data points into a clear Markdown Table within the statement. Do not change the core academic difficulty or points, just improve the layout by using a markdown table for the data/context.`;
    } else if (type === "visual") {
      const visualReq = prompt ? `The user wants: "${prompt}"` : `Add a suitable mathematical graph or logical diagram.`;
      instruction = `- Task: Create a MATHEMATICALLY ACCURATE Mermaid.js diagram.
      - ${visualReq}
      - ACCURACY: Ensure that data points, coordinates, and trends perfectly match the exercise and real-world scientific principles.
      - CONTEXT: Use the specific data, values, or functions from the text.
      - Use Mermaid \`xychart-beta\` for precise plotting and \`flowchart TD\` for logical flows.
      - MANDATORY: Wrap code in triple backticks. Return within 'statement'.`;
    } else if (type === "image") {
      const imageReq = prompt ? `The user wants: "${prompt}"` : `Add a suitable scientific illustration.`;
      instruction = `- Task: Generate a SCIENTIFICALLY ACCURATE and highly descriptive image prompt.
      - ${imageReq}
      - REALISM: The prompt must describe a visual that is factually correct according to scientific standards (e.g., correct lab equipment, accurate biological structures).
      - YOUR GOAL: Expand the request into a detailed, professional prompt for FLUX. Describe exactly what should be visible to ensure relevance.
      - STYLE: Academic, clean vector illustration, minimalist, high-fidelity, white background.
      - Keep JSON EXACTLY the same, only modify 'statement'.`;
    } else if (type === "plot") {
      const plotReq = prompt ? `The user wants: "${prompt}"` : `Plot the main function described in the problem.`;
      instruction = `- Task: Identify the mathematical function or coordinate grid requested.
      - ${plotReq}
      - OUTPUT: Add the equation string (e.g., "sin(x)", "x^2", "2*x + 1") to a NEW property in the JSON called "mathPlots". "mathPlots" is an array of strings.
      - BLANK GRID: If the user wants a grid for the student to draw on (e.g. prompt "blank grid", "for student", "empty"), add an empty string "" to mathPlots.
      - FORMAT: Use standard mathematical notation compatible with function-plot/D3 (e.g., x^2, sin(x), exp(x)).
      - Keep the rest of the JSON exactly the same.`;
    }

    const systemPrompt = `You are an expert exam designer and editor. 
You will receive a JSON representing a single academic exercise.
Your task is to:
1. ${instruction}
2. STRICT PRESERVATION: Do NOT delete, rewrite, or summarize any part of the original text. You must preserve every word of the statement. Only insert the new element.
3. Ensure the language remains in ${language}.
4. Return the EXACT SAME JSON structure for the exercise. Do not wrap the JSON in markdown code blocks. Just return the JSON object.

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
