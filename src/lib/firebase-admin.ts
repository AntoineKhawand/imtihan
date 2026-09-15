/**
 * Firebase Admin SDK — server-side only.
 * Import this ONLY inside Next.js API routes or server actions.
 * Never import in client components.
 *
 * Uses lazy initialization so the module can be imported at build time
 * without requiring env vars to be present.
 */
import * as admin from "firebase-admin";
import type { App } from "firebase-admin/app";

let _app: App | null = null;

function getAdminApp(): App {
  if (_app) return _app;

  // Already initialized by another import
  if (admin.apps.length > 0) {
    _app = admin.apps[0]!;
    return _app;
  }

  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = rawKey
    ?.replace(/^["']|["']$/g, "") // Strip leading/trailing quotes
    .replace(/\\n/g, "\n");

  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !privateKey
  ) {
    throw new Error(
      "Firebase Admin env vars missing. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
  }

  _app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return _app;
}

// Lazy getters — binds functions to their parent instances to preserve 'this'
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    const service = admin.auth(getAdminApp());
    const value = Reflect.get(service, prop);
    return typeof value === "function" ? value.bind(service) : value;
  },
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    const service = admin.firestore(getAdminApp());
    const value = Reflect.get(service, prop);
    return typeof value === "function" ? value.bind(service) : value;
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) {
    const service = admin.storage(getAdminApp());
    const value = Reflect.get(service, prop);
    return typeof value === "function" ? value.bind(service) : value;
  },
});

/**
 * Verify the __session cookie (set by /api/auth/session) and return the uid.
 * Use this in API routes that rely on the browser session cookie.
 */
export async function verifySession(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  if (!match) return null;
  const sessionCookie = decodeURIComponent(match[1]);
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Verify a Firebase ID token from the Authorization header */
export async function verifyIdToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Ensures a Firestore users/{uid} profile document exists for a signed-in user.
 *
 * The client-side registration flow (src/app/auth/register/page.tsx) also writes
 * this doc directly via the Firestore client SDK's `setDoc`, right after the
 * Firebase Auth account is created. That client write can lose a race against
 * Firestore's client-side auth-token propagation and fail with `permission-denied`
 * — when it does, the whole sign-up flow aborts, the account is left with no
 * profile, and the user becomes invisible to quota checks, /admin, etc.
 *
 * This is the server-side safety net: it runs on every session-cookie creation
 * (see /api/auth/session) via the Admin SDK, which is not subject to Firestore
 * security rules or client auth-token timing, so it cannot suffer the same race.
 * Uses `create()` (fails with ALREADY_EXISTS if the doc is already there) so it
 * never clobbers a profile that already exists or was just written concurrently.
 */
export async function ensureUserProfile(uid: string): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);
  try {
    const authUser = await adminAuth.getUser(uid);
    await userRef.create({
      uid,
      email: authUser.email ?? "",
      displayName: authUser.displayName ?? "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: "teacher",
      country: "LB",
      examsGenerated: 0,
      subscription: { status: "none", tier: "free" },
    });
  } catch (err) {
    // ALREADY_EXISTS (code 6) is the expected outcome whenever the client-side
    // write already succeeded — not an error.
    const code = (err as { code?: number | string })?.code;
    if (code === 6 || code === "already-exists") return;
    console.error("[ensureUserProfile] Failed to create profile for", uid, err);
  }
}
