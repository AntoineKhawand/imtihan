import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODEL_PRIMARY, getGeminiModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { studentImage, mimeType, markingScheme, exerciseStatement } = await req.json();

    if (!studentImage || !markingScheme) {
      return NextResponse.json({ error: "Image and marking scheme are required" }, { status: 400 });
    }

    const model = getGeminiModel(GEMINI_MODEL_PRIMARY);

    const prompt = `
      You are an expert examiner. 
      Grade the student's handwritten or typed answer provided in the image against the provided marking scheme.
      
      Context:
      - Exercise: ${exerciseStatement}
      - Marking Scheme: ${JSON.stringify(markingScheme)}
      
      Tasks:
      1. Analyze the student's answer in the image.
      2. For each criterion in the marking scheme, decide if the student earned the points (full, partial, or zero).
      3. Provide a brief justification for each awarded point.
      4. Calculate the total score.
      5. Identify specific errors or areas for improvement.
      
      Format your response as JSON:
      {
        "totalScore": 15.5,
        "maxScore": 20,
        "breakdown": [
          { "criterion": "Correct formula used", "pointsAwarded": 2, "maxPoints": 2, "feedback": "Student correctly identified the kinetic energy formula." },
          { "criterion": "Calculation accuracy", "pointsAwarded": 0.5, "maxPoints": 2, "feedback": "Correct approach but made a decimal error in the final step." }
        ],
        "generalFeedback": "Good understanding of the core concepts. Watch out for unit conversions.",
        "improvementTips": ["Review the conversion from cm to m.", "Show more intermediate steps in algebra."]
      }

      Return ONLY the JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: studentImage,
          mimeType: mimeType || "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
