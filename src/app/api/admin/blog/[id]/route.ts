import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { BlogPostUpdateSchema, type BlogPostDetail } from "@/types/blog";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: fetch one blog_posts document by id, full fields, for the admin edit
// form to prefill. Admin-auth-gated (same pattern as every other
// src/app/api/admin/* route — see src/lib/admin.ts's isAdmin()).
export async function GET(request: NextRequest, { params }: RouteContext) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const snap = await adminDb.collection("blog_posts").doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data = snap.data()!;
    const createdAt =
      typeof data.createdAt?.toMillis === "function"
        ? data.createdAt.toMillis()
        : typeof data.createdAt === "number"
          ? data.createdAt
          : null;

    const post: BlogPostDetail = {
      id: snap.id,
      slug: data.slug ?? "",
      title: data.title ?? "",
      description: data.description ?? "",
      content: data.content ?? "",
      category: data.category ?? "",
      readTime: data.readTime ?? "",
      author: data.author ?? "",
      published: data.published ?? false,
      createdAt,
    };

    return NextResponse.json({ post }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/admin/blog/[id]] GET", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PATCH: update an existing blog_posts document's editable fields
// (title, description, content, category) by document id. Scoped
// intentionally — not a full CMS. Does not touch slug/author/readTime/
// published/createdAt, and never creates a document (existing-only), so a
// typo'd id can't silently create a stray post.
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = BlogPostUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const ref = adminDb.collection("blog_posts").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await ref.update({
      ...parsed.data,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/admin/blog/[id]] PATCH", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
