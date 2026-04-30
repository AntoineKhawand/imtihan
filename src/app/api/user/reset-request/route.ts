import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifySession } from "@/lib/firebase-admin";
import { createSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const uid = await verifySession(request);
    if (!uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: createSecurityHeaders() }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404, headers: createSecurityHeaders() }
      );
    }

    // Flag the user for reset request
    await userRef.update({
      resetRequested: true
    });

    return NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
  } catch (error) {
    console.error("[/api/user/reset-request]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
