import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL    = process.env.NEXT_PUBLIC_APP_URL    ?? "https://www.imtihan.live";
const WA_NUM     = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "96170542238";
const LOGO_URL   = `${APP_URL}/Imtihan-logo.png`;
const TW         = (code: string) =>
  `<img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png"
       width="22" height="22" style="display:inline-block;vertical-align:middle" />`;

function buildNewsletterHtml(firstName: string, month: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @media screen and (max-width:620px){
    .wrap{width:100%!important;padding:0 8px 32px!important}
    .hero{padding:28px 24px!important;border-radius:16px 16px 0 0!important}
    .body{padding:28px 24px!important}
    .foot{padding:24px!important;border-radius:0 0 16px 16px!important}
    .stats-cell{display:block!important;width:100%!important;border-right:none!important;
                border-bottom:1px solid #e2e8f0!important;padding:12px 0!important}
    .stats-cell:last-child{border-bottom:none!important}
    .cta-btn{padding:14px 28px!important;font-size:14px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a">

<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px 48px">
<table class="wrap" width="620" cellpadding="0" cellspacing="0">

  <!-- ══ HEADER ══ -->
  <tr><td class="hero"
          style="background:linear-gradient(160deg,#0f3d28 0%,#1a5e3f 55%,#2d8f5f 100%);
                 border-radius:20px 20px 0 0;padding:40px 44px 36px;overflow:hidden">

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td style="vertical-align:middle;padding-right:14px">
          <img src="${LOGO_URL}" alt="Imtihan" width="48" height="48"
               style="border-radius:12px;display:block;box-shadow:0 4px 16px rgba(0,0,0,0.3)" />
        </td>
        <td style="vertical-align:middle">
          <span style="font-size:20px;font-weight:800;color:#fff;display:block;letter-spacing:-0.3px">Imtihan</span>
          <span style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.8px;text-transform:uppercase">AI Exam Generator</span>
        </td>
        <td align="right" style="vertical-align:middle">
          <span style="background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);
                       font-size:11px;font-weight:700;padding:5px 13px;border-radius:20px;
                       letter-spacing:0.5px;text-transform:uppercase;
                       border:1px solid rgba(255,255,255,0.2)">${month}</span>
        </td>
      </tr>
    </table>

    <h1 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#fff;
               line-height:1.25;letter-spacing:-0.5px">
      Your bi-weekly update<br/>from the Imtihan team
      <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f1f1-1f1e7.png"
           width="22" height="22" style="vertical-align:middle;margin-left:6px" />
    </h1>
    <p style="margin:0;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.65;max-width:440px">
      New features, teaching tips, and everything you need to get more out of Imtihan this month.
    </p>
  </td></tr>

  <!-- ══ BODY ══ -->
  <tr><td class="body"
          style="background:#fff;padding:44px;
                 border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0">

    <p style="color:#475569;line-height:1.75;margin:0 0 36px;font-size:15px">
      Hi ${firstName},<br/><br/>
      It's been a productive month for Lebanese educators on Imtihan.
      Here's what's new, what's improved, and a tip to save you even more time next month.
    </p>

    <!-- Section divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px">
      <tr>
        <td style="padding-right:12px"><div style="height:2px;background:linear-gradient(90deg,#1a5e3f,transparent)"></div></td>
        <td style="white-space:nowrap">
          <span style="font-size:10px;font-weight:800;color:#1a5e3f;letter-spacing:1.5px;text-transform:uppercase">✦ &nbsp;What's New</span>
        </td>
        <td style="padding-left:12px"><div style="height:2px;background:linear-gradient(270deg,#1a5e3f,transparent)"></div></td>
      </tr>
    </table>

    <!-- Feature 1 -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:14px;background:#fff">
      <tr><td style="padding:20px 22px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:14px;vertical-align:top;padding-top:2px">
            <div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;
                        border:1px solid #bbf7d0;text-align:center;line-height:44px">
              ${TW("1f4ca")}
            </div>
          </td>
          <td>
            <strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:5px">
              Barème &amp; Micro-barème in every corrigé
            </strong>
            <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">
              Every generated exam now includes a per-sub-question grading grid and a
              step-by-step micro-barème. Grade in half the time.
            </p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Feature 2 -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:14px;background:#fff">
      <tr><td style="padding:20px 22px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:14px;vertical-align:top;padding-top:2px">
            <div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;
                        border:1px solid #bbf7d0;text-align:center;line-height:44px">
              ${TW("1f500")}
            </div>
          </td>
          <td>
            <strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:5px">
              Version A &amp; B — Anti-cheating exams
            </strong>
            <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">
              Generate two parallel versions with different numbers and shuffled questions.
              Students in adjacent seats get completely different papers.
            </p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Feature 3 -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e2e8f0;border-radius:14px;margin-bottom:36px;background:#fff">
      <tr><td style="padding:20px 22px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:14px;vertical-align:top;padding-top:2px">
            <div style="width:44px;height:44px;border-radius:11px;background:#f0fdf4;
                        border:1px solid #bbf7d0;text-align:center;line-height:44px">
              ${TW("1f3e6")}
            </div>
          </td>
          <td>
            <strong style="color:#0f172a;font-size:15px;display:block;margin-bottom:5px">
              Personal &amp; School Exercise Bank
            </strong>
            <p style="color:#64748b;font-size:13px;line-height:1.65;margin:0">
              Save your best exercises and reuse them across future exams.
              Pro users can share with their entire school team.
            </p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Tip divider -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px">
      <tr>
        <td style="padding-right:12px"><div style="height:2px;background:linear-gradient(90deg,#f59e0b,transparent)"></div></td>
        <td style="white-space:nowrap">
          <span style="font-size:10px;font-weight:800;color:#d97706;letter-spacing:1.5px;text-transform:uppercase">✦ &nbsp;Tip of the Month</span>
        </td>
        <td style="padding-left:12px"><div style="height:2px;background:linear-gradient(270deg,#f59e0b,transparent)"></div></td>
      </tr>
    </table>

    <!-- Tip card -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin-bottom:36px">
      <tr><td style="padding:22px 24px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:14px;vertical-align:top;padding-top:4px">
            ${TW("1f4a1")}
          </td>
          <td>
            <strong style="color:#92400e;font-size:14px;display:block;margin-bottom:6px">
              Upload your course notes for smarter exams
            </strong>
            <p style="color:#78350f;font-size:13px;line-height:1.7;margin:0">
              In Step 1 of the exam builder, upload a PDF or Word file of your course notes.
              Imtihan reads it and generates questions grounded in <em>your exact content</em> —
              not generic textbook questions. Try it with your last chapter.
            </p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Stats -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:36px">
      <tr><td style="padding:20px 24px">
        <p style="margin:0 0 14px;font-size:10px;font-weight:800;color:#64748b;
                  letter-spacing:1.2px;text-transform:uppercase">Imtihan this month</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="stats-cell" align="center"
                style="border-right:1px solid #e2e8f0;padding-right:16px">
              <div style="font-size:28px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">439+</div>
              <div style="font-size:12px;color:#64748b;margin-top:2px">Educators</div>
            </td>
            <td class="stats-cell" align="center"
                style="border-right:1px solid #e2e8f0;padding:0 16px">
              <div style="font-size:28px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">3.5k</div>
              <div style="font-size:12px;color:#64748b;margin-top:2px">Page Views</div>
            </td>
            <td class="stats-cell" align="center" style="padding-left:16px">
              <div style="font-size:28px;font-weight:800;color:#1a5e3f;letter-spacing:-1px">4</div>
              <div style="font-size:12px;color:#64748b;margin-top:2px">Curricula</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${APP_URL}/create" class="cta-btn"
           style="display:inline-block;background:linear-gradient(135deg,#1a5e3f,#2d8f5f);
                  color:#fff;text-decoration:none;padding:16px 48px;border-radius:13px;
                  font-weight:700;font-size:16px;letter-spacing:-0.2px;
                  box-shadow:0 4px 20px rgba(26,94,63,0.35)">
          Generate an exam now →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">
          1 free exam &nbsp;·&nbsp; No credit card required
        </p>
      </td></tr>
    </table>

  </td></tr>

  <!-- ══ FOOTER ══ -->
  <tr><td class="foot"
          style="background:#1e293b;border-radius:0 0 20px 20px;padding:32px 44px;text-align:center">

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

    <p style="margin:0 0 12px">
      <a href="${APP_URL}/create" style="color:#a0f0c0;text-decoration:none;font-size:13px;font-weight:600;margin:0 10px">Create Exam</a>
      <a href="${APP_URL}/pricing" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 10px">Pricing</a>
      <a href="${APP_URL}/contact" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 10px">Contact</a>
      <a href="${APP_URL}/privacy" style="color:#94a3b8;text-decoration:none;font-size:13px;margin:0 10px">Privacy</a>
    </p>

    <p style="margin:0 0 16px">
      <a href="https://wa.me/${WA_NUM}"
         style="color:#25D366;text-decoration:none;font-size:13px;font-weight:600">
        💬 &nbsp;Chat with us on WhatsApp
      </a>
    </p>

    <p style="color:#475569;font-size:11px;margin:0;line-height:1.7">
      You're receiving this because you created an account on Imtihan.<br/>
      Imtihan · Beirut, Lebanon ·
      <a href="${APP_URL}/contact" style="color:#64748b;text-decoration:none">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const subject = `📬 Imtihan Update — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  let sent = 0;
  let errors = 0;

  try {
    const snap = await adminDb.collection("users").limit(500).get();

    for (const doc of snap.docs) {
      const data = doc.data();
      const email: string | undefined = data.email;
      if (!email) continue;

      // Skip if sent within the last 13 days (slight buffer for weekly cron)
      const lastNewsletter: number | undefined = data.newsletterSentAt;
      const now = Date.now();
      const THRESHOLD = 13 * 24 * 60 * 60 * 1000;
      if (lastNewsletter && (now - lastNewsletter < THRESHOLD)) continue;

      const firstName = (data.displayName ?? "").split(" ")[0] || "there";
      const displayMonth = new Date().toLocaleString("en-US", { month: "long" });
      const html = buildNewsletterHtml(firstName, displayMonth);

      try {
        const result = await sendEmail({ to: email, toName: data.displayName ?? email, subject, html });
        if (result.ok) {
          await doc.ref.update({ newsletterSentAt: now });
          sent++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }
  } catch (err) {
    console.error("[cron/newsletter]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  console.log(`[cron/newsletter] sent=${sent} errors=${errors}`);
  return NextResponse.json({ ok: true, sent, errors });
}
