import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetUrl } = body;

    const scanConfig = {
      target: targetUrl || "http://localhost:3000",
      workspace: `scan-${uid}-${Date.now()}`,
      initiatedBy: uid,
      initiatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Security scan queued",
      config: scanConfig,
      status: "queued"
    });
  } catch (error) {
    console.error("[Security Scan API]", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate scan" },
      { status: 500 }
    );
  }
}