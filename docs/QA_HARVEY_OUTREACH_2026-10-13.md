# Independent QA — Harvey outreach adaptation

Date: 2026-10-13. Branch: `feat/harvey-outreach`.

## Verdict

**PASS for code/isolated-component QA and branch push.** The independent final `npm run verify:fix` completed after all product/test edits and exited 0:

| Phase | Executed result |
| --- | --- |
| TypeScript | PASS |
| Full Vitest | 65 files, 713 tests passed; 239.94 seconds |
| Isolated Chromium | 21 tests passed; 1.7 minutes reported by Playwright |
| Focused route/content/prompt/UI | 65 cases across four files passed; 25.60 seconds |
| Affected Chromium | Six cases passed; 40.0 seconds |

No failed or skipped cases occurred in the final gate. Subsequent edits record results only. This certifies code and isolated fixtures, not live OpenAI or email delivery.

## Scope and meaningful checks

- Admin draft endpoint: unauthenticated/non-admin requests fail before quota/provider access; invalid or unexpected brief fields fail before charging quota; missing provider configuration fails closed. Mocked transaction checks verify the UTC per-admin key, charging attempt 20, denying attempt 21, counting failed provider attempts and failing closed when quota storage is unavailable. Successful output contains exactly three schema-validated drafts; HTML, banned phrases, excessive words and incorrect message counts are rejected. Provider/JSON failures are sanitized. The endpoint never invokes the mocked email sender.
- Server send gate: outreach requires literal `reviewed: true`, a valid subject/plain-text message and 1–25 unique nonempty recipient IDs before lookup/send. Tests reject duplicate/26-recipient batches, newline injection, placeholders, HTML, spam phrases, excessive words and multiple links. Reviewed plain text uses the existing marketing sender with escaped conversion; user-supplied HTML is ignored. Exactly 25 recipients produce exactly 25 mocked sends, not an automatic follow-up sequence.
- Content/prompt checks: English/French examples, word/subject limits, placeholder and HTML rejection, escaping and strict three-message schemas. The prompt serializes untrusted public context and explicitly describes manual review, supported capabilities, factual-claim limits and no automatic sequence. The adapted English phrase list does not establish factual correctness or certify French sales wording.
- Real React component tests: disabled generation until valid input/user, authenticated draft POST, three draft cards, selection and review reset after subject/body edits or draft selection, invalid-content review blocking, double-click prevention while busy, HTTP/token/network/schema errors, and hostile HTML displayed literally. Every network action is mocked; no real paid request or send occurs.
- Browser acceptance at 375, 768 and 1440 pixels: draft-generation failure followed by three fixture drafts, selecting draft two, reviewing and clearing review after edits, spam rejection, restored valid content, escaped hostile error text, light/dark containment and no uncaught exceptions. Request assertions permit diagnostic GET and draft POST only; no send POST occurs. Existing admin report checks remain green.

QA identified a Users-toolbar gap: outreach appeared as a Send action without its editor/review controls. Engineering changed that action to "Review outreach in Email", navigating to the editor instead of sending. The Email-tab send-disabled condition and this toolbar change were source-reviewed; actual authenticated admin-page interaction remains unverified because the production session expired.

## Screenshots

These are local development fixtures headed **Admin email QA — fixture data only** with deterministic mocked drafts. They are not production screenshots or evidence of real OpenAI generation. QA visually inspected mobile/desktop light screenshots; the root agent also inspected mobile. The browser suite generates matching light/dark screenshots for all three widths.

- Mobile light: `C:\Users\Administrateur\Documents\Codex\2026-10-10\c-users-administrateur-downloads-imtihan\work\imtihan\test-results\outreach-375-light.png`
- Desktop light: `C:\Users\Administrateur\Documents\Codex\2026-10-10\c-users-administrateur-downloads-imtihan\work\imtihan\test-results\outreach-1440-light.png`
- Additional artifacts: `test-results/outreach-{375,768,1440}-{light,dark}.png` and `playwright-report/index.html` (ignored local outputs).

The existing development-only fixture at `/test-exam-regressions/admin-email` is disabled in production and excluded through its existing sitemap/robots subtree rules. It uses a fake token and intercepts all draft/configuration requests.

## Intermediate test-only correction

The first affected browser run failed three new cases at an exact wrapping-label selector after a populated textarea. Its accessibility snapshot showed the correct textbox and selected draft value. Switching the test to the textbox's accessible role/name corrected the locator; no product change was required. The subsequent affected run passed all six cases.

## Live limits

Root's production admin session redirected to login and the user had not completed sign-in. No real OpenAI outreach generation, authenticated production editor/send-button interaction or Brevo delivery was verified. Existing missing marketing configuration continues to block promotional delivery; these tests do not certify credentials, sender approval or inbox acceptance. No Firebase Admin credentials, production-handler harness, paid AI request, real email send or resend was used by QA.

This adaptation supplies deterministic content checks and manually reviewed drafts using Imtihan's existing services. It does not install Harvey's Python runtime, discover prospects, read replies, schedule follow-ups or send automatically. QA did not commit, push or deploy.
