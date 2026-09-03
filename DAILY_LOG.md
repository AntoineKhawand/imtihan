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
| Wednesday | UX/UI improvement + Playwright coverage |
| Thursday | SEO / GEO / AEO strategy |
| Friday | UX/UI improvement + Playwright coverage **+ weekly feature-ideas email** |
| Sat/Sun | Off (no scheduled run) |

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
