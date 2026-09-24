# Founder Decisions — Imtihan

> One consolidated inbox for anything a team flags as genuinely the founder's call (business, pricing, legal, brand, security-risk-acceptance, or launch-timing) — instead of six scattered "open questions" sections across `SEO_STRATEGY.md`, `DESIGN.md`, `MARKETING.md`, `DATABASE.md`, `BUGS.md`, `ROADMAP.md`. Teams still log full technical detail in their own domain doc; they mirror the *decision itself* here so there's one place to check each morning.
>
> Format per entry: `## <short title>` then **Raised by**, **Date**, **The decision needed**, **Options** (if any are already drafted), **Where the full detail lives**, **Status** (`Open` / `Answered: <what was decided>` / `Deferred`).
>
> Teams: append new entries at the bottom under "Open", never edit another team's entry. When the founder answers one here (or in chat), whoever picks up the resulting work moves it to "Answered" with a one-line summary of what was decided and the date.

---

## Open

### 1. BUG-026 verification model
**Raised by:** database · **Date:** 2026-09-18 (restated 2026-09-19)
**Full detail:** `DATABASE.md`, `BUGS.md` (BUG-026)
**Status:** Answered: 2026-09-24 — option (c), accept the risk for now (only individual teachers today, no real schools onboarded). **Expiry: must be revisited with real verification (option a or b) before any real school institution is onboarded** — see the schools-outreach item below, since that's the event that would actually trigger this risk.

### 2. Accent color
**Raised by:** design · **Date:** carried from `CLAUDE.md` §8
**Full detail:** `DESIGN.md`
**Status:** Answered: 2026-09-24 — keep emerald `#1A5E3F`, do not move to terracotta.

### 3. Font system
**Raised by:** design · **Date:** 2026-09-18
**Full detail:** `DESIGN.md`
**Status:** Answered: 2026-09-24 — revert the code to match the documented Fraunces + Geist system (not the other way around). Applied: body/`.heading` repointed from DM Sans/Nunito to Geist/Fraunces, unused font loaders removed, plus a latent bug fixed (`--font-geist` was a hardcoded string matching no real font-face). Verified live on production post-deploy: `getComputedStyle(document.body).fontFamily` now resolves to `GeistSans, "GeistSans Fallback", ...` — confirmed fixed, not just a code review.

### 4. Pricing / quota number
**Raised by:** marketing · **Date:** 2026-09-18
**Full detail:** `MARKETING.md`
**Status:** Answered: 2026-09-24 — confirmed 10/20 (matches what the backend already enforces). Option 1's pre-drafted diffs applied to `pricing/layout.tsx` and `upgrade/layout.tsx`; all six surfaces (2 page bodies, 2 metadata objects, 2 FAQ blocks) now agree.

### 6. Firestore deploys
**Raised by:** database · **Date:** 2026-09-18
**The decision needed:** Two independent deploy actions, both requiring the founder to run `firebase deploy` by hand (Claude Code's Production Deploy guardrail).
**Options:** BUG-013's index fix has no security implication and is ready to deploy independently, anytime. BUG-026's rules fix should wait for decision #1 above.
**Full detail:** `DATABASE.md`
**Status:** Open

---

## Answered

### 7. BUG-029 content recovery — restore vs. rewrite
**Raised by:** engineering (traced during nightly-ops's first test run) · **Date:** 2026-09-23
**Status:** Answered: 2026-09-24 — no Firebase backup/PITR exists on this plan tier (confirmed by founder in Firebase Console), so `marketing` drafted 3 fresh, WebSearch-verified replacement articles for the same slugs; applied via the real `/admin` edit panel and confirmed live.
**Full detail:** `BUGS.md` (BUG-029)

### 5. Blog-auto-publish cron supervision
**Raised by:** seo-growth / content-curriculum · **Date:** 2026-09-18
**The decision needed:** Should the unsupervised daily AI blog-publishing cron keep running as-is, get a human review/approval step before each post goes live, or be paused?
**Full detail:** `SEO_STRATEGY.md`
**Status:** Answered: 2026-09-23 — keep running as-is, no review step for now.
