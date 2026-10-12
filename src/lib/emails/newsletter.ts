import { emailCampaignUrl } from "@/lib/campaigns";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}

/** Shared by manual sends, the scheduled newsletter and its admin preview.
 * Delivery adds the recipient-specific postal address and unsubscribe footer.
 */
export function buildNewsletterHtml(
  firstName: string,
  month: string,
  appUrl = "https://imtihan.live",
  campaign = "weekly_newsletter",
): string {
  const url = (path: string) => escapeHtml(`${appUrl}${path}`);
  const createUrl = escapeHtml(emailCampaignUrl(`${appUrl}/create`, campaign));
  const features = [
    [
      "01",
      "Start with your syllabus",
      "Choose your curriculum, chapters, marks and difficulty. Upload a document when you want to reuse its content, exercise ideas or structure.",
    ],
    [
      "02",
      "Review every question",
      "Check the data, reasoning and chapter coverage. Refine individual exercises and review the corrigé before sharing with students.",
    ],
    [
      "03",
      "Export a paper you can use",
      "Download Word or print to PDF with one consistent composition. Choose whether to include the corrigé.",
    ],
  ];
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Imtihan teaching notes</title>
<style>body{margin:0;padding:0}table{border-collapse:collapse}a{overflow-wrap:anywhere}@media screen and (max-width:600px){.outer{padding:12px 8px!important}.inset{padding:28px 20px!important}.headline{font-size:30px!important}.cta{display:block!important;text-align:center!important;padding:16px 12px!important}.feature{padding:20px 16px!important}}@media(prefers-color-scheme:dark){.canvas{background:#14231d!important}.paper{background:#1d3027!important}.copy{color:#e3ece6!important}.muted{color:#b6c9bc!important}.panel{background:#253c30!important;border-color:#3e5848!important}}</style></head>
<body class="canvas" style="background:#f3f5f0;font-family:Arial,Helvetica,sans-serif;color:#20382b">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">A practical workflow for your next exam: plan, review and export.</div>
<table role="presentation" width="100%" class="canvas" style="background:#f3f5f0"><tr><td align="center" class="outer" style="padding:32px 16px">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" class="paper" style="max-width:600px;background:#fff;border:1px solid #dce4dc">
<tr><td class="inset" style="padding:32px 36px;background:#173e2c;color:#fff">
<table role="presentation" width="100%"><tr><td><img src="${url("/Imtihan-logo.png")}" alt="Imtihan" width="40" height="40" style="display:block;border-radius:10px"></td><td align="right" style="font-size:12px;color:#d3e5d7">Teaching notes<br>${escapeHtml(month)}</td></tr></table>
<h1 class="headline" style="font-family:Georgia,serif;font-size:38px;font-weight:normal;line-height:1.15;margin:30px 0 14px;color:#fff">A thoughtful exam.<br>A clearer workflow.</h1>
<p style="font-size:16px;line-height:1.7;margin:0;color:#d3e5d7">Practical ideas for your next Maths, Physics or Chemistry paper.</p></td></tr>
<tr><td class="inset" style="padding:32px 36px">
<p class="copy" style="font-size:16px;line-height:1.7;margin:0 0 24px">Hi ${escapeHtml(firstName)},<br>Here is a simple way to prepare your next exam with Imtihan while keeping your teaching goals in control.</p>
${features.map(([number, title, description]) => `<table role="presentation" width="100%" style="margin-bottom:14px"><tr><td class="panel feature" style="padding:22px;background:#f7f9f5;border:1px solid #dce4dc"><p style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#43805a;margin:0 0 8px">${number}</p><h2 class="copy" style="font-size:18px;line-height:1.4;color:#20382b;margin:0 0 8px">${title}</h2><p class="muted" style="font-size:15px;line-height:1.7;color:#526558;margin:0">${description}</p></td></tr></table>`).join("")}
<h2 class="copy" style="font-family:Georgia,serif;font-size:25px;font-weight:normal;margin:28px 0 10px">Try this on your next paper</h2>
<p class="muted" style="font-size:15px;line-height:1.7;color:#526558;margin:0 0 24px">Ask students to interpret a table or graph, justify a choice, and check whether their result is reasonable. Review the generated data so it supports the question without giving away the answer.</p>
<a class="cta" href="${createUrl}" style="display:inline-block;background:#1a5e3f;color:#fff;text-decoration:none;padding:16px 26px;font-size:16px;font-weight:bold;border-radius:8px">Create an exam →</a>
<p class="muted" style="font-size:13px;line-height:1.6;color:#526558;margin:14px 0 0">New to Imtihan? Your account includes one free exam.</p></td></tr>
<tr><td class="inset panel" style="padding:24px 36px;border-top:1px solid #dce4dc;background:#f7f9f5"><p class="muted" style="font-size:13px;line-height:1.8;color:#526558;margin:0">Imtihan · Made for teachers<br><a href="${url("/blog")}" style="color:#43805a">Teaching guides</a> &nbsp;·&nbsp; <a href="${url("/contact")}" style="color:#43805a">Contact</a> &nbsp;·&nbsp; <a href="${url("/privacy")}" style="color:#43805a">Privacy</a><br>Manage promotional email preferences using the unsubscribe link below.</p></td></tr>
</table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}
