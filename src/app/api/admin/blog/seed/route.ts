import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const ARTICLES = [
  {
    slug: "stop-recycled-exams",
    title: "Are Your Students Bored of the Same Recycled Exams?",
    description: "Why using past papers (Dawrat) is hurting your students' engagement, and how AI can instantly solve the problem.",
    category: "Teaching Strategies",
    readTime: "4 min read",
    content: "## The Dawrat Dilemma\n\nFor decades, the standard practice in Lebanese schools has been to recycle old official exams (Dawrat). While this prepares students for the format, it often leads to a 'memorization' culture rather than a 'understanding' culture.\n\n### Why Students Disengage\n\nWhen students recognize a problem from a past paper they've already seen, their brain shifts from analytical mode to recall mode. This hurts their ability to tackle truly novel problems in the future.\n\n### The AI Solution\n\nWith Imtihan, you can take a classic Dawrat problem and instantly generate a 'sibling' problem—same concept, same difficulty, but fresh values and a new scenario. This keeps students on their toes and ensures they've mastered the concept, not just the question."
  },
  {
    slug: "save-time-teaching",
    title: "Reclaiming Your Sundays: How Imtihan Automates Teacher Tasks",
    description: "Learn how generative AI can save Lebanese teachers 10+ hours a week by automating exam creation.",
    category: "Productivity",
    readTime: "4 min read",
    content: "## The Sunday Night Stress\n\nWe've all been there: a mountain of corrections and three exams to draft for Monday morning. Sunday, which should be for rest, becomes the most stressful day of the week.\n\n### Automation is Here\n\nImtihan wasn't built to replace teachers; it was built to free them. By automating the repetitive parts of exam creation—like drafting scenarios, formatting tables, and generating keys—you can reclaim hours of your personal time.\n\n### 5 Ways to Save Time\n\n1. **Instant Scenarios**: No more searching for physics contexts.\n2. **Auto-Formatting**: Everything is perfectly spaced for printing.\n3. **Sync Key**: The corrigé is drafted as you build the questions.\n4. **Batch Generation**: Create versions A and B in seconds.\n5. **Curriculum Alignment**: No more double-checking against the Lebanese official standards."
  },
  {
    slug: "guide-for-parents",
    title: "Is Your Child Ready for the Brevet? Create Mock Exams at Home",
    description: "How Lebanese parents can use AI to create curriculum-aligned mock exams for their kids.",
    category: "Parental Guides",
    readTime: "5 min read",
    content: "## Supporting Your Child at Home\n\nThe Brevet is a stressful milestone for any Lebanese family. Parents often feel helpless when it comes to testing their child's knowledge without expensive private tutors.\n\n### Mock Exams on Demand\n\nImtihan allows parents to select the specific chapters their child is studying and generate a full mock exam in seconds. This provides a safe, low-stakes environment for students to practice before the real deal.\n\n### How to Use Imtihan as a Parent\n\n1. **Select the Topic**: Biology, Math, or Geography.\n2. **Match the Level**: Ensure it's set to Grade 9 (Brevet).\n3. **Review with the Key**: Use the automatically generated corrigé to check your child's work together."
  }
];

export async function GET() {
  try {
    const results = [];
    for (const article of ARTICLES) {
      const existing = await adminDb.collection("blog_posts").where("slug", "==", article.slug).get();
      if (existing.empty) {
        await adminDb.collection("blog_posts").add({
          ...article,
          createdAt: new Date(),
          published: true,
          author: "Jean-Paul Mansour"
        });
        results.push({ slug: article.slug, status: "added" });
      } else {
        results.push({ slug: article.slug, status: "exists" });
      }
    }
    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
