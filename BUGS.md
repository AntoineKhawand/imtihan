# Bug Tracker — Imtihan

Track issues here during development. Format:
```
## BUG-XXX: Short title
**Status:** Open | In Progress | Fixed | Won't Fix
**Severity:** Critical | High | Medium | Low
**Area:** API | UI | Auth | Generation | Export | Data
**Reported:** YYYY-MM-DD
**Fixed:** YYYY-MM-DD (if applicable)

**Description:** What happens vs what should happen.
**Steps to reproduce:** numbered list.
**Root cause:** (fill in when known)
**Fix:** (fill in when fixed)
```

---

## Open Issues

*None currently open.*

---

## Known Limitations (Not Bugs)

These are intentional constraints in MVP — document here to avoid re-opening as bugs.

### LaTeX rendering in exported Word/PDF files
**Status:** Known limitation, deferred to v2
**Details:** Math expressions use Unicode approximations (e.g. ∑, π, ²) rather than proper LaTeX rendering in Word/PDF exports. Full rendering requires `mathjax-node` server-side, planned for v2.
**Workaround:** Teachers can copy the LaTeX from the web preview and typeset manually if needed.

### Arabic language not supported
**Status:** Deferred to v1.1
**Details:** RTL layout, Arabic math notation, and font rendering complexity pushed to v1.1. All UI is LTR only in MVP.

### University curriculum — no predefined chapters
**Status:** By design
**Details:** University teachers describe their own course — we don't pre-define chapters. Claude uses the teacher's description + uploaded syllabus as the curriculum source. This means curriculum validation is more lenient for university.

### File upload size limit: 10 MB
**Status:** By design
**Details:** Files are sent base64-encoded in the request body. At 10 MB encoded, this approaches Next.js's body size limit (configured to 10 MB in `next.config.ts`). Large PDFs (>50 pages) should be cropped before upload.

### sessionStorage for workflow state
**Status:** MVP tradeoff
**Details:** If the teacher closes/refreshes the browser mid-workflow, progress is lost. For MVP this is acceptable. v1.1 should persist draft exams to Firestore.

### Free tier: 1 exam lifetime (not monthly)
**Status:** Product decision
**Details:** Founder confirmed: 1 exam total in the free tier to drive conversion. This may change based on conversion data.

---

## Fixed Issues

---

## BUG-001: Register page syntax error — double `return (` statement
**Status:** Fixed
**Severity:** Critical
**Area:** Auth / UI
**Reported:** 2026-04-24
**Fixed:** 2026-04-24

**Description:** `src/app/auth/register/page.tsx` had a duplicate `return (` statement and an extra stray `</div>`, causing a Turbopack parse error at build time. The page was completely unreachable.
**Root cause:** Manual editing left two consecutive `return (` lines inside `RegisterForm` and an unmatched closing `</div>`.
**Fix:** Rewrote the file in full to restore a single clean `return (` and correct JSX structure.

---

## BUG-002: Google sign-in redirect silently fails — session cookie not set
**Status:** Fixed
**Severity:** High
**Area:** Auth
**Reported:** 2026-04-24
**Fixed:** 2026-04-24

**Description:** Clicking "Continue with Google" on login or register appeared to do nothing — the popup completed but the user was not navigated to the dashboard/create page.
**Root cause (1):** `POST /api/auth/session` was using `cookies()` from `next/headers` to set the `__session` cookie inside a Route Handler. In Next.js 15 App Router, this does not reliably emit a `Set-Cookie` response header on client `fetch` calls. The cookie was never stored in the browser, so the middleware saw no session and immediately redirected back to `/auth/login`.
**Root cause (2):** The client-side `setSessionCookie()` helper did not check `res.ok`, so a 500 response from the session route was swallowed silently and `window.location.assign()` fired without a valid session.
**Fix:** Replaced `cookies().set()` with `response.cookies.set()` on the `NextResponse` object in the route handler. Added `if (!res.ok) throw new Error(...)` in `setSessionCookie()` so failures surface as visible error messages instead of silent loops.

---

## BUG-003: Community page fails to build — unclosed blur-container `<div>`
**Status:** Fixed
**Severity:** Critical
**Area:** UI / Community
**Reported:** 2026-04-24
**Fixed:** 2026-04-24

**Description:** Turbopack reported `Expected '</', got 'jsx text'` at the `</main>` closing tag in `src/app/community/page.tsx`, preventing the build.
**Root cause:** The wrapping `<div className={cn("transition-all duration-700", isFree && "opacity-40 blur-sm ...")}>` opened at line 191 was never closed. Its closing `</div>` was missing before `</main>`.
**Fix:** Added the missing `</div>` immediately before `</main>`.

