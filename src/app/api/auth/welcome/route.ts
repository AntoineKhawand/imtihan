import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";
import { verifySession } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.imtihan.live";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";

// Ensure images use a public domain even if APP_URL is localhost
const IMAGE_BASE_URL = APP_URL.includes("localhost") ? "https://imtihan.live" : APP_URL;

// ─── Twemoji CDN Helper ───────────────────────────────────────────────────────
const tw = (code: string) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

// ─── Premium Welcome Newsletter HTML ──────────────────────────────────────────

function buildWelcomeNewsletter(name: string): { subject: string; html: string } {
  const firstName = name?.split(" ")[0] || "there";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Imtihan</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Main Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:48px 48px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${IMAGE_BASE_URL}/Imtihan-logo.png" alt="Imtihan" width="48" height="48" style="display:block;border-radius:14px;border:none;" />
                        </td>
                        <td style="padding-left:14px;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;vertical-align:middle;">Imtihan</td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;vertical-align:middle;">
                    Education AI
                  </td>
                </tr>
              </table>

              <div style="margin-top:40px;">
                <table cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:100px;">
                  <tr>
                    <td style="padding:6px 14px;font-size:12px;color:#fff;font-weight:700;letter-spacing:0.5px;">
                      <img src="${tw("1f381")}" width="14" height="14" style="vertical-align:middle;margin-right:6px;" />
                      WELCOME ABOARD
                    </td>
                  </tr>
                </table>
                <h1 style="margin:20px 0 12px;font-size:36px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-1px;">
                  Hi ${firstName}! <img src="${tw("1f44b")}" width="32" height="32" style="vertical-align:middle;margin-bottom:6px;" />
                </h1>
                <p style="margin:0;font-size:17px;color:rgba(255,255,255,0.85);line-height:1.6;">
                  Lebanon's most advanced AI exam platform is now at your fingertips. Built by educators, for educators.
                </p>
              </div>
            </td>
          </tr>

          <!-- ── THE WELCOME GIFT ── -->
          <tr>
            <td style="padding:40px 48px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:20px;">
                <tr>
                  <td style="padding:32px;">
                    <div style="font-size:13px;font-weight:800;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Gift for new teachers</div>
                    <div style="font-size:24px;font-weight:800;color:#064e3b;line-height:1.2;margin-bottom:12px;">You have 2 Free Exams waiting</div>
                    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.5;">No credit card, no commitment. Just describe your curriculum and generate.</p>
                    <a href="${APP_URL}/create"
                       style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">
                      Start generating now <img src="${tw("26a1")}" width="16" height="16" style="vertical-align:middle;margin-left:4px;" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── THE 30-SECOND PROMISE & TUTORIAL ── -->
          <tr>
            <td style="padding:48px 48px 0;">
              <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">How it works in 30 seconds</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="48" style="vertical-align:top;">
                          <div style="width:36px;height:36px;background:#ecfdf5;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#10b981;font-size:15px;border:1px solid #d1fae5;">1</div>
                        </td>
                        <td style="padding-left:16px;vertical-align:top;">
                          <div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">Describe your exam</div>
                          <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Type in French, Arabic, or English. E.g. "Physics exam, 9th Grade, Optics section, 3 exercises."</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="48" style="vertical-align:top;">
                          <div style="width:36px;height:36px;background:#ecfdf5;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#10b981;font-size:15px;border:1px solid #d1fae5;">2</div>
                        </td>
                        <td style="padding-left:16px;vertical-align:top;">
                          <div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">Select your curriculum</div>
                          <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Choose Bac Libanais, Bac Français, IB, or University level. We adapt to your standards.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="48" style="vertical-align:top;">
                          <div style="width:36px;height:36px;background:#ecfdf5;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#10b981;font-size:15px;border:1px solid #d1fae5;">3</div>
                        </td>
                        <td style="padding-left:16px;vertical-align:top;">
                          <div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">Download & Export</div>
                          <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Get a clean PDF or Word file + full corrigé in under 30 seconds. Print-ready immediately.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── THE FEATURE SHOWCASE ── -->
          <tr>
            <td style="padding:48px 48px 0;">
              <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Premium features you'll love</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="padding-right:12px;padding-bottom:20px;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
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

          <!-- ── DIRECT SUPPORT (WHATSAPP) ── -->
          <tr>
            <td style="padding:48px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border-radius:20px;border:1px solid #99f6e4;">
                <tr>
                  <td style="padding:32px;text-align:center;">
                    <img src="${tw("1f4ac")}" width="40" height="40" style="margin-bottom:16px;" />
                    <div style="font-weight:800;color:#0f172a;font-size:18px;margin-bottom:8px;">Have a special request?</div>
                    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">I'm here to help you get started. Message us directly on WhatsApp for any help.</p>
                    <a href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi! I just joined Imtihan and I have a question.")}"
                       style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:800;font-size:15px;">
                      💬 Message on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#f8fafc;padding:40px 48px;border-top:1px solid #eef2f6;text-align:center;">
              <img src="${APP_URL}/Imtihan-logo.png" alt="Imtihan" width="32" height="32" style="display:inline-block;margin-bottom:16px;opacity:0.6;" />
              <div style="font-weight:700;color:#64748b;font-size:14px;margin-bottom:8px;">Imtihan — AI for Teachers</div>
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.8;">
                Built for the Lebanese curriculum. <br />
                <a href="${APP_URL}" style="color:#1a5e3f;text-decoration:none;">imtihan.live</a> • 
                <a href="${APP_URL}/privacy" style="color:#94a3b8;text-decoration:none;">Privacy</a> • 
                <a href="${APP_URL}/terms" style="color:#94a3b8;text-decoration:none;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  return {
    subject: `Welcome to Imtihan, ${firstName}! Your first exam takes 30 seconds 🎉`,
    html,
  };
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const uid = await verifySession(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.welcomeEmailSentAt) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const email: string = data.email ?? "";
    const name: string = data.displayName ?? data.name ?? "";

    if (!email) {
      return NextResponse.json({ error: "No email on profile" }, { status: 400 });
    }

    const { subject, html } = buildWelcomeNewsletter(name);
    const result = await sendEmail({ to: email, toName: name, subject, html });

    if (result.ok) {
      await userRef.update({ welcomeEmailSentAt: Date.now() });
      return NextResponse.json({ ok: true, sent: true });
    } else {
      return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
    }
  } catch (err) {
    console.error("[welcome] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const isAdmin = secret === process.env.CRON_SECRET;
  const isTest = request.nextUrl.searchParams.get("test") === "1";

  if (!isAdmin || !isTest) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const testEmail = "antoinekhawand04@gmail.com";
  const { subject, html } = buildWelcomeNewsletter("Antoine");
  const result = await sendEmail({ to: testEmail, toName: "Antoine", subject, html });

  return NextResponse.json({ ok: result.ok, error: result.error });
}
