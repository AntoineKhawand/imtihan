# Daily Automation Log — Imtihan

> Machine-appended log for the recurring scheduled task ("Imtihan daily improvement loop").
> Each scheduled run starts with **no memory** of previous runs — this file is how it knows what
> was already done, so it doesn't repeat itself or contradict yesterday's work. **Read this file
> first, every run, before deciding what to build.**

## Rotation

| Day | Focus |
|---|---|
| Monday | UX/UI improvement + Playwright coverage |
| Tuesday | SEO / GEO / AEO strategy |
| Wednesday | **Curriculum coverage & exemplar-learning** (see `CURRICULUM_COVERAGE_STRATEGY.md`) + Playwright coverage |
| Thursday | SEO / GEO / AEO strategy |
| Friday | UX/UI improvement + Playwright coverage **+ weekly feature-ideas email** |
| Sat/Sun | Off (no scheduled run) |

**2026-09-04:** Wednesday's focus changed from UX/UI to Curriculum Coverage at Antoine's request —
he wants the tool's chapter/exercise data actively verified against real sources (CRDP, BO, IBO)
and the generation pipeline to improve from real usage over time, without spending extra AI
credits to do it. See `CURRICULUM_COVERAGE_STRATEGY.md` for the full plan and `docs/DATA_SOURCING.md`
(newly written the same day — was referenced in `CLAUDE.md` §9 but never actually existed) for the
sourcing methodology. UX/UI improvement is now Monday + Friday only (was Mon/Wed/Fri).

Color palette is locked (emerald `#1a5e3f` accent, per `CLAUDE.md` §10) — UI days never introduce
new colors, only layout/interaction/accessibility/consistency improvements within the existing
palette and design tokens (`tailwind.config.ts`, CSS vars in `globals.css`).

Every run must also execute the existing daily Playwright phase (`npm run test:e2e:daily`, see
`summary.md` for the phase rotation) to catch regressions across the app, not just in what
changed that day — that's the "daily testing for everything added" requirement.

## Operational notes (read before running)

- **Git pushes must happen via a generated Windows `.bat` file run through the Run dialog
  (`win+r` → paste path → Enter), not via `mcp__workspace__bash` git commands.** The repo lives
  on an SMB-mounted drive where the Linux sandbox can create `.git/index.lock` but cannot delete
  it — every bash `git add`/`commit` leaves a stale lock that blocks all future git commands
  from that side. Windows-side `cmd.exe` (via a `.bat`) can delete the lock fine. Pattern: write
  `daily-run-YYYY-MM-DD.bat` to the repo root with `del /f /q ".git\index.lock" 2>nul` first,
  then `git add -A`, commit, push, then `echo DONE > result.txt`; run it via computer-use.
- **Playwright browsers cannot be installed from the sandbox** — `npx playwright install` hits
  `403 Connection blocked by network allowlist` against `cdn.playwright.dev`. Playwright test
  runs (`npm run test:e2e:daily`) must also go through the same Windows `.bat` + computer-use
  path, not bash.
- Code edits themselves (Read/Write/Edit tools) work fine from either side — only git and
  Playwright execution are blocked from bash.
- If computer-use access (Command Prompt + File Explorer) isn't already granted this session,
  call `request_access` for both before attempting the bat-file run.
- **`request_access` cannot be approved at all during an unattended scheduled run** — it returns
  `"Computer-use access ... can't be approved during a scheduled run"` immediately, no matter how
  many times you retry in the same turn. There is no workaround from inside the run: the approval
  dialog requires a live user turn, or the app must be pre-added to the scheduled task's own
  settings (not something this run can do to itself). If this happens, don't loop on it — make the
  code fix, leave the `.bat` file in the repo root ready to run, and say clearly in `DAILY_LOG.md`
  and the run summary that the test/commit/push step didn't happen and needs a manual or
  interactive-session follow-up.
- **Plain `mcp__workspace__bash` git commands (even read-only ones like `git status`) can hang
  indefinitely on this SMB-mounted repo** — don't fall back to bash git as a workaround for a
  blocked computer-use grant; it's not a faster path, it's just a different way to get stuck. Same
  goes for `tsc --noEmit` from bash — it can time out well past 3 minutes on this mount even with
  no real type errors; don't treat a bash timeout on it as a signal something is broken. `git log`
  (local, read-only, no network/index touch) is reliably fast from bash even when `git status`/
  `git push` are not — use it to sanity-check whether a stuck Windows-side commit actually landed
  before assuming nothing happened.
- **A `git push` inside a combined test+commit+push `.bat` can hang indefinitely with zero output,
  even though `git commit` in the same script just succeeded and a bare `git push origin master` in
  a fresh, separate `.bat` immediately afterward succeeds in seconds.** Root cause unconfirmed (not
  GitHub auth or network — the isolated retry proved that); possibly something about the long-running
  cmd session's state after `npm run test:e2e:daily` finishes. If a combined script's `git push` step
  produces no output for several minutes, don't keep waiting or hunting for the stuck process in Task
  Manager (its Processes tab doesn't reliably show/scroll to short-lived console processes via
  computer-use anyway) — just verify the commit landed with `git log` (see above), then write and run
  a second, minimal push-only `.bat` (`del index.lock` + `git push origin master` + status file). It's
  a fast, reliable escape hatch and avoids re-running the whole test suite just to retry a push.

## Run Log

*(newest first)*

