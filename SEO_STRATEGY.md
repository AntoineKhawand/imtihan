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
- [x] **2026-09-08** — Added `LandingFAQ` (5 items each, grounded in each page's own existing
      copy/numbers) + `FAQPage` JSON-LD to `/pricing`, `/about`, and `/upgrade`. `/pricing` and
      `/upgrade` are client-component pages, so the FAQ + schema render from their (server
      component) `layout.tsx` files after `{children}`; `/about` is already a server component so
      it's inline on the page itself, before `PublicFooter`.
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
- [x] **2026-09-18** — Fixed a real bug found by the new internal SEO audit tool
      (`npm run audit:seo`, see "Tooling" below): every blog post (all 9 static pages, the
      `/blog` index, and every dynamic post) had no `alternates.canonical` of its own, so each
      one inherited the root layout's canonical — the homepage — telling search engines every
      single post was a duplicate of `/`. Added a proper self-referencing canonical to all of
      them (`src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, and each of the 9 static
      `src/app/blog/*/page.tsx` files). `/blog` also had zero metadata at all before this (no
      title, description, or Open Graph), now fixed too.
- [x] **2026-09-01** — Hardened `robots.ts`: `/admin`, `/scanner`, `/print`, `/analytics`,
      `/test-auth`, `/test-wysiwyg`, `/account`, `/teacher/` were crawlable by default (no
      denylist entry). All now disallowed.
- [ ] `sitemap.ts` is hand-maintained as a static array — as blog posts and landing pages grow
      this will drift out of sync. Consider generating it from the filesystem (`src/app/blog/*`)
      or a small content registry instead of a manually-updated list.
- [x] **2026-09-18** — GSC's URL Inspection API showed 3 of the 4 curricula landing pages
      (`/ib-exam-generator`, `/bac-francais-exam-generator`, `/generateur-examen-bac-libanais`)
      as "URL is unknown to Google" — confirmed they were true orphan pages: present only in
      `sitemap.ts` and their own file, with zero `<Link>` references anywhere else in `src`
      (nav, footer, homepage, or each other). Sitemap-only discovery with no internal link
      equity is exactly the pattern Google deprioritizes for crawling. Linked all 3 from the
      homepage's "Supported curricula" strip (`src/app/page.tsx`), which carries the bulk of
      the site's impressions (528/546). `/ai-exam-generator-lebanon` was the 4th orphan but is
      already indexed, so left as-is; `/blog` is "Discovered — currently not indexed" (already
      linked from the footer, so this is a crawl-priority/authority issue, not a linking one —
      likely resolves as the site accrues more indexed pages).
- [x] **2026-09-18** — Picked `https://imtihan.live` (apex, no `www`) as the one canonical host:
      GSC data showed apex already carrying 528/546 impressions vs. 14 on `www`, so apex is what
      Google already treats as real. Replaced every hardcoded `https://www.imtihan.live` (31
      files — `layout.tsx`, `sitemap.ts`, `robots.ts`, every landing/blog page's `openGraph.url`
      and JSON-LD, cron/email routes) with the apex form, and added a permanent `www` → apex
      redirect in `next.config.ts` as a backstop. Still needed: confirm `NEXT_PUBLIC_APP_URL` in
      Vercel's production env is set to `https://imtihan.live` (not `www`), since that env var
      overrides the code fallback.
- [ ] Add `og:image` / `twitter:image` metadata to the 4 curricula landing pages — currently only
      the homepage (`page.tsx`) has an explicit `openGraph.images` entry. **Update 2026-09-18:**
      today's production `audit:seo` run shows this gap is wider than "4 curricula pages" —
      35 of 48 sitemap URLs are missing `og:image` (every blog post plus `/pricing`, `/about`,
      `/generateur-examen-bac-libanais`, etc.). Worth a template-level default `og:image` fallback
      rather than a per-page fix.
- [x] **2026-09-18** — Fixed stale `www` defaults left over from the apex migration
      (`7c6032c`): `scripts/lib/site-pages.mjs`'s `DEFAULT_BASE_URL`, `scripts/geo-audit.mjs`'s
      header comment + internal `document.baseURI` fallback, and `scripts/seo-audit.mjs`'s header
      comment all still said `https://www.imtihan.live`. Until fixed, `npm run audit:seo` would
      request `www`, follow Vercel's now-clean 308 to apex, then compare the *apex* page's
      `<link rel="canonical">` against the *www* URL it originally requested — a guaranteed
      canonical-mismatch false positive on every single page. All three now default to
      `https://imtihan.live`.
- [x] **2026-09-18** — Re-ran both audits against the live production apex (not localhost) after
      the founder fixed Vercel's dashboard domain settings (apex is now Production, `www` does a
      single clean 308). `npm run audit:seo`: 48/48 sitemap URLs fetched successfully, **0
      FAIL-severity issues, 0 broken internal links, and — critically — 0 canonical-mismatch
      warnings across all 48 pages** (this is the check the stale `www` default was silently
      breaking; confirms canonical tags render correctly against the real domain now). Only
      warn/info-level findings remain: meta-description length on `/about` (183 chars, over the
      165 ideal) and the pre-existing `og:image` gap noted above. `npm run audit:geo`: all 36 blog
      posts scored successfully (no fetch failures), average 44/100 — unchanged from what's
      expected given no blog-body content changes; confirms the domain fix didn't break anything
      GEO-side either. Full reports regenerated at `SEO_AUDIT_REPORT.md` / `GEO_AUDIT_REPORT.md`
      (both gitignored, not committed).
- [ ] **GSC follow-up on the 2026-09-18 www→apex domain fix — still not completed; two attempts
      now, both blocked on tool access, not data.** First attempt (earlier 2026-09-18 run) had no
      `gsc` MCP tools. This second attempt (later same day, after being told to retry) checked
      again: the tool list available in this session is still Read/Edit/Write/Bash/Grep/Glob/
      WebSearch/SubagentHandback only — no `gsc`-prefixed tools and no `chrome-devtools` tools
      present, so URL Inspection, re-crawl requests, and the Coverage report are still
      unreachable. Per the "ground every claim in data, not assumption" rule, no GSC numbers are
      reported here — none were pulled. Still outstanding, needs a run where the `gsc` MCP server
      is actually attached to the session (this looks like an environment/config gap upstream of
      the agent, not something fixable by retrying the same steps): (1) URL-inspect and request
      re-crawl on the homepage and the 3 newly-linked curricula pages (`/ib-exam-generator`,
      `/bac-francais-exam-generator`, `/generateur-examen-bac-libanais`); (2) check GSC Coverage
      for a "Redirect error" spike on 2026-09-18 (the hours the www/apex redirect loop was live)
      so it reads as a resolved transient blip, not an ongoing issue, in any future audit of this
      data.

### AEO / GEO — done
- [x] **2026-09-01** — Added `FAQPage` JSON-LD + visible Q&A (`LandingFAQ`) to all 4 curricula
      landing pages (previously zero FAQ content/schema outside the homepage).
- [x] **2026-09-08** — Added `LandingFAQ` + `FAQPage` JSON-LD to `/pricing`, `/about`, `/upgrade`.

## Tooling

Two internal audit scripts (no paid API needed — run against the live sitemap.xml, requested as
a lightweight, self-hosted equivalent to every-app/open-seo and GEO-optim/GEO's approaches
rather than adopting either directly, since one needs a paid DataForSEO key and the other is an
academic benchmark pipeline, not a tool):

- **`npm run audit:seo [baseUrl]`** (`scripts/seo-audit.mjs`) — on-page SEO basics for every URL
  in `sitemap.xml`: title/meta-description presence and length, canonical tags (self-referencing,
  not just present), single-`<h1>`, Open Graph tags, image alt text, duplicate titles across
  pages, and broken internal links. Writes `SEO_AUDIT_REPORT.md` (gitignored — regenerate, don't
  trust a stale copy) and exits non-zero on any FAIL-severity issue or broken link.
- **`npm run audit:geo [baseUrl]`** (`scripts/geo-audit.mjs`) — scores every blog post against
  signals GEO-optim/GEO's research found actually correlate with generative-engine visibility
  (citing external sources, statistics, quotations, scannable structure, FAQ schema). Writes
  `GEO_AUDIT_REPORT.md`, weakest posts first, plus a "site-wide gaps" section for anything every
  single post is missing (worth a template-level fix rather than post-by-post).

Both default to `https://imtihan.live` (the apex — canonical since 2026-09-18); pass
`http://localhost:3000` (matching whatever port `NEXT_PUBLIC_APP_URL` in `.env.local` currently
points at) to audit a local dev server instead.

## Noted while working (not fixed today — out of Tuesday's scope)

- `/pricing` advertises 100 exams/month for Pro; `/upgrade` advertises 10/month (20/month on the
  yearly plan) for the same Pro plan — a real numeric inconsistency between the two pages, not
  something introduced by today's FAQ items (the FAQ copy for each page matches that page's own
  existing numbers so it doesn't add a *third* conflicting figure). This should get reconciled to
  one true number, but that's a product/pricing decision, not a Tuesday SEO-day call — flagging
  for Antoine or a UI-day pass rather than guessing which figure is correct.

## Notes for whoever (human or agent) picks the next item

- Never touch color values, `tailwind.config.ts`, or CSS custom properties from this file's
  workstream — that's UI-day territory and the palette is locked.
- Run `npx tsc --noEmit --skipLibCheck` after every change before committing.
- One item per run. Small, safe, reviewable diffs — this runs unattended and pushes itself.
