import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").limit(200).get();
    const users = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        uid: doc.id,
        email: d.email ?? "",
        displayName: d.displayName ?? "",
        createdAt: d.createdAt?.toMillis?.() ?? d.createdAt ?? 0,
        lastLoginAt: d.lastLoginAt ?? null,
        renewalRequested: d.renewalRequested ?? false,
        proExpiresAt: d.proExpiresAt ?? null,
        examsGenerated: d.examsGenerated ?? 0,
        monthlyExamsGenerated: d.monthlyExamsGenerated ?? 0,
        extraExamsQuota: d.extraExamsQuota ?? 0,
      };
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[/api/admin/users]", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