- **2026-09-18 (Fri, interactive, continued) — QA: ran Phase 5, fixed 4 stale test locators/permission gaps, found and fixed a real production bug (BUG-013: missing Firestore index silently empties "My School" bank for every user with a school set).**
  **Phase 5: 12 passed, 3 failed** on first run.
  1. **Fixed (test-only, already flagged): "Purchase via WHISH" URL assertion.** Test expected the old `wa.me` short domain; WHISH now links via `api.whatsapp.com/send`. This exact drift was already flagged as a known stale assumption in this log's 2026-09-14 entry but never fixed until now — confirmed real behavior is correct, updated the regex.
  2. **Fixed (test-only): two "My School" strict-mode violations.** `getByText("E2E Inline/Test School")` (non-exact) also matched the "0 shared exercises from ..." caption and (for one test) the "School set to ..." toast, all containing the school name as a substring. Scoped both to `exact: true`. A third violation surfaced right after: `getByText("Invite Colleagues")` also matched the button that opens the modal (still in the DOM) — scoped to `getByRole("heading", ...)` for the modal's own title.
  3. **Fixed (test-only): missing clipboard permission grant.** The "copy invite link" test's `navigator.clipboard.writeText` silently failed (Chromium denies it without an explicit grant) so "Copied!" never appeared — same root cause and fix as `phase-6-community.spec.ts`'s existing "Copy" test (`test.use({ permissions: [...] })`). Also added the small `.catch()` hygiene fix to `src/app/bank/page.tsx`'s `copyInvite()` (matches the same pattern already applied to `community/page.tsx`'s `copyEmail()`), so a real user who denies clipboard access gets a toast instead of a silent no-op.
  4. **Found and fixed a real app bug, not a test bug (BUG-013): "My School" bank silently shows empty for every Pro teacher with a school set.** Surfaced via the dev server's own console output during a Phase 5 re-run (`FirebaseError: The query requires an index`), not a test assertion — the "Invite Colleagues" test still passed because its own try/catch swallows the error into an empty array, so nothing user-visible broke loudly. Root cause: `getSchoolBankExercises()`'s query (`where("schoolSlug", "==", slug).orderBy("sharedAt", "desc")`) needs a Firestore composite index that was never defined in `firestore.indexes.json` (only a *different* composite index for a separate cross-school query exists there). Same class of issue as BUG-011 — deployed Firestore config silently out of sync with what the app's own queries actually need. Added the missing index definition to `firestore.indexes.json`, but **not yet deployed** — needs Antoine to run `firebase deploy --only firestore:indexes` or create it via the direct Console link in the error, same guardrail blocker as BUG-011's rules deploy. Full writeup in `BUGS.md` BUG-013.
  Verified with a full re-run of the spec file after all fixes: 15/15 pass.

