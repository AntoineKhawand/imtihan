# Independent QA — admin email diagnostics and batch outcomes

Date: 2026-10-12. Branch: `fix/exam-transform-qa`.

## Verdict

**PASS for code/isolated-component QA and branch push.** Final `npm run verify:fix` exited 0 after all product and test edits:

| Phase | Executed result |
| --- | --- |
| TypeScript | PASS |
| Full Vitest | 60 files, 635 tests passed; 161.71 seconds |
| Isolated Chromium | 18 tests passed; 1.1 minutes reported by Playwright |
| Focused admin-email browser pass | 3 tests passed; 23.3 seconds |

No test failed or was skipped in the final gate. Subsequent edits only document the results. This report certifies code and isolated fixture behavior only; no real email was sent and the user's earlier production failure cause remains unknown.

## Checks and evidence

- Eighteen new unit/mocked integration cases exercise the real admin email GET/POST handlers and real React report/configuration components. Firebase authentication, admin authorization, Firestore, Brevo and browser fetch are mocked. Missing-user and non-admin GETs return 401/no-store without sending or disclosing configuration. Admin GET returns issue names only, never API key, address or signing-secret values, and never contacts sender/storage. Missing and placeholder Brevo keys, blank postal address, short signing secret and CRON_SECRET fallback combinations are covered.
- Batch cases verify accepted, opted-out, provider-rejected and transport-unknown recipients with no retries. Skips have a separate counter; later recipients continue; partial acceptances remain visible; transport/database internals stay out of results. QA identified recipient database lookup failure as another path that could discard earlier acceptances. Engineering added an individual lookup catch; the independent regression now verifies preservation and continuation.
- UI tests verify escaped hostile recipient/error strings, fallback messages, separate skipped outcomes, acceptance versus inbox-delivery wording, report dismissal, authenticated GET-only configuration refresh, and HTTP/network/token/malformed-response error handling. No authenticated user means no request.
- Twenty focused tests pass across the two new suites and the sitemap/production-fixture suite. An explicit regression verifies the admin email fixture calls `notFound()` under production NODE_ENV. Sitemap regeneration excludes its entire existing `/test-exam-regressions` subtree; it naturally synchronizes the existing public `/copyright` route into the generated list.
- Three affected Chromium tests pass at 375, 768 and 1440 pixels (23.3s). Each checks light/dark viewport containment, wrapped long addresses/errors, escaped script text, skipped recipients, read-only authenticated GET refresh and dismissal, with zero uncaught browser exceptions. The 375px dark screenshot was visually inspected. Screenshots: `test-results/admin-email-{width}-{light|dark}.png`; HTML report: `playwright-report/index.html` (ignored local artifacts).

The browser component fixture is `/test-exam-regressions/admin-email`. It uses a fake token and intercepts `/api/admin/send-email`; it never invokes a real backend, account or send. This is not authenticated production admin QA.

## Intermediate test failures

An initial browser setup run was stopped after QA moved the fixture while Next was compiling, creating a stale old-route manifest ENOENT. A fresh run then exposed a test-only assumption that exactly two diagnostics GETs would occur; development StrictMode and analytics-rejection reload legitimately repeat the read-only effect. The assertion now verifies refresh increases requests and every request remains GET. The subsequent affected run passes all three cases; no product change was needed for either setup issue.

## Production limits

No production Firebase Admin credentials, real tokens, direct production-handler harness, paid provider call, real recipient send or resend was used. Vercel access remains blocked by the saved browser policy, so production environment settings were not inspected. Presence diagnostics do not verify Brevo credential validity, sender approval, deliverability or suppression-store health. The prior admin UI did not retain recipient errors or send history; these changes expose future batch outcomes and cannot reconstruct or identify the earlier failure.
