import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    
    const stripe = getStripe();
    const userSnap = await userRef.get();
    const customerId = userSnap.data()?.subscription?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}