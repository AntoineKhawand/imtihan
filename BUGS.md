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

## BUG-020: `/scanner` free-tier Pro-guard test — `signInAs()` timed out waiting for redirect off `/test-auth`
**Status:** Open (not reproduced — likely flaky, low test margin)
**Severity:** Low
**Area:** Auth / Testing
**Reported:** 2026-09-18

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:103` ("/scanner free tier is blocked by the Pro guard") failed once, deep into a 29-minute serial full-suite run, because the shared `signInAs()` helper timed out after 30s waiting for the browser to redirect away from `/test-auth`.
**Steps to reproduce:** Did not reproduce. Re-ran in isolation against a fresh dev server 3x: 20.2s, 27.0s, 13.4s — all passed.
**Root cause:** Not a code regression — `signInAs()`'s own internal wait budget is 45s, but this specific test has no `test.setTimeout()` override, so it inherits Playwright's 30s default, giving it near-zero margin. Late in a long serial run the single dev server instance (accumulated Turbopack/Firebase Admin state, ~1.1-1.2GB RSS observed) is measurably slower than a fresh boot, which is enough to blow that thin margin. Most other `signInAs()) call sites share the same 30s default and pass reliably, so this is specific to this test's lack of headroom, not a systemic issue.
**Fix:** Not fixed — didn't force a fix for something that doesn't reproduce. If it recurs, add `test.setTimeout(45_000)` to this test (cheap, safe, matches the sibling BUG-021 test at line 112 which already has this override).

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

