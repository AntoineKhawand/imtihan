import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid || !(await isAdmin(uid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUid, amount } = await request.json();
    if (!targetUid || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(targetUid);
    await userRef.update({
      extraExamsQuota: FieldValue.increment(amount),
    });

    const snapshot = await userRef.get();
    return NextResponse.json({ 
      success: true, 
      extraExamsQuota: snapshot.data()?.extraExamsQuota 
    });

  } catch (error: any) {
    console.error("Error adding quota:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
