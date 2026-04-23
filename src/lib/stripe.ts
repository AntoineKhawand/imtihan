import Stripe from "stripe";

export type { Stripe };

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}