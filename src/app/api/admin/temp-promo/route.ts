import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const email = "bassel_yassine74@hotmail.com";
  const days = 30;

  try {
    const snap = await adminDb.collection("users").where("email", "==", email).get();
    if (snap.empty) {
      return NextResponse.json({ error: "User not found" });
    }

    const userDoc = snap.docs[0];
    const uid = userDoc.id;
    const currentData = userDoc.data();
    
    const currentExpiry = currentData.proExpiresAt || Date.now();
    const newExpiry = Math.max(currentExpiry, Date.now()) + (days * 24 * 60 * 60 * 1000);

    await adminDb.collection("users").doc(uid).update({
      proExpiresAt: newExpiry,
      planType: "monthly",
      monthlyExamsGenerated: 0,
      monthlyPeriodStart: Date.now(),
      renewalRequested: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Granted 30 days to ${email}`,
      newExpiry: new Date(newExpiry).toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
