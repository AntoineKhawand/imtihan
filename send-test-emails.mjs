const API_KEY = process.env.BREVO_API_KEY;
const TO_EMAIL = "antoinekhawand04@gmail.com";
const TO_NAME  = "Antoine";
const APP_URL  = "https://www.imtihan.live";
const WA_NUM   = "96170542238";
const LOGO_URL = "https://www.imtihan.live/Imtihan-logo.png";
const TW = (code, alt, size = 24) =>
  `<img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png"
       alt="${alt}" width="${size}" height="${size}"
       style="display:inline-block;vertical-align:middle;width:${size}px;height:${size}px" />`;

const MONTH = "May 2025";

// ── Newsletter HTML ───────────────────────────────────────────────────────────
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

      <!-- Logo row -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
        <tr>
          <td style="padding-right:14px;vertical-align:middle">
            <img src="${LOGO_URL}" alt="Imtihan" width="48" height="48"
                 style="border-radius:12px;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.3)" />
          </td>
          <td style="vertical-align:middle">
            <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.3px">Imtihan</span><br/>
            <span style="font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:0.8px;
                         text-transform:uppercase">AI Exam Generator</span>
          </td>
          <td style="text-align:right;vertical-align:middle;padding-left:20px">
            <span style="background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);
                         font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;
                         letter-spacing:0.5px;text-transform:uppercase;border:1px solid rgba(255,255,255,0.2)">
              ${MONTH}
            </span>
          </td>
        </tr>
      </table>

      <!-- Hero text -->
      <h1 class="fade-in" style="margin:0 0 10px;font-size:28px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.5px">
        Your monthly update<br/>from the Imtihan team ${TW("1f1f1-1f1e7", "🇱🇧", 22)}
      </h1>
      <p style="margin:0;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.65;max-width:440px">
        New features, teaching tips, and everything you need to get more out of Imtihan this month.
      </p>
    </div>

    <!-- ══ BODY ══ -->
    <div style="background:#fff;padding:44px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">

      <!-- Greeting -->
      <p style="color:#475569;line-height:1.75;margin:0 0 36px;font-size:15px">
        Hi Antoine,<br/><br/>
        It's been a productive month for Lebanese educators on Imtihan. Here's what's new,
        what's improved, and a tip to save you even more time in June.
      </p>

      <!-- ── DIVIDER: What's New ── -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="padding-right:14px">
            <div style="height:2px;background:linear-gradient(90deg,#1a5e3f,transparent)"></div>
          </td>
          <td style="white-space:nowrap">
            <span style="font-size:11px;font-weight:800;color:#1a5e3f;letter-spacing:1.5px;text-transform:uppercase">
              ✦ &nbsp;What's New
            </span>
          </td>
          <td style="padding-left:14px">
            <div style="height:2px;background:linear-gradient(270deg,#1a5e3f,transparent)"></div>
          </td>
        </tr>
      </table>

      <!-- Feature 1 -->
      <table width="100%" cellpadding="0" cellspacing="0"
             class="feature-card"
             style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:16px;overflow:hidden;background:#fff">
        <tr>
          <td style="padding:22px 24px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;vertical-align:top;padding-top:2px">
                  <div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;
                              border:1px solid #bbf7d0;text-align:center;line-height:44px">
                    ${TW("1f4ca", "Chart", 22)}
                  </div>
                </td>
                <td>
                  <strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">
                    Barème &amp; Micro-barème in every corrigé
                  </strong>
                  <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">
                    Every generated exam now includes a detailed marking grid — per sub-question points
                    and a step-by-step micro-barème. Grade in half the time.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Feature 2 -->
      <table width="100%" cellpadding="0" cellspacing="0"
             class="feature-card"
             style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:16px;overflow:hidden;background:#fff">
        <tr>
          <td style="padding:22px 24px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;vertical-align:top;padding-top:2px">
                  <div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;
                              border:1px solid #bbf7d0;text-align:center;line-height:44px">
                    ${TW("1f3e6", "Bank", 22)}
                  </div>
                </td>
                <td>
                  <strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">
                    Personal &amp; School Exercise Bank
                  </strong>
                  <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">
                    Save your best exercises to your personal bank and reuse them across exams.
                    Pro users can also share exercises with their entire school team.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Feature 3 -->
      <table width="100%" cellpadding="0" cellspacing="0"
             class="feature-card"
             style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:36px;overflow:hidden;background:#fff">
        <tr>
          <td style="padding:22px 24px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;vertical-align:top;padding-top:2px">
                  <div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;
                              border:1px solid #bbf7d0;text-align:center;line-height:44px">
                    ${TW("1f500", "Shuffle", 22)}
                  </div>
                </td>
                <td>
                  <strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:6px">
                    Version A &amp; B — Anti-cheating exams
                  </strong>
                  <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">
                    Generate two parallel versions of the same exam with different numbers and
                    shuffled questions. Students in adjacent seats get completely different papers.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- ── DIVIDER: Tip of the Month ── -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        <tr>
          <td style="padding-right:14px">
            <div style="height:2px;background:linear-gradient(90deg,#f59e0b,transparent)"></div>
          </td>
          <td style="white-space:nowrap">
            <span style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:1.5px;text-transform:uppercase">
              ✦ &nbsp;Tip of the Month
            </span>
          </td>
          <td style="padding-left:14px">
            <div style="height:2px;background:linear-gradient(270deg,#f59e0b,transparent)"></div>
          </td>
        </tr>
      </table>

      <!-- Tip card -->
      <table width="100%" cellpadding="0" cellspacing="0"
             class="tip-card"
             style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin-bottom:36px">
        <tr>
          <td style="padding:24px 26px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;vertical-align:top;font-size:28px;line-height:1">
                  ${TW("1f4a1", "Tip", 32)}
                </td>
                <td>
                  <strong style="color:#92400e;font-size:15px;display:block;margin-bottom:8px">
                    Upload your course notes for smarter exams
                  </strong>
                  <p style="color:#78350f;font-size:13px;line-height:1.7;margin:0">
                    In Step 1 of the exam builder, you can upload a PDF or Word file of your course notes.
                    Imtihan reads it and generates questions grounded in <em>your exact content</em> —
                    not generic textbook questions. Try it with your last chapter.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- ── Stats row ── -->
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:36px">
        <tr>
          <td style="padding:20px 24px">
            <p style="margin:0 0 16px;font-size:11px;font-weight:800;color:#64748b;
                      letter-spacing:1.2px;text-transform:uppercase">Imtihan this month</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;border-right:1px solid #e2e8f0;padding-right:20px">
                  <div style="font-size:30px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">439+</div>
                  <div style="font-size:12px;color:#64748b;margin-top:2px">Educators</div>
                </td>
                <td style="text-align:center;border-right:1px solid #e2e8f0;padding:0 20px">
                  <div style="font-size:30px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">3.5k</div>
                  <div style="font-size:12px;color:#64748b;margin-top:2px">Visits</div>
                </td>
                <td style="text-align:center;padding-left:20px">
                  <div style="font-size:30px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">4</div>
                  <div style="font-size:12px;color:#64748b;margin-top:2px">Curricula</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- ── CTA ── -->
      <div style="text-align:center;margin-bottom:10px">
        <a href="${APP_URL}/create"
           class="cta-button"
           style="display:inline-block;background:linear-gradient(135deg,#1a5e3f,#2d8f5f);
                  color:#fff;text-decoration:none;padding:16px 48px;border-radius:13px;
                  font-weight:700;font-size:16px;letter-spacing:-0.2px;
                  box-shadow:0 4px 20px rgba(26,94,63,0.35)">
          Generate an exam now →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">
          2 free exams &nbsp;·&nbsp; No credit card required
        </p>
      </div>

    </div>

    <!-- ══ FOOTER ══ -->
    <div style="background:#1e293b;border-radius:0 0 20px 20px;padding:32px 44px;text-align:center">

      <!-- Logo -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr>
          <td style="padding-right:10px;vertical-align:middle">
            <img src="${LOGO_URL}" alt="Imtihan" width="30" height="30"
                 style="border-radius:8px;display:block" />
          </td>
          <td style="vertical-align:middle">
            <span style="font-size:16px;font-weight:700;color:#fff">Imtihan</span>
          </td>
        </tr>
      </table>

      <!-- Links -->
      <p style="margin:0 0 12px">
        <a href="${APP_URL}/create"
           style="color:#a0f0c0;text-decoration:none;font-size:13px;font-weight:600;margin:0 12px">
          Create Exam
        </a>
        <a href="${APP_URL}/pricing"
           style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px">
          Pricing
        </a>
        <a href="${APP_URL}/contact"
           style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px">
          Contact
        </a>
        <a href="${APP_URL}/privacy"
           style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 12px">
          Privacy
        </a>
      </p>

      <!-- WhatsApp -->
      <p style="margin:0 0 16px">
        <a href="https://wa.me/${WA_NUM}"
           style="color:#25D366;text-decoration:none;font-size:13px;font-weight:600">
          ${TW("1f4ac", "WA", 14)} &nbsp;Chat with us on WhatsApp
        </a>
      </p>

      <p style="color:#475569;font-size:11px;margin:0;line-height:1.7">
        You're receiving this because you created an account on Imtihan.<br/>
        Imtihan · Beirut, Lebanon ·
        <a href="${APP_URL}/contact" style="color:#64748b;text-decoration:none">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;

// ── Send ───────────────────────────────────────────────────────────────────────
const res = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: { "Content-Type": "application/json", "api-key": API_KEY },
  body: JSON.stringify({
    sender: { name: "Imtihan", email: "admin@imtihan.live" },
    to: [{ email: TO_EMAIL, name: TO_NAME }],
    subject: `📬 Imtihan Newsletter — ${MONTH}`,
    htmlContent: newsletterHtml,
  }),
});
const data = await res.text();
console.log(res.ok ? `✅ Newsletter sent! ${data}` : `❌ Failed (${res.status}): ${data}`);