- **2026-09-18 (Fri, interactive, continued) — QA: ran Phase 4, fixed 1 stale strict-mode locator. Also: cleared a corrupted `.next` Turbopack cache that was crashing the dev server under low system memory (66 Chrome processes from the user's own browser session, ~7GB — unrelated to Imtihan, not touched).**
  **Phase 4: 11 passed, 1 failed** on first run (after the cache-clear detour below).
  1. **First attempt failed before any test ran**: the dev server's Turbopack compiler panicked repeatedly (`FATAL: An unexpected Turbopack error... node process exited ... 0xc0000142`) trying to process `globals.css`, timing out the whole run. Checked system memory: ~2.9GB free of 16GB, with the user's own Chrome browser (66 processes, ~7GB) accounting for the pressure — confirmed via command-line inspection that these were real browser tabs/extensions/renderers, not orphaned test processes, so left them alone. Cleared the 1.2GB `.next` build cache (safe, regenerable) instead, which resolved it — the dev server built and served cleanly afterward. Also killed one genuinely stale `next dev` process still holding port 3005 from an earlier interrupted run.
  2. **Fixed: "pro tier: email flow" strict-mode violation.** `getByRole("button", { name: "Send" })` (non-exact) also matched the already-clicked "Send to my email" toggle button, which stays in the DOM. Scoped to `exact: true` to isolate the real Send button, matching the pattern established in earlier phases' locator fixes.
  Verified with a full re-run of the spec file after the fix: 12/12 pass.

- **2026-09-18 (Fri, interactive, continued) — QA: ran Phase 3, found and fixed a real double-click bug in the exercise editor (not just stale tests) plus 2 stale locator/assertion bugs; logged as BUG-012.**
  **Phase 3: 17 passed, 4 failed** on the first full run.
  1. **Fixed (test-only): chapter-coverage assertion used stale copy.** `getByText("Some chapters have no exercise")` no longer exists — the real current copy (`src/app/create/generate/page.tsx`) reads "Click a missing chapter above to generate one question for it." Updated the assertion; no app change.
  2. **Fixed (test-only, then a real strict-mode bug in the fix itself): the "Étape 1:" methodology assertion.** `renderContent.ts`'s `applyMarkdown()` deliberately splits "Étape N:" into its own standalone badge (colon stripped) separate from the following text — confirmed long-standing/intentional via `git log -S "math-node"`. Split the one combined regex assertion into two. First attempt (`getByText("Étape 1", { exact: true })`) then hit a real strict-mode violation: the micro-barème table below has its own "Étape 1" row label, a second legitimate match for the same exact text — scoped with `.first()`.
  3. **Found and fixed a real app bug, not a test bug (BUG-012): double-clicking a KaTeX math node (or any other atomic `[data-raw][contenteditable=false]` block — tables, image/document blocks, step badges) to reveal its raw LaTeX/markdown never actually worked in Chromium.** Confirmed this was genuine app behavior, not a Playwright artifact, by driving raw `mousedown`/`mouseup`/`click` events directly and by manually mutating the DOM outside any event handler (which stuck perfectly). Three compounding causes in `ExerciseEditor.tsx`: (a) Chromium doesn't reliably synthesize `click`/`dblclick` for a `contenteditable="false"` island nested in a `contenteditable="true"` ancestor, so the existing `onDoubleClick` silently never fired; (b) the field's fragment-regenerate feature's `onMouseUp={handleSelect}` treated Chromium's whole-node selection of that island as a normal text selection and popped its toolbar, whose re-render tore down and rebuilt the DOM subtree between the two clicks of a double-click, breaking any identity-based double-click detection; (c) after switching detection to click position/timing and fixing (b), the browser's own native "select word" behavior still fired on the second click's `mouseup` — now against the freshly-revealed plain text — re-triggering the same toolbar and stomping the edit back. Fixed by replacing `onDoubleClick` with a `mousedown`-position-based double-click detector, guarding `handleSelect` against a selection that exactly brackets one atomic sibling, and calling `preventDefault()` + setting an explicit collapsed caret on the reveal to stop the browser's own selection algorithm from re-firing. Verified with 3 consecutive clean runs of the specific test, then a full Phase 3 re-run. Full root-cause writeup in `BUGS.md` BUG-012.
  4. **Not a bug — real external API flake, ignored.** "a fresh 1-exercise request actually streams from /api/generate to a rendered card" (the golden-path real-generation test) failed once in the full-suite run, timing out at the 45s `Export exam` button wait. Re-ran in isolation: passed in 49.2s — right at the edge of its own timeout on a live AI API call, not a code issue. Left untouched.
  Verified with a full re-run of the spec file after all fixes: 19/19 pass.

- **2026-09-18 (Fri, interactive, continued) — QA: ran Phase 2, investigated its 1 failure + 1 logged server error, found both are not real bugs.**
  **Phase 2: 18 passed, 1 failed** on the full-suite run.
  1. **"Generate Version B toggles on for Pro users"** — failed once in the full run (couldn't find the Pro-specific description text; the Pro test user's profile hadn't visibly loaded as Pro yet by the time the assertion fired). Re-ran in isolation: **passed cleanly** in 14.4s. Confirmed flaky under full-suite load, not a consistent app bug — didn't touch the test with a speculative fix, since that risks masking a real occasional timing issue instead of understanding it. Worth revisiting if it starts failing consistently.
  2. **`/api/tools/chapter-performance` logged a `SyntaxError: Unexpected end of JSON input`** during the run. Traced it: the client (`create/generate/page.tsx`) always sends a well-formed JSON body when it calls this route, so the empty body the server received was very likely an in-flight fetch aborted by the test's own `page.goto()` navigating away mid-request — not reachable by a real user's normal browsing. More importantly, the route already handles this correctly: it's wrapped in try/catch, logs the error, and returns a clean `{success:false}` 500 that the client already treats as "no advisory data available" (its own code comment: "advisory UI, never trust the network blindly"). No crash, no user-visible break. Nothing to fix.

- **2026-09-18 (Fri, interactive) — QA: ran Phase 1, fixed 2 stale test bugs, confirmed both are test-only (not app regressions).**
  Ran `node scripts/run-daily-phase.mjs` directly via Bash (same as recent runs — no computer-use/.bat workaround needed). **Phase 1: 30 passed, 3 failed** on first run; **33/33 after fixes.**
  1. **`__redirect` cookie assertions** — the test compared the raw stored cookie value (`%2Fdashboard`) against an undecoded expected string. Checked the actual consuming code (`src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`): both already call `decodeURIComponent()` when reading this cookie, so real login-redirect behavior is correct — a user really does land on `/dashboard`, not `%2Fdashboard`. This resolves the "real app issue" flagged (but never actually investigated) in the 2026-09-13 full-sweep entry above — it was never a bug, just an untested assumption in the test itself. Fixed both assertions in `phase-1-auth-navigation.spec.ts` to decode before comparing.
  2. **UserNav hover/dropdown test** — `page.locator("nav button").last()` was meant to grab the avatar trigger, but `UserNav.tsx`'s dropdown (including the "Sign out" button) is always present in the DOM, just CSS-hidden via `group-hover` until triggered — so "last button in nav" actually resolved to the hidden Sign-out button, timing out on `.hover()`. Real behavior is fine (`group-hover` is a standard, working pattern); fixed the locator to scope to `.group > button` (the avatar's actual direct-child relationship to its hover wrapper) instead of a fragile "last button" assumption.
  Verified with a full re-run of the spec file, not just the 3 previously-failing tests: 33/33 pass.

- **2026-09-17 (Thu) — RESOLVED: the Firestore permissions incident from 2026-09-16 below. Root cause was far bigger than "drifted rules."** Walked the Firebase Console's Firestore → Rules tab together with Antoine (browser access, not CLI — `firebase deploy` was blocked by a Claude Code "Production Deploy" safety classifier, and even just typing the correct rules into the console's editor to save Antoine re-typing them was separately blocked as "Modify Shared Resources" — both are hard tool-level guardrails, not something an in-chat "go ahead" can override, so this needed Antoine's own hands on the keyboard). **The deployed rules were not a drifted variant of `firestore.rules` — they were Firebase's auto-generated "test mode" starter rule** (`allow read, write: if request.time < timestamp.date(2026, 5, 20)`), left over from project creation and never replaced with the real rules despite `firestore.rules` sitting correct and ready in this repo since 07-31. That test-mode rule expired **2026-05-20** — meaning **every Firestore client request, for every user, project-wide, had been denied for roughly four months**, silently survived only by `AuthContext.tsx`'s Admin-SDK API-fallback+polling path. Antoine pasted the repo's real `firestore.rules` into the console and clicked Publish himself. Verified fixed by re-running the exact two tests that caught it: both pass clean now, no permission errors in the console output, normal timing (12.9s / 23.1s). **Action item, not done today:** audit whether any *other* Firebase project (if one exists for staging, or a second environment) has the same unreplaced test-mode rule.

- **2026-09-16 (Wed, interactive/ad-hoc, run from an interactive Claude Code session — not the unattended scheduled task) — QA: ran Phase 8, fixed a stale test locator, and found a real, currently-unexplained regression worth flagging urgently.**
  Ran `node scripts/run-daily-phase.mjs` directly via a normal Bash tool call (no computer-use/.bat workaround needed or used — this session's git/Playwright access worked cleanly the whole time, unlike the unattended scheduled task's documented SMB-mount/sandbox constraints above). **Phase 8: 8 passed, 4 failed.**
  1. **Fixed: the `/upgrade` WhatsApp contact-preference button locator** — exactly the failure already flagged (but never investigated) in the 2026-09-13/14 entries above. Root cause confirmed: the button's accessible name is the full concatenated text "WhatsApp We chat directly with you" (icon + label + sub-caption all inside one `<button>`), so `getByRole("button", { name: "WhatsApp", exact: true })` can never match. Not an app bug — the button's icon+label+caption layout is intentional. Fixed both occurrences in `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts` to `getByRole("button", { name: /WhatsApp/ })`.
  2. **Found, NOT fixed — needs Antoine's input: authenticated users' Firestore *client-SDK* reads of their own profile are being denied ("Missing or insufficient permissions"), and this is new since 2026-09-13.** Two tests newly failed today that passed on 2026-09-13 with the *identical, unchanged* test file (`git log` shows only one commit ever touched this spec, from 07-31) and an *unchanged* `firestore.rules` (last touched 07-31): the Pro-badge test on `/pricing` and the Pro-tier `/scanner` test. Diagnosed with a throwaway diagnostic spec (deleted after): sign-in itself works completely correctly (`__session` cookie set, protected `/dashboard` route reached fine) — only the Firestore client SDK's own read of `users/{uid}` is denied, every single time, despite `firestore.rules` plainly allowing it for `request.auth.uid == userId`. Since the rules file itself hasn't changed, this points to the **deployed** rules on the live Firebase project having drifted from what's in this repo (or some other project-side change) sometime between 09-13 and today — not a code regression I can fix by editing this repo. The app currently survives this via `AuthContext.tsx`'s existing Admin-SDK-backed `/api/auth/profile` fallback+polling (by design, for exactly this scenario), so real users aren't fully broken, but every signed-in user right now is running on the slower polling fallback instead of realtime Firestore listeners, and profile-dependent UI (Pro badges, gated features) can lag behind reality by up to 15s. **Needs Antoine to either check the Firebase Console's actual deployed Firestore rules for `imtihan-app`, or authorize `firebase deploy --only firestore:rules` (firebase-tools is already authenticated as antoinekhawand04@gmail.com in this environment, project just needs to be set) to re-sync them from this repo's `firestore.rules`.**
  3. **Corrected a documentation inaccuracy in `docs/AGENT_TEAMS.md`'s QA-team section** (written before this real e2e/ suite's existence was rediscovered): it told a future QA routine to build a test suite "under `tests/`" from scratch, when a mature 8-phase Playwright suite already exists under `e2e/phases/`, run via this same daily-rotation mechanism. Updated to point at the real suite instead.
  Committed as a normal `git commit`+`git push` from this session (branch `fix/e2e-whatsapp-button-locator`), not via the `.bat`-file/computer-use workaround the unattended scheduled task needs.

