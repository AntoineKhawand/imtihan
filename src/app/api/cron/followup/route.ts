import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.imtihan.live";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";
const IMAGE_BASE_URL = APP_URL.includes("localhost") ? "https://imtihan.live" : APP_URL;
const tw = (code: string) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

// ─── Premium Follow-up Templates ─────────────────────────────────────────────

function buildEngagementEmail(name: string, count: number): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";
  const html = `<!doctype html>
<html>
<head>
  <style>
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header-section { padding: 32px 24px !important; }
      .content-section { padding: 32px 24px !important; }
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .cta-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 28px rgba(26,94,63,0.4) !important; }
    .tip-item:hover { transform: translateX(4px) !important; }
    .whatsapp-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important; }
    .cta-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .tip-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .whatsapp-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .float-icon { animation: float 3s ease-in-out infinite; }
    .slide-up { animation: slideUp 0.6s ease-out both; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
          <tr>
            <td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:40px 48px;position:relative;overflow:hidden">
               <img src="${IMAGE_BASE_URL}/Imtihan-logo.png" width="40" height="40" style="border-radius:12px;margin-bottom:24px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
               <h1 class="slide-up" style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">How's it going, ${firstName}? <img src="${tw("1f44b")}" width="24" height="24" style="vertical-align:middle;" class="float-icon" /></h1>
            </td>
          </tr>
          <tr>
            <td class="content-section" style="padding:48px;">
              <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">
                You've already generated <strong>${count} exam${count > 1 ? "s" : ""}</strong> with Imtihan — that's amazing! We hope it's saving you hours of work.
              </p>
              <div style="background:#f0fdf4;border-radius:20px;padding:32px;border:1px solid #dcfce7;margin-bottom:32px;">
                <div style="font-weight:800;color:#166534;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Pro Tips for Experts</div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td class="tip-item" style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f500")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Version A & B</b>: Create parallel versions to stop cheating.</td></tr>
                  <tr><td class="tip-item" style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f4cb")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Full Barème</b>: Points breakdown included in every key.</td></tr>
                  <tr><td class="tip-item" style="color:#166534;font-size:15px;"><img src="${tw("1f516")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Exercise Bank</b>: Save your favorite AI questions.</td></tr>
                </table>
              </div>
              <a href="${APP_URL}/create" class="cta-btn" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">Generate another exam →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 48px;text-align:center;">
               <div class="whatsapp-card" style="background:#f8fafc;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
                 <img src="${tw("1f4ac")}" width="32" height="32" style="margin-bottom:12px;" />
                 <div style="font-weight:700;color:#1e293b;margin-bottom:4px;">Have feedback?</div>
                 <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Message us on WhatsApp to share your experience.</p>
                 <a href="https://wa.me/${WHATSAPP}" style="color:#1a5e3f;font-weight:700;text-decoration:none;">Chat with us now</a>
               </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { subject: `How's your experience with Imtihan so far? 💬`, html };
}

