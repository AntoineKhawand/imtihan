import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { shortId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function GET(request: NextRequest) {
  // 1. Verify Authentication (Cron Secret OR Admin Token)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  let isAuthorized = false;

  // Check Cron Secret
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  }

  // Check Admin Identity (if called from Dashboard)
  if (!isAuthorized && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const { auth } = require("@/lib/firebase-admin");
      const decodedToken = await auth.verifyIdToken(token);
      // You can add more strict admin check here if needed (e.g. check uid or custom claim)
      if (decodedToken) isAuthorized = true;
    } catch (e) {
      // Not a valid admin token, continue
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Determine Topic & Content
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    
    const prompt = `
      You are a high-end educational consultant and blog writer for "Imtihan", an AI platform that helps Lebanese teachers and students generate professional exams.
      Today is ${today}.
      
      Task: Write a trending, viral-potential blog post for the Lebanese educational community.
      
      CORE FOCUS:
      The article MUST explicitly relate to how Imtihan helps with specific curricula:
      - Bac Libanais (Official Lebanese Program)
      - Bac Français (French System)
      - IB (International Baccalaureate)
      - University entrance exams in Lebanon
      
      TARGET PERSONAS (Rotate focus daily):
      - Teachers (Time-saving, pedagogy, exam quality)
      - Parents (Supporting children at home, mock exams, Brevet preparation)
      - Students (Self-testing, understanding official exam formats)
      - Coordinators (Standardization across sections)
      
      Requirements:
      - Topic: Must be relevant to current Lebanese education milestones.
      - Tone: Professional, authoritative, yet encouraging and premium.
      - Format: Return a JSON object with:
        {
          "title": "...",
          "description": "...",
          "category": "...", (Pick from: Teaching Strategies, Productivity, Parental Guides, Leadership, Higher Ed)
          "readTime": "... min read",
          "content": "Full markdown content with h2, h3 tags. Mention Imtihan's specific features like AI diagrams, instant corrigé, and curriculum alignment."
        }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up JSON response
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const postData = JSON.parse(jsonStr);

    // 3. Generate Slug & Save
    const slug = postData.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-") + "-" + shortId().slice(0, 4);

    const post = {
      ...postData,
      slug,
      createdAt: new Date(), // adminDb uses FieldValue.serverTimestamp() usually, but native Date works too if mapped
      published: true,
      author: "Imtihan AI Assistant"
    };

    const docRef = await adminDb.collection("blog_posts").add({
      ...post,
      createdAt: new Date() // Store as Date for easier querying in the API
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      slug,
      title: postData.title
    });

  } catch (error) {
    console.error("[/api/cron/blog-auto-publish] Error:", error);
    return NextResponse.json({ error: "Failed to auto-publish blog" }, { status: 500 });
  }
}
