import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL_PRIMARY, getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const model = getGeminiModel(GEMINI_MODEL_PRIMARY);

    const prompt = `
      You are an expert educational content digitizer. 
      Analyze the provided image of an exam question or exercise.
      
      Tasks:
      1. Extract the text accurately.
      2. Identify the subject (Math, Physics, Chemistry, Biology, etc.).
      3. Format all mathematical and chemical notations using LaTeX (e.g., $E = mc^2$ or $\\ce{H2O}$).
      4. Structure the output as a JSON object matching this schema:
      {
        "title": "A short descriptive title",
        "subject": "physics|mathematics|chemistry|biology|svt|philosophy|history|geography|english|french|arabic|informatics|economics|accounting|psychology",
        "statement": "The full text of the exercise statement in Markdown with KaTeX",
        "difficulty": "easy|medium|hard",
        "points": 5,
        "subQuestions": [
          { "label": "1.", "statement": "sub-question text", "points": 2 }
        ],
        "solution": {
          "finalAnswer": "The final answer",
          "methodology": "Step by step explanation"
        }
      }

      Return ONLY the JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,
          mimeType: mimeType || "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from markdown blocks if any
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Scanner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
