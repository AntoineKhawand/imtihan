import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid || !(await isAdmin(uid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUid } = await request.json();
    if (!targetUid || typeof targetUid !== "string") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(targetUid);
    const snap = await userRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userRef.update({
      examsGenerated: 0,
      monthlyExamsGenerated: 0,
      extraExamsQuota: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[/api/admin/reset-trial]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
