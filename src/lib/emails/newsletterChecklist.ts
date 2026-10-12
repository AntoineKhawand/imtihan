import { emailCampaignUrl } from "@/lib/campaigns";
// Shared by /api/newsletter/subscribe (first send) and
// /api/cron/newsletter-checklist-backfill (retry for anyone whose first send
// failed) — one template, so the two paths can never drift apart.

export const CHECKLIST_SUBJECT = "Your Exam-Writing Checklist — Imtihan";

export const CHECKLIST_HTML = `
<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media screen and (max-width:600px){.checklist-body{padding:12px 8px!important}.checklist-header{padding:28px 20px!important}.checklist-content{padding:28px 20px!important}.checklist-cta{display:block!important;text-align:center;padding:16px 12px!important}}</style></head>
<body class="checklist-body" style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;font-size:16px;color:#1d1d1f;padding:24px;max-width:560px;margin:0 auto;background:#f5f5f7">
  <div style="background:#ffffff;border-radius:24px;overflow:hidden">
    <div class="checklist-header" style="background:#0f2d20;padding:40px;text-align:center">
      <img src="https://imtihan.live/Imtihan-logo.png" alt="Imtihan" width="40" height="40" style="display:block;margin:0 auto 16px;border-radius:10px;" />
      <p style="color:#fff;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.4px">Your exam-writing checklist</p>
    </div>
    <div class="checklist-content" style="padding:40px 36px">
      <p style="color:#6e6e73;margin:0 0 28px 0;line-height:1.65;font-size:15px">
        Ten checks worth running before any Bac Libanais, Bac Français, or IB exam goes out —
        the ones that catch the mistakes students actually complain about.
      </p>
      <ol style="color:#1d1d1f;line-height:2;padding-left:20px;margin:0 0 28px 0;font-size:15px">
        <li><strong>Total points add up</strong> — sum every exercise + sub-question against the stated total.</li>
        <li><strong>Difficulty matches your goal</strong> — check the reasoning required, not just the size of the numbers.</li>
        <li><strong>Chapter coverage matches what you taught</strong> — no question from a chapter you skipped.</li>
        <li><strong>Every document has a real, checkable source</strong> — never an invented citation.</li>
        <li><strong>Command verbs match the curriculum's convention</strong> — "Montrer que" vs "Calculer" (or "Show that" vs "Calculate") aren't interchangeable.</li>
        <li><strong>Corrigé barème sums to the exercise's points</strong>, not just the exam's total.</li>
        <li><strong>Language is fully consistent</strong> — no stray English mixed into a French paper, or vice versa.</li>
        <li><strong>Numbers in the corrigé are internally consistent</strong> — no negative mass, no probability over 100%.</li>
        <li><strong>Duration is realistic</strong> for the exercise count and difficulty, not just copy-pasted from last time.</li>
        <li><strong>You'd want to sit it yourself</strong> — the actual test: is it fair, or just hard?</li>
      </ol>
      <p style="color:#6e6e73;line-height:1.65;margin:0 0 28px 0;font-size:15px">
        Use this checklist while reviewing your Imtihan exam and corrigé. Check the questions,
        marks and answers before sharing the paper with your students.
      </p>
      <a class="checklist-cta" href="${emailCampaignUrl("https://imtihan.live/create", "exam_checklist")}" style="display:inline-block;background:#1a5e3f;color:#fff;padding:15px 32px;border-radius:980px;text-decoration:none;font-weight:600;font-size:16px">
        Try your first exam free
      </a>
      <p style="color:#86868b;font-size:12px;margin:32px 0 0 0;line-height:1.6">
        You're getting this because you signed up at imtihan.live. No spam, no list-sharing —
        just this one email.
      </p>
    </div>
  </div>
</body>
</html>`;
