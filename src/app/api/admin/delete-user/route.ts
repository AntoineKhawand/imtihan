import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

/**
 * Permanently deletes a user: their Firebase Auth account, their saved-exam
 * subcollection, and their users/{uid} profile doc. Irreversible — the UI
 * gates this behind a confirmation dialog; this route adds its own guards
 * (no self-delete, no deleting another admin) so a UI bug can't turn into
 * a one-click account wipe.
 */
export async function POST(request: NextRequest) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid || !(await isAdmin(uid))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUid } = await request.json();
    if (!targetUid || typeof targetUid !== "string") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }
    if (targetUid === uid) {
      return NextResponse.json({ error: "You can't delete your own account from here" }, { status: 400 });
    }
    if (await isAdmin(targetUid)) {
      return NextResponse.json({ error: "Can't delete another admin account" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(targetUid);
    const snap = await userRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const email = snap.data()?.email ?? "";

    // delete the saved-exam subcollection in batches (Firestore caps a batch at 500 writes)
    const examsRef = userRef.collection("exams");
    let deletedExams = 0;
    while (true) {
      const batchSnap = await examsRef.limit(400).get();
      if (batchSnap.empty) break;
      const batch = adminDb.batch();
      batchSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deletedExams += batchSnap.size;
      if (batchSnap.size < 400) break;
    }

    await userRef.delete();

    // Auth deletion is best-effort: the profile may have gone orphaned from
    // Auth already (see ensureUserProfile's history), so a missing Auth user
    // shouldn't block cleaning up the rest.
    let authDeleted = true;
    try {
      await adminAuth.deleteUser(targetUid);
    } catch (err: any) {
      if (err?.code !== "auth/user-not-found") {
        console.error("[/api/admin/delete-user] Auth deletion failed for", targetUid, err);
        authDeleted = false;
      }
    }

    return NextResponse.json({ success: true, email, deletedExams, authDeleted });
  } catch (error: any) {
    console.error("[/api/admin/delete-user]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