- **2026-09-15 (Tue) — SEO/GEO: expanded `public/llms.txt` with `/pricing` page and Key Facts section.** 
  Completed the top unchecked backlog item from `SEO_STRATEGY.md`: added `/pricing` page entry to the "About & Pricing" section (previously only `/upgrade` was listed), and added a new "Key Facts" section documenting free-tier terms (1 exam lifetime), supported languages (French, English — Arabic in v1.1), curricula (Bac Libanais, Bac Français, IB, University), subjects (Math, Physics, Chemistry — Biology and CS in v1.1), and corrigé inclusion. These additions help LLMs browsing or summarizing Imtihan from `llms.txt` alone get key specifics right without inferring them, per the GEO optimization strategy. No code changes, no color/token changes.
  **Test/commit/push step blocked — needs manual follow-up (same constraint as every recent scheduled run).** `request_access` for File Explorer returned "can't be approved during a scheduled run". `daily-run-2026-09-15.bat` is in the repo root, ready to run as-is (commit message: `feat(seo): expand public/llms.txt with /pricing page and Key Facts section`). **Today's Playwright phase run and code push did not happen; the changes above are on disk but not committed to git.**

- **2026-09-14 (Mon, regular daily run) — UX/UI: fixed university curriculum "Generate Exam" button staying disabled.** Phase 2's test suite flagged that the university-curriculum confirm step's "Generate Exam" button stayed disabled even though no chapter validation should block it (chapters are inferred, not predefined, for university). Root cause: the button's `disabled` condition checked `chapterIds.length === 0`, but university curriculum intentionally has empty `chapterIds`. Fix: changed disable condition to `curriculumId !== "university" && chapterIds.length === 0`, so the button is enabled for university even with no chapters, while still preventing generation for other curricula when no chapters are selected. No color/token changes. **Test/commit/push step blocked — needs manual follow-up.** `request_access` for File Explorer returned "can't be approved during a scheduled run". `daily-run-2026-09-14-mon.bat` is in the repo root, ready to execute via computer-use in an interactive session (runs `npm run test:e2e:daily` Phase 1, commits as "fix(confirm): enable Generate Exam button for university curriculum with no predefined chapters", pushes to origin/master). **Today's Playwright phase run and code push did not happen; the fix above is committed to disk but not to git.**

