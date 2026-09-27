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
- [x] **2026-09-19** (`content-curriculum`) — Audited all 9 static blog posts for a direct-answer
      opening paragraph (first 40–60 words standing alone as a complete answer to the post's
      implicit question). The 5 posts rewritten 2026-09-18 (`stop-recycled-exams`,
      `save-time-teaching`, `guide-for-parents`, `university-assessment-ai`,
      `lebanese-teachers-ai-exam-generator`) already opened this way — confirmed by re-reading each
      one, no changes needed. The 4 remaining posts (`exam-standardization`,
      `ib-mark-scheme-generator`, `generate-bac-libanais-chemistry`, `generate-bac-francais-devoir`)
      did not — each opened with a problem-statement or scene-setting sentence instead of an
      answer (e.g. exam-standardization's old opener was just "Educational coordination is about
      more than just managing schedules," with no actual answer). Fixed as part of the same-day GEO
      rewrite below, so this item and the GEO remediation item share one diff per post rather than
      two separate passes — see that entry for the exact before/after copy.
- [x] **2026-09-22** — Added `HowTo` schema to `generate-bac-libanais-chemistry` blog post. The
      post's "Automating the Draft in 5 Minutes" section has a natural 4-step structure (Select
      Curriculum, Input Topics, Upload Notes, Generate) perfectly suited for HowTo JSON-LD.
      Created `buildHowToSchema()` export in `src/components/landing/LandingFAQ.tsx` to follow the
      same pattern as `buildFaqSchema`, then wired it into the blog page's `<SchemaOrg>` component
      alongside Article and FAQ schemas. Improves GEO visibility for "how to generate exam" queries.

### GEO
- [x] **2026-09-19** — `public/llms.txt` had 2 false Arabic-support claims left over from
      yesterday's marketing-copy sweep (`b07e82a` didn't touch this file): the header said "in
      English, French, and Arabic" and the `/generateur-examen-bac-libanais` entry said "Supports
      French, English, and Arabic." Removed both — Arabic is explicitly deferred to v1.1 per
      `CLAUDE.md` §8/§9. Also added the missing `/pricing` entry under "About & Pricing" (was
      `/upgrade`-only) and a new "Key Facts" section stating the real free-tier terms (1 free exam
      lifetime, not monthly), supported languages (French/English only), curricula (Bac Libanais,
      Bac Français, IB, University), and subjects (Math, Physics, Chemistry) — deliberately
      phrased quota-free given the still-open `/pricing` vs `/upgrade` monthly-quota mismatch
      noted below, so this file doesn't assert a number that contradicts either page.
- [x] **2026-09-19** — Checked whether `robots.ts` needs to explicitly allow known AI crawlers
      (GPTBot, PerplexityBot, ClaudeBot, Google-Extended). Confirmed: the existing wildcard
      `userAgent: "*"` rule (with no crawler-specific disallow anywhere in the file) already
      covers all of them — no code change needed. Closing this backlog item.
- [x] **2026-09-19** — `organizationSchema` (homepage, `src/app/page.tsx`) listed
      `https://www.facebook.com/imtihan.live` and `https://www.linkedin.com/company/imtihan-lebanon`
      under `sameAs`. Verified via WebSearch before touching anything: neither URL surfaces for
      "imtihan.live facebook page" or "imtihan-lebanon imtihan.live linkedin company" — no
      evidence either profile exists. Removed both from the `sameAs` array; a dead `sameAs`
      undermines entity credibility for AI Overviews/GEO more than having none at all. If/when
      real Facebook/LinkedIn pages go live before Q3 launch, re-add them then.
