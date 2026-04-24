import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Stripe payments are not enabled. Please upgrade via WhatsApp." },
    { status: 410 }
  );
}
