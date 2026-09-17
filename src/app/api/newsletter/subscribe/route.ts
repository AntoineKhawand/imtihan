import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSecurityHeaders } from "@/lib/security";
import { sendEmail } from "@/lib/brevo";
import { adminDb } from "@/lib/firebase-admin";

// Public, unauthenticated endpoint (landing-page lead magnet signup) — no
// account required. `honeypot` is a hidden form field real visitors never
// fill in; any value there is a bot and gets silently accepted-but-dropped
// rather than told it was rejected (never tip off a bot to what caught it).
const BodySchema = z.object({
  email: z.string().email().max(200),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

const CHECKLIST_HTML = `
<!doctype html>
<html>
<head></head>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto;background:#f8fafc">
  <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6">
    <div style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 100%);padding:32px;text-align:center">
      <p style="color:#fff;font-size:20px;font-weight:700;margin:0">Imtihan</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:22px;margin:0 0 8px 0;color:#0d0d0d">Your Exam-Writing Checklist</h1>
      <p style="color:#4b5563;margin:0 0 24px 0;line-height:1.6">
        Ten checks worth running before any Bac Libanais, Bac Français, or IB exam goes out —
        the ones that catch the mistakes students actually complain about.
      </p>
      <ol style="color:#111;line-height:1.9;padding-left:20px;margin:0 0 24px 0">
        <li><strong>Total points add up</strong> — sum every exercise + sub-question against the stated total.</li>
        <li><strong>Difficulty is actually mixed</strong> — not every question at the same level, front-loaded easy.</li>
        <li><strong>Chapter coverage matches what you taught</strong> — no question from a chapter you skipped.</li>
        <li><strong>Every document has a real, checkable source</strong> — never an invented citation.</li>
        <li><strong>Command verbs match the curriculum's convention</strong> — "Montrer que" vs "Calculer" vs "استنتج" aren't interchangeable.</li>
        <li><strong>Corrigé barème sums to the exercise's points</strong>, not just the exam's total.</li>
        <li><strong>Language is fully consistent</strong> — no stray English/French mixed into an Arabic paper.</li>
        <li><strong>Numbers in the corrigé are internally consistent</strong> — no negative mass, no probability over 100%.</li>
        <li><strong>Duration is realistic</strong> for the exercise count and difficulty, not just copy-pasted from last time.</li>
        <li><strong>You'd want to sit it yourself</strong> — the actual test: is it fair, or just hard?</li>
      </ol>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 24px 0">
        Imtihan runs a version of this checklist automatically on every exam it generates —
        curriculum-aligned, corrigé included, in minutes instead of hours.
      </p>
      <a href="https://www.imtihan.live/create" style="display:inline-block;background:#1a5e3f;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600">
        Try your first exam free
      </a>
      <p style="color:#9ca3af;font-size:12px;margin:32px 0 0 0">
        You're getting this because you signed up at imtihan.live. No spam, no list-sharing —
        just this one email.
      </p>
    </div>
  </div>
</body>
</html>`;

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
        subject: "Your Exam-Writing Checklist — Imtihan",
        html: CHECKLIST_HTML,
      });
      if (!result.ok) {
        console.error("[/api/newsletter/subscribe] Email send failed:", result.error);
        // Subscriber is saved either way — a delivery hiccup shouldn't block signup.
      }
    }

    return NextResponse.json({ success: true }, { headers: createSecurityHeaders() });
  } catch (error) {
    console.error("[/api/newsletter/subscribe]", error);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500, headers: createSecurityHeaders() });
  }
}