- **2026-09-14 (early Mon, part 3) — full one-time sweep of Phases 1, 2, 3, 4, 5, 7, 8** (Phase 6 already verified in part 2), at Antoine's request, now that the runner bug is fixed and every past phase's "0 passed" result is known to have been meaningless. First real execution of nearly the whole suite. **Totals: 110 passed, 18 failed.** Committed as `d57b8a0`, pushed clean. Per-phase: P1 30/3, P2 17/2, P3 17/2, P4 11/1, P5 12/3, P7 4/4, P8 10/2 (P6 from earlier: 9/1).
  **Important operational finding, not a code bug:** every real Claude call during this run (`/api/analyze` and `/api/generate`) failed with `401 invalid x-api-key` and silently fell back to Gemini. The fallback worked and tests still passed, but this means **the app's primary Claude path is currently unusable with whatever key is in `.env.local`/deployment env** — every "AI-generated" result today, in this run and potentially in production, came from the Gemini fallback, not Claude. Antoine should rotate/check the `ANTHROPIC_API_KEY` — this is a real-money/quality issue, not a test artifact.
  **Most of the 18 failures are stale test assumptions (the same pattern found in Phase 6 earlier tonight), not app bugs** — now that tests actually run for the first time, their locators/assertions are being checked against the real app for the first time too, and several were simply never accurate: strict-mode violations where a locator also matches an unrelated element (Community Library heading vs. route-announcer div; "Send" vs. "Send to my email"; "Newsletter" template name vs. "Template: newsletter" caption; "E2E Test School" heading vs. its own descriptive sentence) and outdated string/URL expectations (WHISH now links to `api.whatsapp.com/send` not `wa.me`; a redirect cookie value check needing `decodeURIComponent`). These need test fixes, not app fixes, but weren't touched tonight (out of scope for a one-time verification pass — flagging for whoever next does a UI/testing day).
  **A smaller set of failures look like genuine app issues worth investigating**, listed here so they're not lost: (1) Phase 1 — the `__redirect` cookie is stored URL-encoded (`%2Fdashboard`) instead of raw (`/dashboard`), affecting the two auth-gate redirect tests; (2) Phase 2 — the university-curriculum confirm step's "Generate Exam" button stays disabled even though no chapter validation should block it, and the research-paper search feature timed out without either succeeding or showing its own graceful-error copy; (3) Phase 7 (admin panel) — the active user-filter button never gets its highlighted style, the "+10Q" bonus-quota badge doesn't appear after clicking +10Q, and the "Free trial reset" toast doesn't appear after Reset; (4) Phase 8 — two `/upgrade` tests timed out (30s) waiting to click a "WhatsApp" contact-preference button, worth checking if that button's selector/visibility changed recently. None of these were fixed tonight — this was a verification pass, not a fix pass; they're flagged here for a future UI/testing day to work through one at a time.
  **Operational notes from tonight's run:** (1) File Explorer's rendering intermittently breaks (file list renders solid black except a ~110px strip near the bottom) after the window has been open a while across multiple navigations — closing and reopening File Explorer via `open_application` fixes it instantly; don't fight the broken rendering by scrolling/guessing coordinates. (2) Double-clicking a `.bat` immediately after selecting it can silently no-op (no process starts, no error) — if a launched script's result file doesn't appear within ~10s, don't assume it's just slow; close/reopen File Explorer and double-click again. (3) A completely unrelated PowerShell-run trading bot (`okx_liquidity_sweep_bot.py`, from a different scheduled task on this machine) appeared on screen mid-session with `AUTO_TRADE=true` and API-shaped secrets visible in plaintext — not an Imtihan concern, but flagged to Antoine directly in-conversation; do not interact with unrelated terminal windows encountered while doing Imtihan computer-use work.

- **2026-09-13 (Sun, part 2) — investigated the 4 Phase 6 failures surfaced by the runner fix above.** 3 of the 4 were test bugs, not app bugs: (1) `getByText('Community Library')` hit a strict-mode violation because it also matched Next.js's route-announcer live-region div — fixed to `getByRole('heading', ...)`; (2) the Remix regression test asserted `/Exercise 1/i`, but the seeded exam (`f1`, "Physique — Mécanique et Électromagnétisme") has `context.language: "french"`, and `ExerciseCard` (unlike the community preview modal, which hardcodes English) correctly localizes the label to "Exercice" — fixed the regex to accept both, confirming the underlying 09-07 Remix cache-key fix does actually work under a real run; (3) the clipboard "Copy" test failed because Chromium denies `navigator.clipboard.writeText` without an explicit permission grant in a test context — added `test.use({ permissions: [...] })`, and also added a `.catch()` in `community/page.tsx`'s `copyEmail()` so a real-world denial doesn't surface as an unhandled rejection (small app hygiene fix, unrelated to the test fix). Re-ran Phase 6 forced (`node scripts/run-daily-phase.mjs 6`, not through `npm run` — see below): **9 passed, 1 failed**, confirming all 3 fixes. Committed as `0180fb7`, pushed clean.
  The 4th failure (`setupTestUser`/`signInAs` timing out waiting for the post-`/test-auth` redirect) reproduced again on a *second* independent run with a *different* underlying error each time (`apiRequestContext.post: Request context disposed` the first time, a plain `page.waitForURL` 30s timeout the second) — always on the first test executed against a freshly-booted dev server, never on any of the other 9. This is a real, reproducible pattern worth a dedicated look (possibly `signInAs`/`setupTestUser` needs to tolerate a slow first Firebase Admin round-trip on cold boot, similar to the already-documented dev-server cold-boot quirks), not fixed today — flagging for whoever next touches `e2e/helpers/auth.ts` or the daily runner.
  **Operational note, new:** invoking `node scripts/run-daily-phase.mjs 6` directly (skipping the `npm run` wrapper) finished a full Phase run in ~3 minutes with no `npm` startup overhead — worth using directly for ad-hoc single-phase re-runs going forward. Also: a `.bat` file must never delete itself mid-execution (tried this to keep the repo root tidy after a one-off verification run) — cmd.exe stops processing the script as soon as its backing file disappears, silently skipping every line after the `del`, including the git commit/push. Lost one full test run's commit this way and had to redo it with a second, non-self-deleting `.bat`. Use a plain descriptively-named `.bat` and delete it manually afterward (via the Write/Edit tools, not from within the script) instead.

