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

### 9. Version A/B: marketing copy vs. actual product gate disagree — AND the feature itself is weaker than either side claims
**Raised by:** qa (exploratory pass, live production) · **Date:** 2026-09-25, deepened 2026-09-26
**The decision needed:** The homepage `/#pricing` and `/pricing` both list "Version A/B generation" as an included Free-plan feature. But the actual Confirm & Configure step gates "Generate Version B" as Pro-only (confirmed live with a real free-tier account), and `ROADMAP.md` confirms this Pro-gating is the intended design — that's the original BUG-036 mismatch. Retested as a real Pro user (BUG-042): the Step 2 "Generate Version B" toggle is completely dead code — its own copy claims it "regenerates numerical values," but the field is accepted into `/api/generate`'s schema and never read again anywhere in the route; toggling it does nothing. The *real* Version A/B mechanism lives only at Export, is a pure client-side reorder (same statement text and numbers, just shuffled order + relabeled sub-questions) — for a small exam there's a real chance the shuffle produces an export identical to Version A. So this isn't just a copy problem: the underlying feature doesn't do what either the Free-plan copy or the Pro-gated Step 2 toggle claims.
**Options:** (a) invest in a real second AI-generated variant (different numbers/wording, not just reordering) — closes the gap for real, more cost/complexity; (b) keep it reorder-only, but describe it honestly everywhere (drop or rewrite the Step 2 toggle entirely, since it currently claims a capability that doesn't exist and does nothing when toggled) and fix the Free/Pro copy mismatch to match; (c) something else.
**Full detail:** `BUGS.md` (BUG-036, BUG-042)
**Status:** Open

### 10. School Bank sharing silently also publishes to students, including full solutions
**Raised by:** qa (Pro-tier exploratory pass) · **Date:** 2026-09-26
**The decision needed:** `/bank`'s "My School" tab describes School Bank purely as teacher-to-teacher collaboration ("share exercises with colleagues at the same school"). But the same `schoolBank` Firestore collection a teacher shares to is read directly by `/student/practice` and shown to students — including the full worked solution/methodology, not just the exercise statement. A teacher sharing an exercise believing (per the feature's own copy) that only colleagues see it is also silently giving their own students immediate access to its complete answer key.
**Options:** (a) make this one action honestly — update `/bank`'s copy to say "colleagues and your students" so teachers know what they're actually doing; (b) split into two distinct actions ("share with colleagues" vs. "publish to students"), with the student-facing one requiring explicit confirmation given it exposes the answer key; (c) something else.
**Full detail:** `BUGS.md` (BUG-044)
**Status:** Open

### 6. Firestore deploys
**Raised by:** database · **Date:** 2026-09-18 · **Escalated:** 2026-09-26 (qa, BUG-045)
**The decision needed:** Two independent deploy actions, both requiring the founder to run `firebase deploy` by hand (Claude Code's Production Deploy guardrail).
**Options:** BUG-013's index fix has no security implication and is ready to deploy independently, anytime — `firebase deploy --only firestore:indexes`. This one now blocks a second, Pro-tier paid feature too (BUG-045: "School Bank"/Community exam library has been completely non-functional for viewing since it shipped, not just the free "My School" tab BUG-013 originally covered) — 8 days pending with no downside to deploying. BUG-026's rules fix should wait for decision #1 above (already answered — accept risk for now).
**Full detail:** `DATABASE.md`, `BUGS.md` (BUG-013, BUG-045)
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