## BUG-021: `/scanner` pro-tier test — "AI Exam Scanner" heading and "Unlock AI Exam Scanner" upsell heading both visible simultaneously
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Scanner
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:112` failed a strict-mode check: `getByText('AI Exam Scanner')` resolved to two visible elements — the real scanner heading AND the "Unlock AI Exam Scanner" Pro-upsell heading. This was a real, if usually brief, Pro-gating race — not a test-locator artifact.
**Root cause:** `AuthContext`'s `onAuthStateChanged` handler sets `loading = false` as soon as `subscribeToProfile()` *attaches* its Firestore `onSnapshot` listener, without awaiting the first snapshot payload — leaving a window where `user` is set but `profile` is still `null` for an already-authenticated, genuinely-Pro user. `ProGuard` treated `isProActive(null)` as "not pro" during that window and rendered the full, non-blurred upsell paywall — which itself *also* renders the real page's dimmed `children` behind it (`opacity-10 blur-3xl`), so both headings were simultaneously visible per Playwright (opacity doesn't count as hidden). Ties to `CLAUDE.md` §12's "Lebanese internet" gotcha: slower Firestore round trips widen this window for real Pro users in the field, not just in tests.
**Fix:** `src/components/ui/ProGuard.tsx` — added `if (user && !profile) return null;` between the existing `loading` check and the `isPro` check, so ProGuard waits instead of assuming non-Pro while a signed-in user's profile is still in flight. Scoped to `ProGuard` only (not `AuthContext`) to minimize blast radius; also benefits `src/app/analytics/page.tsx`, the only other `ProGuard` consumer, which has the identical race but no dedicated e2e coverage. Verified: full `phase-8-pricing-upgrade-misc.spec.ts` (20 tests combined with phase-7) green, `npm run type-check` clean.

---

## BUG-017: Admin "+10Q" bonus-quota action gives no visible confirmation feedback
**Status:** Fixed
**Severity:** Low
**Area:** UI / Admin
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** Clicking "+10Q" on a user row in `/admin`'s Users tab was supposed to show a "+10" confirmation. The DOM node existed but stayed hidden to Playwright/real users.
**Root cause:** `src/app/admin/page.tsx` rendered the confirmation twice — a working plain-text `+{quota}` in the `md:hidden` mobile card (hidden at desktop viewport width, which is what Playwright and most admins use) and a desktop version that rendered a `<Plus size={10}/>` icon as a *sibling* of the number, so the DOM text content was just `"10"`, never a single `"+10"` text node — `getByText('+10', {exact:true})` could never match the visible desktop element even after the write succeeded.
**Fix:** Replaced the desktop badge's `<Plus size={10}/>{quota}` with plain text `+{quota}`, matching the already-correct mobile pattern; removed the now-unused `Plus` icon import. Verified: `e2e/phases/phase-7-admin.spec.ts` full file green, `npm run type-check` clean.

---

## BUG-016: Admin filter buttons — deselecting all filters doesn't restore "All Users" active state
**Status:** Fixed
**Severity:** Low
**Area:** UI / Admin
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** In `/admin`'s Users tab, deselecting "Pending Requests" (or "Yearly Only") should fall back to "All Users" being active. Instead "All Users" never regained its `bg-emerald-600` active styling, and the row filter stayed stuck applied — a real state bug, not just a visual one.
**Root cause:** The "Pending Requests" button's `onClick` was `() => setFilterType("requests")` — it always forced `filterType` to `"requests"` and never toggled back to `"all"` on a second click, unlike "Yearly Only" which already toggled correctly via `setShowYearly(!showYearly)`.
**Fix:** `src/app/admin/page.tsx` — changed to `onClick={() => setFilterType(filterType === "requests" ? "all" : "requests")}`, making it a true toggle. Since the emerald active styling and the row filter are both keyed off `filterType === "all"`, one fix covers both the logic and the visual bug. Verified: `e2e/phases/phase-7-admin.spec.ts` full file green (8/8), `npm run type-check` clean.

---

## BUG-018: Stale/ambiguous test locator — "Newsletter" text matches both the template-picker button and the "Template: newsletter" summary label
**Status:** Fixed
**Severity:** Low
**Area:** Testing / Admin
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `e2e/phases/phase-7-admin.spec.ts:114` ("Email tab: template picker, custom HTML fields, and segment counts") failed a Playwright strict-mode check: `page.getByText("Newsletter")` resolved to 2 elements — the "Newsletter" template-picker button (`src/app/admin/page.tsx`'s `EMAIL_TEMPLATES` grid, line ~636) and the "Template: newsletter" summary label lower on the same tab (line ~760). Not a new element; the summary label has existed alongside the picker since the Email tab was built — `getByText`'s default case-insensitive substring match was always going to catch both once both were on-screen at once, this just hadn't been exercised by this exact assertion before.
**Root cause:** Test-only issue, not an app bug. `page.getByText("Newsletter")` matches by case-insensitive substring by default, so it matched both the button's visible title text ("Newsletter") and the `<p>Template: {emailTemplate}</p>` label (rendered lowercase as "newsletter", still a case-insensitive substring match).
**Fix:** Scoped the locator to `page.getByRole("button", { name: "Newsletter" })`, which only matches the template-picker button (the summary `<p>` has no button role) and is unambiguous. Verified with `npx playwright test e2e/phases/phase-7-admin.spec.ts -g "template picker"` — 1 passed. No production code changed.

---

## BUG-019: Stale test assertion — WhatsApp popup URL assertion only accepted `wa.me`, not the `api.whatsapp.com/send` redirect target
**Status:** Fixed
**Severity:** Low
**Area:** Testing / Upgrade
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:82` ("WhatsApp path opens a wa.me deep link and shows the success screen") asserted `popup.url()` matched `/wa\.me/`, but QA observed the popup resolving to `https://api.whatsapp.com/send/?phone=...` instead. The app itself (`src/app/upgrade/page.tsx`) still calls `window.open(\`https://wa.me/${WHISH_NUMBER}?text=${msg}\`, "_blank")` unchanged — `wa.me` is WhatsApp's own shortlink domain, which 302-redirects to `api.whatsapp.com/send/?phone=...`. The test's synchronous `popup.url()` check immediately after `context.waitForEvent("page")` used to catch the URL before that redirect landed; evidently it can now land fast enough (or the browser/network conditions changed) that the popup's URL has already advanced past `wa.me` by the time the assertion runs.
**Root cause:** Test-only issue, not an app bug — no app code (`src/app/upgrade/page.tsx`) needed to change; the WhatsApp deep-link the app requests is still `wa.me`, but the test was asserting on a URL that's an external redirect hop, not one the app controls.
**Fix:** Added `await popup.waitForURL(/api\.whatsapp\.com\/send|wa\.me/, { timeout: 8_000 }).catch(() => {})` before the assertion (bounded wait so a slow/blocked external redirect can't hang the test), and broadened the assertion regex to accept either `wa.me` or `api.whatsapp.com/send`. Deliberately avoided `waitForLoadState()` for the popup — first attempt at the fix used it and it hung until the test's own 30s timeout in this environment's network conditions, since it blocks on the real external domain's full page load. Verified with `npx playwright test e2e/phases/phase-8-pricing-upgrade-misc.spec.ts -g "WhatsApp path"` — 1 passed. No production code changed.

---

## BUG-014: CSP `script-src` blocks Google Analytics/GTM — `gtag.js` fails to load

**Status:** Fixed
**Severity:** Medium
**Area:** Analytics / Security
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** Google Analytics (GTM) is silently broken by the app's own Content-Security-Policy. The browser blocks the request to load `https://www.googletagmanager.com/gtag/js?id=G-7DZ1T3P599`, so no analytics events are ever sent, with no visible error to the end user (only a CSP violation in the browser console). This also causes an e2e smoke test, `landing page loads without errors`, to fail intermittently (the console-error assertion catches the blocked-script CSP violation).
**Steps to reproduce:**
1. Load any page of the app in a browser with devtools open.
2. Check the Console/Network tab — a CSP violation is logged for `https://www.googletagmanager.com/gtag/js?id=G-7DZ1T3P599`, and the script fails to load (status blocked, not a network error).
3. No `gtag`/GA4 events fire afterward.
4. Run the e2e suite's `landing page loads without errors` smoke test — it can fail intermittently due to this same blocked-resource console error.
**Root cause:** Two separate CSP definitions exist, and the original diagnosis only named one of them. `createSecurityHeaders()` in `src/lib/security.ts` sets a `Content-Security-Policy` header whose `script-src` allowlist (`'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://*.google.com https://va.vercel-scripts.com`) did not include `https://www.googletagmanager.com` — but that function is only ever called from API route handlers, whose response headers don't govern the browser's CSP enforcement on the navigated HTML document. The CSP that actually gets enforced on every page load (including the landing page) is built independently and inline inside `src/proxy.ts` (Next.js 16's `middleware.ts`-equivalent convention, matched against all non-`/api` routes) — confirmed by curling a local dev server and diffing the returned `content-security-policy` header against both source files. `proxy.ts`'s `script-src` had the same gap. Traced the GA/GTM wiring itself via `git log -S googletagmanager` to commit `a410d51` ("integrate Google Analytics") — the CSP allowlists were never updated to allow it in either file, so the policy has blocked it from day one. Pre-existing, unrelated to the `imtihan.live` apex-domain migration.
**Fix:** Added `https://www.googletagmanager.com` to `script-src`, and `https://www.google-analytics.com`, `https://*.google-analytics.com`, `https://*.analytics.google.com` to `connect-src`, in **both** `src/proxy.ts` (the one actually enforced on page navigations) and `createSecurityHeaders()` in `src/lib/security.ts` (kept consistent even though it's currently only wired to API JSON responses, to avoid the same trap resurfacing if it's ever applied to page responses). Verified: (1) curled a local dev server (`localhost:3000`, then `localhost:3005` under the Playwright-managed `next dev --turbopack` instance) and read the raw `content-security-policy` response header back — confirmed both new domains present. (2) Ran a one-off Playwright script against the live page that recorded every network response matching `googletagmanager.com` / `google-analytics.com` / `analytics.google.com`: `gtag.js` loaded with `200`, and the GA4 beacon (`https://www.google-analytics.com/g/collect?...&en=page_view...`) fired and returned `204` (GA4's normal success response for `/g/collect`, not an error) — so this is a genuine network-level confirmation the hit landed, not just a CSP-permits-it check. Zero console/page errors were captured during that run. (3) Ran `e2e/smoke.spec.ts`'s `landing page loads without errors` twice in isolation (both green) and the full 12-test `smoke.spec.ts` file once (12/12 green) via `npx playwright test`. (4) `npm run type-check` clean (no code paths changed beyond the two CSP header strings).

---

## BUG-015: Stale test assertion in `generate-prompts.test.ts` didn't match the (intentionally restored) `[id: ...]` chapter tags

**Status:** Fixed
**Severity:** Low
**Area:** Testing / Generation
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA's full-suite run flagged `src/__tests__/generate-prompts.test.ts` (chapter-coverage "packs multiple chapters into one exercise" case) failing: it asserted the literal string `- Exercise 1 → "Nombres complexes" + "Équations différentielles"...` but `buildChapterDistribution()` in `src/lib/prompts/generate.ts` actually emits `"Nombres complexes" [id: ter-math-complex] + ...` — an inline machine-readable id tag per chapter.
**Root cause:** Not a regression. `git log -S` traced the `[id: ...]` tagging to PR #8, "restore-chapter-id-tagging" (commit `5487cc8`), which deliberately restored the id tags so the model copies real curriculum ids verbatim into each exercise's `chapterIds` field instead of guessing/hallucinating them (see CLAUDE.md §4 anti-hallucination rule). The test predates that restore and was never updated to match.
**Fix:** Updated the assertion in `generate-prompts.test.ts` to expect the current output including both chapters' `[id: ...]` tags and the current "include ALL of their ids in that exercise's chapterIds" instruction text. No production code changed. Full suite now green (60/60), `npm run type-check` clean.

---

## BUG-013: "My School" bank silently shows empty — missing Firestore composite index for `schoolBank` queries

**Status:** Fix on disk, not yet deployed
**Severity:** High
**Area:** Data / Bank
**Reported:** 2026-09-18
**Fixed:** Not yet — needs `firebase deploy --only firestore:indexes` or a manual Firebase Console index creation, blocked by the same Claude Code "Production Deploy" guardrail as BUG-011

**Description:** Every Pro teacher who sets a school and opens `/bank`'s "My School" tab silently sees an empty shared-exercises list instead of their colleagues' real contributions, with no error shown to the user — `getSchoolBankExercises()` (`src/app/bank/page.tsx`) catches the failure and returns `[]`. Surfaced via the dev server's own console output while re-running a Phase 5 e2e test (`FirebaseError: The query requires an index`), not via any user report — this is a genuinely broken feature, not a test artifact.
**Root cause:** The query is `where("schoolSlug", "==", slug).orderBy("sharedAt", "desc")` on the `schoolBank` collection — Firestore requires a composite index for a query that combines an equality filter with an `orderBy` on a different field, and `firestore.indexes.json` only defined a *different* composite index for this collection (`curriculumId` + `subject` + `exercise.chapterIds`, used by a separate cross-school lookup), never one covering `schoolSlug` + `sharedAt`. Same class of issue as BUG-011: the deployed Firestore config silently doesn't match what the app's own queries need, masked here by the query's own try/catch swallowing the error into an empty array instead of surfacing it.
**Fix:** Added the missing composite index (`schoolSlug` ASC, `sharedAt` DESC) to `firestore.indexes.json`. **Not yet deployed** — same guardrail that blocked `firebase deploy` for BUG-011 blocks it here too. Antoine needs to run `firebase deploy --only firestore:indexes` himself (or open the direct Firebase Console link the error message itself provides — check the browser dev console on `/bank` with "My School" open and a school with real shared exercises — and click "Create Index" there), then confirm by reloading `/bank`'s My School tab.

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
