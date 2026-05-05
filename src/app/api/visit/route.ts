import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createSecurityHeaders } from "@/lib/security";
import admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATS_REF = () => adminDb.collection("system").doc("stats");

export async function GET() {
  try {
    const snap = await STATS_REF().get();
    const total = snap.data()?.totalVisits ?? 0;
    return NextResponse.json({ total }, {
      headers: { ...createSecurityHeaders(), "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}

export async function POST() {
  try {
    await STATS_REF().set(
      { totalVisits: admin.firestore.FieldValue.increment(1) },
      { merge: true }
    );
    const snap = await STATS_REF().get();
    const total = snap.data()?.totalVisits ?? 1;
    return NextResponse.json({ total }, {
      headers: { ...createSecurityHeaders(), "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ total: 0 }, { status: 500 });
  }
}
