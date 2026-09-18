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

- *(empty — first pass not yet run. Log dated entries here: what changed, why, what claim it replaced.)*
- **2026-09-18**: removed fabricated "Join 1,000+ Lebanese teachers" claim (two locations) and a false "English, French, or Arabic" claim (Arabic is not in MVP scope) — logged by `content-curriculum`/`engineering` before this team existed; noting here as the baseline.

## Open questions for the founder

- Pricing after free tier ($7-10/mo range floated in `CLAUDE.md` §8) — not marketing's call, flag tradeoffs only.
- The `/pricing` (100 exams/mo) vs `/upgrade` (10-20/mo) Pro-quota mismatch — needs a real number picked.
