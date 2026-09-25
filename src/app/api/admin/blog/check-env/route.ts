import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    hasGeminiKey: !!process.env.GOOGLE_AI_API_KEY,
    geminiKeyPrefix: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.slice(0, 5) + "..." : "missing",
    hasCronSecret: !!process.env.CRON_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
}