- [ ] **Blocked on a decision, not a technical fix:** the 27 Firestore-backed dynamic blog posts
      (14 of them at 40/100) need the same `BlogCallout`/`BlogFAQ` treatment the 5 rewritten
      static posts got, but there's no update path for existing Firestore `blog_posts` docs
      anywhere in the app (only add-if-missing and add-new routes exist) — see the 2026-09-18
      follow-up entry below for the full trace. Needs either (a) a proper admin edit endpoint
      built by `engineering`, or (b) an explicit go-ahead to write a one-off `adminDb` script
      against production, before this can move. Also surfaces a separate, non-GEO question: an
      unattended daily cron job (`api/cron/blog-auto-publish`) is auto-publishing these with no
      review step and a rotating template producing near-duplicate titles — flagged for the
      founder, not something this run decided unilaterally.

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
- [x] **2026-09-24** — `sitemap.ts`'s 21-URL static array (hardcoded homepage, marketing/curriculum
      landing pages, `/blog` index, and the 9 static blog posts — the ~27 Firestore-backed dynamic
      posts were already queried live, not hand-maintained, and are untouched) is now generated
      instead of hand-typed. New `scripts/generate-static-routes.mjs` walks `src/app/**/page.tsx`,
      excludes authenticated/private app surfaces (mirrors `robots.ts`'s disallow list: `/admin`,
      `/api`, `/auth`, `/create`, `/dashboard`, `/bank`, `/community`, `/print`, `/scanner`,
      `/analytics`, `/test-auth`, `/test-wysiwyg`, `/account`, `/student`, `/teacher`), Next.js
      dynamic route segments (`blog/[slug]`, `exam/[id]` — need runtime data, not a static walk),
      and the two Stripe post-checkout redirect pages (`/pricing/cancel`, `/pricing/success` —
      client-only, no metadata, thin transactional content, were never in the old array either) —
      then writes a typed `STATIC_SITEMAP_ROUTES` array to `src/lib/seo/static-sitemap-routes.ts`,
      which `sitemap.ts` now imports instead of the old inline literal. Also derived
      `STATIC_BLOG_SLUGS` (used to de-dupe Firestore posts against the static ones) from that same
      generated list instead of keeping a second hand-typed slug array, closing a second,
      smaller drift risk in the same file. Wired into `predev`/`prebuild` npm scripts so it
      regenerates automatically before every dev server start and build; also runnable directly via
      `npm run generate:sitemap-routes`. **Chose build-time generation over a request-time
      `fs.readdirSync` inside `sitemap.ts`** because Next's production serverless bundles are built
      from the traced module graph, not the raw repo tree — a runtime filesystem walk over
      `src/app` isn't guaranteed to see the source files once deployed, so a plain, statically
      imported generated file is the safe option; scripts/lib/site-pages.mjs was read first per
      instructions but wasn't reusable for this direction since it *fetches* the live
      `sitemap.xml` for the audit scripts (downstream of `sitemap.ts`), not a filesystem-derived
      page list that could feed it upstream. **Verified without a dev server** (avoided per the
      "never load real Admin SDK credentials" rule and general memory-pressure caution): ran the
      generator and diffed its 21 output paths byte-for-byte against the old hardcoded array plus
      the derived blog-slug list — exact match, 0 missing, 0 unexpectedly added. `npm run
      type-check` clean. One gitignore gotcha caught before committing: the obvious output path
      `src/lib/generated/` collided with `.gitignore`'s existing bare `generated/` rule (meant for
      local test-exam output) and would have been silently untracked — moved the output to
      `src/lib/seo/static-sitemap-routes.ts` instead.
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
- [x] **2026-09-18** — Fixed the `/about` meta description length flagged by `npm run audit:seo`
      (183 chars, over the ~165-char ideal, getting truncated in Google search results). Rewrote
      `src/app/about/page.tsx`'s `metadata.description` to 162 chars — kept the same message
      (story/mission, "empower Lebanese and international educators," the Bac Libanais/Bac
      Français/IB curricula list, "save hours of prep time") but trimmed the redundant "story and
      mission" / "Discover" opener rather than truncating mid-sentence. Did not touch `og:image`
      (separate item below, being handled in parallel by `engineering`).
