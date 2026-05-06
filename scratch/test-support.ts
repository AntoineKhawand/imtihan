import { sendEmail } from "../src/lib/brevo";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const PUBLIC_LOGO = "https://www.imtihan.live/Imtihan-logo.png";
const APP_URL = "https://www.imtihan.live";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";
const tw = (code: string) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

function buildTutorialSupport(name: string): { subject: string; html: string } {
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
                  <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Guide & Help</td>
                </tr>
              </table>
              <div style="margin-top:40px;">
                <h1 style="margin:0;font-size:32px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-1px;">
                  We are with you <img src="${tw("1f4da")}" width="28" height="28" style="vertical-align:middle;" />
                </h1>
                <p style="margin:12px 0 0;font-size:17px;color:rgba(255,255,255,0.8);line-height:1.6;">Every step of the way, from your first generation to expert grading.</p>
              </div>
            </td>
          </tr>

          <!-- THE TUTORIAL SECTION -->
          <tr>
            <td style="padding:48px 48px 0;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">The Tutorial</h2>
              <p style="margin:0 0 32px;color:#64748b;font-size:15px;">A quick 3-step guide to mastering Imtihan.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
                       <table width="100%" cellpadding="0" cellspacing="0" border="0">
                         <tr>
                           <td width="40" style="vertical-align:middle;font-size:24px;">📝</td>
                           <td style="padding-left:16px;">
                             <div style="font-weight:800;color:#1e293b;font-size:16px;">1. Describe</div>
                             <div style="color:#64748b;font-size:14px;">"Chemistry, Grade 12, Acids & Bases"</div>
                           </td>
                         </tr>
                       </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
                       <table width="100%" cellpadding="0" cellspacing="0" border="0">
                         <tr>
                           <td width="40" style="vertical-align:middle;font-size:24px;">🌍</td>
                           <td style="padding-left:16px;">
                             <div style="font-weight:800;color:#1e293b;font-size:16px;">2. Pick Curriculum</div>
                             <div style="color:#64748b;font-size:14px;">Bac Libanais, Bac Français, or IB.</div>
                           </td>
                         </tr>
                       </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
                       <table width="100%" cellpadding="0" cellspacing="0" border="0">
                         <tr>
                           <td width="40" style="vertical-align:middle;font-size:24px;">🚀</td>
                           <td style="padding-left:16px;">
                             <div style="font-weight:800;color:#1e293b;font-size:16px;">3. Generate</div>
                             <div style="color:#64748b;font-size:14px;">Instant high-quality exam in seconds.</div>
                           </td>
                         </tr>
                       </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIRECT SUPPORT SECTION -->
          <tr>
            <td style="padding:48px;">
              <div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:2px solid #bbf7d0;border-radius:24px;padding:40px;text-align:center;">
                <img src="${tw("1f4ac")}" width="48" height="48" style="margin-bottom:20px;" />
                <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#064e3b;">Direct Support</h2>
                <p style="margin:0 0 28px;color:#14532d;font-size:16px;line-height:1.6;">Have a specific question or a special request? Message us directly on WhatsApp. We usually reply in under an hour.</p>
                <a href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I'm using Imtihan and I need help with...")}" 
                   style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:16px 40px;border-radius:14px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(37,211,102,0.3);">
                  💬 Chat on WhatsApp
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #eef2f6;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">Imtihan • The Teacher's AI Assistant</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: `Tutorial & Support — Imtihan 💡`, html };
}

async function run() {
  console.log("Sending Tutorial & Support test email...");
  const { subject, html } = buildTutorialSupport("Antoine");
  const result = await sendEmail({
    to: "antoinekhawand04@gmail.com",
    toName: "Antoine",
    subject,
    html
  });
  if (result.ok) console.log("Tutorial & Support test email sent successfully!");
}

run();
