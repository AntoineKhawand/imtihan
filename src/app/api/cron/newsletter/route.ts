import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL    = process.env.NEXT_PUBLIC_APP_URL    ?? "https://imtihan.live";
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
    .wrap{width:100%!important;padding:0 6px 32px!important}
    .hero{padding:40px 28px 32px!important}
    .body{padding:32px 28px!important}
    .foot{padding:28px!important}
    .cta-btn{padding:15px 32px!important;font-size:15px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;
             font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif;color:#1d1d1f">

<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 16px 48px">
<table class="wrap" width="600" cellpadding="0" cellspacing="0">

  <!-- ══ HEADER ══ -->
  <tr><td class="hero"
          style="background:#0f2d20;border-radius:24px 24px 0 0;padding:48px 44px 40px;text-align:center">

    <img src="${LOGO_URL}" alt="Imtihan" width="44" height="44"
         style="border-radius:11px;display:block;margin:0 auto 20px" />

    <h1 style="margin:0 0 12px;font-size:30px;font-weight:700;color:#fff;
               line-height:1.2;letter-spacing:-0.6px">
      What's new this month
    </h1>
    <p style="margin:0;color:rgba(255,255,255,0.65);font-size:16px;line-height:1.6">
      ${month} · the Imtihan team
    </p>
  </td></tr>

  <!-- ══ BODY ══ -->
  <tr><td class="body" style="background:#fff;padding:48px 44px">

    <p style="color:#424245;line-height:1.7;margin:0 0 40px;font-size:16px">
      Hi ${firstName}, here's what changed for Lebanese educators on Imtihan — and one tip
      worth trying on your next exam.
    </p>

    <p style="margin:0 0 20px;font-size:12px;font-weight:600;color:#1a5e3f;letter-spacing:0.08em;text-transform:uppercase">
      What's new
    </p>

    <!-- Feature 1 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="48" style="vertical-align:top">
          <div style="width:40px;height:40px;border-radius:11px;background:#f0fdf4;text-align:center;line-height:40px">
            ${TW("1f4ca")}
          </div>
        </td>
        <td style="padding-left:16px;vertical-align:top">
          <strong style="color:#1d1d1f;font-size:16px;display:block;margin-bottom:4px;letter-spacing:-0.2px">
            Barème &amp; micro-barème in every corrigé
          </strong>
          <p style="color:#6e6e73;font-size:14px;line-height:1.6;margin:0">
            Every generated exam now includes a per-sub-question grading grid and a
            step-by-step micro-barème. Grade in half the time.
          </p>
        </td>
      </tr>
    </table>

    <!-- Feature 2 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="48" style="vertical-align:top">
          <div style="width:40px;height:40px;border-radius:11px;background:#f0fdf4;text-align:center;line-height:40px">
            ${TW("1f500")}
          </div>
        </td>
        <td style="padding-left:16px;vertical-align:top">
          <strong style="color:#1d1d1f;font-size:16px;display:block;margin-bottom:4px;letter-spacing:-0.2px">
            Version A &amp; B — anti-cheating exams
          </strong>
          <p style="color:#6e6e73;font-size:14px;line-height:1.6;margin:0">
            Generate a real second exam — different numbers and wording, same difficulty.
            Students in adjacent seats get completely different papers.
          </p>
        </td>
      </tr>
    </table>

    <!-- Feature 3 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px">
      <tr>
        <td width="48" style="vertical-align:top">
          <div style="width:40px;height:40px;border-radius:11px;background:#f0fdf4;text-align:center;line-height:40px">
            ${TW("1f3e6")}
          </div>
        </td>
        <td style="padding-left:16px;vertical-align:top">
          <strong style="color:#1d1d1f;font-size:16px;display:block;margin-bottom:4px;letter-spacing:-0.2px">
            Personal &amp; school exercise bank
          </strong>
          <p style="color:#6e6e73;font-size:14px;line-height:1.6;margin:0">
            Save your best exercises and reuse them across future exams.
            Pro users can share with their entire school team.
          </p>
        </td>
      </tr>
    </table>

    <!-- Tip card -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f9f9fb;border-radius:16px;margin-bottom:40px">
      <tr><td style="padding:24px 26px">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="30" style="vertical-align:top;padding-top:1px">
            ${TW("1f4a1")}
          </td>
          <td style="padding-left:10px">
            <strong style="color:#1d1d1f;font-size:14px;display:block;margin-bottom:6px">
              Tip: upload your course notes for smarter exams
            </strong>
            <p style="color:#6e6e73;font-size:14px;line-height:1.65;margin:0">
              In Step 1 of the exam builder, upload a PDF or Word file of your course notes.
              Imtihan reads it and generates questions grounded in <em>your exact content</em> —
              not generic textbook questions.
            </p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="${APP_URL}/create" class="cta-btn"
           style="display:inline-block;background:#1a5e3f;
                  color:#fff;text-decoration:none;padding:16px 40px;border-radius:980px;
                  font-weight:600;font-size:16px;letter-spacing:-0.1px">
          Generate an exam
        </a>
        <p style="color:#86868b;font-size:13px;margin:14px 0 0">
          1 free exam · no credit card required
        </p>
      </td></tr>
    </table>

  </td></tr>

  <!-- ══ FOOTER ══ -->
  <tr><td class="foot" style="background:#fff;border-radius:0 0 24px 24px;padding:36px 44px;text-align:center;border-top:1px solid #f0f0f2">

    <p style="margin:0 0 16px">
      <a href="${APP_URL}/create" style="color:#1a5e3f;text-decoration:none;font-size:13px;font-weight:600;margin:0 10px">Create exam</a>
      <a href="${APP_URL}/pricing" style="color:#86868b;text-decoration:none;font-size:13px;margin:0 10px">Pricing</a>
      <a href="${APP_URL}/contact" style="color:#86868b;text-decoration:none;font-size:13px;margin:0 10px">Contact</a>
      <a href="${APP_URL}/privacy" style="color:#86868b;text-decoration:none;font-size:13px;margin:0 10px">Privacy</a>
    </p>

    <p style="margin:0 0 20px">
      <a href="https://wa.me/${WA_NUM}" style="color:#1a5e3f;text-decoration:none;font-size:13px;font-weight:600">
        Chat with us on WhatsApp
      </a>
    </p>

    <p style="color:#86868b;font-size:12px;margin:0;line-height:1.7">
      You're receiving this because you created an account on Imtihan.<br/>
      Imtihan · Beirut, Lebanon ·
      <a href="${APP_URL}/contact" style="color:#86868b;text-decoration:underline">Unsubscribe</a>
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
          console.error(
            "[cron/newsletter] send_rejected",
            JSON.stringify({ uid: doc.id, error: result.error ?? null })
          );
          errors++;
        }
      } catch (err) {
        console.error(
          "[cron/newsletter] send_threw",
          JSON.stringify({ uid: doc.id, error: err instanceof Error ? err.message : String(err) })
        );
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
