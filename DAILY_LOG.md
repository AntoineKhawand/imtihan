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
  no real type errors; don't treat a bash timeout on it as a signal something is broken.

## Run Log

*(newest first)*

- **2026-09-01 (2nd run) — Playwright runner bugfix, blocked on execution.** Investigated why the
  first run's `npm run test:e2e:daily` produced `Phase 1 done: 0 passed, 0 failed in 0.0s` with
  *zero* visible Playwright output in between (not a slow-boot timeout — the earlier 120s→180s
  `webServer` timeout bump from this morning's first run wasn't the cause). Root cause:
  `scripts/run-daily-phase.mjs` spawns `npx.cmd` via `spawnSync` without `shell: true`. On Windows,
  spawning a `.cmd` file directly from a nested Node process (this script is itself invoked by
  `npm run`, which spawns `node scripts/run-daily-phase.mjs`) can fail near-instantly with a null
  exit status and no stdout/stderr at all despite `stdio: 'inherit'` — which matches the symptom
  exactly. Fixed by adding `shell: process.platform === "win32"` to that `spawnSync` call. **Not
  yet verified end-to-end**: this run's `request_access(["File Explorer", "Command Prompt"])`
  calls were both rejected with "can't be approved during a scheduled run" (see Operational notes
  above — new finding), and a bash-side `git status`/`tsc --noEmit` fallback attempt hung past 30s
  and 177s respectively without completing, so nothing was committed or pushed this run. A
  ready-to-run `daily-run2-2026-09-01.bat` is sitting in the repo root (uncommitted, untracked) —
  next run (or Antoine, interactively) should execute it via computer-use to confirm Phase 1
  actually passes now and to commit/push the fix.

- **2026-09-01 — Playwright pipeline validation.** Ran the daily phase script live for the first time (previously "no runs yet"). Findings: (1) `npx playwright install chromium --with-deps` **hangs indefinitely on Windows** — `--with-deps` triggers a UAC elevation request that lands on the secure desktop and can't be approved by unattended automation. Never use `--with-deps` on Windows; it's unnecessary here anyway. (2) Chromium is already cached locally (`%USERPROFILE%\AppData\Local\ms-playwright`, several versions) — installs without `--with-deps` are a fast no-op. (3) `npx playwright test` on Phase 1 timed out waiting for the dev server (`Error: Timed out waiting 120000ms from config.webServer`) — bumped `playwright.config.ts`'s webServer timeout from 120s to 180s to give Turbopack + Firebase Admin cold-boot more room. **Not yet re-verified end to end after the timeout bump** — next scheduled run should confirm Phase 1 actually passes now, and if it still times out at 180s, investigate further (check for a port-3005 process left over from a previous run, or profile the boot directly) rather than keep raising the timeout blindly.

- **2026-09-01 (Tue) — SEO/GEO/AEO.** Added `LandingFAQ` component (`src/components/landing/LandingFAQ.tsx`) — reusable AEO block combining visible Q&A copy with `FAQPage` JSON-LD via `buildFaqSchema()`. Wired into all 4 curricula landing pages (`ib-exam-generator`, `generateur-examen-bac-libanais`, `ai-exam-generator-lebanon`, `bac-francais-exam-generator`), each with 5 topical FAQ items previously missing FAQ schema entirely (only the homepage had one). Hardened `robots.ts`: added `/admin`, `/scanner`, `/print`, `/analytics`, `/test-auth`, `/test-wysiwyg`, `/account`, `/teacher/` to disallow — these were previously crawlable by default (only an allowlist for `/`, `/contact`, `/privacy`, `/terms` existed, not a real denylist). `tsc --noEmit` clean. See `SEO_STRATEGY.md` for the running backlog this was pulled from.
