import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REMINDER_WINDOW_DAYS = 5;
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.imtihan.live";

// ─── Email builder ────────────────────────────────────────────────────────────
function buildReminderEmail(
  name: string,
  email: string,
  daysLeft: number,
  expiryDate: string
): { subject: string; html: string } {
  const urgency = daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`;

  // ── Customize the pre-filled WhatsApp message below ──────────────────────
  const whatsappMsg = encodeURIComponent(
    `Hello! I'd like to renew my Imtihan Pro subscription.\n` +
    `📧 Account email: ${email}\n` +
    `📅 Expires on: ${expiryDate}\n\n` +
    `I'll send you the Whish receipt right after payment — please activate my account once confirmed. Thank you!`
  );
  // ── End customization ──────────────────────────────────────────────────────
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;
  const upgradeLink  = `${APP_URL}/upgrade`;

  const subject = daysLeft === 1
    ? `🚨 Last day — Your Imtihan Pro expires tomorrow`
    : `⏰ Your Imtihan Pro expires ${urgency}`;

  const html = `<!doctype html>
<html>
<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#111;margin:0;padding:0;background:#f9fafb">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
      <div style="width:36px;height:36px;border-radius:10px;background:#1a5e3f;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;text-align:center;line-height:36px">إ</div>
      <span style="font-size:18px;font-weight:700;color:#1a5e3f">Imtihan</span>
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;padding:32px;margin-bottom:24px">
      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">
        ${daysLeft === 1 ? "🚨 Last day to renew!" : `⏰ Your Pro plan expires ${urgency}`}
      </p>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">
        Hi <strong style="color:#111">${name || "there"}</strong>,<br/><br/>
        Your Imtihan Pro subscription expires on
        <strong style="color:#dc2626">${expiryDate}</strong>.<br/>
        Renew in 2 minutes to keep your
        <strong style="color:#1a5e3f">100 exams/month</strong> without interruption.
      </p>

      <!-- How to renew box -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;font-size:13px;color:#374151;line-height:1.7">
        <strong style="color:#111">How to renew (2 steps):</strong><br/>
        1. Click the button below — WhatsApp opens with a pre-filled message.<br/>
        2. Pay via <strong>Whish Money</strong> and send us the receipt — your account is activated instantly.
      </div>

      <!-- WhatsApp CTA — main button -->
      <a href="${whatsappLink}"
         style="display:block;background:#25d366;color:#fff;text-decoration:none;text-align:center;padding:16px 24px;border-radius:12px;font-weight:800;font-size:17px;margin-bottom:10px;letter-spacing:0.01em">
        💬 &nbsp; Tap to Renew via WhatsApp
      </a>
      <p style="margin:0 0 16px;text-align:center;font-size:12px;color:#9ca3af">
        Opens a pre-filled message — just tap Send, then pay via Whish.
      </p>

      <!-- Secondary CTA -->
      <a href="${upgradeLink}"
         style="display:block;background:#f3f4f6;color:#374151;text-decoration:none;text-align:center;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
        See all upgrade options →
      </a>
    </div>

    <!-- What you keep -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 10px;font-weight:600;color:#166534;font-size:14px">What your Pro plan includes</p>
      <ul style="margin:0;padding-left:20px;color:#166534;font-size:13px;line-height:1.8">
        <li>100 exams per month — all curricula & subjects</li>
        <li>Corrigé included with every exam</li>
        <li>Word + PDF export</li>
        <li>Saved exam library & community access</li>
      </ul>
    </div>

    <!-- Footer -->
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
      Imtihan · Made for Lebanese teachers<br/>
      Questions? Reply to this email or message us on WhatsApp.
    </p>
  </div>
</body>
</html>`;

  return { subject, html };
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const windowEnd = now + REMINDER_WINDOW_DAYS * MS_PER_DAY;

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const snapshot = await adminDb.collection("users").get();

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const { proExpiresAt, email, displayName, lastReminderSentAt } = data;

      // Only active Pro users expiring within the window
      if (!proExpiresAt || proExpiresAt <= now || proExpiresAt > windowEnd) continue;
      if (!email) continue;

      // Don't re-send within 23 hours (prevents duplicates on re-runs)
      if (lastReminderSentAt && now - lastReminderSentAt < 23 * 60 * 60 * 1000) {
        skipped++;
        continue;
      }

      const daysLeft   = Math.ceil((proExpiresAt - now) / MS_PER_DAY);
      const expiryDate = new Date(proExpiresAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric",
      });

      const { subject, html } = buildReminderEmail(
        displayName ?? "",
        email,
        daysLeft,
        expiryDate
      );

      const result = await sendEmail({
        to: email,
        toName: displayName ?? undefined,
        subject,
        html,
      });

      if (!result.ok) {
        console.error(`[cron/reminders] Brevo failed for ${email}:`, result.error);
        errors++;
        continue;
      }

      // Mark reminded
      await docSnap.ref.update({ lastReminderSentAt: now });
      sent++;
    }
  } catch (err) {
    console.error("[cron/reminders] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  console.log(`[cron/reminders] Done — sent:${sent} skipped:${skipped} errors:${errors}`);
  return NextResponse.json({ success: true, sent, skipped, errors });
}
