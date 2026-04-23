import { adminAuth } from "@/lib/firebase-admin";

/**
 * Returns true if the given UID belongs to an admin.
 * Checks ADMIN_EMAILS env var (comma-separated) so you never need to look up Firebase UIDs.
 * Falls back to ADMIN_UIDS for UID-based checks.
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const allowedUids = (process.env.ADMIN_UIDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Fast path: UID is directly listed
  if (allowedUids.includes(uid)) return true;

  // Email path: resolve UID → email via Firebase Admin
  if (allowedEmails.length > 0) {
    try {
      const user = await adminAuth.getUser(uid);
      return allowedEmails.includes((user.email ?? "").toLowerCase());
    } catch {
      return false;
    }
  }

  return false;
}
