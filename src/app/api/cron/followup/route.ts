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
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
          <tr>
            <td style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:40px 48px;">
               <img src="${IMAGE_BASE_URL}/Imtihan-logo.png" width="40" height="40" style="border-radius:12px;margin-bottom:24px;" />
               <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">How's it going, ${firstName}? <img src="${tw("1f44b")}" width="24" height="24" style="vertical-align:middle;" /></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">
                You've already generated <strong>${count} exam${count > 1 ? "s" : ""}</strong> with Imtihan — that's amazing! We hope it's saving you hours of work.
              </p>
              <div style="background:#f0fdf4;border-radius:20px;padding:32px;border:1px solid #dcfce7;margin-bottom:32px;">
                <div style="font-weight:800;color:#166534;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Pro Tips for Experts</div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f500")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Version A & B</b>: Create parallel versions to stop cheating.</td></tr>
                  <tr><td style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f4cb")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Full Barème</b>: Points breakdown included in every key.</td></tr>
                  <tr><td style="color:#166534;font-size:15px;"><img src="${tw("1f516")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Exercise Bank</b>: Save your favorite AI questions.</td></tr>
                </table>
              </div>
              <a href="${APP_URL}/create" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;">Generate another exam →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 48px;text-align:center;">
               <div style="background:#f8fafc;border-radius:16px;padding:24px;">
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
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
          <tr>
            <td style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:40px 48px;">
               <img src="${IMAGE_BASE_URL}/Imtihan-logo.png" width="40" height="40" style="border-radius:12px;margin-bottom:24px;" />
               <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Your first exam is waiting ⚡</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">
                Hi ${firstName}, you haven't generated your first exam yet. It literally takes <strong>30 seconds</strong>.
              </p>
              <div style="background:#f0fdf4;border-radius:20px;padding:32px;border:1px solid #dcfce7;margin-bottom:32px;">
                <div style="font-weight:800;color:#166534;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Reminder: It's Free</div>
                <p style="margin:0;color:#166534;font-size:15px;line-height:1.6;">
                  Your account includes <strong>2 free exams</strong>. No credit card needed. Just describe what you need and watch the AI work.
                </p>
              </div>
              <a href="${APP_URL}/create" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;">Generate my first exam →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
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
