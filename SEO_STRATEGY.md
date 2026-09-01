# SEO / GEO / AEO Strategy — Imtihan

Living backlog for Tuesday/Thursday scheduled runs. **SEO** = classic search ranking (Google,
Bing). **GEO** (Generative Engine Optimization) = being findable and correctly represented when
an LLM browses/crawls the site (ChatGPT browsing, Claude, Perplexity's crawler). **AEO** (Answer
Engine Optimization) = being directly quotable as *the answer* in AI Overviews, Perplexity
answers, and voice/chat assistants — concise, self-contained, question-shaped content near the
top of a page, reinforced with matching structured data.

Pick **one item per Tue/Thu run**, move it to "Done" with the date and a one-line result, and
add anything newly discovered to the backlog. Don't batch multiple unrelated fixes in one run —
keep each change reviewable and low-risk for an unattended push.

## Backlog (highest priority first)

### AEO
- [ ] Add `LandingFAQ` (see `src/components/landing/LandingFAQ.tsx`) to `/pricing`, `/about`,
      and `/upgrade` — currently no FAQ/AEO content outside the homepage + 4 curricula pages.
- [ ] Audit blog posts (`src/app/blog/*`) for a direct-answer opening paragraph (first 40-60
      words should stand alone as a complete answer to the title's implicit question) — AI
      Overviews and Perplexity preferentially quote the first substantive paragraph.
- [ ] Add `HowTo` schema to a blog post that's genuinely a step-by-step guide (e.g.
      `generate-bac-libanais-chemistry`, `ib-mark-scheme-generator`) if the content structure
      supports it without forcing it.

### GEO
- [ ] Expand `public/llms.txt` — add the `/pricing` and `/upgrade` pages (currently only listed
      under "About & Pricing" as `/upgrade`; `/pricing` itself is missing), and add a one-line
      "Key facts" section (free tier terms, supported languages, curricula) so an LLM summarizing
      Imtihan from `llms.txt` alone gets the specifics right instead of inferring them.
- [ ] Check whether `robots.ts` needs to explicitly allow known AI crawlers (GPTBot,
      PerplexityBot, ClaudeBot, Google-Extended) — currently covered by the wildcard `userAgent:
      "*"` rule, which is fine, but worth a dedicated pass to confirm none of these are
      inadvertently caught by a future disallow rule as the site grows.
- [ ] `organizationSchema` (homepage) lists Facebook + LinkedIn under `sameAs` — verify these
      profiles actually exist and are live before Q3 launch; a dead `sameAs` link undermines
      entity credibility for GEO.

### Technical SEO
- [x] **2026-09-01** — Hardened `robots.ts`: `/admin`, `/scanner`, `/print`, `/analytics`,
      `/test-auth`, `/test-wysiwyg`, `/account`, `/teacher/` were crawlable by default (no
      denylist entry). All now disallowed.
- [ ] `sitemap.ts` is hand-maintained as a static array — as blog posts and landing pages grow
      this will drift out of sync. Consider generating it from the filesystem (`src/app/blog/*`)
      or a small content registry instead of a manually-updated list.
- [ ] Verify canonical URLs resolve correctly post-launch (imtihan.live vs www.imtihan.live —
      `page.tsx`'s `openGraph.url` uses `www.imtihan.live` but other pages use bare
      `imtihan.live`; pick one canonical host and make it consistent everywhere).
- [ ] Add `og:image` / `twitter:image` metadata to the 4 curricula landing pages — currently only
      the homepage (`page.tsx`) has an explicit `openGraph.images` entry.

### AEO / GEO — done
- [x] **2026-09-01** — Added `FAQPage` JSON-LD + visible Q&A (`LandingFAQ`) to all 4 curricula
      landing pages (previously zero FAQ content/schema outside the homepage).

## Notes for whoever (human or agent) picks the next item

- Never touch color values, `tailwind.config.ts`, or CSS custom properties from this file's
  workstream — that's UI-day territory and the palette is locked.
- Run `npx tsc --noEmit --skipLibCheck` after every change before committing.
- One item per run. Small, safe, reviewable diffs — this runs unattended and pushes itself.
