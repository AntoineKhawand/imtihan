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

## BUG-012: Double-click-to-edit-raw-LaTeX never worked in Chromium for math nodes (and any other atomic contenteditable block)

**Status:** Fixed
**Severity:** Medium
**Area:** UI / Generation (ExerciseEditor)
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** In the exercise editor, double-clicking a KaTeX-rendered math expression (or any other `[data-raw][contenteditable="false"]` atomic block — tables, image/document blocks, "Étape N" step badges) inside a `contenteditable="true"` field was supposed to swap it for its raw markdown/LaTeX source so a teacher could hand-edit it. It never actually worked, in real Chrome/Chromium as well as Playwright — a genuine, reproducible app bug, not a test artifact (confirmed by driving raw `mousedown`/`mouseup` events and by manually mutating the DOM outside any event handler, which worked and stuck).
**Root cause (three compounding issues, all in `ExerciseEditor.tsx`):**
1. Chromium does not reliably synthesize `click`/`dblclick` DOM events for a `contenteditable="false"` island nested inside a `contenteditable="true"` ancestor — `onDoubleClick` silently never fired for these nodes at all (confirmed by capturing every mouse event at the document level: `mousedown`/`mouseup` fired consistently, `click`/`dblclick` did not).
2. Chromium selects such an atomic island as a whole unit on a single click. The field's existing `onMouseUp={fragState.handleSelect}` (for the unrelated "select text, ask AI to rewrite this fragment" feature) treated that as a normal text selection and popped the fragment-regenerate toolbar, and `handleSelect`'s ancestor-based check for this case didn't fire either — Chromium represents the selection's start/end container as the *shared parent*, bracketing the atomic node as a sibling, not as a descendant of it. Every re-render this toolbar triggered replaced the whole `dangerouslySetInnerHTML` subtree with an equivalent-but-different DOM node, so nothing that compared node identity across the two clicks of a double-click could ever match.
3. Once (1) and (2) were fixed and the raw text was actually swapped in during the second `mousedown`, the browser still finalized its own native double-click "select word" behavior on the following `mouseup` — now landing on ordinary text instead of an atomic node — which selected a word of the freshly revealed LaTeX and popped the fragment toolbar again, whose re-render stomped the edit right back to the original KaTeX rendering before Playwright (or a real user) ever saw it.
**Fix:** Replaced the native `onDoubleClick` handler in both `RichField` and `RichFieldInline` with a `useRawReveal()` hook driven off `onMouseDown` click position + timing (two mousedowns on a `[data-raw]` node within 500ms and 8px count as a double-click), since `mousedown` fires reliably where `click`/`dblclick` do not. Guarded `handleSelect` to ignore a selection that exactly brackets a single atomic `[data-raw][contenteditable="false"]` sibling, so it no longer pops the fragment toolbar for these nodes. Added `e.preventDefault()` on the double-click-triggering `mousedown` plus an explicit collapsed-caret selection on the newly inserted text node, so the browser's own native selection algorithm never gets a chance to re-select and re-trigger the toolbar afterward. Verified with 3 consecutive clean runs of the previously-flaky-to-broken test (`phase-3-generation-editor.spec.ts`, "double-clicking the math node in the statement reveals raw LaTeX for editing").

---

## BUG-011: Firestore client reads denied project-wide since 2026-05-20 — Firebase project was still on its auto-generated test-mode rule

**Status:** Fixed
**Severity:** Critical
**Area:** Data / Auth
**Reported:** 2026-09-16
**Fixed:** 2026-09-17

**Description:** Every authenticated user's Firestore client-SDK read of their own profile (`users/{uid}`) failed with "Missing or insufficient permissions," every time, for every user. Console showed `[AuthContext] Firestore listener error — falling back to API`. The app didn't visibly break for real users because `AuthContext.tsx` already had an Admin-SDK-backed `/api/auth/profile` fallback with 15s polling, built for exactly this kind of failure — but every signed-in user was silently running on that slower, non-realtime path the whole time, and any purely client-side Firestore usage elsewhere in the app would have been fully broken.
**Root cause:** The Firebase project's *deployed* Firestore rules were never actually set to the real rules in `firestore.rules` (correct and present in this repo since 2026-07-31, apparently written but never deployed). They were still Firebase's auto-generated "test mode" starter rule from project creation — `allow read, write: if request.time < timestamp.date(2026, 5, 20)` — which unconditionally denies all reads/writes once its hardcoded expiry passes. That expiry was **2026-05-20**, so the entire project had zero working Firestore client access for roughly four months before this was caught by an e2e test failure (see `DAILY_LOG.md`'s 2026-09-16/17 entries for the full diagnostic trail, including two Claude Code safety guardrails — "Production Deploy" and "Modify Shared Resources" — that correctly blocked the AI assistant from running `firebase deploy` or even pre-filling the console's rules editor, requiring the founder to do the actual publish by hand).
**Fix:** Founder published the repo's real `firestore.rules` (per-user `users/{uid}` and `users/{uid}/exams/{examId}` ownership checks, `schoolBank` read for any authenticated user, `student_profiles`/`student_attempts` ownership checks, deny-all fallback) via the Firebase Console. Verified via two previously-failing e2e tests (`phase-8-pricing-upgrade-misc.spec.ts`'s Pro-badge and Scanner pro-tier tests) — both now pass cleanly with normal timing and no permission errors.

