import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GEMINI_MODEL_PRIMARY, getGeminiModel } from "@/lib/gemini";
import { checkAndIncrementDailyLimit, getClientIp } from "@/lib/rateLimit";

// This route calls a paid Gemini API with no sign-in requirement (intentional —
// it's the public "try our scanner" demo on the marketing site, src/app/scanner/page.tsx)
// and previously had zero rate limiting and zero request-shape validation
// (FOUNDER_DECISIONS.md #8). A per-IP daily cap plus a payload size cap bounds
// the cost exposure of an anonymous route without requiring login, which would
// break the intended try-it-free UX.
const DAILY_LIMIT_PER_IP = 15;
const MAX_IMAGE_BASE64_CHARS = 8_000_000; // ~6MB decoded — generous for a phone photo of a page

const RequestSchema = z.object({
  image: z.string().min(1).max(MAX_IMAGE_BASE64_CHARS),
  mimeType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = await checkAndIncrementDailyLimit("scanner", ip, DAILY_LIMIT_PER_IP);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many scans from this network today. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { image, mimeType } = parsed.data;

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
