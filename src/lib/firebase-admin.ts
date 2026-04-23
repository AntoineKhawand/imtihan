/**
 * Firebase Admin SDK — server-side only.
 * Import this ONLY inside Next.js API routes or server actions.
 * Never import in client components.
 */
import * as admin from "firebase-admin";

export let adminAuth: admin.auth.Auth;
export let adminDb: admin.firestore.Firestore;
export let adminStorage: admin.storage.Storage;

let adminApp: admin.app.App | undefined;

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  if (adminApp) {
    return adminApp;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL) {
      console.warn("Firebase Admin env vars not set — some features may not work");
      throw new Error("Firebase Admin not initialized");
    }
    throw new Error(
      "Missing Firebase Admin environment variables. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
  }

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return adminApp;
}

try {
  const app = getAdminApp();
  adminAuth = admin.auth(app);
  adminDb = admin.firestore(app);
  adminStorage = admin.storage(app);
} catch {
  console.warn("Firebase Admin SDK initialization skipped (env vars missing)");
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