import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { extendProByDays } from "@/lib/subscription";
import { isAdmin } from "@/lib/admin";

const BodySchema = z.object({
  targetUid: z.string().min(1),
  days: z.number().int().min(1).max(365).default(30),
});

export async function POST(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { targetUid, days } = parsed.data;

  try {
    const ref = adminDb.collection("users").doc(targetUid);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const current = snap.data()?.proExpiresAt ?? undefined;
    const newExpiry = extendProByDays(current, days);

    await ref.update({
      proExpiresAt: newExpiry,
      monthlyExamsGenerated: 0,
      monthlyPeriodStart: Date.now(),
      renewalRequested: false,
    });

    return NextResponse.json({
      success: true,
      proExpiresAt: newExpiry,
      expiresDate: new Date(newExpiry).toISOString(),
    });
  } catch (err) {
    console.error("[/api/admin/extend-pro]", err);
    return NextResponse.json({ error: "Failed to extend subscription" }, { status: 500 });
  }
}
