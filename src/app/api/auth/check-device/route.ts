import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const MAX_ACCOUNTS_PER_DEVICE = 1;

export async function POST(request: NextRequest) {
  try {
    const { fingerprint } = await request.json();

    if (!fingerprint || typeof fingerprint !== "string") {
      return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
    }

    // Check how many users have this fingerprint
    const snapshot = await adminDb
      .collection("users")
      .where("fingerprint", "==", fingerprint)
      .count()
      .get();

    const count = snapshot.data().count;

    if (count >= MAX_ACCOUNTS_PER_DEVICE) {
      return NextResponse.json(
        { allowed: false, error: "Device limit reached. You cannot create more accounts from this device." },
        { status: 403 }
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Error checking device fingerprint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
