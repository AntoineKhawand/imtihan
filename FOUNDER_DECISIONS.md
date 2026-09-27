# Founder Decisions — Imtihan

> One consolidated inbox for anything a team flags as genuinely the founder's call (business, pricing, legal, brand, security-risk-acceptance, or launch-timing) — instead of six scattered "open questions" sections across `SEO_STRATEGY.md`, `DESIGN.md`, `MARKETING.md`, `DATABASE.md`, `BUGS.md`, `ROADMAP.md`. Teams still log full technical detail in their own domain doc; they mirror the *decision itself* here so there's one place to check each morning.
>
> Format per entry: `## <short title>` then **Raised by**, **Date**, **The decision needed**, **Options** (if any are already drafted), **Where the full detail lives**, **Status** (`Open` / `Answered: <what was decided>` / `Deferred`).
>
> Teams: append new entries at the bottom under "Open", never edit another team's entry. When the founder answers one here (or in chat), whoever picks up the resulting work moves it to "Answered" with a one-line summary of what was decided and the date.

---

## Open

*(Nothing open right now — check back after the next dispatch. Every item below is resolved.)*

---

## Answered

### 8. Unauthenticated API routes that call paid AI APIs or proxy third-party services with zero auth or rate limiting
**Raised by:** security · **Date:** 2026-09-25
**Full detail:** `SECURITY.md` (2026-09-25 audit log), `BUGS.md`
**Status:** Answered: 2026-09-27 — a per-route decision, not one blanket policy, after actually checking which routes have a real current caller:
- `/api/rubric`, `/api/generate/transform`, and the top-level `/api/translate` (distinct from the real, already-authenticated `/api/exam/translate`) have **zero callers anywhere in `src/`** — confirmed by search. Gated behind `verifySession` (401 if signed out). Zero regression risk, since nothing depends on the old unauthenticated behavior.
- `/api/scanner` is a real, intentional public "try our scanner" demo (linked from `src/app/scanner/page.tsx`) that calls paid Gemini — kept public, but given a per-IP daily cap (15/day) and request-size/shape validation it never had, via a new Firestore-backed rate limiter (`src/lib/rateLimit.ts`) — the two previously-installed rate-limiting libraries were removed as unused dead code earlier the same day (BUG-034 cleanup) and wouldn't have worked anyway on Vercel's stateless serverless functions (in-memory limiters don't persist across invocations); Firestore is the same pattern this app already uses for quota counters.
- `/api/image/generate` is a free (zero-$-cost) proxy to `pollinations.ai`, embedded via `<img src>` in exam content shown to students and on pages `src/proxy.ts` doesn't gate behind login (`/student/practice`, `/exam/[id]`) — auth-gating it would break legitimate rendering for students who never sign in as a teacher. Kept public; added only a prompt-length cap, matching the fix already applied the same day to `/api/visual/mermaid` (a hardcoded-host proxy, same shape).

### 9. Version A/B: marketing copy vs. actual product gate disagree — AND the feature itself is weaker than either side claims
**Raised by:** qa (exploratory pass, live production) · **Date:** 2026-09-25, deepened 2026-09-26
**Full detail:** `BUGS.md` (BUG-036, BUG-042)
**Status:** Answered: 2026-09-27 — option (a), invest in a real second AI-generated variant. Implemented: `/api/generate/version-b` (new route) asks Claude/Gemini to rewrite every exercise's numbers/names/context and fully recompute its solution, given Version A's exercises; `src/lib/variant.ts`'s new `mergeVariantExercise()` then force-copies every structural/gradable field (type, difficulty, points, chapterIds, sub-question/option counts and labels, bareme/microBareme points) from the original so "same difficulty and points distribution as Version A" is a code-enforced guarantee, not just a prompt instruction the AI might ignore. Trigger point is the existing Pro-gated "Variant" selector at Export (Step 5) — clicking "Version B" for the first time now makes a real AI call instead of an instant client-side reorder. Also fixed in the process: PDF export (`/print`) had never respected the variant selector at all (Word/email were the only paths that did) — it now accepts `?variant=b`. **Update, same day:** BUG-036's Free-vs-Pro copy mismatch is now also fixed — since Version B is a genuinely costly second AI call, kept it Pro-only (protects margin) and corrected every surface that wrongly listed it as a Free-plan feature (`LandingPricing.tsx`, `pricing/page.tsx`, `pricing/layout.tsx`'s FAQ, the homepage FAQ) to instead list it under Pro. Two open sub-questions remain flagged for founder input in `BUGS.md`'s BUG-042 update: (1) whether Version B should cost 1 unit of the same monthly Pro quota as a fresh generation (current default) or get its own separate/cheaper cap; (2) whether repeated Version B re-rolls need their own cooldown beyond the shared monthly quota, since each is a real second AI API call.

### 6. Firestore deploys
**Raised by:** database · **Date:** 2026-09-18 · **Escalated:** 2026-09-26 (qa, BUG-045)
**Full detail:** `DATABASE.md`, `BUGS.md` (BUG-013, BUG-045)
**Status:** Answered/done: 2026-09-27 — founder ran `firebase deploy --only firestore:indexes` himself. All 3 pending indexes (BUG-013's original "My School" fix, plus BUG-045/BUG-044's `visibleToStudents` pair) are live. Both dependent features (My School tab, School Bank) confirmed working.

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
