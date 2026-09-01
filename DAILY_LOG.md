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

## Run Log

*(newest first)*

- **2026-09-01 (Tue) — SEO/GEO/AEO.** Added `LandingFAQ` component (`src/components/landing/LandingFAQ.tsx`) — reusable AEO block combining visible Q&A copy with `FAQPage` JSON-LD via `buildFaqSchema()`. Wired into all 4 curricula landing pages (`ib-exam-generator`, `generateur-examen-bac-libanais`, `ai-exam-generator-lebanon`, `bac-francais-exam-generator`), each with 5 topical FAQ items previously missing FAQ schema entirely (only the homepage had one). Hardened `robots.ts`: added `/admin`, `/scanner`, `/print`, `/analytics`, `/test-auth`, `/test-wysiwyg`, `/account`, `/teacher/` to disallow — these were previously crawlable by default (only an allowlist for `/`, `/contact`, `/privacy`, `/terms` existed, not a real denylist). `tsc --noEmit` clean. See `SEO_STRATEGY.md` for the running backlog this was pulled from.
