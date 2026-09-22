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
**The decision needed:** How should a teacher's school affiliation actually be verified before it gates student names, emails, and quiz history? `users/{uid}.school`/`.role` are self-writable today with zero verification.
**Options:** (a) Firebase custom claims set at a controlled invite/verification step; (b) an email-domain allowlist; (c) explicitly accept the risk pre-launch with a documented expiry date.
**Full detail:** `DATABASE.md`, `BUGS.md` (BUG-026)
**Status:** Open

### 2. Accent color
**Raised by:** design · **Date:** carried from `CLAUDE.md` §8
**The decision needed:** Keep emerald `#1A5E3F` as final, or move to terracotta as previously floated?
**Full detail:** `DESIGN.md`
**Status:** Open

### 3. Font system
**Raised by:** design · **Date:** 2026-09-18
**The decision needed:** `CLAUDE.md` documents Fraunces + Geist as locked-in, but the shipped code actually runs Nunito + DM Sans. Which is correct — update the doc, or revert the code?
**Full detail:** `DESIGN.md`
**Status:** Open

### 4. Pricing / quota number
**Raised by:** marketing · **Date:** 2026-09-18
**The decision needed:** `/pricing`'s own FAQ contradicts its own pricing card (100/month vs. 10-20/month). Three ready-to-ship copy diffs are pre-drafted for whichever real number is confirmed.
**Options:** (a) confirm 10/20 to match what the backend already enforces — smallest diff; (b) raise the real backend limit toward 100/month and update copy to match; (c) a genuine new tiered structure.
**Full detail:** `MARKETING.md`
**Status:** Open

### 5. Blog-auto-publish cron supervision
**Raised by:** seo-growth / content-curriculum · **Date:** 2026-09-18
**The decision needed:** Should the unsupervised daily AI blog-publishing cron keep running as-is, get a human review/approval step before each post goes live, or be paused?
**Full detail:** `SEO_STRATEGY.md`
**Status:** Open

### 6. Firestore deploys
**Raised by:** database · **Date:** 2026-09-18
**The decision needed:** Two independent deploy actions, both requiring the founder to run `firebase deploy` by hand (Claude Code's Production Deploy guardrail).
**Options:** BUG-013's index fix has no security implication and is ready to deploy independently, anytime. BUG-026's rules fix should wait for decision #1 above.
**Full detail:** `DATABASE.md`
**Status:** Open

---

## Answered

*(empty — nothing decided yet)*