- **2026-09-13 (Sun, interactive/ad-hoc — off-day for the regular rotation, run at Antoine's request to clear the backlog).** Two things happened:
  1. **Caught up 3 days of pending disk-only changes to git.** `request_access` for Command Prompt/File Explorer succeeded this time (interactive session, not an unattended scheduled run), so `daily-run-2026-09-13-catchup.bat` ran successfully: one combined commit (`0b33437`) covering the 09-07 Community Remix cache-key fix, the 09-08 SEO FAQ schema additions, and the 09-09 curriculum corrections, pushed clean to `origin/master`.
  2. **Found and fixed a real bug that had silently disabled the entire daily Playwright suite since 2026-09-01.** `scripts/run-daily-phase.mjs` built the spec-file argument with `path.join("e2e", "phases", specFile)`, which emits backslashes on Windows (`e2e\phases\phase-N-....spec.ts`). Playwright treats that CLI argument as a regex matched against file paths — a bare backslash in a regex is an escape character, so the pattern silently matched nothing. This is the actual root cause of every single "0 passed, 0 failed" entry in `summary.md`'s Run Log going back to Phase 1 on 2026-09-01 — the daily regression suite has never run a single real test in over a week of daily runs, despite each day's `DAILY_LOG.md` entry reporting a clean `tsc` and treating the 0/0 result as (at worst) a known infra quirk rather than a total suite outage. Fixed by joining the path segments with a literal `"/"` instead of `path.join`, which Playwright matches correctly as a literal path separator on every OS. Verified live: re-running `npm run test:e2e:daily` afterward correctly picked up Phase 6 (rotation had already advanced past Phase 5) and for the first time actually ran real tests — **6 passed, 4 failed** in 175.6s, committed and pushed as `9e3750a`.
  3. **The 4 real failures Phase 6 (Community) surfaced are new information, not yet investigated:** (a) "content is blurred behind a Pro upsell" — `setupTestUser` timed out with `apiRequestContext.post: Request context disposed` calling `/api/test/custom-token`, likely a slow cold dev-server boot rather than a real regression; (b) "no blur overlay and no upsell banner" — `getByText('Community Library')` is a strict-mode violation because it now matches both the `<h1>` and Next.js's route-announcer div, an accessibility helper Next.js injects — the test's locator needs to be more specific (e.g. scope to the `<h1>` or use `getByRole('heading', ...)`), not necessarily an app bug; (c) "How sharing works... Copy copies the email" — the "Copied!" confirmation never appeared, worth checking if the copy handler or clipboard permissions changed; (d) "Remix shows the cached exam instantly" — `/Exercise 1/i` never appeared after Remix, which is concerning given this spec was specifically extended on 2026-09-07 to guard the Remix cache-key fix — worth a priority look on the next UI day to confirm that fix still holds under a real run now that the suite can actually execute it. None of these were investigated further today (out of scope for a backlog catch-up); flagging here for the next Monday/Friday UI day or a dedicated follow-up.
  4. **Implication for every prior "✅ tsc clean, Playwright presumed fine" entry in this log:** every daily entry since 2026-09-01 was written without ever having a working test run to validate against — `tsc --noEmit` was the only real signal that ran successfully most days. Nothing in those past changes is known to be broken, but none of them were actually confirmed against the e2e suite either. Worth keeping in mind if a regression surfaces that can't otherwise be explained.

- **2026-09-09 (Wed) — Curriculum Coverage: audited `bac-libanais.ts` Terminale-S mathematics
  chapters against the official CRDP "Curriculum of Mathematics" page (crdp.org, General Sciences
  section, Third Year — fetched and read in full today).** Found a real inaccuracy:
  `ter-math-probability`'s objectives described continuous-distribution content (normal law,
  exponential law, confidence intervals) that does not appear anywhere in the official CRDP
  programme — replaced with the actual Third Year probability unit (conditional probability,
  independence, total probability formula, discrete random variable law), which the source
  document confirms verbatim. Also added three chapters that are substantial (20-40h each) units
  in the real programme but were entirely missing from the file: logarithmic/exponential functions
  (`ter-math-log-exp`), differential equations (`ter-math-diff-eq`), and analytic geometry in space
  (`ter-math-space-geometry`) — all near-universal on real Terminale exam papers, so their absence
  meant generated exams could never draw on them. Added a dated source comment above the chapter
  array. Checked off the corresponding item in `CURRICULUM_COVERAGE_STRATEGY.md` with a note that
  EB9→Première-S were spot-checked (look accurate) but a full line-by-line pass on those levels,
  plus Bac Français/IB, is left for future Wednesdays — one curriculum/level slice per run to keep
  diffs reviewable. No AI generation credits spent (WebSearch + direct CRDP page fetch only, per
  the Wednesday constraint). `npx tsc --noEmit --skipLibCheck` ran clean (exit 0, no SMB timeout
  this run).
  **Test/commit/push step blocked again this run — same constraint as every recent run.**
  `request_access` for Command Prompt/File Explorer returned "can't be approved during a scheduled
  run" on the immediate call and the same-turn retry. `daily-run-2026-09-09.bat` is in the repo
  root, ready to run as-is (commit message: `fix(curricula): correct Terminale-S probability
  chapter and add missing CRDP math chapters`). **Today's Playwright phase run and code push did
  not happen; the changes above are on disk but not committed to git.**

- **2026-09-08 (Tue) — SEO/AEO: added `LandingFAQ` + `FAQPage` JSON-LD to `/pricing`, `/about`,
  and `/upgrade`** (top backlog item in `SEO_STRATEGY.md`). Each page gets 5 FAQ items grounded
  strictly in that page's own existing copy/numbers (no new claims introduced). `/pricing` and
  `/upgrade` are `"use client"` page components, so the FAQ section + schema render from their
  (server-component) `layout.tsx` files, after `{children}`; `/about` is already a server
  component so the FAQ is inline on the page, before `PublicFooter`. While researching each
  page's numbers for the FAQ copy, noticed `/pricing` advertises 100 exams/month for Pro while
  `/upgrade` advertises 10/month (20/month yearly) for the same plan — a pre-existing
  inconsistency between the two pages, not introduced today (each page's FAQ matches only that
  page's own figure, so it doesn't add a third conflicting number). Flagged in `SEO_STRATEGY.md`
  under a new "Noted while working" section for Antoine or a future UI-day pass — reconciling the
  real number is a product decision, not a Tuesday SEO call. No color/token changes.
  `npx tsc --noEmit --skipLibCheck` timed out on the SMB mount (the known, previously-documented
  issue — not a signal of a real type error); the changes themselves are small, additive JSX +
  plain-object literals following the exact pattern already used on the 4 curricula landing pages,
  so risk is low.
  **Test/commit/push step blocked again this run — same constraint as every recent run.**
  `request_access` for Command Prompt/File Explorer returned "can't be approved during a scheduled
  run" on the immediate call and the same-turn retry. `daily-run-2026-09-08.bat` is in the repo
  root, ready to run as-is (commit message: `feat(seo): add LandingFAQ + FAQPage schema to
  /pricing, /about, /upgrade`). **Today's Playwright phase run and code push did not happen; the
  changes above are on disk but not committed to git.**

