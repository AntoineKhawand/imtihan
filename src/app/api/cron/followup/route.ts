import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.imtihan.live";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";

// ─── Email: user has generated at least 1 exam ───────────────────────────────

function buildEngagementEmail(name: string, examsGenerated: number): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: `How's your experience with Imtihan so far? 💬`,
    html: `<!doctype html>
<html>
<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#111;margin:0;padding:0;background:#f9fafb">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">

    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
      <div style="width:36px;height:36px;border-radius:10px;background:#1a5e3f;color:#fff;font-weight:700;font-size:14px;text-align:center;line-height:36px">إ</div>
      <span style="font-size:18px;font-weight:700;color:#1a5e3f">Imtihan</span>
    </div>

    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Hi ${firstName} 👋</h2>
    <p style="color:#555;line-height:1.6;margin:0 0 20px">
      You've already generated <strong>${examsGenerated} exam${examsGenerated > 1 ? "s" : ""}</strong> with Imtihan — that's great!
      We'd love to know how it's been going for you.
    </p>

    <div style="background:#f0fdf4;border-left:4px solid #1a5e3f;border-radius:8px;padding:16px 20px;margin:0 0 24px">
      <p style="margin:0;color:#1a5e3f;font-weight:600">A few things you might not have tried yet:</p>
      <ul style="margin:10px 0 0;padding-left:20px;color:#333;line-height:1.8">
        <li>📄 Export to <strong>Word or PDF</strong> — ready to print</li>
        <li>🔄 Generate <strong>Version A &amp; B</strong> — anti-cheating parallel exams</li>
        <li>🏦 Save exercises to your <strong>personal bank</strong> for reuse</li>
        <li>📊 <strong>Barème &amp; micro-barème</strong> included in every corrigé</li>
      </ul>
    </div>

    <p style="color:#555;line-height:1.6;margin:0 0 24px">
      If you have feedback, questions, or ran into anything confusing — just reply to this email or message us directly on WhatsApp. We read every message.
    </p>

    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px">
      <a href="${APP_URL}/create" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
        Generate another exam →
      </a>
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'm using Imtihan and wanted to share some feedback.")}"
         style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
        💬 Chat on WhatsApp
      </a>
    </div>

    <p style="color:#888;font-size:13px;margin:0">The Imtihan team · <a href="${APP_URL}" style="color:#1a5e3f">imtihan.live</a></p>
  </div>
</body>
</html>`,
  };
}

// ─── Email: user has never generated an exam ─────────────────────────────────

function buildActivationEmail(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: `Your first exam is waiting — takes 30 seconds ⚡`,
    html: `<!doctype html>
<html>
<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;color:#111;margin:0;padding:0;background:#f9fafb">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">

    <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
      <div style="width:36px;height:36px;border-radius:10px;background:#1a5e3f;color:#fff;font-weight:700;font-size:14px;text-align:center;line-height:36px">إ</div>
      <span style="font-size:18px;font-weight:700;color:#1a5e3f">Imtihan</span>
    </div>

    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Hi ${firstName} 👋</h2>
    <p style="color:#555;line-height:1.6;margin:0 0 20px">
      You created an Imtihan account but haven't generated your first exam yet.
      It literally takes <strong>30 seconds</strong> — no forms, no templates, just describe what you need.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0 0 14px;font-weight:700;color:#1a5e3f;font-size:16px">How it works:</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <span style="background:#1a5e3f;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0">1</span>
          <span style="color:#333">Describe your exam in plain language (French, English, or Arabic)</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <span style="background:#1a5e3f;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0">2</span>
          <span style="color:#333">Choose your curriculum — Bac Libanais, Bac Français, IB, or University</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px">
          <span style="background:#1a5e3f;color:#fff;width:22px;height:22px;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0">3</span>
          <span style="color:#333">Get a complete exam <strong>+ full corrigé</strong> in under 30 seconds</span>
        </div>
      </div>
    </div>

    <p style="color:#555;line-height:1.6;margin:0 0 8px">Your account includes <strong>2 free exams</strong> — no credit card needed.</p>

    <div style="margin:24px 0 32px">
      <a href="${APP_URL}/create"
         style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(26,94,63,0.25)">
        Generate my first exam — it's free →
      </a>
    </div>

    <p style="color:#555;line-height:1.6;margin:0 0 24px">
      If you have any questions or need help getting started, just reply to this email — we're happy to help.
    </p>

    <p style="color:#888;font-size:13px;margin:0">The Imtihan team · <a href="${APP_URL}" style="color:#1a5e3f">imtihan.live</a></p>
  </div>
</body>
</html>`,
  };
}

// ─── Cron handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Verify cron secret
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const MIN_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours after signup before sending

  let activationSent = 0;
  let engagementSent = 0;
  let errors = 0;

  try {
    // Query all users — we filter in memory (fine for small-medium scale)
    const usersSnap = await adminDb.collection("users").limit(300).get();

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const email: string | undefined = data.email;
      const name: string = data.displayName ?? data.name ?? "";
      const examsGenerated: number = data.examsGenerated ?? 0;
      const createdAt: number = data.createdAt ?? now; // fallback: treat as new

      if (!email) continue;

      // Only process users whose account is at least 48h old
      if (now - createdAt < MIN_AGE_MS) continue;

      // ── Activation email (0 exams generated) ──────────────────────────────
      if (examsGenerated < 1 && !data.activationFollowupSentAt) {
        try {
          const { subject, html } = buildActivationEmail(name);
          const result = await sendEmail({ to: email, toName: name, subject, html });
          if (result.ok) {
            await doc.ref.update({ activationFollowupSentAt: now });
            activationSent++;
          }
        } catch (err) {
          console.error(`[cron/followup] Activation email failed for ${email}:`, err);
          errors++;
        }
        continue;
      }

      // ── Engagement email (≥1 exam generated) ──────────────────────────────
      if (examsGenerated >= 1 && !data.engagementFollowupSentAt) {
        try {
          const { subject, html } = buildEngagementEmail(name, examsGenerated);
          const result = await sendEmail({ to: email, toName: name, subject, html });
          if (result.ok) {
            await doc.ref.update({ engagementFollowupSentAt: now });
            engagementSent++;
          }
        } catch (err) {
          console.error(`[cron/followup] Engagement email failed for ${email}:`, err);
          errors++;
        }
      }
    }
  } catch (err) {
    console.error("[cron/followup] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  console.log(`[cron/followup] Done — activation: ${activationSent}, engagement: ${engagementSent}, errors: ${errors}`);
  return NextResponse.json({ ok: true, activationSent, engagementSent, errors });
}
