import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const snapshot = await adminDb.collection("blog_posts")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      slug: doc.data().slug,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      category: doc.data().category
    }));

    return NextResponse.json({ 
      count: snapshot.size,
      posts 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
