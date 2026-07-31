# Imtihan E2E Test Plan — Daily Rotation Checklist

This file is the **living checklist** for the automated Playwright suite in `e2e/phases/`.
One phase runs per day (rotating in order, wrapping back to Phase 1 after Phase 8),
driven by `scripts/run-daily-phase.mjs`. Every run updates this file automatically —
**the table and Run Log below are machine-written; edit the prose sections freely,
but don't hand-edit the table's Last Run / Status / Result columns, they'll be
overwritten on the next run.**

## For the AI agent running this each day

1. Run `node scripts/run-daily-phase.mjs` from the project root (`Downloads/imtihan/imtihan`).
   It picks the next phase in the rotation automatically — you don't need to specify which one.
2. The script starts the dev server itself (via Playwright's `webServer` config in
   `playwright.config.ts`, port 3005), runs that phase's spec file, updates the table
   and Run Log in this file, and exits non-zero if any test failed.
3. If it exits non-zero: open the HTML report (`npx playwright show-report`) or re-read
   this file's Run Log for the failure summary, then investigate — check `BUGS.md` first
   in case it's a known issue, otherwise treat it as a real regression and report it.
4. Requires `.env.local` to be populated (Firebase, Gemini, Anthropic, Brevo keys) — the
   dev-only `/test-auth` and `/api/test/custom-token` routes (used to sign in test users
   without Google OAuth) refuse to run in production, so this only works against a local
   dev server, never a deployed one.
5. Don't run the admin suite's "Send Emails" or "Generate Article Now" buttons manually
   against production data — the spec file deliberately never clicks them because they
   mass-email real users / publish a real blog post. See the safety note at the top of
   `e2e/phases/phase-7-admin.spec.ts`.

## Real-cost / side-effect notes

Some tests intentionally hit real external services rather than mocking them, so the
suite catches actual integration regressions, not just UI regressions. This means the
suite is not free to run — each phase that touches AI generation, email, or file export
spends a small amount of real quota:

| Phase | Real calls made |
|---|---|
| 2 | One `/api/analyze` call (Gemini) |
| 3 | One 2-exercise "Regenerate all" + one 1-exercise golden-path generation (Gemini/Claude) |
| 4 | One real Word export (cheap, no AI) + one real email send via Brevo to a `@test.imtihan.live` address (bounces harmlessly) |
| 5 | Real Word exports (cheap, no AI) |
| 6 | Real Word export of a community exam (cheap, no AI); Remix triggers a real background generation the test doesn't wait for |
| 7 | Real admin actions (+30D/+1Y/+10Q/Reset) — always scoped to our own test user only, never real users |
| 8 | One real `/api/scanner` vision call (Gemini) |

## Known app issues found while building this suite (not test bugs)

- `/create/generate`'s "Back" link points to `/create/structure`, which doesn't exist (404). Tracked as a spawned follow-up.
- `/bank`'s "Go to Settings" link (My School tab, no school set) points to `/account`, which doesn't exist (404). Tracked as a spawned follow-up.
- The cache key written before navigating to `/create/generate` from the Community "Remix" action (and in the pre-existing `e2e/qcm.spec.ts` seed helper) omits the `t: templateId` field that `create/generate/page.tsx` expects, so the exercise cache never matches and a live regeneration fires even when cached exercises exist. Tracked as a spawned follow-up.
- `AuthLayout` wraps `<Logo>` in its own `<Link href="/">`, but `Logo` already renders an internal `<Link href="/">` — nested anchors trigger a hydration-mismatch and a full client remount on every `/auth/*` page load. Tracked as a spawned follow-up.
- The CSP header (`src/proxy.ts`) doesn't whitelist `googletagmanager.com`, so Google Analytics is silently blocked by the browser on every page load. Tracked as a spawned follow-up.

## Architecture note: auth gating happens in `src/proxy.ts`

Next.js 16 renamed the `middleware.ts` convention to **`proxy.ts`** — easy to miss if you go looking
for `middleware.ts` and find nothing (`src/proxy.ts` is where it actually lives). It server-side
redirects any request without a `__session` cookie away from `PROTECTED_PATHS` (`/dashboard`,
`/create`, `/bank`, `/library`, `/account`, `/community`, `/admin`) straight to `/auth/login`,
*before* the page component ever renders. That means a bare unauthenticated `page.goto()` to any
of those routes never reaches the page's own client-side "please sign in" UI — Phase 1 tests that
directly (see "Auth gates"). Every other phase always calls the `signInAs()` helper first for this
reason. `signInAs()` itself polls for the `__session` cookie (rather than trusting a fixed delay)
before proceeding, since a cold Firebase Admin SDK / Firestore round trip on the first sign-in of
a fresh dev server can occasionally outlast a flat timeout.

## Phase rotation

| # | Phase | Covers | Last Run | Status | Result |
|---|-------|--------|----------|--------|--------|
| 1 | Auth & Navigation | Landing/footer/404, pricing toggle, login/register/forgot forms, UserNav hover menu + sign out, auth gates on dashboard/community/admin | Not yet run | ⏳ Pending | – |
| 2 | Exam Creation (Describe + Confirm) | `/create` textarea, example chips, class profiles, arXiv search, dropzone, free-limit gate, real Analyze call; `/create/confirm` dropdowns, chapter chips, geographic context, blueprint inputs, template picker, Version B toggle | Not yet run | ⏳ Pending | – |
| 3 | Generation & Exercise Editor | `/create/generate` exercise rendering, chapter coverage, action menu, Corrigé + calculators, ExerciseEditor modal (tabs, difficulty, MCQ correctness, sub-questions, plots, save/cancel), one real golden-path generation | Not yet run | ⏳ Pending | – |
| 4 | Export | `/create/export` header fields, Pro-gated logo upload, template/variant toggles, real Word download, PDF new-tab, save to library, real email send | Not yet run | ⏳ Pending | – |
| 5 | Dashboard & Bank | Exam rows (expand/duplicate/delete/download), quota states, bundle modal, sidebar; Bank tabs, BankCard actions, Invite Colleagues modal | Not yet run | ⏳ Pending | – |
| 6 | Community | Sign-in gate, free-tier blur, HowToShare, search/sort, Like/Preview/Download/Remix, preview modal | Not yet run | ⏳ Pending | – |
| 7 | Admin panel | Non-admin redirect (see Phase 1), tab switcher, user row actions (scoped to test user only), email tab UI (never sends), blog tab UI (never publishes) | Not yet run | ⏳ Pending | – |
| 8 | Pricing/Upgrade/Scanner/Contact | Authenticated pricing CTAs, upgrade form + WhatsApp path, Pro-gated scanner + real digitization call, contact form | Not yet run | ⏳ Pending | – |

## Run Log

*(newest first — appended automatically by `scripts/run-daily-phase.mjs`)*

- No runs yet.

## Regression suite (not part of the daily rotation)

`e2e/smoke.spec.ts`, `e2e/qcm.spec.ts`, `e2e/security.spec.ts`, `e2e/subscription.spec.ts`,
`e2e/user-flows.spec.ts`, `e2e/wysiwyg.spec.ts`, and `e2e/capture.spec.ts` predate this phase
rotation and are left untouched. Run them on demand with `npm run test:e2e` — they aren't
scheduled daily.
