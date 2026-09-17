// Shared by /api/newsletter/subscribe (first send) and
// /api/cron/newsletter-checklist-backfill (retry for anyone whose first send
// failed) — one template, so the two paths can never drift apart.

export const CHECKLIST_SUBJECT = "Your Exam-Writing Checklist — Imtihan";

export const CHECKLIST_HTML = `
<!doctype html>
<html>
<head></head>
<body style="font-family:system-ui,sans-serif;font-size:15px;color:#111;padding:24px;max-width:560px;margin:0 auto;background:#f8fafc">
  <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #eef2f6">
    <div style="background:linear-gradient(135deg,#0d3d27 0%,#1a5e3f 100%);padding:32px;text-align:center">
      <img src="https://www.imtihan.live/Imtihan-logo.png" alt="Imtihan" width="40" height="40" style="display:block;margin:0 auto 12px;border-radius:10px;" />
      <p style="color:#fff;font-size:20px;font-weight:700;margin:0">Imtihan</p>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:22px;margin:0 0 8px 0;color:#0d0d0d">Your Exam-Writing Checklist</h1>
      <p style="color:#4b5563;margin:0 0 24px 0;line-height:1.6">
        Ten checks worth running before any Bac Libanais, Bac Français, or IB exam goes out —
        the ones that catch the mistakes students actually complain about.
      </p>
      <ol style="color:#111;line-height:1.9;padding-left:20px;margin:0 0 24px 0">
        <li><strong>Total points add up</strong> — sum every exercise + sub-question against the stated total.</li>
        <li><strong>Difficulty is actually mixed</strong> — not every question at the same level, front-loaded easy.</li>
        <li><strong>Chapter coverage matches what you taught</strong> — no question from a chapter you skipped.</li>
        <li><strong>Every document has a real, checkable source</strong> — never an invented citation.</li>
        <li><strong>Command verbs match the curriculum's convention</strong> — "Montrer que" vs "Calculer" vs "استنتج" aren't interchangeable.</li>
        <li><strong>Corrigé barème sums to the exercise's points</strong>, not just the exam's total.</li>
        <li><strong>Language is fully consistent</strong> — no stray English/French mixed into an Arabic paper.</li>
        <li><strong>Numbers in the corrigé are internally consistent</strong> — no negative mass, no probability over 100%.</li>
        <li><strong>Duration is realistic</strong> for the exercise count and difficulty, not just copy-pasted from last time.</li>
        <li><strong>You'd want to sit it yourself</strong> — the actual test: is it fair, or just hard?</li>
      </ol>
      <p style="color:#4b5563;line-height:1.6;margin:0 0 24px 0">
        Imtihan runs a version of this checklist automatically on every exam it generates —
        curriculum-aligned, corrigé included, in minutes instead of hours.
      </p>
      <a href="https://www.imtihan.live/create" style="display:inline-block;background:#1a5e3f;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600">
        Try your first exam free
      </a>
      <p style="color:#9ca3af;font-size:12px;margin:32px 0 0 0">
        You're getting this because you signed up at imtihan.live. No spam, no list-sharing —
        just this one email.
      </p>
    </div>
  </div>
</body>
</html>`;
