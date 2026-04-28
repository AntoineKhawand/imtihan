import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ref = adminDb.collection("users").doc(uid);
    await ref.update({
      renewalRequested: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/user/request-renewal]", err);
    return NextResponse.json({ error: "Failed to request renewal" }, { status: 500 });
  }
}
