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

    if (category && category !== "All") {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();
    const total = snapshot.size;
    
    // Manual pagination for simplicity (Firestore offset is expensive/not ideal for small sets)
    const articles = snapshot.docs
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
