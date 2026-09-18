import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import type { BlogPostSummary } from "@/types/blog";

export const dynamic = "force-dynamic";

// Admin-only list of every blog_posts document, used by /admin's Blog tab to
// pick a post to edit. Distinct from the unauthenticated public /api/blog
// (paginated, published-only feed) and the unauthenticated debug
// /api/admin/blog/diag (last-10 only) — this one is auth-gated and returns
// every post so an admin can find any of the 27 cron-generated ones.
export async function GET(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await adminDb.collection("blog_posts").orderBy("createdAt", "desc").get();

    const posts: BlogPostSummary[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt =
        typeof data.createdAt?.toMillis === "function"
          ? data.createdAt.toMillis()
          : typeof data.createdAt === "number"
            ? data.createdAt
            : null;

      return {
        id: doc.id,
        slug: data.slug ?? "",
        title: data.title ?? "(untitled)",
        category: data.category ?? "",
        published: data.published ?? false,
        createdAt,
      };
    });

    return NextResponse.json({ posts }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/admin/blog]", err);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}
