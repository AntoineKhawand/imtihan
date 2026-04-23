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

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

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

// Lazy getters — no initialization happens at import time
export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    return Reflect.get(admin.auth(getAdminApp()), prop);
  },
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    return Reflect.get(admin.firestore(getAdminApp()), prop);
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) {
    return Reflect.get(admin.storage(getAdminApp()), prop);
  },
});

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
