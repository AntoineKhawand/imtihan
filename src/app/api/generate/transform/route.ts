import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRetryAndFallback } from "@/lib/gemini";
import type { Exercise } from "@/types/exam";
import { sanitizeError, createSecurityHeaders } from "@/lib/security";

const RequestSchema = z.object({
  exercise: z.any(),
  type: z.enum(["table", "visual", "image"]),
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
      const visualReq = prompt ? `Specific requirement: ${prompt}` : `Add a suitable mathematical graph, diagram, or chart.`;
      instruction = `${visualReq} 
      - For mathematical graphs (functions, parabolas, curves), use Mermaid \`xychart-beta\`.
      - For diagrams (electrical circuits, chemical setups, biology structures), use Mermaid \`flowchart TD\`.
      - IMPORTANT: Mermaid is NOT a function plotter. You MUST provide explicit data points. e.g., \`x-axis [0, 1, 2, 3]\` and \`line [0, 1, 4, 9]\`.
      - QUOTING: Always wrap labels in double quotes to avoid errors with special characters (e.g., A["f(x) = x^2"]).
      - MANDATORY: Wrap the Mermaid code in triple backticks (e.g., \`\`\`mermaid ... \`\`\`).
      - Return the Mermaid block directly within the 'statement' field.`;
    } else if (type === "image") {
      const imageReq = prompt ? `Specific image requirement: ${prompt}` : `Insert a suitable scientific illustration or academic visual.`;
      instruction = `- ${imageReq}
      - Insert the tag [IMAGE: concise detailed prompt] exactly where the image should appear in the 'statement' (usually at the beginning or right after the context).
      - PROMPT STYLE: Focus on professional high-fidelity mockups, flat design, and minimalist vector illustrations.
      - IMPORTANT: Minimize text within the image itself. Prefer icons, symbols, and structural clarity over labels.
      - STRICT: DO NOT use HTML tags. Only use the [IMAGE: ...] format.
      - Keep the JSON EXACTLY the same, only modify 'statement'.`;
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
