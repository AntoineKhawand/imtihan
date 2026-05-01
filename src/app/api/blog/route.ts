import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    let query: any = adminDb.collection("blog_posts")
      .orderBy("createdAt", "desc");

    let snapshot = await query.get();
    
    // Auto-seed if empty
    if (snapshot.empty && (!category || category === "All")) {
      const INITIAL_ARTICLES = [
        {
          slug: "stop-recycled-exams",
          title: "Are Your Students Bored of the Same Recycled Exams?",
          description: "Why using past papers (Dawrat) is hurting your students' engagement, and how AI can instantly solve the problem.",
          category: "Teaching Strategies",
          readTime: "4 min read",
          content: "## The Dawrat Dilemma\n\nFor decades, the standard practice in Lebanese schools has been to recycle old official exams (Dawrat). While this prepares students for the format, it often leads to a 'memorization' culture rather than a 'understanding' culture.\n\n### Why Students Disengage\n\nWhen students recognize a problem from a past paper they've already seen, their brain shifts from analytical mode to recall mode. This hurts their ability to tackle truly novel problems in the future.\n\n### The AI Solution\n\nWith Imtihan, you can take a classic Dawrat problem and instantly generate a 'sibling' problem—same concept, same difficulty, but fresh values and a new scenario. This keeps students on their toes and ensures they've mastered the concept, not just the question.",
          author: "Jean-Paul Mansour",
          published: true,
          createdAt: new Date()
        },
        {
          slug: "save-time-teaching",
          title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks",
          description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
          category: "Productivity",
          readTime: "4 min read",
          content: "## The Sunday Night Stress\n\nWe've all been there: a mountain of corrections and three exams to draft for Monday morning. Sunday, which should be for rest, becomes the most stressful day of the week.\n\n### Automation is Here\n\nImtihan wasn't built to replace teachers; it was built to free them. By automating the repetitive parts of exam creation—like drafting scenarios, formatting tables, and generating keys—you can reclaim hours of your personal time.\n\n### 5 Ways to Save Time\n\n1. **Instant Scenarios**: No more searching for physics contexts.\n2. **Auto-Formatting**: Everything is perfectly spaced for printing.\n3. **Sync Key**: The corrigé is drafted as you build the questions.\n4. **Batch Generation**: Create versions A and B in seconds.\n5. **Curriculum Alignment**: No more double-checking against the Lebanese official standards.",
          author: "Jean-Paul Mansour",
          published: true,
          createdAt: new Date()
        }
      ];

      for (const article of INITIAL_ARTICLES) {
        await adminDb.collection("blog_posts").add(article);
      }
      
      // Re-fetch after seeding
      snapshot = await query.get();
    }

    // Apply category filter if needed (on the snapshot results or re-query)
    // For simplicity and to avoid multiple reads, we can filter the snapshot if category is set
    let docs = snapshot.docs;
    if (category && category !== "All") {
      docs = docs.filter((doc: any) => doc.data().category === category);
    }

    const total = docs.length;
    
    const articles = docs
      .slice(skip, skip + limit)
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        // Format timestamp for JSON
        date: doc.data().createdAt?.toDate?.()?.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        }) || "Recently"
      }));

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[/api/blog] Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
