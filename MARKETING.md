# Marketing — Imtihan

> Owned by the `marketing` team. Conversion copy, positioning, and campaign decisions — distinct from `seo-growth` (organic/technical search) and `content-curriculum` (blog/curriculum content quality). Marketing owns *does this copy convert*, not *does this page rank* or *is this claim curriculum-accurate*.

---

## Scope

- Landing page hero/CTA copy, `/pricing` and `/upgrade` messaging, email campaign copy (`src/lib/emails/`, the cron-driven sends).
- Positioning and claims — must stay truthful to actual product state. Imtihan is **pre-launch MVP** (`CLAUDE.md` §1): no fabricated user counts, testimonials, or social proof. (See 2026-09-18 fix: "Join 1,000+ Lebanese teachers" was a fabricated number, removed.)
- Free-tier / paywall messaging consistency — flag (don't silently resolve) the known `/pricing` vs `/upgrade` quota-number mismatch noted in `SEO_STRATEGY.md`; that's a pricing decision for the founder.

## Out of scope (belongs elsewhere)

- Technical SEO, indexing, sitemap/robots, Search Console data → `seo-growth`.
- Blog post quality/GEO structure, curriculum data accuracy → `content-curriculum`.
- Actually sending real customer communications, running paid ad campaigns, or any real-money spend decision → founder only. This team drafts and edits copy/code; it does not execute marketing spend.

## Campaign / copy log

- **2026-09-18**: removed fabricated "Join 1,000+ Lebanese teachers" claim (two locations) and a false "English, French, or Arabic" claim (Arabic is not in MVP scope) — logged by `content-curriculum`/`engineering` before this team existed; noting here as the baseline.

- **2026-09-18 (marketing team, first pass — full sweep)**: Grepped and read every marketing-facing page for fabricated numbers, testimonials without a real source, and claims outside `CLAUDE.md` §9's MVP scope. Found and fixed the following (all verified with `npx tsc --noEmit --skipLibCheck`, clean):

  **Fabricated testimonials / social proof (same category as the 1,000+ teachers fix):**
  - `src/app/page.tsx` — removed a 3-testimonial section with invented quotes attributed to fictional "Professeur de Physique-Chimie," "Mathematics Teacher," and "أستاذة رياضيات" (the last one also implied Arabic support). Pre-launch, none of these can correspond to a real user. Replaced with an honest "Why Imtihan" founder-positioning block (no invented users, no numbers) and removed the fabricated `aggregateRating` (4.9/154, `SoftwareApplication` JSON-LD) — there is no review data yet. Also removed `"Arabic"` from `organizationSchema.contactPoint.availableLanguage`.
  - `src/app/auth/layout.tsx` (the login/register panel — high-conversion real estate) — removed a "Trusted by Lebanese educators" badge (unverifiable pre-launch) and a fabricated 5-star testimonial attributed to "Prof. Khalil · Lycée Français de Beyrouth." Replaced with an unattributed founder note grounded in facts from `CLAUDE.md` (solo founder, Bsabba, Lebanon).
  - `src/app/upgrade/page.tsx` (the Pro checkout page) — removed a second fabricated testimonial attributed to the *same* fake "Prof. Khalil" persona ("Generated a full Terminale Physics exam in under 3 minutes. Worth every cent."). Two fake quotes from one invented recurring character across two different high-value pages was the most serious finding of this sweep. Replaced with a plain capability line (no attribution). Removed the now-unused `Star` icon import.
  - `src/app/about/page.tsx` — removed "Join thousands of educators transforming their workload" (a fabrication, arguably worse than the already-fixed "1,000+" claim). Replaced with "Be among the first to transform your workload," which is honest for a pre-launch product and still a clear CTA.
  - `src/app/community/layout.tsx` — "Browse and remix **thousands** of exams shared by teachers in Lebanon" → removed the fabricated count, kept the real feature description.

  **Arabic-support claims outside MVP scope (`CLAUDE.md` §9 — Arabic is deferred to v1.1):**
  - Found and removed on: `src/app/page.tsx` (openGraph description, `STATS` languages row, a `FEATURES` card titled "French, English & Arabic," and the Arabic testimonial noted above), `src/app/ai-exam-generator-lebanon/page.tsx` (openGraph description, a benefits card, one FAQ answer), `src/app/generateur-examen-bac-libanais/page.tsx` (a features card titled "Soutien du Français, Anglais et Arabe," one FAQ answer, the hero paragraph), `src/app/about/page.tsx` (one FAQ answer, the narrative section, and the "Lebanese Rooted" value card's "trilingual demands" phrase — changed to "bilingual (French/English)").
  - Left untouched, deliberately: `src/app/contact/page.tsx`'s "we reply in French, English, or Arabic" and Imtihan's own name etymology ("Imtihan (إمتحان) is Arabic for exam") on `/about`. These are claims about *humans replying to support messages* and *what the word means*, not about the product generating exam content in Arabic — a different, plausible claim that isn't MVP feature scope. Flagging the distinction here in case a future pass disagrees.

  **Subjects outside MVP scope (`CLAUDE.md` §9 — MVP subjects are Math, Physics, Chemistry only; Biology/SVT and Informatique are explicitly deferred, and nothing in §9 supports Economics/Sociology/Philosophy/History-Geo/SES either):**
  - `src/app/page.tsx` — `STATS` claimed "32 Subjects" across "Sciences · Humanités · Langues · Gestion"; `SUBJECT_CATEGORIES` listed ~30 subjects across 4 categories (Biologie, SVT, Informatique, NSI, Histoire-Géo, Philosophie, Arabe, Espagnol, Allemand, Économie, SES, Psychologie, Sociologie, Droit, Comptabilité, Médecine, Ingénierie, Architecture, etc.) — none of which exist in the MVP. Cut down to the real 3 subjects (Math, Physics, Chemistry) in a single category; `STATS` now says "3 Subjects." Also rewrote the `BookOpen` feature card ("32 subjects across all curricula" → grounded in the real 3).
  - `src/app/bac-francais-exam-generator/page.tsx` — meta description, a features card, one FAQ answer, and a 3-card "specialties" section all advertised SVT and SES alongside Math/Physique-Chimie. Removed SVT and the entire "SES & Humanités" card; kept Math + Physique-Chimie (and trimmed biology-flavored topics — génétique, géologie, évolution — out of the Physique-Chimie card's topic list).
  - `src/app/generateur-examen-bac-libanais/page.tsx` — heaviest scope creep found: a features card claimed "histoire-géo, philosophie" support; the hero paragraph and a syllabus card advertised SVT/Génétique; a "Terminale SE / LH" card advertised "Économie de marché libanaise, Sociologie et philosophie libanaise officielle" (none of which Imtihan generates). Rewrote all of these down to Math/Physics/Chemistry — the SE/LH card now correctly scopes to just the math portion of those tracks (Statistiques, Probabilités) rather than implying we cover their economics/sociology/philosophy content.

  **Deferred feature advertised as purchasable (`CLAUDE.md` §9 — school accounts are "Not in MVP — defer firmly"):**
  - `src/components/landing/LandingPricing.tsx` — the homepage pricing section had a full third "Institutions" tier card ($3.99/teacher/mo, "Bulk teacher licenses," "Centralized administration," "Custom school headers," "Shared question database," "Onboarding & training," a live "Contact Sales" CTA). This invites a sales conversation for a product that doesn't exist yet. Removed the card; grid is now Free + Pro only, 2 columns.

  **Small correctness fix (not a fabrication, but factually wrong given the confirmed 1-exam-lifetime free tier, `CLAUDE.md` §8):**
  - `src/app/pricing/cancel/page.tsx` — "You can still use your free exam**s**" (plural) → singular, matching the real 1-free-exam-lifetime entitlement.

  **Deliberately left alone (noted for transparency, not treated as violations):**
  - Superlative/puffery language ("No. 1 AI Exam Builder in Lebanon," "the leading AI exam generator," "Le premier générateur... intelligent," "Join IB Teachers worldwide") — unverifiable but not a quantifiable/fabricated claim in the same sense as a fake user count or a named testimonial; treated as ordinary ad-copy hyperbole, not touched. Flagging in case the founder wants a harder line on this category too.
  - `VisitorCounter` (`src/components/landing/VisitorCounter.tsx` + `src/app/api/visit/route.ts`) — checked closely since it looked like a candidate for fabrication. It's real: a documented base of 439 real visits (sourced from Vercel Analytics, dated May 2025, in a code comment) plus a live Firestore-tracked increment. Not a violation.

## Open questions for the founder

- Pricing after free tier ($7-10/mo range floated in `CLAUDE.md` §8) — not marketing's call, flag tradeoffs only.

- **The `/pricing` vs `/upgrade` Pro-quota mismatch — options memo (2026-09-18, marketing team).** This is more nuanced right now than `SEO_STRATEGY.md`'s note describes, and it's explicitly the founder's call, not marketing's — no number has been picked below.

  **What's actually live right now, quoted exactly:**
  - `/pricing`'s own page body (`src/app/pricing/page.tsx`, `getFeaturesPro()`): **"10 exams per month"** / **"20 exams per month"** (yearly) — this was already fixed by `engineering` in commit `f19da02` ("fix(pricing): correct Pro exam count from stale 100/month to real 10/20"), with a code comment stating this matches `MONTHLY_LIMITS.pro` actually enforced in `/api/generate/route.ts`.
  - `/pricing`'s own metadata (`src/app/pricing/layout.tsx`, both `metadata.description` and `openGraph.description`): **"100 examens par mois"** / **"$5.99/mois ou $47.88/an pour générer 100 examens par mois."**
  - `/pricing`'s own visible FAQ, rendered directly below the page body on the same page (`PRICING_FAQ_ITEMS[1]`): **"Both plans include 100 exams per month with corrigés included."**
  - `/upgrade`'s own page body (`src/app/upgrade/page.tsx`, `PRO_FEATURES` + hero paragraph): **"10 exams/mo · 20 with yearly plan"**.
  - `/upgrade`'s own metadata (`src/app/upgrade/layout.tsx`, `metadata.description`): **"Unlock 100 exams per month."**
  - `/upgrade`'s own visible FAQ (`UPGRADE_FAQ_ITEMS[1]`): **"10 exams per month on the monthly plan, or 20 exams per month on the yearly plan"** — correct, matches its own page body.

  So the real situation is: someone (engineering) already partially fixed this — both pages' *visible bodies* now agree with each other and with the number the backend actually enforces (10/20). But the fix didn't get swept into `/pricing`'s metadata (2 places) or `/pricing`'s own FAQ block, or into `/upgrade`'s metadata — all of which still say "100." That means `/pricing` right now contradicts *itself*: a visitor sees "10 exams per month" in the pricing card, scrolls down, and sees "100 exams per month" in the FAQ directly below it on the same page. That's a worse, more visibly broken state than the cross-page mismatch `SEO_STRATEGY.md` originally flagged, not a milder one.

  **What this costs if left as-is:** a Pro user who read "100" (via Google's search snippet, an og:image link share, or the pricing page's own FAQ) and then sees "10" enforced by the app, or gets a "monthly limit reached" error at exam #11, reasonably feels misled — this is a support-ticket and trust problem, not just a copy nit.

  **Options (not picking one — founder's call):**
  1. **Confirm 10/20 is final and sweep the remaining "100" instances to match.** This is the smallest-diff option since two of four surfaces (both page bodies, `/upgrade`'s FAQ) and the enforced backend limit already agree — it would just mean finishing the sweep `f19da02` started into `/pricing/layout.tsx` (2 spots) and `/upgrade/layout.tsx` (1 spot).
  2. **Raise the real enforced limit to something closer to 100/month** (in `/api/generate/route.ts`'s `MONTHLY_LIMITS.pro`) and update copy to match. Bigger change — a pricing/unit-economics call, not a copy call — but would mean the "100" copy that's still live in 3 places today was actually the intended number and the "10/20" fix was the wrong correction.
  3. **A tiered structure** (e.g., a distinct "100/mo" tier priced above the current $5.99–3.99 Pro tier, keeping 10/20 as the entry Pro tier) — resolves the mismatch by making both numbers real, but is the most product/pricing work of the three options.

  Marketing's position: whichever number is chosen, we'll make all six surfaces (2 page bodies, 2 metadata objects, 2 FAQ blocks — one of each per page) say the same thing before this is closed out — but the number itself needs the founder's sign-off first.

  **READY-TO-SHIP DIFFS — drafted 2026-09-19, NOT applied, no option picked.** All three resolution paths from the options memo above, pre-written so whichever one the founder signs off on ships same-day. Apply only the block matching the chosen option; discard the other two. Every `old_string`/`new_string` pair below is copy-paste-ready for the `Edit` tool against the current file contents (verified against the repo on 2026-09-19).

  ---

  ### Option 1 — Confirm 10/20 is final, sweep the remaining "100" instances to match

  Smallest diff. Both page bodies and `/upgrade`'s FAQ already say 10/20 and match the enforced backend limit (`MONTHLY_LIMITS.pro = 10`, `proLimit = yearly ? 20 : 10` in `src/app/api/generate/route.ts` — untouched in this option). Only 3 stale "100" spots need fixing:

  **File: `src/app/pricing/layout.tsx`**
  ```
  old_string:
    description: "Imtihan Pro à partir de $5.99/mois. 100 examens par mois, toutes les matières, corrigé inclus. Paiement via WhatsApp. Commencez gratuitement avec 1 examen.",
  new_string:
    description: "Imtihan Pro à partir de $5.99/mois. 10 examens par mois (20 avec l'abonnement annuel), toutes les matières, corrigé inclus. Paiement via WhatsApp. Commencez gratuitement avec 1 examen.",
  ```
  ```
  old_string:
    description: "$5.99/mois ou $47.88/an pour générer 100 examens par mois. Sans carte bancaire, paiement WhatsApp.",
  new_string:
    description: "$5.99/mois pour générer 10 examens par mois, ou $47.88/an pour 20 examens par mois. Sans carte bancaire, paiement WhatsApp.",
  ```

  **File: `src/app/pricing/page.tsx`** (`PRICING_FAQ_ITEMS[1]`)
  ```
  old_string:
    a: "$5.99 per month, or $3.99 per month billed yearly ($47.88/year). Both plans include 100 exams per month with corrigés included.",
  new_string:
    a: "$5.99 per month for 10 exams per month, or $3.99 per month billed yearly ($47.88/year) for 20 exams per month. Corrigés included on both plans.",
  ```

  **File: `src/app/upgrade/layout.tsx`**
  ```
  old_string:
    description: "Unlock 100 exams per month. Pay via WHISH Money in Lebanon. Instant activation for Bac Libanais, Brevet, and school exams.",
  new_string:
    description: "Unlock 10 exams per month, or 20 with the yearly plan. Pay via WHISH Money in Lebanon. Instant activation for Bac Libanais, Brevet, and school exams.",
  ```

  No other files touched in this option — `/upgrade`'s FAQ, both page bodies, and the backend limit are already correct.

  ---

  ### Option 2 — Raise the real enforced limit to 100/month, update all copy to match

  This is a backend/unit-economics change (`src/app/api/generate/route.ts`), not just copy — flagging again that the number itself is the founder's call, not marketing's. Drafted here only so the copy side is ready the same day engineering flips the backend constant. **One sub-decision this option doesn't resolve on its own: the pre-existing stale "100" copy never differentiated monthly vs. yearly (it said "100" for both) — the diff below preserves that as the smallest-change assumption. If the founder wants the yearly plan to keep a bonus above 100 (e.g. 100/150), the backend `proLimit` line and the copy below both need a second pass — flagging, not deciding.**

  **File: `src/app/api/generate/route.ts`** (engineering's file — included here only so the copy change has a paired backend reference; marketing is not applying this)
  ```
  old_string:
    const MONTHLY_LIMITS = { free: 1, pro: 10 } as const;
  new_string:
    const MONTHLY_LIMITS = { free: 1, pro: 100 } as const;
  ```
  ```
  old_string:
    const proLimit = userData.planType === "yearly" ? 20 : MONTHLY_LIMITS.pro;
  new_string:
    const proLimit = MONTHLY_LIMITS.pro; // yearly no longer gets a separate bonus limit — both plans are 100/mo. Revisit if founder wants a yearly-only bump instead.
  ```

  **File: `src/app/pricing/page.tsx`**
  ```
  old_string:
  // Exam-count copy must match the limits actually enforced in
  // /api/generate/route.ts (MONTHLY_LIMITS.pro = 10, or 20 on the yearly
  // plan) — this page previously said "100 exams per month" for both,
  // which the backend has never allowed.
  function getFeaturesPro(yearly: boolean): string[] {
    return [
      `${yearly ? 20 : 10} exams per month`,
  new_string:
  // Exam-count copy must match the limit actually enforced in
  // /api/generate/route.ts (MONTHLY_LIMITS.pro = 100, same on monthly
  // and yearly billing — raised from 10/20 on <date applied>, founder call).
  function getFeaturesPro(yearly: boolean): string[] {
    return [
      `100 exams per month`,
  ```
  (the `yearly` parameter becomes unused for this string once both plans match — leave the parameter in place since other parts of the component still branch on it for price display; don't strip it just to silence an unused-var-in-string smell)

  **File: `src/app/pricing/layout.tsx`** — no change needed; the stale "100 examens par mois" copy already matches the new real number. Leave as-is (but re-verify after applying, in case wording elsewhere on the page still implies a monthly/yearly split).

  **File: `src/app/pricing/page.tsx`** (`PRICING_FAQ_ITEMS[1]`) — no change needed; already says "100 exams per month."

  **File: `src/app/upgrade/page.tsx`**
  ```
  old_string:
    "10 exams/mo · 20 with yearly plan",
  new_string:
    "100 exams per month",
  ```
  ```
  old_string:
    10 exams/month (20 with yearly plan). Pay via WHISH Money, get instant access. No auto-renewals.
  new_string:
    100 exams/month, both plans. Pay via WHISH Money, get instant access. No auto-renewals.
  ```

  **File: `src/app/upgrade/layout.tsx`** — no change needed; the stale "Unlock 100 exams per month" copy already matches. Leave as-is.

  **File: `src/app/upgrade/layout.tsx`** (`UPGRADE_FAQ_ITEMS[1]`)
  ```
  old_string:
    a: "10 exams per month on the monthly plan, or 20 exams per month on the yearly plan — each with its corrigé included.",
  new_string:
    a: "100 exams per month on both the monthly and yearly plans — each with its corrigé included.",
  ```

  ---

  ### Option 3 — Tiered structure (new higher tier alongside the current 10/20 Pro tier)

  This is the one option that genuinely cannot ship as a same-day copy diff — it requires a new pricing card, a new plan identifier in the backend/Stripe-or-WHISH flow, and a name + price for the new tier, none of which exist in code today. What follows is a copy *skeleton* only, so the wording is ready the moment product/engineering defines the missing pieces (tier name, price, exact limit — none of which marketing is deciding here).

  **Undetermined inputs this option needs before the skeleton below can become a real diff:** tier name (placeholder `[TIER NAME]` used below), tier price (placeholder `[PRICE]`), and confirmation that 100/mo is still the right number for it (memo assumed so, not re-litigated here).

  Skeleton FAQ addition (for `PRICING_FAQ_ITEMS` and/or `UPGRADE_FAQ_ITEMS`, wherever the new tier is surfaced):
  ```
  {
    q: "Is there a higher-volume plan than Pro?",
    a: "Yes — [TIER NAME] includes 100 exams per month for [PRICE], for teachers or departments generating at high volume. Pro remains 10 exams per month (20 with the yearly plan) at $5.99/$3.99.",
  },
  ```
  Skeleton pricing-card blurb (for wherever `getFeaturesPro()` / `PRO_FEATURES` render — a third card, not a rewrite of the existing Pro card):
  ```
  const FEATURES_[TIER_NAME] = [
    "100 exams per month",
    "All curricula & subjects",
    "Corrigé included per exam",
    "Word + PDF export",
    "Saved exam library",
    "Community exam library",
    "Priority [whatever differentiates this tier — TBD]",
  ];
  ```
  Existing Pro-tier copy (both pages, all surfaces) is untouched in this option — it stays correctly at 10/20, which is already true today. Only new surfaces are added.

  ---

  Log: this drafting pass touched no files — MARKETING.md only. No option applied, no number picked. Whoever the founder assigns to execute should re-verify each `old_string` against the live file first (`Edit` will fail loudly if the file has drifted since 2026-09-19), then run `npm run type-check` after applying.

- **2026-09-19 (marketing team, team-sync EOD check-in)**: Found and fixed one fabricated-usage claim the 2026-09-18 sweep missed because it lives inside a `content-curriculum`-owned route (`src/app/blog/[slug]/page.tsx`) rather than a marketing-owned page — but the specific block is the shared "Get Started Free" sidebar CTA card, which `CLAUDE.md` §15 / this file's scope note explicitly carves out as marketing's regardless of which team owns the surrounding page. The card read "Join Lebanese teachers using AI to create professional assessments in minutes" — same category as the already-fixed "Join 1,000+ Lebanese teachers" and "Join thousands of educators" claims (implies an existing user base pre-launch). Changed to "Describe your exam, get a polished Word and PDF exam plus corrigé in minutes." — same CTA strength, zero borrowed social proof. Grepped for the same `Join (Lebanese|thousands|hundreds|\d)` / "teachers already/currently using" pattern site-wide afterward — no further instances found. `npm run type-check` not re-run for this single-string change (no logic touched, same as prior single-string fixes in this log).

- **2026-09-19 (marketing team, shared blog-component audit — prompted by the unsupervised `blog-auto-publish` cron)**: Read every component under `src/components/blog/` (`BlogAuthor`, `BlogRelated`, `BlogShare`, `BlogProgressBar`, `BlogCalculator`, `BlogTableOfContents`, `BlogCallout`, `BlogFAQ`) plus every call site under `src/app/blog/` and the cron route itself (`src/app/api/cron/blog-auto-publish/route.ts`), looking for the same category of fabricated/unverifiable claim as the 2026-09-18 sweep.

  **Found and fixed (component-level, in scope for this team — applies to every past and future post automatically):**
  - `src/components/blog/BlogAuthor.tsx` — every byline unconditionally rendered a blue "VERIFIED EDUCATOR" badge with a checkmark icon, regardless of who was passed in. There is no verification process anywhere in this pre-launch product, so the badge was false on every single post that has ever used this component — including the cron-generated ones, which `src/app/api/cron/blog-auto-publish/route.ts:96` always attributes to `"Imtihan AI Assistant"` (an AI is not an educator, verified or otherwise; the badge was self-contradictory nonsense on those posts specifically). This is the clearest instance of the risk described in tonight's task: a fabricated trust signal baked into a shared component, multiplying across every future post nobody manually reviews. Removed the badge entirely (and the now-unused `CheckCircle2` import); byline still shows name, role, and bio, just without the fake credential stamp. Verified with `npm run type-check`, clean.

  **Found, NOT fixed — flagging for `content-curriculum` (out of this team's file scope, same fabrication category):**
  - Every static post under `src/app/blog/*/page.tsx` (9 files: `save-time-teaching`, `generate-bac-francais-devoir`, `stop-recycled-exams`, `ib-mark-scheme-generator`, `generate-bac-libanais-chemistry`, `university-assessment-ai`, `lebanese-teachers-ai-exam-generator`, `exam-standardization`, `guide-for-parents`) passes `BlogAuthor` a fully invented named persona with a fabricated professional biography — e.g. "Samer Haddad, Mathematics Teacher... 10 years of experience," "Dr. Karim Zein, University Professor... Lebanon's top universities for over a decade," "Rania El-Khoury, Chemistry Department Head... 15 years," "Jean-Pierre Saadeh, Director of Academics... 20 years" (reused verbatim on two different posts), plus five more. None of these people exist; pre-launch, there is no one at Imtihan these bios could correspond to. Same category as the already-fixed "Prof. Khalil" testimonials from the 2026-09-18 sweep, just as an author byline instead of a pull-quote. Several of these posts also use `BlogCallout` (a "Teacher's Tip" / "Coordinator's Tip" / "Parent's Tip" block, rendered in a semantic `<blockquote>` specifically so it reads as a real first-person quotation — see the component's own code comment) with fabricated first-person anecdotes ("I used to spend my entire Sunday morning...", "I implemented Imtihan for all Grade 12 sections...") that, again, nobody pre-launch actually said.
  - **Why not fixed directly:** `BlogCallout.tsx` and the persona names/bios live inside `src/app/blog/*/page.tsx` — page *content*, which `CLAUDE.md` §15 and this file's own "Out of scope" section assign to `content-curriculum`, not marketing. Tonight's task scope was explicitly the shared components under `src/components/blog/`; the `BlogAuthor.tsx` fix above is squarely that. The fictional personas and callout quotes are the same violation *category* but live in files outside that boundary, so flagging rather than editing, per this team's standing cross-team rule (don't touch another team's owned files without a `team-sync`).
  - Posted to `TEAM_CHAT.md` for `content-curriculum`'s attention.

  **Checked, no issue found (same standard, nothing to report):**
  - `BlogRelated.tsx` — hardcoded list of real, existing post slugs/titles/categories; no counts or claims, just internal navigation. Clean.
  - `BlogShare.tsx` — share/copy-link buttons only, no copy claims. Clean.
  - `BlogProgressBar.tsx`, `BlogTableOfContents.tsx` — pure UI/scroll utilities, no copy at all. Clean.
  - `BlogFAQ.tsx` — a generic Q&A renderer; the component itself makes no claims (content is supplied per-post via `items` prop and wasn't in scope tonight since it's page content, not component content).
  - `BlogCalculator.tsx` — an interactive "time saved" estimator with clearly-named, code-commented assumption variables (`hoursPerExam = 3 // Estimated manual time per exam`, `timeWithImtihan = 0.5`). This computes a projection from a user-adjustable input, not a fabricated fixed stat presented as fact — judged not to be the same violation category as a fake user count or testimonial. Flagging only for transparency, not treated as a violation, consistent with how the 2026-09-18 sweep treated ordinary puffery/estimates it chose not to touch.
