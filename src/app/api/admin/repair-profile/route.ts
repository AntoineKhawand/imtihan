import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminAuth, adminDb, verifySession } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { createSecurityHeaders } from "@/lib/security";

/**
 * One-off repair tool for the "ghost account" class of bug: a Firebase Auth
 * user exists but their `users/{uid}` Firestore profile was never created
 * (e.g. the client-side self-heal in AuthContext's onSnapshot fallback can
 * itself silently fail if the Firestore listener errors right after sign-in).
 *
 * Looks a person up by email via the Admin SDK (bypasses security rules
 * entirely, so no client-side race can affect it) and creates their profile
 * doc if missing. Safe to call repeatedly — no-ops if the doc already exists.
 *
 * Uses the __session cookie (not a Bearer token) so it works by just visiting
 * the URL in a browser that's already logged into /admin — no curl needed.
 */
export async function GET(request: NextRequest) {
  const uid = await verifySession(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: createSecurityHeaders() });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Missing ?email= query param" }, { status: 400, headers: createSecurityHeaders() });
  }

  try {
    const authUser = await adminAuth.getUserByEmail(email);

    const ref = adminDb.collection("users").doc(authUser.uid);
    const snap = await ref.get();

    if (snap.exists) {
      return NextResponse.json(
        { repaired: false, message: "Profile already exists — nothing to do.", uid: authUser.uid, profile: snap.data() },
        { headers: createSecurityHeaders() }
      );
    }

    const newProfile = {
      uid: authUser.uid,
      email: authUser.email ?? email,
      displayName: authUser.displayName ?? "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "teacher",
      country: "LB",
      examsGenerated: 0,
      subscription: { status: "none", tier: "free" },
    };

    await ref.set(newProfile);

    return NextResponse.json(
      { repaired: true, message: "Profile created.", uid: authUser.uid },
      { headers: createSecurityHeaders() }
    );
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/user-not-found") {
      return NextResponse.json({ error: `No Firebase Auth account found for ${email}` }, { status: 404, headers: createSecurityHeaders() });
    }
    console.error("[/api/admin/repair-profile]", err);
    return NextResponse.json({ error: "Failed to repair profile" }, { status: 500, headers: createSecurityHeaders() });
  }
}
