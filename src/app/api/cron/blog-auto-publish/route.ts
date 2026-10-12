import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { withRetryAndFallback, geminiErrorMessage } from "@/lib/gemini";
import { getAnthropicClient, isAnthropicConfigured, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { isAdmin } from "@/lib/admin";
import { shortId, slugify } from "@/lib/utils";
import { buildBlogPrompt, selectBlogBrief, type RecentBlogPost } from "@/lib/prompts/blog";
import { GeneratedBlogSchema, blogQualityIssues, blogReadTime } from "@/lib/blogQuality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  // BUG: this used to treat ANY successfully-verified Firebase ID token as
  // authorized — i.e. any signed-in account (a free-tier teacher, even a
  // student), not just an admin — despite the comment's own intent and
  // every sibling /api/admin/* route gating on isAdmin(uid). That let any
  // signed-in user trigger an unbounded, cost-incurring Claude/Gemini call
  // and auto-publish a live blog post with zero review. Now matches the
  // same verifyIdToken + isAdmin(uid) pattern used everywhere else.
  if (!isAuthorized && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken && (await isAdmin(decodedToken.uid))) isAuthorized = true;
    } catch (e) {
      console.error("Auth verify error:", e);
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Recent content is editorial context, not a source of factual claims.
    const recentSnapshot = await adminDb.collection("blog_posts")
      .orderBy("createdAt", "desc").limit(60).get();
    const recent: RecentBlogPost[] = recentSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: typeof data.title === "string" ? data.title : "",
        primaryKeyword: typeof data.primaryKeyword === "string" ? data.primaryKeyword : undefined,
      };
    });
    const brief = selectBlogBrief(recent, Math.floor(Date.now() / 86400000));
    const prompt = buildBlogPrompt(brief, recent);

    // ── AI Generation (Primary: Claude, Fallback: Gemini) ───────────────────
    // Matches the pattern already used by /api/generate, /api/analyze, and
    // /api/exam/translate — this route is text-only (no document upload),
    // so it's the simplest case: no image/PDF content block needed.
    let result = "";
    let providerName: "Claude" | "Gemini" = "Gemini";

    if (isAnthropicConfigured()) {
      try {
        console.log("[/api/cron/blog-auto-publish] Attempting Claude...");
        const anthropic = getAnthropicClient();
        const message = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
        });
        result = message.content.filter(block => block.type === "text").map(block => block.text).join("\n");
        providerName = "Claude";
      } catch (claudeErr) {
        console.warn("[/api/cron/blog-auto-publish] Claude failed, falling back to Gemini:", claudeErr);
      }
    }

    if (!result) {
      try {
        console.log("[/api/cron/blog-auto-publish] Using Gemini...");
        result = await withRetryAndFallback(async (model) => {
          const res = await model.generateContent(prompt);
          return res.response.text();
        });
        providerName = "Gemini";
      } catch (geminiErr) {
        console.error("[/api/cron/blog-auto-publish] Gemini fallback failed:", geminiErr);
        return NextResponse.json(
          { success: false, error: geminiErrorMessage(geminiErr) },
          { status: 503 }
        );
      }
    }

    console.log(`[/api/cron/blog-auto-publish] Generated via ${providerName}`);

    // Clean up JSON response - more robust extraction
    let postData;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : result;
      postData = GeneratedBlogSchema.parse(JSON.parse(jsonStr));
    } catch (e) {
      console.error("Failed to parse AI response:", result);
      throw new Error("AI returned malformed data. Try again.");
    }

    const issues = blogQualityIssues(postData, brief.keyword, brief.link, recent.map(p => p.title));
    if (issues.length) {
      console.warn("[/api/cron/blog-auto-publish] Quality gate rejected article:", issues);
      return NextResponse.json({ success: false, error: "Article did not pass editorial checks", issues }, { status: 422 });
    }

    // 3. Generate Slug & Save
    const slug = slugify(postData.title) + "-" + shortId().slice(0, 4);

    const post = {
      ...postData,
      readTime: blogReadTime(postData.content),
      primaryKeyword: brief.keyword,
      relatedKeywords: [...brief.related],
      language: brief.language,
      editorialVersion: 1,
      slug,
      createdAt: new Date(),
      published: true,
      author: "Imtihan AI Assistant"
    };

    const docRef = await adminDb.collection("blog_posts").add({
      ...post,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      slug,
      title: postData.title
    });

  } catch (error: unknown) {
    console.error("[/api/cron/blog-auto-publish] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to auto-publish blog"
    }, { status: 500 });
  }
}
