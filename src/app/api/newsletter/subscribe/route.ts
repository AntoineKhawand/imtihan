import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSecurityHeaders } from "@/lib/security";
import { sendEmail } from "@/lib/brevo";
import { adminDb } from "@/lib/firebase-admin";
import { CHECKLIST_SUBJECT, CHECKLIST_HTML } from "@/lib/emails/newsletterChecklist";

// Public, unauthenticated endpoint (landing-page lead magnet signup) — no
// account required. `honeypot` is a hidden form field real visitors never
// fill in; any value there is a bot and gets silently accepted-but-dropped
// rather than told it was rejected (never tip off a bot to what caught it).
const BodySchema = z.object({
  email: z.string().email().max(200),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Please enter a valid email." }, { status: 400, headers: createSecurityHeaders() });
    }
    const { email, honeypot } = parsed.data;

    // Bot caught the honeypot — pretend success, do nothing else.
    if (honeypot) {
      return NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const docId = Buffer.from(normalizedEmail).toString("base64url");
    const ref = adminDb.collection("newsletter_subscribers").doc(docId);
    const existing = await ref.get();

    if (!existing.exists) {
      await ref.set({
        email: normalizedEmail,
        source: "landing_lead_magnet",
        createdAt: Date.now(),
      });

      const result = await sendEmail({
        to: normalizedEmail,
        subject: CHECKLIST_SUBJECT,
        html: CHECKLIST_HTML,
      });
      if (result.ok) {
        // Absence of this field is exactly what
        // /api/cron/newsletter-checklist-backfill retries — never write it
        // on failure.
        await ref.update({ checklistSentAt: Date.now() });
      } else {
        console.error("[/api/newsletter/subscribe] Email send failed:", result.error);
        // Subscriber is saved either way — a delivery hiccup shouldn't block
        // signup, and the backfill cron will pick this one up.
      }
    }

    return NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
  } catch (error) {
    console.error("[/api/newsletter/subscribe]", error);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500, headers: createSecurityHeaders() });
  }
}
