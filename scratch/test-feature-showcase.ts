import { sendEmail } from "../src/lib/brevo";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Use the production URL for images in the test so they appear in the email client
const PUBLIC_LOGO = "https://www.imtihan.live/Imtihan-logo.png";
const APP_URL = "https://www.imtihan.live";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";
const tw = (code: string) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

function buildWelcomeNewsletter(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Feature Showcase — Imtihan</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:48px 48px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${PUBLIC_LOGO}" alt="Imtihan" width="48" height="48" style="display:block;border-radius:14px;border:none;" />
                        </td>
                        <td style="padding-left:14px;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;vertical-align:middle;">Imtihan</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;vertical-align:middle;">Feature Showcase</td>
                </tr>
              </table>
              <div style="margin-top:40px;">
                <h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-1px;">
                  Premium features for teachers <img src="${tw("2728")}" width="28" height="28" style="vertical-align:middle;margin-bottom:4px;" />
                </h1>
                <p style="margin:0;font-size:17px;color:rgba(255,255,255,0.85);line-height:1.6;">Everything you need to automate your classroom and focus on teaching.</p>
              </div>
            </td>
          </tr>

          <!-- FEATURE SHOWCASE SECTION -->
          <tr>
            <td style="padding:48px;">
              <div style="font-size:13px;font-weight:800;color:#1a5e3f;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;text-align:center;">Powerful Tools</div>
              <h2 style="margin:0 0 32px;font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;text-align:center;">The Feature Showcase</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="padding-right:12px;padding-bottom:24px;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
                      <tr><td>
                        <img src="${tw("1f500")}" width="36" height="36" style="margin-bottom:16px;" />
                        <div style="font-weight:800;color:#1e293b;font-size:16px;margin-bottom:8px;">Version A & B</div>
                        <div style="color:#64748b;font-size:14px;line-height:1.6;">Instantly create two parallel versions of the same exam with different questions to prevent cheating.</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" style="padding-left:12px;padding-bottom:24px;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
                      <tr><td>
                        <img src="${tw("1f4cb")}" width="36" height="36" style="margin-bottom:16px;" />
                        <div style="font-weight:800;color:#1e293b;font-size:16px;margin-bottom:8px;">Full Barème</div>
                        <div style="color:#64748b;font-size:14px;line-height:1.6;">Every corrigé includes a professional points breakdown for objective and fast grading.</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-right:12px;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
                      <tr><td>
                        <img src="${tw("1f516")}" width="36" height="36" style="margin-bottom:16px;" />
                        <div style="font-weight:800;color:#1e293b;font-size:16px;margin-bottom:8px;">Exercise Bank</div>
                        <div style="color:#64748b;font-size:14px;line-height:1.6;">Save AI-generated exercises you love to your personal bank and reuse them in any future exam.</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" style="padding-left:12px;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:28px;">
                      <tr><td>
                        <img src="${tw("1f4e5")}" width="36" height="36" style="margin-bottom:16px;" />
                        <div style="font-weight:800;color:#1e293b;font-size:16px;margin-bottom:8px;">Word & PDF</div>
                        <div style="color:#64748b;font-size:14px;line-height:1.6;">Download your exams in high-quality PDF or fully editable Microsoft Word format for final tweaks.</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 48px 48px;text-align:center;">
              <a href="${APP_URL}/create" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">
                Try these features now →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;padding:40px 48px;border-top:1px solid #eef2f6;text-align:center;">
              <img src="${PUBLIC_LOGO}" alt="Imtihan" width="32" height="32" style="display:inline-block;margin-bottom:16px;opacity:0.6;" />
              <div style="font-weight:700;color:#64748b;font-size:14px;margin-bottom:8px;">Imtihan — Built for Lebanese Teachers</div>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.8;">
                <a href="${APP_URL}" style="color:#1a5e3f;text-decoration:none;">imtihan.live</a> • 
                <a href="https://wa.me/${WHATSAPP}" style="color:#94a3b8;text-decoration:none;">WhatsApp Support</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: `The Feature Showcase — Imtihan ✨`, html };
}

async function run() {
  console.log("Sending Feature Showcase test email...");
  const { subject, html } = buildWelcomeNewsletter("Antoine");
  const result = await sendEmail({
    to: "antoinekhawand04@gmail.com",
    toName: "Antoine",
    subject,
    html
  });

  if (result.ok) {
    console.log("Feature Showcase test email sent successfully!");
  } else {
    console.error("Failed to send test email:", result.error);
  }
}

run();
