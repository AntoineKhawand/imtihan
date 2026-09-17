import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection("newsletter_subscribers").orderBy("createdAt", "desc").limit(500).get();
    const subscribers = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        email: d.email ?? "",
        source: d.source ?? "",
        createdAt: d.createdAt ?? 0,
        checklistSentAt: d.checklistSentAt ?? null,
      };
    });
    return NextResponse.json({ subscribers }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/admin/newsletter-subscribers]", err);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