---

## BUG-004: Export step indicator shows "Step 3 of 5" instead of "Step 5 of 5"
**Status:** Fixed
**Severity:** Low
**Area:** UI / Export
**Reported:** 2026-07-31
**Fixed:** 2026-07-31

**Description:** The export page (`/create/export`) rendered `<StepIndicator current={3} />` and `<StepLabel step={3} />`, so the progress dots showed Step 3 as active and the label read "Step 3 of 5" — visually incorrect for the final step.
**Root cause:** Copy-paste error when the export page was created.
**Fix:** Changed both props to `current={5}` / `step={5}`.

---

## BUG-005: "Include corrigé" email checkbox had no effect
**Status:** Fixed
**Severity:** Medium
**Area:** Export / API
**Reported:** 2026-07-31
**Fixed:** 2026-07-31

**Description:** The export page has an "Include corrigé" checkbox for email delivery (`emailIncludeSolution`) and an "Includes corrigé / Exam only" toggle for Word download (`includeAnswerKey`). Neither value was being honoured — the server always generated documents with the full answer key regardless of the toggle state.
**Root cause (1):** `emailIncludeSolution` was tracked in state but never included in the JSON body sent to `/api/export/send`.
**Root cause (2):** `/api/export/route.ts` `RequestSchema` had no `includeAnswerKey` field, so the value sent by the client was silently dropped.
**Root cause (3):** `generateWordDocument` had no `includeAnswerKey` parameter.
**Fix:** Added `includeAnswerKey` to `RequestSchema`, updated `generateWordDocument` signature to accept it with a default of `true`, added an early return that skips the corrigé section when `false`. Updated `/api/export/send` to accept and forward `includeSolution`. Updated client to pass `includeSolution: emailIncludeSolution` in the email request body.

---

## BUG-006: Math rendering — subscripts, Greek letters, \\text{} appeared as raw LaTeX
**Status:** Fixed
**Severity:** High
**Area:** UI / Generation
**Reported:** 2026-07-30
**Fixed:** 2026-07-31

**Description:** Raw LaTeX strings appeared in the exercise preview, e.g. `Z_0 = $R = 50$ \text{ Ω}$`. The `splitMath` function mishandled odd numbers of `$` delimiters, and the text-segment processor didn't catch `\Omega`, `\text{}`, `\frac{}{}`, or subscripted variables like `R_1`.
**Root cause:** (a) `splitMath` treated unclosed `$` as the start of a math block, creating a huge "math" segment from the stray `$` to the end of the string; (b) the inline safety net only matched `\ce{}`, `\vec{}`, and a handful of other commands — not `\text{}`, Greek letters, or subscripted variable patterns; (c) the final cleanup pass wrapped bare LaTeX in `$...$` strings but never re-rendered them to KaTeX.
**Fix:** Modified `splitMath` to strip the opening delimiter and treat the rest as plain text when no closing delimiter is found. Expanded the inline safety net to auto-wrap: `\text{}`, bare Greek letters (`\Omega`, `\alpha`, etc.), `\frac{A}{B}` (two-brace handling), and subscripted variables (`R_1`, `Z_0`, `U_{CE}` — with `{` in the lookbehind to prevent double-wrapping inside `\cmd{…}` arguments). Removed the broken final-cleanup `$...$` wrapping that was adding delimiters without rendering them. Confirmed with a 17-case regression test (17/17 pass).

---

## BUG-007: Landing page buttons and cards had stale indigo drop-shadow colours
**Status:** Fixed
**Severity:** Low
**Area:** UI / Landing
**Reported:** 2026-07-31
**Fixed:** 2026-07-31

**Description:** Button hover shadows and card hover shadows on the landing page used hardcoded `rgba(79,70,229,…)` — the old indigo accent — even after the accent was reverted to emerald `#1a5e3f`. The shadows glowed indigo/purple instead of emerald on hover.
**Root cause:** The previous colour revert fixed CSS variables (`--accent` → emerald) but missed 7 hardcoded `rgba()` values in Tailwind arbitrary shadow classes in `page.tsx`, `Button.tsx`, and `LandingNav.tsx`.
**Fix:** Replaced all 7 occurrences with `rgba(26,94,63,…)` (emerald equivalent). The `indigo-600` in `renderContent.ts` step-badge colour rotation is intentional and was left unchanged.

---

## Reporting a Bug

1. Check this file first — it might already be documented.
2. Check `CLAUDE.md` section 12 "Known Gotchas" — might be a known env issue.
3. If new, add an entry above with the next BUG-XXX number.
4. If urgent (crash / data loss), mark as **Critical** and fix before any other work.
