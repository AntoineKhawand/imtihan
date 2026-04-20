/**
 * Firebase Admin SDK — server-side only.
 * Import this ONLY inside Next.js API routes or server actions.
 * Never import in client components.
 */
import * as admin from "firebase-admin";

let adminApp: admin.app.App;

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
    throw new Error(
      "Missing Firebase Admin environment variables. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

adminApp = getAdminApp();

export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
export const adminStorage = admin.storage(adminApp);

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
