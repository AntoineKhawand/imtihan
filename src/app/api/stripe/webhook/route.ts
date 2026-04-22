import { NextResponse } from "next/server";
import { getStripe, type Stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { doc, updateDoc, serverTimestamp } from "firebase-admin/firestore";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;
        
        if (uid && session.subscription) {
          const userRef = doc(adminDb, "users", uid);
          await updateDoc(userRef, {
            "subscription.status": "active",
            "subscription.tier": "individual",
            "subscription.stripeCustomerId": session.customer as string,
            "subscription.stripeSubscriptionId": session.subscription as string,
            "subscription.renewsAt": Date.now() + 30 * 24 * 60 * 60 * 1000,
            updatedAt: serverTimestamp(),
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          const usersSnap = await adminDb
            .collection("users")
            .where("subscription.stripeCustomerId", "==", customerId)
            .get();

          for (const docSnap of usersSnap.docs) {
            await doc(adminDb, "users", docSnap.id).update({
              "subscription.status": "active",
              "subscription.renewsAt": Date.now() + 30 * 24 * 60 * 60 * 1000,
              updatedAt: serverTimestamp(),
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          const usersSnap = await adminDb
            .collection("users")
            .where("subscription.stripeCustomerId", "==", customerId)
            .get();

          for (const docSnap of usersSnap.docs) {
            await doc(adminDb, "users", docSnap.id).update({
              "subscription.status": "past_due",
              updatedAt: serverTimestamp(),
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const usersSnap = await adminDb
          .collection("users")
          .where("subscription.stripeCustomerId", "==", customerId)
          .get();

        for (const docSnap of usersSnap.docs) {
          await doc(adminDb, "users", docSnap.id).update({
            "subscription.status": "canceled",
            "subscription.tier": "free",
            updatedAt: serverTimestamp(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}