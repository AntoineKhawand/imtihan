// Shared by /api/newsletter/subscribe (first send) and
// /api/cron/newsletter-checklist-backfill (retry for anyone whose first send
// failed) — one template, so the two paths can never drift apart.

export const CHECKLIST_SUBJECT = "Your Exam-Writing Checklist — Imtihan";

export const CHECKLIST_HTML = `
<!doctype html>
<html>
<head></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;font-size:16px;color:#1d1d1f;padding:24px;max-width:560px;margin:0 auto;background:#f5f5f7">
  <div style="background:#ffffff;border-radius:24px;overflow:hidden">
    <div style="background:#0f2d20;padding:40px;text-align:center">
      <img src="https://imtihan.live/Imtihan-logo.png" alt="Imtihan" width="40" height="40" style="display:block;margin:0 auto 16px;border-radius:10px;" />
      <p style="color:#fff;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.4px">Your exam-writing checklist</p>
    </div>
    <div style="padding:40px 36px">
      <p style="color:#6e6e73;margin:0 0 28px 0;line-height:1.65;font-size:15px">
        Ten checks worth running before any Bac Libanais, Bac Français, or IB exam goes out —
        the ones that catch the mistakes students actually complain about.
      </p>
      <ol style="color:#1d1d1f;line-height:2;padding-left:20px;margin:0 0 28px 0;font-size:15px">
        <li><strong>Total points add up</strong> — sum every exercise + sub-question against the stated total.</li>
        <li><strong>Difficulty is actually mixed</strong> — not every question at the same level, front-loaded easy.</li>
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
        Imtihan runs a version of this checklist automatically on every exam it generates —
        curriculum-aligned, corrigé included, in minutes instead of hours.
      </p>
      <a href="https://imtihan.live/create" style="display:inline-block;background:#1a5e3f;color:#fff;padding:15px 32px;border-radius:980px;text-decoration:none;font-weight:600;font-size:16px">
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
