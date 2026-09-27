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

### 8. Unauthenticated API routes that call paid AI APIs or proxy third-party services with zero auth or rate limiting
**Raised by:** security · **Date:** 2026-09-25
**The decision needed:** `/api/generate/transform`, `/api/image/generate`, `/api/rubric`, `/api/scanner`, and `/api/translate` all call a paid AI API (Gemini/Claude) or proxy a third-party image service, with no `verifyIdToken` check and no rate limiting — unlike `/api/generate` (the main exam-creation endpoint), which is properly auth-gated and quota-enforced. Concrete exploit: anyone who finds these URLs (no account needed) can call them in an unbounded loop, running up the founder's Gemini/Claude/image-proxy API bill indefinitely and completely bypassing the "1 free exam, then paywall" quota model — this isn't a data-exposure risk, it's a direct-cost risk with no ceiling. `/api/visual/mermaid` (unauthenticated proxy to `mermaid.ink`/`kroki.io`) has a milder version of the same shape (free third-party services, so no direct API cost, but still an open, unbounded proxy).
**Why this isn't a unilateral security fix:** Adding a blanket auth requirement to all of these could break an intentionally-public "try it free" UX on a landing/demo page (unclear from the code alone whether that's the intent for any of them) — this needs a product decision on which of these should require sign-in vs. stay public-with-rate-limiting vs. accept the cost exposure pre-launch (traffic is presumably still low pre-launch, so the practical cost today may be small). Two rate-limiting libraries (`express-rate-limit`, `rate-limiter-flexible`) are already installed as dependencies but never actually used anywhere in `src/` — whichever direction is chosen, the tooling to implement it is already in the repo.
**Options:** (a) require `verifyIdToken` on all 5 routes, same pattern as `/api/generate`; (b) keep them public but add IP-based rate limiting via the already-installed `rate-limiter-flexible`/`express-rate-limit`; (c) accept the exposure for now given pre-launch traffic levels, revisit before any paid marketing push.
**Full detail:** `SECURITY.md` (2026-09-25 audit log)
**Status:** Open

### 6. Firestore deploys
**Raised by:** database · **Date:** 2026-09-18 · **Escalated:** 2026-09-26 (qa, BUG-045)
**The decision needed:** Two independent deploy actions, both requiring the founder to run `firebase deploy` by hand (Claude Code's Production Deploy guardrail).
**Options:** BUG-013's index fix has no security implication and is ready to deploy independently, anytime — `firebase deploy --only firestore:indexes`. This one now blocks a second, Pro-tier paid feature too (BUG-045: "School Bank"/Community exam library has been completely non-functional for viewing since it shipped, not just the free "My School" tab BUG-013 originally covered) — 8 days pending with no downside to deploying. BUG-026's rules fix should wait for decision #1 above (already answered — accept risk for now).
**Full detail:** `DATABASE.md`, `BUGS.md` (BUG-013, BUG-045)
**Status:** Open

---

## Answered

### 9. Version A/B: marketing copy vs. actual product gate disagree — AND the feature itself is weaker than either side claims
**Raised by:** qa (exploratory pass, live production) · **Date:** 2026-09-25, deepened 2026-09-26
**Full detail:** `BUGS.md` (BUG-036, BUG-042)
**Status:** Answered: 2026-09-27 — option (a), invest in a real second AI-generated variant. Implemented: `/api/generate/version-b` (new route) asks Claude/Gemini to rewrite every exercise's numbers/names/context and fully recompute its solution, given Version A's exercises; `src/lib/variant.ts`'s new `mergeVariantExercise()` then force-copies every structural/gradable field (type, difficulty, points, chapterIds, sub-question/option counts and labels, bareme/microBareme points) from the original so "same difficulty and points distribution as Version A" is a code-enforced guarantee, not just a prompt instruction the AI might ignore. Trigger point is the existing Pro-gated "Variant" selector at Export (Step 5) — clicking "Version B" for the first time now makes a real AI call instead of an instant client-side reorder. Also fixed in the process: PDF export (`/print`) had never respected the variant selector at all (Word/email were the only paths that did) — it now accepts `?variant=b`. BUG-036's Free-vs-Pro pricing-tier copy mismatch remains open and separate — that's a gating question, not addressed here. Two open sub-questions flagged back for founder input in `BUGS.md`'s BUG-042 update: (1) whether Version B should cost 1 unit of the same monthly Pro quota as a fresh generation (current default) or get its own separate/cheaper cap; (2) whether repeated Version B re-rolls need their own cooldown beyond the shared monthly quota, since each is a real second AI API call.

### 10. School Bank sharing silently also publishes to students, including full solutions
**Raised by:** qa (Pro-tier exploratory pass) · **Date:** 2026-09-26
**Full detail:** `BUGS.md` (BUG-044)
**Status:** Answered: 2026-09-26 — option (b), split into two distinct actions. Reasoning: School Bank is genuinely valuable (a real differentiator for a school-based product) and shouldn't be cut — the problem was consent, not the feature. Chose the smallest fix that solves the trust problem: one new `visibleToStudents` field (default off) plus a confirmation modal with an explicit opt-in checkbox, not a second collection or duplicated write path — appropriate for a pre-launch feature with zero real users on the current behavior yet. Sharing with colleagues is now always private by default; a teacher must explicitly check a box to also expose the solution to students. Pending the same index deploy as BUG-013/045.

### 7. BUG-029 content recovery — restore vs. rewrite
**Raised by:** engineering (traced during nightly-ops's first test run) · **Date:** 2026-09-23
**Status:** Answered: 2026-09-24 — no Firebase backup/PITR exists on this plan tier (confirmed by founder in Firebase Console), so `marketing` drafted 3 fresh, WebSearch-verified replacement articles for the same slugs; applied via the real `/admin` edit panel and confirmed live.
**Full detail:** `BUGS.md` (BUG-029)

### 5. Blog-auto-publish cron supervision
**Raised by:** seo-growth / content-curriculum · **Date:** 2026-09-18
**The decision needed:** Should the unsupervised daily AI blog-publishing cron keep running as-is, get a human review/approval step before each post goes live, or be paused?
**Full detail:** `SEO_STRATEGY.md`
**Status:** Answered: 2026-09-23 — keep running as-is, no review step for now.