function buildActivationEmail(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";
  const html = `<!doctype html>
<html>
<head>
  <style>
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header-section { padding: 32px 24px !important; }
      .content-section { padding: 32px 24px !important; }
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .cta-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 28px rgba(26,94,63,0.4) !important; }
    .free-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 18px rgba(26,94,63,0.12) !important; }
    .step-row:hover { transform: translateX(4px) !important; }
    .cta-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .free-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .step-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .pulse-icon { animation: pulse 2s ease-in-out infinite; }
    .slide-up { animation: slideUp 0.6s ease-out both; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">

        <!-- HEADER -->
        <tr><td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:48px;position:relative;overflow:hidden">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td>
              <img src="${IMAGE_BASE_URL}/Imtihan-logo.png" width="44" height="44" style="display:block;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.25)" />
            </td><td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;vertical-align:middle;">Getting Started</td></tr>
          </table>
          <div style="margin-top:32px;">
            <h1 class="slide-up" style="margin:0;font-size:30px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.5px;">Hi ${firstName}, your first exam is waiting</h1>
            <p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.8);line-height:1.6;">We noticed you haven't generated your first exam yet. Don't worry — it takes just 30 seconds.</p>
          </div>
        </td></tr>

        <!-- BODY -->
        <tr><td class="content-section" style="padding:48px;">
          <p style="margin:0 0 28px;font-size:16px;color:#334155;line-height:1.7;">Just <strong>3 simple steps</strong> and you'll have a complete exam with corrigé:</p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
            <tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" class="step-row" style="border-radius:14px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>
              <td width="44" style="vertical-align:top;"><div style="width:36px;height:36px;background:#1a5e3f;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#fff;font-size:16px;">1</div></td>
              <td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:3px;">Describe your exam</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.5;">Type your subject and topics in any language. No formatting needed.</p></td>
            </tr></table></td></tr>
            <tr><td style="padding-bottom:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" class="step-row" style="border-radius:14px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>
              <td width="44" style="vertical-align:top;"><div style="width:36px;height:36px;background:#1a5e3f;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#fff;font-size:16px;">2</div></td>
              <td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:3px;">Pick your curriculum</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.5;">Bac Libanais, Bac Français, IB, or University — we match the standards.</p></td>
            </tr></table></td></tr>
            <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0" class="step-row" style="border-radius:14px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>
              <td width="44" style="vertical-align:top;"><div style="width:36px;height:36px;background:#1a5e3f;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#fff;font-size:16px;">3</div></td>
              <td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:3px;">Generate & Download</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.5;">Hit generate. Your exam + corrigé appears in under 30 seconds. Export to PDF or Word.</p></td>
            </tr></table></td></tr>
          </table>

          <!-- Free reminder card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" class="free-card" style="background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border-radius:18px;border:1px solid #bbf7d0;margin-bottom:32px;">
            <tr><td style="padding:28px 32px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:16px;vertical-align:top;font-size:36px;" class="pulse-icon">🎁</td>
                <td>
                  <div style="font-weight:800;color:#166534;font-size:16px;margin-bottom:6px;">Your 2 free exams are ready</div>
                  <p style="margin:0;color:#15803d;font-size:14px;line-height:1.6;">No credit card, no commitment. Just create your account and start generating immediately.</p>
                </td>
              </tr></table>
            </td></tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${APP_URL}/create" class="cta-btn" style="display:inline-block;background:linear-gradient(135deg,#1a5e3f,#2d8f5f);color:#fff;text-decoration:none;padding:16px 44px;border-radius:14px;font-weight:800;font-size:16px;box-shadow:0 8px 24px rgba(26,94,63,0.35);">Generate my first exam →</a>
            <p style="color:#94a3b8;font-size:12px;margin:14px 0 0">No credit card required &nbsp;·&nbsp; Takes 30 seconds</p>
          </div>
        </td></tr>

        <!-- SUPPORT -->
        <tr><td style="padding:0 48px 48px;text-align:center;">
          <div style="background:#f8fafc;border-radius:16px;padding:28px;border:1px solid #e2e8f0;">
            <img src="${tw("1f4ac")}" width="32" height="32" style="margin-bottom:12px;" />
            <div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:6px;">Need help getting started?</div>
            <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6;">Message us on WhatsApp and we'll walk you through your first exam.</p>
            <a href="https://wa.me/${WHATSAPP}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">💬 Chat on WhatsApp</a>
          </div>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #eef2f6;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">Imtihan • Built for Lebanese teachers • <a href="${APP_URL}" style="color:#1a5e3f;text-decoration:none;">imtihan.live</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return { subject: `Your first exam is waiting — takes 30 seconds ⚡`, html };
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const MIN_AGE_MS = 48 * 60 * 60 * 1000;
  let activationSent = 0;
  let engagementSent = 0;
  let errors = 0;

  try {
    const usersSnap = await adminDb.collection("users").limit(300).get();
    for (const doc of usersSnap.docs) {
      const data = doc.data();
      const email = data.email;
      const name = data.displayName ?? data.name ?? "";
      const count = data.examsGenerated ?? 0;
      const createdAt = data.createdAt ?? now;

      if (!email) continue;
      if (now - createdAt < MIN_AGE_MS) continue;

      if (count < 1 && !data.activationFollowupSentAt) {
        const { subject, html } = buildActivationEmail(name);
        const res = await sendEmail({ to: email, toName: name, subject, html });
        if (res.ok) {
          await doc.ref.update({ activationFollowupSentAt: now });
          activationSent++;
        } else errors++;
      } else if (count >= 1 && !data.engagementFollowupSentAt) {
        const { subject, html } = buildEngagementEmail(name, count);
        const res = await sendEmail({ to: email, toName: name, subject, html });
        if (res.ok) {
          await doc.ref.update({ engagementFollowupSentAt: now });
          engagementSent++;
        } else errors++;
      }
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, activationSent, engagementSent, errors });
}