- **2026-09-07 (Mon) — UX/UI: fixed the Community "Remix" cache-key bug** (last remaining item
  from `summary.md`'s "Known app issues" list, plus one entirely new find). `handleUse()` in
  `src/app/community/page.tsx` wrote `imtihan_exercises_key` as `{ c: exam.context }` while
  `/create/generate` compares against `{ c: context, t: templateId }` on mount (`templateId`
  read from a separate `imtihan_templateId` key, defaulting to `"classic"`) — the keys could
  never match, so every Remix click discarded the seeded cache as "stale" and silently fired a
  real Gemini/Claude generation instead of showing the community exam's exercises instantly.
  Fix: `handleUse()` now also writes `imtihan_templateId: "classic"` (community exams have no
  per-exam template, they always use the default) and includes `t: "classic"` in the cache key.
  Applied the identical fix to the two pre-existing `seedMcq`/inline seed helpers in
  `e2e/qcm.spec.ts` that had the same gap. Extended
  `e2e/phases/phase-6-community.spec.ts`'s Remix test with a new case asserting the cache key
  includes `t:"classic"` and that the "Generating your exam…" streaming copy never appears after
  a Remix click (i.e. no live regen fires). `npx tsc --noEmit --skipLibCheck` ran clean (exit 0,
  no SMB timeout this time).
  While verifying, found two other "Known app issues" list entries were already stale/resolved
  and not marked as such — the `/create/structure` 404 was fixed back in commit `51e4c7f`
  (it's now a client redirect to `/create/confirm`), and the `/bank` "Go to Settings" 404 was
  fixed 2026-09-04. Updated `summary.md`'s list to strike both through with their fix commits/dates,
  and added a new open item there: the 2026-09-04 run's Phase 5 attempt failed with `Process from
  config.webServer was not able to start. Exit code: 1` — a *different* failure mode from the
  earlier `webServer` timeout already tracked (2026-09-01/02 entries below); not investigated
  today (out of scope for a one-day UI fix), flagged in `summary.md` for whoever next touches e2e
  infra. Also confirmed via `git log` that the 2026-09-04 entry below undersold itself: the
  `daily-run-2026-09-04.bat` script *did* get run at some point after that entry was written (its
  result/status files exist and show a completed — if Phase-5-failing — run), and the commit
  (`4b353cf`, later re-committed as `0b28a71` with an identical message/diff) is confirmed pushed
  to `origin/master`. No color/token changes today.
  **Test/commit/push step blocked again this run — same constraint as recent Mon/Wed/Fri runs.**
  `request_access` for Command Prompt/File Explorer returned "can't be approved during a scheduled
  run" on the immediate call and the same-turn retry. `daily-run-2026-09-07.bat` is in the repo
  root, ready to run as-is (commit message: `fix(community): correct Remix cache key so cached
  exercises render instantly instead of triggering a live regeneration`). **Today's Playwright
  phase run and code push did not happen; the fix above is committed to disk but not to git.**

- **2026-09-04 (Fri) — UX/UI: fixed the `/bank` dead "Go to Settings" link (the last remaining
  known app issue in `summary.md`). Pro teachers with no school set previously hit a "Go to
  Settings" button linking to `/account`, a route that has never existed anywhere in the app
  (confirmed via search — no `/account` page, no settings page at all). Rather than build a whole
  new settings page (out of scope for a one-day UI fix), replaced the dead link with an inline
  form right on `/bank`'s "My School" tab: a text input + Save button that writes `school` on
  `users/{uid}` directly via `updateDoc` (`firebase/firestore`), the same pattern `AuthContext`
  already uses for `examsGenerated`/`lastLoginAt`. On save, the Firestore `onSnapshot` listener in
  `AuthContext` propagates the change and the "no school set" card is replaced by the school bank
  view automatically — no reload needed. Updated `e2e/phases/phase-5-dashboard-bank.spec.ts`'s
  "Go to Settings" test to instead fill the input, click Save, and assert the school bank view
  appears (also asserts the dead `/account` link is gone). `npx tsc --noEmit --skipLibCheck` ran
  clean (exit 0). No color/token changes.
  **Friday feature-ideas step:** added 3 new grounded ideas to `FEATURE_IDEAS.md` under
  "Week of 2026-09-04" (School-Name Autocomplete/Normalization — a direct follow-on from today's
  fix, since exact-slug matching means typos silently split one school into two banks;
  Chapter-Level Struggle Highlighting on `/teacher/students`; Duplicate/Overlap Warning Before
  Generating). Nothing implemented — awaiting Antoine's approval per policy. **Gmail connector was
  not available in this session**, so the weekly ideas email did not send; ideas are in
  `FEATURE_IDEAS.md` for Antoine to read there instead.
  **Test/commit/push step blocked — needs manual follow-up (same constraint as 2026-09-02 and
  2026-09-03).** `request_access` for Command Prompt/File Explorer returned "can't be approved
  during a scheduled run" on both the immediate call and the same-turn retry.
  `daily-run-2026-09-04.bat` is sitting in the repo root, ready to run as-is (runs
  `npm run test:e2e:daily`, then `git add`/`commit`/`push`, writing output to
  `daily-run-2026-09-04-result.txt` and a `daily-run-2026-09-04-status.txt` marker on completion).
  Commit message baked into the script: `feat(bank): replace dead /account link with inline
  school-name save form`. **Today's Playwright phase run and code push did not happen; the fix
  above is committed to disk but not to git or deployed.**

- **2026-09-03 (Wed) — UX/UI: added aria-label to password toggle button for accessibility.
  Improved FormElements.tsx Input component by adding dynamic aria-label ("Show password" / "Hide password")
  to the password field's show/hide toggle button, improving usability for screen reader users and keyboard
  navigators. Added regression test in phase-1-auth-navigation.spec.ts to verify the aria-label is present
  and correct on both /auth/login and /auth/register password fields. `npx tsc` not re-verified (SMB timeout
  on this mount), but change is minimal and safe.
  **Test/commit/push step blocked — needs manual follow-up (same constraint as 2026-09-02).** Created
  `daily-run-2026-09-03.bat` in repo root, ready to execute via computer-use/File Explorer in an interactive
  session. Commit message: `chore(a11y): add aria-label to password toggle button for screen reader users`.

- **2026-09-02 (Wed) — UX/UI: fixed nested-`<a>` hydration bug in AuthLayout.
  Test/commit/push step blocked — needs manual follow-up.** Found and fixed
  the known app issue tracked in `summary.md`: `AuthLayout` (`src/app/auth/layout.tsx`)
  wrapped `<Logo>` in its own `<Link href="/">`, and `Logo` always rendered an
  internal `<Link href="/">` too — nested `<a>` tags are invalid HTML and were
  forcing a hydration-mismatch + full client remount on every `/auth/login`,
  `/auth/register`, and `/auth/forgot` page load. Fix: added an `asLink` prop
  to `Logo` (`src/components/ui/Logo.tsx`, defaults to `true` for every other
  existing call site) so a caller that already wraps it in a link can opt out
  of Logo's own `<Link>` and render a plain `<span>` instead; `AuthLayout` now
  passes `asLink={false}`. No color/token changes. Removed the now-resolved
  item from `summary.md`'s "Known app issues" list and the stale workaround
  comments in `e2e/phases/phase-1-auth-navigation.spec.ts` that referenced
  this bug. Added a new regression block to that same spec —
  `AuthLayout — no nested anchors` — that loads all three auth pages at a
  desktop (lg+) viewport and asserts zero `<a>` elements contain another
  `<a>` in the DOM. `npx tsc --noEmit --skipLibCheck` ran clean (exit 0, fast,
  no timeout).
  **This run could not execute the `.bat` (test + commit + push) step**:
  `request_access` for Command Prompt / File Explorer returned "can't be
  approved during a scheduled run" on both the first call and the same-turn
  retry — per the operational note below, there's no workaround from inside
  an unattended run. `daily-run-2026-09-02.bat` is sitting in the repo root,
  ready to run as-is (runs `npm run test:e2e:daily`, then `git add`/`commit`/
  `push`, writing output to `daily-run-2026-09-02-result.txt` and a
  `daily-run-2026-09-02-status.txt` marker on completion) — it just needs
  either an interactive session (so the access dialog can be approved) or a
  manual double-click. **Today's Playwright phase run and code push did not
  happen; the fix above is committed to disk but not to git.**

- **2026-09-02 — Playwright runner bugfix confirmed + pushed (commit `d4ed89a`).** Antoine asked
  interactively to commit/push the fix left pending by the prior run. Ran `daily-run2-2026-09-01.bat`
  via computer-use: the `shell: true` fix **worked** — Phase 2 actually executed this time (238.3s,
  real Playwright output) instead of the previous instant `0 passed, 0 failed in 0.0s` crash, so the
  spawnSync root cause is confirmed fixed. Phase 2 itself then hit a *separate*, genuine issue —
  `Error: Timed out waiting 180000ms from config.webServer` — i.e. the dev server still doesn't come
  up within 180s even after this morning's 120s→180s bump; that's still open, see the note below.
  `git add`/`commit` completed fine (message: `fix(e2e): use shell:true when spawning npx.cmd on
  Windows in daily phase runner`), but `git push` then hung for ~19 minutes with zero output and no
  visible process in Task Manager's Processes tab before I gave up waiting on it — see new
  Operational note below. A second, minimal `push-only-2026-09-02.bat` (just `git push origin
  master`, no test rerun) ran instantly and succeeded (`0cb12d6..d4ed89a  master -> master`), so the
  push itself works fine in isolation; whatever the first run's cmd session got stuck on, it wasn't
  GitHub auth or network. **Next run should investigate the Phase 2 `webServer` timeout** — check
  for a stale process already holding port 3005 from a previous run (the likely culprit, since nothing
  else changed since the 180s bump), or profile the dev server's actual cold-boot time directly.

- **2026-09-01 — Playwright pipeline validation.** Ran the daily phase script live for the first time (previously "no runs yet"). Findings: (1) `npx playwright install chromium --with-deps` **hangs indefinitely on Windows** — `--with-deps` triggers a UAC elevation request that lands on the secure desktop and can't be approved by unattended automation. Never use `--with-deps` on Windows; it's unnecessary here anyway. (2) Chromium is already cached locally (`%USERPROFILE%\AppData\Local\ms-playwright`, several versions) — installs without `--with-deps` are a fast no-op. (3) `npx playwright test` on Phase 1 timed out waiting for the dev server (`Error: Timed out waiting 120000ms from config.webServer`) — bumped `playwright.config.ts`'s webServer timeout from 120s to 180s to give Turbopack + Firebase Admin cold-boot more room. **Not yet re-verified end to end after the timeout bump** — next scheduled run should confirm Phase 1 actually passes now, and if it still times out at 180s, investigate further (check for a port-3005 process left over from a previous run, or profile the boot directly) rather than keep raising the timeout blindly.

- **2026-09-01 (Tue) — SEO/GEO/AEO.** Added `LandingFAQ` component (`src/components/landing/LandingFAQ.tsx`) — reusable AEO block combining visible Q&A copy with `FAQPage` JSON-LD via `buildFaqSchema()`. Wired into all 4 curricula landing pages (`ib-exam-generator`, `generateur-examen-bac-libanais`, `ai-exam-generator-lebanon`, `bac-francais-exam-generator`), each with 5 topical FAQ items previously missing FAQ schema entirely (only the homepage had one). Hardened `robots.ts`: added `/admin`, `/scanner`, `/print`, `/analytics`, `/test-auth`, `/test-wysiwyg`, `/account`, `/teacher/` to disallow — these were previously crawlable by default (only an allowlist for `/`, `/contact`, `/privacy`, `/terms` existed, not a real denylist). `tsc --noEmit` clean. See `SEO_STRATEGY.md` for the running backlog this was pulled from.
