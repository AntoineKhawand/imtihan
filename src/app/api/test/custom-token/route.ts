import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// DEVELOPMENT ONLY — used exclusively by Playwright e2e tests.
// Returns a Firebase custom token and sets up the user's Firestore document.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  let body: { uid: string; profile?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { uid, profile } = body;
  if (!uid || typeof uid !== "string") {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  try {
    // Ensure the user exists in Firebase Auth
    try {
      await adminAuth.getUser(uid);
    } catch {
      await adminAuth.createUser({
        uid,
        email: `${uid}@test.imtihan.live`,
        displayName: "Playwright Test User",
        emailVerified: true,
      });
    }

    // Ensure the Firestore document exists (or update it with the given profile)
    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();
    const baseProfile = {
      uid,
      email: `${uid}@test.imtihan.live`,
      displayName: "Playwright Test User",
      createdAt: Date.now(),
      role: "teacher",
      country: "LB",
      examsGenerated: 0,
      subscription: { status: "none", tier: "free" },
    };

    if (!snap.exists) {
      await userRef.set({ ...baseProfile, ...(profile ?? {}) });
    } else if (profile) {
      await userRef.update(profile);
    }

    const customToken = await adminAuth.createCustomToken(uid);
    return NextResponse.json({ customToken });
  } catch (err) {
    console.error("[/api/test/custom-token]", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
