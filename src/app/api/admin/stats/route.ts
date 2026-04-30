import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const statsSnap = await adminDb.collection("system").doc("stats").get();
    const statsData = statsSnap.exists ? statsSnap.data() : { subjects: {} };
    
    return NextResponse.json({ 
      subjects: statsData?.subjects || {},
      lastUpdated: statsData?.lastGenerationAt?.toMillis?.() || Date.now()
    });
  } catch (err) {
    console.error("[/api/admin/stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
