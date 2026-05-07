import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env.local") });

const API_KEY = process.env.BREVO_API_KEY;
const TO_EMAIL = "antoinekhawand04@gmail.com";
const TO_NAME = "Antoine";
const APP_URL = "https://www.imtihan.live";
const WA_NUM = "96170542238";
const LOGO_URL = "https://www.imtihan.live/Imtihan-logo.png";
const TW = (code, alt, size = 24) =>
  `<img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png"
       alt="${alt}" width="${size}" height="${size}"
       style="display:inline-block;vertical-align:middle;width:${size}px;height:${size}px" />`;

const MONTH = "May 2025";

// ─────────────────────────────────────────────────────────────────────────────
async function sendTest(subject, html) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": API_KEY },
    body: JSON.stringify({
      sender: { name: "Imtihan", email: "admin@imtihan.live" },
      to: [{ email: TO_EMAIL, name: TO_NAME }],
      subject,
      htmlContent: html,
    }),
  });
  const data = await res.text();
  console.log(res.ok ? `✅ ${subject} → sent` : `❌ ${subject} → ${res.status}: ${data}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1️⃣ NEWSLETTER
// ─────────────────────────────────────────────────────────────────────────────
const newsletterHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Imtihan Newsletter — ${MONTH}</title>
  <style>
    @media screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .hero { padding: 28px 24px !important; }
      .body-content { padding: 28px 24px !important; }
      .footer { padding: 24px !important; }
      .stats td { display: block !important; width: 100% !important; padding: 12px 0 !important; border-right: none !important; border-bottom: 1px solid #e2e8f0; }
      .stats td:last-child { border-bottom: none !important; }
    }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .cta-button:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(26,94,63,0.45) !important; }
    .feature-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; border-color: #bbf7d0 !important; }
    .tip-card:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px rgba(245,158,11,0.15) !important; }
    .cta-button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .feature-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .tip-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .shimmer-bg { background: linear-gradient(90deg, #0f3d28 0%, #1a5e3f 40%, #2d8f5f 60%, #1a5e3f 80%, #0f3d28 100%); background-size: 200% auto; animation: shimmer 8s linear infinite; }
    .fade-in { animation: fadeInUp 0.6s ease-out both; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a">
  <div style="max-width:620px;margin:32px auto;padding:0 16px 48px">

    <!-- ══ HEADER ══ -->
    <div class="shimmer-bg hero" style="background:linear-gradient(160deg,#0f3d28 0%,#1a5e3f 50%,#2d8f5f 100%);
                border-radius:20px 20px 0 0;padding:40px 44px 36px;position:relative;overflow:hidden">

      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
        <tr>
          <td style="padding-right:14px;vertical-align:middle">
            <img src="${LOGO_URL}" alt="Imtihan" width="48" height="48" style="border-radius:12px;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.3)" />
          </td>
          <td style="vertical-align:middle">
            <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px">Imtihan</span><br/>
            <span style="font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.8px;text-transform:uppercase">AI Exam Generator</span>
          </td>
          <td style="text-align:right;vertical-align:middle;padding-left:20px">
            <span style="background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,0.2)">${MONTH}</span>
          </td>
        </tr>
      </table>

      <h1 class="fade-in" style="margin:0 0 10px;font-size:28px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.5px">
        Your monthly update<br/>from the Imtihan team ${TW("1f1f1-1f1e7", "🇱🇧", 22)}
      </h1>
      <p style="margin:0;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.65;max-width:440px">
        New features, teaching tips, and everything you need to get more out of Imtihan this month.
      </p>
    </div>

    <!-- ══ BODY ══ -->
    <div style="background:#fff;padding:44px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">
      <p style="color:#475569;line-height:1.75;margin:0 0 36px;font-size:15px">
        Hi Antoine,<br/><br/>
        It's been a productive month for Lebanese educators on Imtihan. Here's what's new,
        what's improved, and a tip to save you even more time in June.
      </p>

      <!-- What's New -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr><td style="padding-right:14px"><div style="height:2px;background:linear-gradient(90deg,#1a5e3f,transparent)"></div></td>
        <td style="white-space:nowrap"><span style="font-size:11px;font-weight:800;color:#1a5e3f;letter-spacing:1.5px;text-transform:uppercase">✦ &nbsp;What's New</span></td>
        <td style="padding-left:14px"><div style="height:2px;background:linear-gradient(270deg,#1a5e3f,transparent)"></div></td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:16px;overflow:hidden;background:#fff">
        <tr><td style="padding:22px 24px"><table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:top;padding-top:2px"><div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;line-height:44px">${TW("1f4ca", "Chart", 22)}</div></td>
          <td><strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">Barème &amp; Micro-barème in every corrigé</strong>
          <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">Every generated exam now includes a detailed marking grid — per sub-question points and a step-by-step micro-barème. Grade in half the time.</p></td>
        </tr></table></td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:16px;overflow:hidden;background:#fff">
        <tr><td style="padding:22px 24px"><table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:top;padding-top:2px"><div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;line-height:44px">${TW("1f3e6", "Bank", 22)}</div></td>
          <td><strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">Personal &amp; School Exercise Bank</strong>
          <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">Save your best exercises to your personal bank and reuse them across exams. Pro users can also share exercises with their entire school team.</p></td>
        </tr></table></td></tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" class="feature-card" style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:36px;overflow:hidden;background:#fff">
        <tr><td style="padding:22px 24px"><table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:top;padding-top:2px"><div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;line-height:44px">${TW("1f500", "Shuffle", 22)}</div></td>
          <td><strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">Version A &amp; B — Anti-cheating exams</strong>
          <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">Generate two parallel versions of the same exam with different numbers and shuffled questions. Students in adjacent seats get completely different papers.</p></td>
        </tr></table></td></tr></table>

      <!-- Tip of the Month -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr><td style="padding-right:14px"><div style="height:2px;background:linear-gradient(90deg,#f59e0b,transparent)"></div></td>
        <td style="white-space:nowrap"><span style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:1.5px;text-transform:uppercase">✦ &nbsp;Tip of the Month</span></td>
        <td style="padding-left:14px"><div style="height:2px;background:linear-gradient(270deg,#f59e0b,transparent)"></div></td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" class="tip-card" style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin-bottom:36px">
        <tr><td style="padding:24px 26px"><table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;vertical-align:top;font-size:28px;line-height:1">${TW("1f4a1", "Tip", 32)}</td>
          <td><strong style="color:#92400e;font-size:15px;display:block;margin-bottom:8px">Upload your course notes for smarter exams</strong>
          <p style="color:#78350f;font-size:13px;line-height:1.7;margin:0">In Step 1 of the exam builder, you can upload a PDF or Word file of your course notes. Imtihan reads it and generates questions grounded in <em>your exact content</em> — not generic textbook questions. Try it with your last chapter.</p></td>
        </tr></table></td></tr></table>

      <!-- Stats -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:36px">
        <tr><td style="padding:20px 24px">
          <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#64748b;letter-spacing:1.2px;text-transform:uppercase">Imtihan this month</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;border-right:1px solid #e2e8f0;padding-right:20px"><div style="font-size:30px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">439+</div><div style="font-size:12px;color:#64748b;margin-top:2px">Educators</div></td>
              <td style="text-align:center;border-right:1px solid #e2e8f0;padding:0 20px"><div style="font-size:30px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">3.5k</div><div style="font-size:12px;color:#64748b;margin-top:2px">Visits</div></td>
              <td style="text-align:center;padding-left:20px"><div style="font-size:30px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">4</div><div style="font-size:12px;color:#64748b;margin-top:2px">Curricula</div></td>
            </tr>
          </table>
        </td></tr></table>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:10px">
        <a href="${APP_URL}/create" class="cta-button" style="display:inline-block;background:linear-gradient(135deg,#1a5e3f,#2d8f5f);color:#fff;text-decoration:none;padding:16px 48px;border-radius:13px;font-weight:700;font-size:16px;letter-spacing:-0.2px;box-shadow:0 4px 20px rgba(26,94,63,0.35)">Generate an exam now →</a>
        <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">2 free exams &nbsp;·&nbsp; No credit card required</p>
      </div>
    </div>

    <!-- ══ FOOTER ══ -->
    <div style="background:#1e293b;border-radius:0 0 20px 20px;padding:32px 44px;text-align:center">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>
        <td style="padding-right:10px;vertical-align:middle"><img src="${LOGO_URL}" alt="Imtihan" width="30" height="30" style="border-radius:8px;display:block" /></td>
        <td style="vertical-align:middle"><span style="font-size:16px;font-weight:700;color:#fff">Imtihan</span></td>
      </tr></table>
      <p style="margin:0 0 12px">
        <a href="${APP_URL}/create" style="color:#a0f0c0;text-decoration:none;font-size:13px;font-weight:600;margin:0 12px">Create Exam</a>
        <a href="${APP_URL}/pricing" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px">Pricing</a>
        <a href="${APP_URL}/contact" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px">Contact</a>
        <a href="${APP_URL}/privacy" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px">Privacy</a>
      </p>
      <p style="margin:0 0 16px"><a href="https://wa.me/${WA_NUM}" style="color:#25D366;text-decoration:none;font-size:13px;font-weight:600">${TW("1f4ac", "WA", 14)} &nbsp;Chat with us on WhatsApp</a></p>
      <p style="color:#475569;font-size:11px;margin:0;line-height:1.7">You're receiving this because you created an account on Imtihan.<br/>Imtihan · Beirut, Lebanon · <a href="${APP_URL}/contact" style="color:#64748b;text-decoration:none">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 2️⃣ WELCOME EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const firstName = "Antoine";
const tw = (code) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`;

const welcomeHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Imtihan</title>
  <style>
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header-section { padding: 32px 24px !important; }
      .content-section { padding: 28px 24px !important; }
      .footer-section { padding: 28px 24px !important; }
      .feature-col { display: block !important; width: 100% !important; padding: 0 0 16px !important; }
    }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .cta-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 28px rgba(26,94,63,0.4) !important; }
    .gift-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(26,94,63,0.12) !important; }
    .feature-item:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important; border-color: #bbf7d0 !important; }
    .whatsapp-btn:hover { transform: scale(1.05) !important; box-shadow: 0 8px 20px rgba(37,211,102,0.4) !important; }
    .cta-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .gift-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .feature-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .whatsapp-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .float-icon { animation: float 3s ease-in-out infinite; }
    .slide-step { animation: slideIn 0.5s ease-out both; }
    .scale-card { animation: scaleIn 0.5s ease-out both; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">

        <!-- HEADER -->
        <tr><td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:48px 48px 40px;position:relative;overflow:hidden">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td><table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;"><img src="${APP_URL}/Imtihan-logo.png" alt="Imtihan" width="48" height="48" style="display:block;border-radius:14px;border:none;" /></td>
              <td style="padding-left:14px;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;vertical-align:middle;">Imtihan</td>
            </tr></table></td>
            <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;vertical-align:middle;">Education AI</td></tr>
          </table>
          <div style="margin-top:40px;">
            <table cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:100px;">
              <tr><td style="padding:6px 14px;font-size:12px;color:#fff;font-weight:700;letter-spacing:0.5px;"><img src="${tw("1f389")}" width="14" height="14" style="vertical-align:middle;margin-right:6px;" /> WELCOME ABOARD</td></tr>
            </table>
            <h1 class="scale-card" style="margin:20px 0 12px;font-size:36px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-1px;">Hi ${firstName}! <img src="${tw("1f44b")}" width="32" height="32" style="vertical-align:middle;margin-bottom:6px;" class="float-icon" /></h1>
            <p style="margin:0;font-size:17px;color:rgba(255,255,255,0.85);line-height:1.6;">Lebanon's most advanced AI exam platform is now at your fingertips. Built by educators, for educators.</p>
          </div>
        </td></tr>

        <!-- GIFT -->
        <tr><td style="padding:40px 48px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" class="gift-card scale-card" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:20px;">
            <tr><td style="padding:32px;">
              <div style="font-size:13px;font-weight:800;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Gift for new teachers</div>
              <div style="font-size:24px;font-weight:800;color:#064e3b;line-height:1.2;margin-bottom:12px;">You have 2 Free Exams waiting</div>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.5;">No credit card, no commitment. Just describe your curriculum and generate.</p>
              <a href="${APP_URL}/create" class="cta-btn" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">Start generating now <img src="${tw("26a1")}" width="16" height="16" style="vertical-align:middle;margin-left:4px;" /></a>
            </td></tr>
          </table>
        </td></tr>

        <!-- TUTORIAL -->
        <tr><td style="padding:48px 48px 0;">
          <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">How it works in 30 seconds</h2>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="48" style="vertical-align:top;"><div class="slide-step" style="width:36px;height:36px;background:#ecfdf5;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#10b981;font-size:15px;border:1px solid #d1fae5;">1</div></td>
              <td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">Describe your exam</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Type in French, Arabic, or English. E.g. "Physics exam, 9th Grade, Optics section, 3 exercises."</p></td>
            </tr></table></td></tr>
            <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="48" style="vertical-align:top;"><div class="slide-step" style="animation-delay:0.1s;width:36px;height:36px;background:#ecfdf5;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#10b981;font-size:15px;border:1px solid #d1fae5;">2</div></td>
              <td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">Select your curriculum</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Choose Bac Libanais, Bac Français, IB, or University level. We adapt to your standards.</p></td>
            </tr></table></td></tr>
            <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="48" style="vertical-align:top;"><div class="slide-step" style="animation-delay:0.2s;width:36px;height:36px;background:#ecfdf5;border-radius:10px;text-align:center;line-height:36px;font-weight:800;color:#10b981;font-size:15px;border:1px solid #d1fae5;">3</div></td>
              <td style="padding-left:16px;vertical-align:top;"><div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">Download & Export</div><p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Get a clean PDF or Word file + full corrigé in under 30 seconds. Print-ready immediately.</p></td>
            </tr></table></td></tr>
          </table>
        </td></tr>

        <!-- FEATURES -->
        <tr><td style="padding:48px 48px 0;">
          <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Premium features you'll love</h2>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="50%" class="feature-col feature-item" style="padding-right:12px;padding-bottom:20px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;"><tr><td>
                <img src="${tw("1f500")}" width="32" height="32" style="margin-bottom:12px;" /><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:6px;">Version A & B</div><div style="color:#64748b;font-size:13px;line-height:1.5;">Instantly create two parallel versions of the same exam to prevent cheating.</div>
              </td></tr></table></td>
              <td width="50%" class="feature-col feature-item" style="padding-left:12px;padding-bottom:20px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;"><tr><td>
                <img src="${tw("1f4cb")}" width="32" height="32" style="margin-bottom:12px;" /><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:6px;">Full Barème</div><div style="color:#64748b;font-size:13px;line-height:1.5;">Every corrigé includes a detailed points breakdown for easy grading.</div>
              </td></tr></table></td>
            </tr>
            <tr>
              <td width="50%" class="feature-col feature-item" style="padding-right:12px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;"><tr><td>
                <img src="${tw("1f516")}" width="32" height="32" style="margin-bottom:12px;" /><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:6px;">Exercise Bank</div><div style="color:#64748b;font-size:13px;line-height:1.5;">Save your favorite AI-generated exercises to your personal bank for reuse.</div>
              </td></tr></table></td>
              <td width="50%" class="feature-col feature-item" style="padding-left:12px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;"><tr><td>
                <img src="${tw("1f4e5")}" width="32" height="32" style="margin-bottom:12px;" /><div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:6px;">Instant Export</div><div style="color:#64748b;font-size:13px;line-height:1.5;">Download in high-quality PDF or editable Microsoft Word format.</div>
              </td></tr></table></td>
            </tr>
          </table>
        </td></tr>

        <!-- SUPPORT -->
        <tr><td style="padding:48px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border-radius:20px;border:1px solid #99f6e4;">
            <tr><td style="padding:32px;text-align:center;">
              <img src="${tw("1f4ac")}" width="40" height="40" style="margin-bottom:16px;" />
              <div style="font-weight:800;color:#0f172a;font-size:18px;margin-bottom:8px;">Have a special request?</div>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">I'm here to help you get started. Message us directly on WhatsApp for any help.</p>
              <a href="https://wa.me/${WA_NUM}?text=${encodeURIComponent("Hi! I just joined Imtihan and I have a question.")}" class="whatsapp-btn" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:800;font-size:15px;">💬 Message on WhatsApp</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td class="footer-section" style="background:#f8fafc;padding:40px 48px;border-top:1px solid #eef2f6;text-align:center;">
          <img src="${APP_URL}/Imtihan-logo.png" alt="Imtihan" width="32" height="32" style="display:inline-block;margin-bottom:16px;opacity:0.6;" />
          <div style="font-weight:700;color:#64748b;font-size:14px;margin-bottom:8px;">Imtihan — AI for Teachers</div>
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.8;">Built for the Lebanese curriculum. <br /> <a href="${APP_URL}" style="color:#1a5e3f;text-decoration:none;">imtihan.live</a> • <a href="${APP_URL}/privacy" style="color:#94a3b8;text-decoration:none;">Privacy</a> • <a href="${APP_URL}/terms" style="color:#94a3b8;text-decoration:none;">Terms</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 3️⃣ UPGRADE CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────
const planLabel = "Monthly — $5.99/month";
const name = "Antoine";
const paymentMethod = "whish";
const instructions = "Send via <strong>Whish Money</strong> to <strong>+961 70 542 238</strong>. Use your email as the reference.";

const upgradeHtml = `<!doctype html>
<html>
<head>
  <style>
    @media screen and (max-width: 560px) {
      .email-body { width: 100% !important; }
      .content-padding { padding: 24px !important; }
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    .payment-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 20px rgba(26,94,63,0.35) !important; }
    .payment-box:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important; border-color: #1a5e3f !important; }
    .payment-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: inline-block; }
    .payment-box { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .slide-up { animation: slideUp 0.6s ease-out both; }
  </style>
</head>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto;background:#f8fafc">
  <div class="email-body slide-up" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 100%);padding:36px;position:relative;overflow:hidden">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <img src="${APP_URL}/Imtihan-logo.png" width="36" height="36" style="border-radius:10px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.2)" alt="Imtihan" />
        <strong style="font-size:20px;color:#fff">Imtihan</strong>
      </div>
      <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:100px;display:inline-block;padding:6px 14px">
        <span style="font-size:12px;color:#fff;font-weight:700;letter-spacing:0.5px">UPGRADE REQUEST RECEIVED</span>
      </div>
      <h1 style="margin:16px 0 8px;font-size:26px;font-weight:800;color:#fff;line-height:1.2">Hi ${name}!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.6">Your request to upgrade to <strong>Imtihan Pro (${planLabel})</strong> is being processed.</p>
    </div>

    <!-- Content -->
    <div class="content-padding" style="padding:36px">
      <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7">Complete your payment to activate Pro. Here's how:</p>

      <div class="payment-box" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:24px;margin-bottom:24px">
        <p style="margin:0 0 12px;font-weight:700;font-size:14px;color:#1e293b;text-transform:uppercase;letter-spacing:0.5px">Payment instructions</p>
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.7">${instructions}</p>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="margin:0;font-weight:700;color:#166534;font-size:14px">After payment</p>
        <p style="margin:8px 0 0;color:#166534;font-size:14px;line-height:1.6">Your account will be upgraded <strong>instantly</strong> once we confirm payment.</p>
      </div>

      <div style="text-align:center">
        <a href="https://wa.me/${WA_NUM}" class="payment-btn" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 4px 16px rgba(37,211,102,0.3)">💬 Need help on WhatsApp?</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:28px 36px;border-top:1px solid #e5e7eb;text-align:center">
      <p style="margin:0 0 8px;color:#64748b;font-size:14px">Questions? Just reply to this email.</p>
      <p style="color:#9ca3af;font-size:12px;margin:0">Imtihan · Made for Lebanese teachers</p>
    </div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 4️⃣ UPGRADE ADMIN NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
const adminHtml = `<!doctype html>
<html>
<head>
  <style>
    @media screen and (max-width: 560px) {
      .email-body { width: 100% !important; padding: 16px !important; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .admin-cta:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 16px rgba(26,94,63,0.3) !important; }
    .admin-cta { transition: all 0.3s ease; display: inline-block; }
    .fade-in { animation: fadeIn 0.5s ease-out; }
  </style>
</head>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto;background:#f8fafc">
  <div class="email-body fade-in" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 100%);padding:32px;display:flex;align-items:center;gap:12px">
      <img src="${APP_URL}/Imtihan-logo.png" width="40" height="40" style="border-radius:10px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.2)" alt="Imtihan" />
      <strong style="font-size:18px;color:#fff">Imtihan — New Upgrade Request</strong>
    </div>

    <!-- Content -->
    <div style="padding:32px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:12px;padding:20px">
        <tr><td style="padding:10px 0;color:#6b7280;width:140px;border-bottom:1px solid #e5e7eb">Name</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb">${name}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Email</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb"><a href="mailto:antoinekhawand04@gmail.com" style="color:#1a5e3f;text-decoration:none">antoinekhawand04@gmail.com</a></td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Phone</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb">+961 70 542 238</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #e5e7eb">Plan</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #e5e7eb">${planLabel}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280">Payment</td><td style="padding:10px 0;font-weight:600;text-transform:capitalize">${paymentMethod}</td></tr>
      </table>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="margin:0 0 8px;font-weight:700;color:#166534;font-size:14px">⚡ Action required</p>
        <p style="margin:0;color:#166534;font-size:14px;line-height:1.6">Contact this teacher and send them the payment link / reference.</p>
      </div>

      <a href="mailto:antoinekhawand04@gmail.com" class="admin-cta" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;box-shadow:0 4px 12px rgba(26,94,63,0.25)">Reply to teacher →</a>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center">
      <p style="color:#9ca3af;font-size:12px;margin:0">Imtihan · Automated upgrade notification</p>
    </div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 5️⃣ 30-SECOND PROMISE
// ─────────────────────────────────────────────────────────────────────────────
const promiseHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header-section { padding: 32px 24px !important; }
      .content-section { padding: 32px 24px !important; }
      .footer-section { padding: 24px !important; }
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .cta-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 28px rgba(26,94,63,0.4) !important; }
    .step-item:hover { transform: translateX(4px) !important; }
    .cta-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .step-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .float-icon { animation: float 3s ease-in-out infinite; }
    .slide-up { animation: slideUp 0.6s ease-out both; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
        <tr><td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:48px 48px 40px;position:relative;overflow:hidden">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td><img src="${APP_URL}/Imtihan-logo.png" alt="Imtihan" width="48" height="48" style="display:block;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.3)" /></td>
            <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">The Promise</td></tr>
          </table>
          <div style="margin-top:40px;">
            <h1 class="slide-up" style="margin:0;font-size:32px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-1px;">Your time is valuable <img src="${tw("23f3")}" width="28" height="28" style="vertical-align:middle;" class="float-icon" /></h1>
            <p style="margin:12px 0 0;font-size:17px;color:rgba(255,255,255,0.8);line-height:1.6;">We promise a complete exam in under 30 seconds. Here is how.</p>
          </div>
        </td></tr>
        <tr><td class="content-section" style="padding:48px;">
          <h2 style="margin:0 0 32px;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;text-align:center;">The 30-Second Workflow</h2>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" class="step-item" style="background:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0"><tr>
              <td width="56" style="vertical-align:top;"><div style="width:40px;height:40px;background:#1a5e3f;border-radius:12px;text-align:center;line-height:40px;font-weight:800;color:#fff;font-size:18px;">1</div></td>
              <td style="padding-left:20px;vertical-align:top;"><div style="font-weight:800;color:#1e293b;font-size:17px;margin-bottom:6px;">Describe your vision</div><p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Don't worry about formatting. Just type "Terminale Physics, 3 exercises on Electric Circuits" in any language.</p></td>
            </tr></table></td></tr>
            <tr><td style="padding-bottom:24px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" class="step-item" style="background:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0"><tr>
              <td width="56" style="vertical-align:top;"><div style="width:40px;height:40px;background:#1a5e3f;border-radius:12px;text-align:center;line-height:40px;font-weight:800;color:#fff;font-size:18px;">2</div></td>
              <td style="padding-left:20px;vertical-align:top;"><div style="font-weight:800;color:#1e293b;font-size:17px;margin-bottom:6px;">Select curriculum</div><p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Choose Bac Libanais, Bac Français, or IB. Our AI is trained on the exact official standards of these programs.</p></td>
            </tr></table></td></tr>
            <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0" class="step-item" style="background:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0"><tr>
              <td width="56" style="vertical-align:top;"><div style="width:40px;height:40px;background:#1a5e3f;border-radius:12px;text-align:center;line-height:40px;font-weight:800;color:#fff;font-size:18px;">3</div></td>
              <td style="padding-left:20px;vertical-align:top;"><div style="font-weight:800;color:#1e293b;font-size:17px;margin-bottom:6px;">Instant Magic</div><p style="margin:0;color:#64748b;font-size:15px;line-height:1.6;">Hit generate and watch your complete exam — with Barème and Corrigé — appear in less than 30 seconds.</p></td>
            </tr></table></td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 48px 48px;text-align:center;">
          <a href="${APP_URL}/create" class="cta-btn" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">Try the 30-second promise →</a>
        </td></tr>
        <tr><td class="footer-section" style="background:#f8fafc;padding:32px;text-align:center;border-top:1px solid #eef2f6;">
          <img src="${APP_URL}/Imtihan-logo.png" alt="Imtihan" width="28" height="28" style="display:inline-block;margin-bottom:12px;opacity:0.5;border-radius:8px;" />
          <p style="margin:0;color:#94a3b8;font-size:12px;">Imtihan • AI for Educators</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 6️⃣ ENGAGEMENT FOLLOW-UP
