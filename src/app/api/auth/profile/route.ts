import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifySession } from "@/lib/firebase-admin";
import { createSecurityHeaders } from "@/lib/security";

/**
 * Returns the authenticated user's Firestore profile via Admin SDK.
 * Used as a fallback when client-side Firestore reads fail (e.g., restrictive
 * security rules or transient auth propagation delays).
 */
export async function GET(request: NextRequest) {
  const uid = await verifySession(request);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createSecurityHeaders() });
  }

  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404, headers: createSecurityHeaders() });
  }

  return NextResponse.json(
    { profile: snap.data() },
    { headers: { ...createSecurityHeaders(), "Cache-Control": "no-store" } }
  );
}
