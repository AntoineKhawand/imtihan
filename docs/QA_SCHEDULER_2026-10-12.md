# Independent QA — scheduler authentication and write results

Date: 2026-10-12. Branch: `fix/scheduler-auth`.

## Verdict

**PASS for the scheduler code repair.** Independent final `npm run verify:fix` exited 0 after all product/test edits: TypeScript passed; 61 Vitest files / 644 tests passed (95.48s); 18 isolated Chromium tests passed (1.7 minutes reported by Playwright). No failures or skipped cases occurred in the final gate. Subsequent edits document results only.

Focused repaired-route regressions pass 9/9 with all Firebase/style boundaries mocked. This verifies code behavior only; no live cron was triggered, no provider/email was called, and scheduler activity is not certified. The separate production exam smoke observation below remains outside this scheduler verdict.

## Independently verified repair

- Configured Vercel-style `Authorization: Bearer <CRON_SECRET>` reaches the mocked style scan and saves a profile.
- Missing configured secret, missing authorization, wrong Bearer, raw secret and legacy `x-cron-secret` alone all return 401 before any database access or style write.
- A rejected write returns HTTP 500 with `groups: 0` and `failedGroups: 1`, without leaking its private rejection detail in the response.
- Mixed writes return HTTP 500 with accurate partial successes (`groups: 2`, `failedGroups: 1` for three groups). An empty scan returns a truthful zero result without a write.

The initial read-only audit empirically reproduced the old failures using temporary fully mocked diagnostics: configured Bearer was rejected, missing secret admitted an unauthenticated write, and a rejected style save was counted as updated. Those diagnosis-only tests were removed and replaced by `src/__tests__/cron-sync-styles.test.ts`, which asserts the repaired behavior. No QA product edits were made.

## Scheduler availability and remaining limits

`vercel.json` declares seven schedules: welcome backfill daily, reminders daily, blog publication daily, follow-up daily, newsletter each Monday, checklist backfill daily and style synchronization each Sunday. All seven route files exist. This proves source configuration, not that the production scheduler is enabled, that authentication/configuration is present, or that any particular run succeeded. Vercel settings/run logs remain unavailable under the saved browser access policy.

The root agent's normal signed-in, read-only production admin configuration check reports missing `MARKETING_POSTAL_ADDRESS` and missing/short marketing unsubscribe signing configuration; Brevo key presence passes. Key presence alone does not verify valid credentials, approved sender or inbox delivery. The existing central marketing sender fails closed on missing required settings, affecting promotional email crons. No real mail or resend was attempted during this audit.

Newsletter cadence remains an audit finding: Monday trigger plus a 13-day per-recipient threshold skips the following Monday, producing approximately fortnightly delivery to the same teacher. Temporary mocked day-7/day-14 checks confirmed this. The weekly newsletter scans `users`; `newsletter_subscribers` receives the checklist/backfill path instead. Cadence/audience were not changed in this repair.

Other existing limits remain: follow-up/reminder transport exceptions can abort their overall batch; daily blog invocation can reject an article at its editorial quality gate, so a scheduled invocation does not guarantee a new article. No successful production invocation, paid AI availability, actual Firestore write, or real email delivery is inferred from mocked tests.

Twenty-five existing blog-generation, marketing-safeguard and admin-email mocked tests also passed in the initial audit. QA did not push or deploy.

## Separate production exam smoke observation

The root agent reported a normal production `/create` UI smoke test during this scheduler audit: analysis succeeded but returned a 50/50 medium/hard mix without an explicit difficulty request; one small exercise streamed 6,939 characters before the UI displayed a generation network error. The root UI retry succeeded with one exercise, three questions and five points. Subsequent live graph and table requests rendered successfully; this does not independently certify mathematical correctness. QA did not independently operate that live flow. No available server/provider logs establish its cause. This observation is separate from the scheduler route repair and means a passing local fixture gate does not certify the production generation/provider flow.