---

## BUG-010: Dashboard "Download PDF" produces a corrupt, unopenable file

**Status:** Fixed
**Severity:** Critical
**Area:** Export
**Reported:** 2026-09-16
**Fixed:** 2026-09-16

**Description:** From a saved exam's card on `/dashboard`, clicking "Download PDF" downloaded a file named `<title>.pdf` that no PDF viewer could open. `/create/export`'s own PDF option was unaffected — it opens `/print` (browser print-to-PDF), a completely separate code path.
**Root cause:** `src/app/api/export/route.ts`'s `POST` handler treats `format: "word"` and `format: "pdf"` identically — both call `generateWordDocument()`, which only ever builds real `.docx` (OOXML/ZIP) bytes via the `docx` library. The `format === "pdf"` branch just swaps the response's `Content-Type` to `application/pdf` and the filename extension to `.pdf` without changing the actual bytes, so the downloaded file is DOCX binary data mislabeled as a PDF. `/create/export`'s PDF button never hit this endpoint at all (it opens `/print`, which renders through `src/lib/renderContent.ts`, the live web pipeline, and uses the real browser print dialog) — only `/dashboard`'s "Download PDF" button (`handleDownload("pdf")` in `src/app/dashboard/page.tsx`) called `/api/export` with `format: "pdf"`, so the bug was isolated to that one entry point.
**Fix:** `/dashboard`'s `handleDownload("pdf")` now writes the saved exam's `context`/`exercises`/`templateId` into the same `sessionStorage` keys `/print` reads (`imtihan_context`, `imtihan_exercises`, `imtihan_templateId`) and opens `/print` in a new tab, reusing the already-correct browser-print path instead of the broken server endpoint. `/api/export`'s `format: "pdf"` branch itself is untouched and still exists — a real server-side PDF renderer (`@react-pdf/renderer`, per `CLAUDE.md`'s tech stack table) is still not built; nothing currently calls that branch after this fix, but it should not be wired to a new caller until it actually generates PDF bytes.

---

## BUG-008: \boxed{} final answers with stray internal $ delimiters render as raw LaTeX
**Status:** Fixed
**Severity:** High
**Area:** UI / Generation / Math rendering
**Reported:** 2026-09-03
**Fixed:** 2026-09-03

**Description:** Physics/chemistry corrigés sometimes showed the raw LaTeX code instead of rendered math,
e.g. `\boxed{$y = h$ + x\tan\alpha - \frac{g}{2v_0^2\cos^2\alpha}\,x^2}` appeared verbatim on screen.
**Root cause:** The generation prompt told the AI to wrap final answers as `$\boxed{result}$` (one outer
$...$ pair) but a separate "wrap every variable in $...$" rule caused the AI to also nest `$...$` around
sub-expressions INSIDE the `\boxed{}` braces. `renderContent.ts`'s `splitMath()` naively finds the first
`$` and treats it as a delimiter boundary — it cut straight through the `\boxed{...}` braces, corrupting
the brace matching and leaving everything after the first internal `$` as unrendered raw text.
**Fix:** (1) Added `fixBoxedMath()` in `renderContent.ts` — a brace-depth-aware preprocessing pass that
finds every `\boxed{...}` span (correctly handling nested braces like `\frac{a}{b}` inside), strips any
stray `$` found inside, and ensures the whole expression is wrapped in exactly one outer `$...$` pair
before the normal KaTeX pipeline runs. Runs defensively regardless of what the AI outputs. (2) Clarified
`src/lib/prompts/generate.ts`'s boxed-answer rules to explicitly forbid internal `$` delimiters, with a
right/wrong example. Added 4 new cases (18-21) to `test-render.mjs`'s regression harness — all pass
(21/21 total).

---

## BUG-009: Some selected chapters get zero exercises ("Chapter coverage" warning)
**Status:** Fixed
**Severity:** Medium
**Area:** Generation / Prompts
**Reported:** 2026-09-03
**Fixed:** 2026-09-03

**Description:** When a teacher selected multiple chapters (e.g. "Mécanique — mouvements dans l'espace"
and "Électromagnétisme" among others), the generated exam sometimes had zero exercises tagged with one
or more of the selected chapters — flagged by the `/create/generate` "Chapter coverage" warning ("Some
chapters have no exercise — regenerate individual questions to adjust coverage").
**Root cause:** Unlike difficulty (which gets an explicit per-exercise breakdown — "Easy: 2, Medium: 1,
Hard: 1"), chapters had no equivalent per-exercise assignment. The prompt only said "stay within these
selected chapters" with no requirement that every one of them actually appear, so with a short exercise
count relative to the number of selected chapters, the AI could freely concentrate all exercises on just
1-2 chapters.
**Fix:** Added `buildChapterDistribution()` in `src/lib/prompts/generate.ts` — deterministically maps
every selected chapter to a specific exercise number (round-robin) before generation, mirroring the
difficulty breakdown pattern. When there are more chapters than exercises, multiple chapters are assigned
to the same exercise with an explicit instruction to cover each as a distinct sub-question rather than
dropping any. Verified the distribution algorithm against 6 scenarios (more/fewer/equal chapters vs.
exercises) — every chapter is guaranteed at least one assigned exercise slot in all cases. Also
strengthened the system prompt's chapter-scope rule to reference this mandatory coverage requirement.

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
