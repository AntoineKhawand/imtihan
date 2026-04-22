import { NextResponse } from "next/server";
import { getStripe, type Stripe } from "@/lib/stripe";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { doc, getDoc } from "firebase/firestore";

const PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly";

export async function POST(request: Request) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { successUrl, cancelUrl } = body;

    const userRef = doc(adminDb, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const customerEmail = userData.email;
    const customerId = userData.subscription?.stripeCustomerId;

    const stripe = getStripe();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing/cancel`,
      metadata: {
        uid,
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!customerId && session.customer) {
      await userRef.update({
        "subscription.stripeCustomerId": session.customer,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}