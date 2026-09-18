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