- [x] **2026-09-18** (`engineering`) — Fixed the 35/48-page `og:image` gap noted above.
      **Root cause** (verified with a local dev server + curl against rendered `<head>` output,
      not assumption): the root layout (`src/app/layout.tsx`) already declared a fallback
      `openGraph.images` pointing at the existing `src/app/opengraph-image.tsx`
      (`ImageResponse`-based, already on-brand — Fraunces-style serif headline, `#1a5e3f` emerald,
      cream `#faf8f3` background), but Next's metadata resolution does **not** deep-merge
      `openGraph` across route segments — a child route's own `metadata.openGraph` object fully
      *replaces* the parent's, not just the fields it sets. Every page that defined its own
      `openGraph` (for a custom per-page title/description) but didn't repeat `images` therefore
      rendered zero `og:image` tag at all, confirmed by curling `/about`, `/pricing`, `/contact`
      before the fix (no `og:image` meta in the response) — pages that omitted `openGraph`
      entirely (the 9 static `/blog/*` pages) were unaffected, since they inherit the parent's
      object untouched. Fixed by adding `images: [{ url: "/opengraph-image", width: 1200, height:
      630, alt: ... }]` to the 8 affected single-page route files (`about`, `pricing/layout`,
      `contact`, `ib-exam-generator`, `bac-francais-exam-generator`,
      `generateur-examen-bac-libanais`, `ai-exam-generator-lebanon`, `blog/page.tsx`). For
      `/blog/[slug]` (the ~27 Firestore-backed dynamic posts — the bulk of the gap), built a true
      per-post image instead of the shared fallback: `src/app/blog/[slug]/opengraph-image.tsx`
      uses the file-convention `ImageResponse` idiom, reuses the page's own `getPost(slug)` (now
      exported from `page.tsx`) to render the post's actual title + category on the same branded
      card, with a plain-fallback render if the Firestore lookup throws. Verified end-to-end
      against a local dev server: `npm run audit:seo -- http://localhost:3000` — **before: 35/48
      pages missing `og:image`; after: 0/48**, confirmed by grepping the regenerated
      `SEO_AUDIT_REPORT.md` for any `image` finding (none) and by curling both a static page
      (`/about` → `http://localhost:3000/opengraph-image`) and a live Firestore post
      (`/blog/rentre-2026-…-70s5/opengraph-image` → `200 image/png`, title rendered correctly in
      the PNG). `npm run type-check` clean. **Not done:** a per-post image for the 9 *static*
      `/blog/*/page.tsx` files (`exam-standardization`, `stop-recycled-exams`, etc.) — they
      already inherit the shared branded fallback correctly (confirmed, not missing), so this is a
      nice-to-have polish item, not a gap-closer; flagging here rather than doing it silently. QA
      should still verify this in the e2e suite before treating the social-share preview as fully
      confirmed in production (local dev + audit script only, not a real Twitter/LinkedIn/WhatsApp
      unfurl test).
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
- [~] **2026-09-27 — GSC follow-up, first run with `gsc` tools actually attached (read-only
      slice). Real numbers, `sc-domain:imtihan.live`, 28d to 2026-09-27:** 9 clicks / 554
      impressions / CTR 1.6% / avg pos 5.8. Sitemap `https://imtihan.live/sitemap.xml` (apex)
      is the only one registered: Valid, 48 URLs, 0 errors, 0 warnings, last downloaded
      2026-09-22. Page split: apex `/` = 501 impr / 9 clicks (all clicks); 9 blog/landing apex
      URLs = 2-24 impr each; only ONE `www` URL still appears (a `/blog/the-may-marathon-...-ljv6`,
      15 impr) versus 14 www impr on 2026-09-18 — i.e. www residue is ~3% of impressions, down
      from being the only other host. Daily impressions dipped 11-13/day on 09-17/18 and 3 on
      09-20 (vs ~20-25 baseline), recovering to 14-18 by 09-24: consistent with a brief transient
      around the redirect fix, not an ongoing loss. Indexing (URL Inspection):
      `https://imtihan.live/` = PASS, Submitted and indexed, last crawled 2026-09-20 (post-fix),
      Google canonical = user canonical = apex. `https://www.imtihan.live/` = "Alternate page
      with proper canonical tag" (correct, the desired outcome). `/generateur-examen-bac-libanais`
      = Crawled - currently not indexed (crawled 2026-09-21, fetch SUCCESSFUL, referring page is
      only `/`). `/ib-exam-generator` = Discovered - currently not indexed; `/bac-francais-exam-generator`
      = URL is unknown to Google (both never crawled). Stale www blog URL inspected: still
      "indexed" as the www URL, last crawled 2026-08-31 (pre-fix), Google canonical = the www URL,
      so Google has not yet re-crawled it to see the 308/canonical; expect it to consolidate on
      next crawl. Open points: (a) the two never-crawled curricula pages and the crawled-not-indexed
      one are a discovery/quality-signal problem, not a domain problem — they have only the
      homepage as an internal referrer; more internal links (blog posts, footer) would help;
      flag to `content-curriculum`/`engineering` if wanted. (b) Requesting re-crawl and reading
      the Coverage "Redirect error" report are not possible with read-only API tools (URL
      Inspection API has no request-indexing method; Coverage report isn't in the API) — a human
      needs to click "Request indexing" in the GSC UI for the 3 curricula URLs + confirm no
      Redirect-error rows. (c) Vercel `NEXT_PUBLIC_APP_URL` check remains a human item.
      Prior history: this item was blocked 4 runs on tool access, not data.
      (Original note follows.) — GSC follow-up on the 2026-09-18 www→apex domain fix — still not completed; now 4 runs
      blocked on tool access, not data. Stop retrying — this needs the `gsc` MCP server actually
      attached to the session, not another same-step retry.** 2026-09-18 (run 1): no `gsc` tools.
      2026-09-18 (run 2, after being told to retry): checked again, still absent. An unlogged run
      3 also found it absent (per the orchestrator's count going into tonight). 2026-09-19 (run 4,
      this run, checked first thing as instructed): tool list available this session is still
      Read/Edit/Write/Bash/Grep/Glob/WebSearch/SubagentHandback only — no `gsc`-prefixed tools and
      no `chrome-devtools` tools present, so URL Inspection, re-crawl requests, and the Coverage
      report are still unreachable. Per the "ground every claim in data, not assumption" rule, no
      GSC numbers are reported here — none were pulled, and no fix in tonight's 3 items relied on
      GSC data (llms.txt/sameAs/robots were verifiable via repo state + WebSearch alone). This is
      an environment/config gap upstream of the agent — needs someone to fix the tool attachment
      before the next run, not another retry. Once connected: (1) URL-inspect and request
      re-crawl on the homepage and the 3 newly-linked curricula pages (`/ib-exam-generator`,
      `/bac-francais-exam-generator`, `/generateur-examen-bac-libanais`); (2) check GSC Coverage
      for a "Redirect error" spike on 2026-09-18 (the hours the www/apex redirect loop was live)
      so it reads as a resolved transient blip, not an ongoing issue, in any future audit of this
      data.

### AEO / GEO — done
- [x] **2026-09-01** — Added `FAQPage` JSON-LD + visible Q&A (`LandingFAQ`) to all 4 curricula
      landing pages (previously zero FAQ content/schema outside the homepage).
- [x] **2026-09-08** — Added `LandingFAQ` + `FAQPage` JSON-LD to `/pricing`, `/about`, `/upgrade`.
- [x] **2026-09-18** (`content-curriculum`) — Re-ran `npm run audit:geo` (re-verified, not
      trusted from an earlier same-day run by `seo-growth`): confirmed 36/36 posts, average
      44/100, same two site-wide gaps as before (`quotations` and `faq-schema` at 0/36).
      Root-caused `quotations`: `BlogCallout` (used on all 9 static `/blog/*` posts) rendered its
      testimonial as a styled `<p>`, not a semantic `<blockquote>` — fixed once at the template
      level (`src/components/blog/BlogCallout.tsx`), which alone lifted 4 untouched static posts
      (`exam-standardization`, `ib-mark-scheme-generator`, `generate-bac-libanais-chemistry`,
      `generate-bac-francais-devoir`) by 15 pts each with no content edits. Built a new
      `src/components/blog/BlogFAQ.tsx` (visible in-article Q&A, paired with `buildFaqSchema`
      from `src/components/landing/LandingFAQ.tsx` + `<SchemaOrg>` for `FAQPage` JSON-LD) and
      rewrote the 5 lowest-scoring posts — `university-assessment-ai` (10→100),
      `lebanese-teachers-ai-exam-generator` (10→100), `stop-recycled-exams` (25→100),
      `save-time-teaching` (25→100), `guide-for-parents` (25→100) — adding a direct-answer
      opening paragraph, 600+ words of expanded but factually-grounded copy (no invented
      curriculum chapters, subjects, or user-count stats — stayed inside Math/Physics/Chemistry,
      French/English, and the free-form University model per `CLAUDE.md` §9 and
      `docs/DATA_SOURCING.md`), a real bullet/numbered list, a real external citation per post
      (OECD's 2024 TALIS report on teacher workload, Roediger & Karpicke's testing-effect
      research via retrievalpractice.org, CRDP's official Lebanese exam archive, and Biggs'
      1996 constructive-alignment paper — all verified via WebSearch before citing, not assumed),
      and a 3-item FAQ (visible + JSON-LD) per post. Verified locally (`npm run audit:geo
      http://localhost:3000` — production hasn't been deployed with this change yet, so
      `https://imtihan.live` still shows the pre-fix 44/100 average until the next deploy): all 5
      target posts now 100/100, the 4 BlogCallout-only posts at 40/40/55/55 (up from 25/25/40/40),
      and all 27 untouched dynamic (Firestore) posts scored identically to the pre-fix baseline —
      **local average across all 36 posts: 57/100, up from 44/100, with zero regressions.**
      `npx tsc --noEmit --skipLibCheck` clean. **Not done, flagged for a future pass:** the 27
      Firestore-backed dynamic posts (`src/app/blog/[slug]/page.tsx`) still render zero
      blockquotes and no FAQ schema — `BlogCallout`/`BlogFAQ` aren't used in the Markdown-rendered
      dynamic template, so this fix doesn't reach them; the 4 posts above only got the
      `quotations` signal free from the template fix and still lack `citations`, `lists`, and
      `faq-schema` — same treatment (real citation + FAQ) would need per-post content work, not
      another template fix, since their bodies are still very thin (89–309 words).
- [x] **2026-09-18** (`content-curriculum`, follow-up pass) — Re-ran `npm run audit:geo` fresh
      (didn't trust the earlier same-day summary above): confirmed live `https://imtihan.live`
      now shows the 5 rewritten static posts at 100/100 and the 4 template-fix-only posts at
      40/40/55/55, matching what was previously verified only locally — **36 posts, average
      57/100**, so that deploy is confirmed live. Went looking for the lowest-scoring *dynamic*
      (Firestore-backed) posts to give them the same real-content treatment (`BlogCallout`
      testimonial + `BlogFAQ`/`FAQPage`), per the follow-up flagged above. **Blocked, not
      attempted — reporting instead of improvising a write path:** traced
      `src/app/blog/[slug]/page.tsx`'s `getPost()` to Firestore's `blog_posts` collection, and
      the 27 dynamic posts (14 of them scoring 40/100, the lowest in the whole audit) turn out to
      be entirely auto-generated by an unattended daily cron job
      (`src/app/api/cron/blog-auto-publish/route.ts`) that prompts Gemini for a new post from
      scratch and calls `adminDb.collection("blog_posts").add(...)` directly — no admin UI, no
      draft/review step. The only other Firestore-touching routes are
      `src/app/api/admin/blog/seed/route.ts` (add-if-slug-missing, and only for 3 hardcoded
      legacy posts, not any of the 27) and `.../diag/route.ts` (read-only). **There is no update
      path for an existing post's content anywhere in the app** — editing one of the 27 would
      mean a one-off script calling `adminDb` directly against the live production project
      (`imtihan-app`, real service-account creds already in `.env.local`, no emulator configured),
      with no review/diff/rollback mechanism. That's a direct, unreviewable production data
      mutation, which is exactly the case this task's own instructions say to stop and report
      rather than improvise — so no dynamic post content was changed this run. **Numbers below are
      before-only** (2026-09-18, no after state exists yet): the 14 dynamic posts at 40/100 are
      `exam-standardization`, `ib-mark-scheme-generator`, and 12 of the cron-generated posts
      (`the-final-countdown-navigating-the-may-19th-pressure-peak-in-lebanese-schools-hfda`,
      `the-final-sprint-navigating-lebanons-highstakes-exam-season-with-ai-precision-lhi4`, and 10
      more sharing the same "May exam season urgency" template — see `GEO_AUDIT_REPORT.md` for
      the full list) — all missing `citations`, `quotations`, and `faq-schema`, several also
      missing `depth` (as low as 89 words). **Separately worth flagging** (not a GEO fix, a
      product/editorial question for the founder): this cron job publishes AI-generated posts to
      production completely unsupervised, on a rotating "exam-season-urgency" template — the
      2026-09-18 audit shows at least a dozen near-duplicate titles ("the-may-countdown...",
      "the-final-sprint...", "the-may-sprint...") that read as thin content-farm output rather
      than editorial posts, and the slug-generation regex
      (`title.toLowerCase().replace(/[^\w ]+/g, "")`) silently strips accented characters, so
      titles mentioning "Bac Français" produce slugs like `...bac-franais...`. Recommend either
      pausing the cron job or adding a review/approval step before more of these publish — flagged
      here rather than acted on, since disabling a scheduled production job is a business call,
      not a content edit.
- [x] **2026-09-19** (`content-curriculum`) — Finished GEO remediation on the 4 template-fix-only
      static posts left at 40/40/55/55 by the 2026-09-18 pass:
      `exam-standardization`, `ib-mark-scheme-generator`, `generate-bac-libanais-chemistry`,
      `generate-bac-francais-devoir`. Same recipe as the 5 posts already at 100/100: a
      direct-answer opening paragraph, a real WebSearch-verified external citation, a
      bullet/numbered list, and a `BlogFAQ`/`FAQPage` block, plus expanding all 4 posts past the
      600-word depth threshold (all 4 were under 600 words pre-edit — 96/277/321/294 words
      respectively — not just the 2 lowest-scoring ones as initially assumed; verified by
      replicating `scripts/geo-audit.mjs`'s exact scoring logic in a local harness before editing,
      see verification method below). Real citations used, each WebSearch-verified before citing:
      CAEP's (Council for the Accreditation of Educator Preparation) definition of inter-rater
      reliability for `exam-standardization`; the IB's own "Diploma programme assessment" page
      (`ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/`)
      for `ib-mark-scheme-generator`; CRDP's official Lebanese exam archive (already verified live
      in `guide-for-parents`, reused as it's directly relevant) for `generate-bac-libanais-chemistry`;
      and the French Ministry's official note de service defining the Terminale spécialité
      Physique-Chimie exam structure since 2021 (`education.gouv.fr/bo/20/Special2/MENE2001798N.htm`)
      for `generate-bac-francais-devoir`.
      **Two real curriculum-accuracy bugs found and fixed while rewriting, not left in the new
      copy:** `generate-bac-libanais-chemistry`'s old copy claimed "chemical equilibrium" as a
      dense Bac Libanais chemistry topic — grepped `src/data/curricula/bac-libanais.ts` and
      confirmed no such chapter/objective exists anywhere in the file for Chemistry (only chemical
      kinetics at Première, and acid-base/pH titration + organic chemistry at Terminale); the claim
      was quietly wrong and has been removed, replaced with the topics that actually exist in the
      curriculum data. Separately, `generate-bac-francais-devoir`'s old copy said Terminale
      spécialité Physique-Chimie DS should cover "la thermodynamique" — grepped
      `src/data/curricula/bac-francais.ts`'s `terminale-fr-spe-pc` chapter list and confirmed there
      is no "Thermodynamique" chapter (the closest real one is "Énergie — conversions et
      transferts"); replaced the claim with the real chapter names (mécanique, énergie, ondes et
      signaux, équilibres chimiques, cinétique chimique, chimie organique). Both fixes are a direct
      application of `CLAUDE.md` §4 ("any curriculum chapter the AI references MUST exist in
      `src/data/curricula/`") to blog copy, not just app-generated exams — a blog post asserting a
      curriculum topic that doesn't exist in the data is the same hallucination risk in a different
      surface. **Verification method, given the "no dev server" constraint tonight:** rather than
      running `next dev` under memory pressure, replicated `scripts/geo-audit.mjs`'s exact scoring
      logic (word count, external-link count, stat regex, blockquote/list/heading counts, FAQPage
      JSON-LD detection) in a standalone Node+jsdom script, fed it the literal article HTML for the
      current (pre-edit) and proposed (post-edit) copy, and confirmed the harness reproduced the
      live 40/40/55/55 baseline exactly before trusting it to score the rewrites — all 4 rewrites
      scored 90/100 on every non-schema signal (the harness can't render the real `<SchemaOrg>`
      JSON-LD, so `faq-schema` shows as a false FAIL in the harness only; the real pages use the
      identical `SchemaOrg`+`buildFaqSchema` pattern already confirmed live at 100/100 on the other
      5 posts). **Ran `npm run audit:geo` against production afterward** as instructed — it still
      shows the pre-edit 40/40/55/55 scores, because this change hasn't been deployed yet (same
      situation the 2026-09-18 entry above hit); production won't reflect these until the next
      deploy. `npx tsc --noEmit` (full `npm run type-check`) clean.

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