// ─────────────────────────────────────────────────────────────────────────────
const examCount = 3;
const engagementHtml = `<!doctype html>
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
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #eef2f6;">
        <tr><td class="header-section" style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 60%,#22854f 100%);padding:40px 48px;position:relative;overflow:hidden">
           <img src="${APP_URL}/Imtihan-logo.png" width="40" height="40" style="border-radius:12px;margin-bottom:24px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
           <h1 class="slide-up" style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">How's it going, ${firstName}? <img src="${tw("1f44b")}" width="24" height="24" style="vertical-align:middle;" class="float-icon" /></h1>
        </td></tr>
        <tr><td class="content-section" style="padding:48px;">
          <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">You've already generated <strong>${examCount} exams</strong> with Imtihan — that's amazing! We hope it's saving you hours of work.</p>
          <div style="background:#f0fdf4;border-radius:20px;padding:32px;border:1px solid #dcfce7;margin-bottom:32px;">
            <div style="font-weight:800;color:#166534;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Pro Tips for Experts</div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="tip-item" style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f500")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Version A & B</b>: Create parallel versions to stop cheating.</td></tr>
              <tr><td class="tip-item" style="padding-bottom:12px;color:#166534;font-size:15px;"><img src="${tw("1f4cb")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Full Barème</b>: Points breakdown included in every key.</td></tr>
              <tr><td class="tip-item" style="color:#166534;font-size:15px;"><img src="${tw("1f516")}" width="16" height="16" style="vertical-align:middle;margin-right:8px;" /> <b>Exercise Bank</b>: Save your favorite AI questions.</td></tr>
            </table>
          </div>
          <a href="${APP_URL}/create" class="cta-btn" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 36px;border-radius:12px;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(26,94,63,0.3);">Generate another exam →</a>
        </td></tr>
        <tr><td style="padding:0 48px 48px;text-align:center;">
           <div class="whatsapp-card" style="background:#f8fafc;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
             <img src="${tw("1f4ac")}" width="32" height="32" style="margin-bottom:12px;" />
             <div style="font-weight:700;color:#1e293b;margin-bottom:4px;">Have feedback?</div>
             <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Message us on WhatsApp to share your experience.</p>
             <a href="https://wa.me/${WA_NUM}" style="color:#1a5e3f;font-weight:700;text-decoration:none;">Chat with us now</a>
           </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 7️⃣ ACTIVATION FOLLOW-UP
// ─────────────────────────────────────────────────────────────────────────────
const activationHtml = `<!doctype html>
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
            <tr><td><img src="${APP_URL}/Imtihan-logo.png" width="44" height="44" style="display:block;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.25)" /></td>
            <td align="right" style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;vertical-align:middle;">Getting Started</td></tr>
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
            <a href="https://wa.me/${WA_NUM}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">💬 Chat on WhatsApp</a>
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

// ─────────────────────────────────────────────────────────────────────────────
// SEND ALL 7 TEST EMAILS
// ─────────────────────────────────────────────────────────────────────────────
console.log("Sending 7 test emails...\n");

await sendTest(`📬 Imtihan Newsletter — ${MONTH}`, newsletterHtml);
await sendTest(`Welcome to Imtihan, ${firstName}!`, welcomeHtml);
await sendTest("Your Imtihan Pro upgrade request — next steps", upgradeHtml);
await sendTest("New Pro Upgrade Request — Antoine (Admin)", adminHtml);
await sendTest("The 30-Second Promise — Imtihan ⚡", promiseHtml);
await sendTest("How's your experience with Imtihan so far? 💬", engagementHtml);
await sendTest("Your first exam is waiting — takes 30 seconds ⚡", activationHtml);

console.log("\nDone!");
