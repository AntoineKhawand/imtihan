import { sendEmail } from "../src/lib/brevo";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const PUBLIC_LOGO = "https://www.imtihan.live/Imtihan-logo.png";
const APP_URL = "https://www.imtihan.live";
const tw = (code: string) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

function build30SecondPromise(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                    <img src="${PUBLIC_LOGO}" alt="Imtihan" width="48" height="48" style="display:block;border-radius:14px;" />
                  </td>
                  <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">The Promise</td>
                </tr>
              </table>
              <div style="margin-top:40px;">
                <h1 style="margin:0;font-size:32px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-1px;">
                  Your time is valuable <img src="${tw("23f3")}" width="28" height="28" style="vertical-align:middle;" />
                </h1>
                <p style="margin:12px 0 0;font-size:17px;color:rgba(255,255,255,0.8);line-height:1.6;">We promise a complete exam in under 30 seconds. Here is how.</p>
              </div>
            </td>
          </tr>

          <!-- THE 30-SECOND PROMISE SECTION -->
          <tr>
            <td style="padding:48px;">
              <h2 style="margin:0 0 32px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;text-align:center;">The 30-Second Workflow</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="56" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#1a5e3f;border-radius:12px;text-align:center;line-height:40px;font-weight:800;color:#fff;font-size:18px;">1</div>
                        </td>
                        <td style="padding-left:20px;vertical-align:top;">
                          <div style="font-weight:800;color:#1e293b;font-size:17px;margin-bottom:6px;">Describe your vision</div>
                          <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Don't worry about formatting. Just type "Terminale Physics, 3 exercises on Electric Circuits" in any language.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="56" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#1a5e3f;border-radius:12px;text-align:center;line-height:40px;font-weight:800;color:#fff;font-size:18px;">2</div>
                        </td>
                        <td style="padding-left:20px;vertical-align:top;">
                          <div style="font-weight:800;color:#1e293b;font-size:17px;margin-bottom:6px;">Select curriculum</div>
                          <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Choose Bac Libanais, Bac Français, or IB. Our AI is trained on the exact official standards of these programs.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="56" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background:#1a5e3f;border-radius:12px;text-align:center;line-height:40px;font-weight:800;color:#fff;font-size:18px;">3</div>
                        </td>
                        <td style="padding-left:20px;vertical-align:top;">
                          <div style="font-weight:800;color:#1e293b;font-size:17px;margin-bottom:6px;">Instant Magic</div>
                          <p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Hit generate and watch your complete exam — with Barème and Corrigé — appear in less than 30 seconds.</p>
                        </td>
                      </tr>
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
                Try the 30-second promise →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">Imtihan • AI for Educators</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: `The 30-Second Promise — Imtihan ⚡`, html };
}

async function run() {
  console.log("Sending 30-Second Promise test email...");
  const { subject, html } = build30SecondPromise("Antoine");
  const result = await sendEmail({
    to: "antoinekhawand04@gmail.com",
    toName: "Antoine",
    subject,
    html
  });
  if (result.ok) console.log("30-Second Promise test email sent successfully!");
}

run();
