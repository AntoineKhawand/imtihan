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
- [~] **2026-09-27 — the "blocked on a decision" reason above is stale; re-checked, not assumed.**
      Re-ran `npm run audit:geo` against production first (not trusting the old "14 at 40/100"
      count): only **9** dynamic posts are still at 40/100 today (the other 5 the original count
      included — `the-final-countdown-navigating-the-may-19th…`, `the-final-sprint-navigating-
      lebanons-highstakes…`, `the-may-sprint-how-lebanese-educators…`, and 2 others — are now at
      100/100 or 60-75/100, most likely via the 2026-09-23/24 BUG-029 content-recovery rewrites;
      average across all 37 posts in the sitemap is now 67/100, up from 44/100 at the last
      full audit). Then read `src/app/admin/page.tsx` + `src/app/api/admin/blog/[id]/route.ts`
      directly rather than trusting the 2026-09-20 00:40 `TEAM_CHAT.md` entry secondhand:
      confirmed `GET`/`PATCH /api/admin/blog/[id]` is real, admin-auth-gated, Zod-validated
      (`BlogPostUpdateSchema`), and **can edit an existing post's `content` field** — so engineering
      already closed the "no update path exists" blocker (this was in fact resolved 2026-09-20,
      just never reflected back into this doc). Better still: `src/app/blog/[slug]/page.tsx`
      already has an `extractFaqSection()` convention wired in (a trailing `## Frequently Asked
      Questions` heading with `**Q: …**` pairs in the `content` markdown renders as a real
      `<BlogFAQ>` block *and* `FAQPage` JSON-LD via `buildFaqSchema` — no per-post code change
      needed, purely a content edit through the existing PATCH endpoint). `BlogCallout` (the
      blockquote-testimonial component) is **not** wired into the dynamic template at all, only
      `BlogFAQ` is — so FAQ, not a fabricated testimonial, is the correct/only treatment available
      for these posts, which also sidesteps the fabricated-persona/testimonial problem `marketing`
      already flagged elsewhere in this codebase.
      **Picked the highest-priority post using real GSC data, not just the lowest GEO score:**
      pulled `page`-dimension search analytics (2026-08-01→2026-09-27) for all 9 candidates —
      8 of the 9 have **zero impressions** in the last ~2 months; the one exception,
      `the-may-sprint-engineering-perfection-in-lebanese-exams-without-the-burnout-sx7l`, has 3
      impressions at position 6.7, and URL Inspection confirms it's genuinely indexed (`PASS`,
      `Submitted and indexed`, last crawled 2026-09-22) — the only one of the 9 actually
      surfacing in real search right now. **Drafted a grounded 3-item FAQ** for that post (pulled
      its live rendered content via `WebFetch` first so nothing is invented — the 3 Qs restate
      only what the post already says: multi-curricula support in one generator, AI-generated
      diagrams for physics/biology, and coordinator-level standardization across sections; no new
      stats or claims added):
      ```
      ## Frequently Asked Questions

      **Q: Can Imtihan generate exams for the Bac Libanais, Bac Français, and IB from one tool?**
      Yes. The platform handles three distinct pathways in the same generator: CRDP-aligned Bac
      Libanais assessments, French Baccalauréat-style document-based studies and essays, and
      IB Diploma-style questions using command terms like "Analyze" and "Evaluate." You choose the
      curriculum and level when describing the exam, and Imtihan grounds the questions in that
      track's own requirements instead of a generic template.

      **Q: Does Imtihan generate diagrams for physics and biology questions, not just text?**
      Yes. Alongside the exam text, Imtihan produces diagrams — physics circuits and labeled
      biological illustrations — aligned to each exercise's curriculum context, so teachers don't
      have to source or hand-draw figures separately during a busy exam season.

      **Q: Can department heads use Imtihan to standardize exams across multiple class sections?**
      Yes. Coordinators can set the same complexity level, chapter coverage, and time limit when
      generating exams for parallel sections, keeping the assessment consistent across sections
      instead of each teacher writing their own version.
      ```
      **Not applied this run — a narrower blocker than before, and stated plainly rather than
      worked around:** this dispatch has no `chrome-devtools` tool attached (same
      dispatch-configuration gap `qa` hit on 2026-09-27 testing Version B — full mutating `gsc`
      tools were present, so this reads as an interactive session, but no browser tool came with
      it), so there's no way to drive the real `/admin` UI end-to-end. The only other path would
      be calling `PATCH /api/admin/blog/[id]` directly with a real authenticated request, which
      needs a real admin Firebase ID token — obtaining one without an interactive browser login
      means either minting a token from service-account credentials or hand-authenticating via a
      script, both of which are exactly the "never call a real production API route/handler
      directly or use real Admin SDK credentials from a script" rule this codebase already got
      burned by twice (BUG-029, the QA Pro-tier incident). **Did not do either** in that dispatch.
      **Applied in a follow-up interactive session, same day:** verified the drafted FAQ against
      the post's live rendered content directly (independent re-check, not just trusting the
      draft), then applied it through the real `/admin` → Blog → "Manage Existing Posts" panel
      (already-authenticated admin session in the browser) — appended verbatim to the end of the
      post's `content`, saved ("Post updated" confirmed), and verified live on
      `imtihan.live/blog/...-sx7l`: renders as a real `<BlogFAQ>` component (confirmed via
      accessibility tree — a labeled "Frequently asked questions" region, not just raw markdown
      text), so the `FAQPage` JSON-LD fired too. Re-ran `npm run audit:geo` against production:
      this post moved from **40/100 to 70/100**; site-wide average ticked up from 67 to 68 across
      37 posts. Re-flagging the cron-job editorial-review question from the original entry below
      is unchanged and still stands.
- [~] **2026-10-02 — continued the 40/100 dynamic-post FAQ remediation (nightly run, `gsc` tools
      confirmed absent as expected; `chrome-devtools` was NOT actually usable this session despite
      the dispatch note claiming it was connected — see below).** Re-ran `npm run audit:geo` against
      production first rather than trusting the 2026-09-27 `GEO_AUDIT_REPORT.md` (5 days stale, and
      the blog-auto-publish cron adds new posts daily): 38 posts now in the sitemap (was 37),
      average 68/100 (unchanged). **9 posts are at 40/100 today** — not the same 9 as 2026-09-27
      (that cohort's `...-sx7l` is now the only one above 40, fixed to 70/100; the cron has since
      generated new near-duplicate "May countdown/sprint" posts that replaced the others in the
      40/100 band): `precision-under-pressure-master-the-may-revision-sprint-with-imtihan-27p8`,
      `the-final-30-days-how-lebanons-top-educators-are-mastering-the-2026-exam-season-1b3z`,
      `the-final-sprint-navigating-the-2026-exam-season-with-imtihans-precision-ai-hayn`,
      `the-may-countdown-elevating-lebanese-exam-standards-in-the-age-of-ai-dm3l`,
      `the-may-countdown-master-the-lebanese-bac-french-bac-and-ib-with-aiprecision-zd5d`,
      `the-may-countdown-mastering-lebanons-official-exams-and-university-entrances-with-imtihan-wuz8`,
      `the-may-countdown-mastering-the-final-sprint-for-the-bac-libanais-ib-and-bac-franais-with-imtihan-umb9`,
      `the-may-countdown-precisionengineering-the-2026-lebanese-exam-season-dkbg`,
      `the-may-squeeze-turning-exam-anxiety-into-peak-performance-with-imtihan-yyb4`.
      **Selection signal, stated honestly:** no GSC data available tonight (as expected), and
      grepped all of `src/` for every one of the 9 slugs — zero internal links to any of them from
      anywhere in the app (expected; these are Firestore-only dynamic posts, never hardcoded-linked
      like the curricula landing pages), so the "prefer one with internal links" tiebreaker the task
      suggested doesn't actually differentiate any of the 9. Picked
      **`precision-under-pressure-master-the-may-revision-sprint-with-imtihan-27p8`** purely because
      it's first alphabetically among the 9 — no stronger signal was available, logging this plainly
      rather than inventing one.
      **Drafted a grounded 3-item FAQ**, after pulling the post's actual live rendered content via
      `WebFetch` (not inventing anything — restates only claims already in the post's body: CRDP-aligned
      Bac Libanais generation, Bac Français/IB diagrams + command-term awareness, university entrance
      MCQ sets, and coordinator-level standardization):
      ```
      ## Frequently Asked Questions

      **Q: Can Imtihan generate exams for the Bac Libanais, Bac Français, IB, and university entrance exams in one tool?**
      Yes. The platform covers Bac Libanais exams aligned to CRDP/Ministry of Education standards,
      Bac Français and IB assessments with diagrams and command-term-aware questions (Analyze,
      Evaluate, Describe), and MCQ-style practice sets modeled on the pace of university entrance
      exams for schools preparing students for AUB, LAU, USJ, and Lebanese University admissions.

      **Q: Does Imtihan generate diagrams for Bac Français and IB exams, not just text questions?**
      Yes. Teachers can request specific, labeled diagrams — such as a circuit for Physics —
      generated to meet the visual standards expected in the Épreuves Terminales and IB Paper 1 & 2,
      instead of sourcing or hand-drawing figures separately.

      **Q: Can department heads and coordinators use Imtihan to standardize mock exams across multiple class sections?**
      Yes. Coordinators can set a standardized exam template across an entire grade level, so every
      section is measured against the same rigor and benchmark during the May revision period —
      addressing the "Horizontal Consistency" challenge the post itself describes for Department
      Heads.
      ```
      **Deliberately left out of the FAQ, flagging instead of amplifying:** the post's own body
      (not written by me, pre-existing cron output) lists "Life Sciences (SVT)" as a generated
      subject — per `CLAUDE.md` §8/§9, Biology/SVT is explicitly deferred to v1.1, not MVP scope.
      This looks like a real curriculum-accuracy bug in the live post, same class as the 2 real
      bugs `content-curriculum` found and fixed in static posts on 2026-09-19 — but fixing blog-post
      body copy is `content-curriculum`'s domain, not mine, so I didn't touch the post body and
      didn't let my FAQ repeat or reinforce the SVT claim. Flagging here for `content-curriculum`
      (same cron-output-accuracy pattern, this time in a dynamic/Firestore post rather than a
      static one).
      **Not applied this run — tool was denied, not absent, worth distinguishing from every prior
      "not attached" entry in this doc:** the dispatch note for tonight said `chrome-devtools`
      tools were "genuinely connected this session (unlike recent nights)." Tested directly before
      assuming that was true: `mcp__chrome-devtools__list_pages` and `mcp__chrome-devtools__new_page`
      both returned an explicit **permission-denied** error (not "no such tool," not a connection
      timeout) — a different failure mode than every previous "absent/not attached" entry in this
      file (2026-09-29/09-30/10-01). Did not attempt to route around it (e.g. via `curl`/a script
      hitting `PATCH /api/admin/blog/[id]` directly) — that path is explicitly banned per
      `CLAUDE.md` §15/BUG-029 regardless of how narrow the gap looks. **The FAQ above is drafted and
      ready to paste into the `/admin` → Blog → "Manage Existing Posts" panel for the
      `...-27p8` post** by whoever next has a real, permitted `chrome-devtools` session (or by a
      human directly) — same ready-to-apply handoff shape as the 2026-09-27 precedent. No before/after
      GEO score to report since nothing was applied; current score for this post remains **40/100**.

### Technical SEO
- [ ] **2026-10-08 (founder-reported snapshot — not yet independently re-pulled via `gsc`
      tools this session; `gsc` has failed to connect most sessions recently, see the
      2026-10-01 entry below) — 4 real action items from the founder's own GSC/GA4 numbers.**
      Reported: GSC clicks 8 (was 4), impressions 198 (was 136), CTR 4% (was 2.9%), avg
      position 6.4. **These look like a shorter window (likely 7-day) than the 28-day figures
      this doc has been tracking (18/584/3.08%/5.8 as of 2026-10-05)** — whoever picks this up
      should pull a fresh `gsc` snapshot (both 7d and 28d) if the tool connects, to reconcile
      rather than treat the founder's numbers as a direct replacement for the tracked 28-day
      baseline. GA4: 67 users (+43%), 70 sessions (+21%), 54% engagement, **0 key events**.
      Channels: Direct 52, Organic Search 6, Social 5. Top queries, none with a single click
      yet: `imtihan` (17 impr, pos 8.4), `ib test maker` (11 impr, pos 6.7), `imtihan en
      francais` (7 impr, pos 9).
      **Action 1 — rewrite a blog post's title + meta description for CTR** (37 impressions,
      0 clicks, per the founder; he didn't name the specific post). First step: identify which
      post via `get_search_by_page_query` (or equivalent) if `gsc` connects — don't guess. Then
      rewrite title/meta with a clear, specific call to action, same pattern as the existing
      AEO/GEO copy work logged above.
      **Action 2 — strengthen two on-topic landing pages losing ground:**
      `/generateur-examen-bac-libanais` (`src/app/generateur-examen-bac-libanais/page.tsx`,
      current title `"Générateur d'Examen Bac Libanais IA | Imtihan"`) — this is a real
      **regression**, not just a low number: the 2026-10-05 entry above logged "bac libanais"
      at position **5**; the founder now reports **8.6**. Needs on-page work (content depth,
      internal links, schema) — content-curriculum is already separately auditing this exact
      page's underlying curriculum data (see `CURRICULUM_COVERAGE_STRATEGY.md`'s
      bac-libanais.ts item), so coordinate rather than duplicate.
      `/bac-francais-exam-generator` (`src/app/bac-francais-exam-generator/page.tsx`, current
      title `"Générateur de Devoir Bac Français | Imtihan"`) for `imtihan en francais` (pos 9,
      7 impressions, 0 clicks) — title/meta don't contain that exact phrase; consider working
      "en français" into the title or an on-page heading since that's literally the query.
      **Action 3 — push `/ib-exam-generator`** (`src/app/ib-exam-generator/page.tsx`, current
      title `"IB Exam Generator: Chemistry & Physics | Imtihan"`), the best performer (`ib test
      maker`, pos 6.7, 11 impressions) but still 0 clicks — same CTR-copy treatment as Action 1,
      plus it's the best candidate for extra internal links from other pages (feed link equity
      to the page already closest to ranking).
      **GA4 "0 key events" is NOT a missing-code problem** — `sign_up` (fires on both
      password and Google registration, `src/app/auth/register/page.tsx`) and `exam_generated`
      (fires on exam-creation completion, `src/app/create/generate/page.tsx`) are both already
      instrumented via `src/lib/analytics.ts` (measurement ID `G-7DZ1T3P599`), with unit test
      coverage in `src/__tests__/analytics.test.ts`. "0 key events" almost certainly means these
      events aren't marked as **Key events** in the GA4 Admin console itself (Admin → Events →
      toggle "Mark as key event") — a dashboard setting only the founder can make, not a
      nightly-dispatchable code task. Logged as a founder action in `FOUNDER_DECISIONS.md`
      instead of assigned here.
- [x] **2026-10-05 — `METRICS.md`/`CEO_OPERATING_PLAN.md` GSC refresh (real duty going forward,
      not a one-off; see standing-cadence note below).** `gsc` tools attached and worked cleanly
      this session. Real 28d numbers: 18 clicks / 584 impressions / 3.08% CTR / avg pos 5.8 (was
      9/554/1.6%/5.8 at the 2026-09-27 baseline — clicks and CTR roughly doubled, position flat).
      `batch_url_inspection` on the same 9 tracked pages: **6 of 9 now indexed** (was 1 of 9
      confirmed) — the 3 landing pages that had manual re-indexing requested 2026-09-28/30
      (`/generateur-examen-bac-libanais`, `/ib-exam-generator`, `/bac-francais-exam-generator`) are
      all now PASS/"Submitted and indexed" (crawled 2026-09-28), and each is already pulling real
      on-topic non-brand query impressions that didn't exist before ("bac libanais" pos 5, "ib test
      maker" 9 impr, "imtihan en francais"). This is a genuine, detectable result from both the
      2026-09-30 footer-linking fix and the manual indexing requests — not just a status-field
      flip. `/pricing`, `/about`, `/blog` are all still "URL is unknown to Google," never crawled,
      over a week after the `/about`/`/pricing` footer-link fix (2026-09-27) shipped — that fix has
      **not** produced a detectable change yet, unlike the landing-page fix. Action taken:
      resubmitted `sitemap.xml` (50 URLs, 0 errors) via `gsc` tools to nudge a re-crawl of those 3;
      if still unindexed next check, a human needs to click Request Indexing in the GSC UI for
      them specifically (same lever that worked for the landing pages — the API has no
      request-indexing method). GA4 numbers were **not** refreshed — no GA4 MCP tool is available
      in this environment at all, so `METRICS.md`'s GA4 rows stay at their 2026-09-28 values,
      explicitly marked stale. Full detail in `METRICS.md`'s "Traffic & acquisition" table and
      `CEO_OPERATING_PLAN.md` §2/§7.
      **Standing cadence, going forward:** this GSC refresh (performance overview + indexing check
      on the same tracked pages) should run **weekly**, not nightly and not ad-hoc. A near-zero-
      traffic pre-launch site's real numbers don't move meaningfully day-to-day (today's 28-day
      aggregate barely shifted from a week-old baseline even with a real indexing win behind it),
      so a nightly check would mostly just re-confirm the same number at the cost of a dispatch —
      weekly is enough to catch real movement (like the landing-page indexing flip above) without
      wasting runs. Whoever schedules this should treat "pull GSC numbers, update `METRICS.md`
      and `CEO_OPERATING_PLAN.md`, check indexing on the same tracked page set, resubmit sitemap or
      flag for manual Request-Indexing if any tracked page is still stuck" as one recurring
      backlog item, not something that needs re-proposing each time.
- [~] **2026-10-01 — 3rd of the last 4 nightly runs blocked on the same GSC tool-attachment gap
      (2026-09-29, 2026-09-30, now today; 2026-09-27/09-28 were the only 2 that worked).** Checked
      tool availability first, as instructed: zero `mcp__gsc__*` tools of any kind are present in
      this session's toolset (not erroring, simply absent — identical failure mode to 09-29/09-30,
      not the 09-27/09-28 pattern where calls succeeded). This session's own MCP connection check
      also reported `gsc` and `chrome-devtools` both timing out at session start, consistent with
      the absence. **No GSC numbers pulled or reported — 2026-09-27's 9 clicks / 554 impressions /
      CTR 1.6% / avg pos 5.8 (28d) remains the last-known-real baseline**, not re-logged as fresh
      data. Did the same non-GSC fallback as 09-29/09-30 via `WebFetch`:
      - All 3 previously not-indexed curricula pages (`/bac-francais-exam-generator`,
        `/generateur-examen-bac-libanais`, `/ib-exam-generator`) still render correctly — title/H1
        match target queries, unchanged — and all 3 still carry the "Exam generators" footer link
        row cross-linking each other, matching the 2026-09-30 confirmation.
      - `sitemap.xml`: all 3 curricula pages still present. One caveat worth flagging rather than
        asserting as a regression: `WebFetch`'s own count this session read **47** URL entries vs.
        the 48 recorded in every prior baseline — `WebFetch` summarizes fetched content through a
        model rather than returning a raw byte-exact count, so a single off-by-one from this tool
        isn't reliable evidence of an actual sitemap change (no `<url>` entries were individually
        diffed). Flagging for whoever next has either `gsc` tools or a way to fetch the raw XML
        directly (e.g. `curl`) to confirm the real count rather than trusting either number as-is.
      - `robots.txt`: unchanged disallow list (`/create`, `/dashboard`, `/bank`, `/community`,
        `/auth/`, `/api/`, `/admin`, `/scanner`, `/print`, `/analytics`, `/test-auth`,
        `/test-wysiwyg`, `/account`, `/teacher/`) — none of the 4 landing pages or `/blog` blocked.
      **Net: everything checkable without `gsc` is confirmed correct and live**; **whether Google
      has actually re-crawled/flipped any of the 3 pages to indexed is still unknown** — needs live
      `batch_url_inspection`, unreachable again this session. No code changes made. This is now the
      3rd distinct run this week hitting "tool present in agent frontmatter/CLAUDE.md but not
      actually attached to the session" (also hit `qa`, `design`, `content-curriculum` on other
      dates per `TEAM_CHAT.md`) — looks like a persistent provisioning-layer issue, not one-off
      flakiness; worth an interactive-session check of `scripts/nightly-ops.ps1`'s `gsc`/
      `chrome-devtools` grant and the underlying MCP server's health before assuming the next run
      will have it. Next run with working `gsc` tools: treat 2026-09-27 as the last real baseline
      and prioritize (1) `batch_url_inspection` on the 3 curricula pages, (2) a fresh 28d aggregate
      to compare against 554 impr/9 clicks, (3) query/position check on the `...-sx7l` FAQ post.
- [~] **2026-09-30 — direct continuation of the 2026-09-29 GSC health check, still blocked the same
      way.** Checked tool availability first, as instructed: this session's tool list is
      Read/Edit/Write/Bash/Grep/Glob/WebSearch/WebFetch only — no `mcp__gsc__*` tool of any kind is
      present (not even listed to try and fail; they're simply absent from the toolset), so
      `get_search_by_page_query`/`batch_url_inspection`/etc. were never attempted as live calls —
      there's nothing to invoke. This is the identical failure mode as 2026-09-29 (also "zero gsc
      tools attached"), not the 2026-09-27/09-28 pattern (tools present, calls succeeded). Per this
      doc's own rule ("ground every claim in data, not assumption"), **no GSC numbers are reported
      below, and 2026-09-27's 9 clicks / 554 impressions / CTR 1.6% / avg pos 5.8 (28d) remains the
      last-known-real baseline** for whoever runs next with working tools — NOT the 2026-09-28
      per-page-query pull (that was a narrower, page-scoped query, not a comparable aggregate).
      **Did the same non-GSC fallback as 2026-09-29, but went further** (confirmed the fix is live,
      not just deployed):
      - `WebFetch`'d all 3 previously not-indexed curricula pages directly
        (`/bac-francais-exam-generator`, `/generateur-examen-bac-libanais`, `/ib-exam-generator`):
        all 3 render correctly (title/H1 match their target queries, unchanged from 2026-09-28's
        on-page check) and all 3 now genuinely carry the 2026-09-28 `PublicFooter.tsx` "Exam
        generators" link row in their own rendered footer (Bac Libanais / Bac Français / IB
        Diploma / Lebanon AI Generator, all 4 as `<a href>`s) — confirms the footer fix isn't just
        present on other pages, it's present on these 3 pages themselves too, i.e. now
        cross-linking each other, not just receiving inbound links from elsewhere.
      - `WebFetch`'d `sitemap.xml`: still 48 URLs, all 3 curricula pages present (unchanged from
        baseline — ruling out an accidental sitemap regression as an alternative explanation if
        indexing hasn't moved).
      - `WebFetch`'d `robots.txt`: unchanged disallow list, none of the 4 landing pages or `/blog`
        blocked.
      - Re-verified the `...-sx7l` FAQ post (2026-09-27's applied fix): the visible 3-Q&A FAQ
        section is still live, and its own footer also now has the "Exam generators" row.
      - Tried `WebSearch` with `site:imtihan.live` queries for these pages as a cheap indirect
        indexing signal, explicitly **not trusting the result**: it returned GitHub PR pages and
        generic unrelated content, not real Google-index results — this tool doesn't reflect actual
        Google indexing status, so it's logged here only to save a future run from trying the same
        dead end, not as evidence either way.
      **Net: everything checkable without `gsc` is confirmed correct and live** (deploy + on-page +
      sitemap + robots all clean); **whether Google has actually re-crawled and flipped any of the 3
      pages to indexed is still unknown** — that requires live URL Inspection, which remains
      unreachable this session. No code changes made (nothing broken was found to fix). Tool
      attachment for `gsc` has now failed 2 of the last 3 nightly runs (09-29, 09-30) after working
      on 09-27/09-28 — this reads as a real regression in `scripts/nightly-ops.ps1`'s `gsc` grant (or
      the underlying MCP server's availability), not routine flakiness; worth an interactive-session
      check of the tool-attachment config before assuming the next unattended run will have it
      either. Next run with working `gsc` tools should still treat 2026-09-27 as the last real
      baseline and prioritize: (1) `batch_url_inspection` on the 3 curricula pages, (2) a fresh 28d
      aggregate pull to compare against 554 impr/9 clicks, (3) query/position check on the `...-sx7l`
      post to see if the FAQ move (40→70/100 GEO score, applied 2026-09-27) shows up in impressions
      or position yet.
- [~] **2026-09-29 — nightly GSC health check requested (compare vs. 2026-09-28 baseline, re-check
      the 3 not-indexed curricula pages after yesterday's footer-linking fix + the founder's manual
      Request-Indexing clicks). Blocked before any data could be pulled: zero `mcp__gsc__*` tools
      attached to this session at all.** Tried 8 distinct tool names spanning every category the
      task named — `get_search_by_page_query`, `get_advanced_search_analytics`,
      `get_performance_overview`, `get_search_analytics`, `check_indexing_issues`,
      `batch_url_inspection`, `list_properties`, `get_capabilities`, `reauthenticate` — every one
      returned "No such tool available," not an auth/API error, meaning the MCP server itself
      wasn't wired into this dispatch's tool list (same failure mode as the 2026-09-18 runs
      1-4 that blocked this exact backlog item for 4 consecutive sessions before
      `scripts/nightly-ops.ps1` was fixed 2026-09-25 to actually grant the read-only `gsc` slice).
      Tonight's task prompt itself flagged this as a real possibility ("connection timeouts
      reported earlier tonight") — so this reads as a transient/regressed MCP connection, not a
      re-opened config gap; no code change needed on `nightly-ops.ps1` unless this repeats.
      **No GSC numbers reported below — none were pulled, and per this file's own standing rule
      ("ground every claim in data, not assumption") the 2026-09-28 baseline (554 impr/9 clicks as
      of 09-27, 3-4/48 indexed) stays the last-known-real snapshot; it is NOT being re-logged as
      today's number.** Did one non-GSC, code-level check instead, since it needed no `gsc` tool:
      `WebFetch`'d a live production blog post
      (`.../the-2026-rentre-playbook-standardizing-diagnostic-assessments-across-bac-libanais-french-bac-and-ib-xzi2`)
      and confirmed yesterday's `PublicFooter.tsx` fix (the "Exam generators" link row) is genuinely
      live in production — the footer now really does link `/generateur-examen-bac-libanais`,
      `/bac-francais-exam-generator`, `/ib-exam-generator`, and `/ai-exam-generator-lebanon` on a
      real rendered page, not just in the source diff. That's a deploy-confirmation, not new
      indexing data — whether Google has re-crawled enough pages to register those links, and
      whether the 3 not-indexed pages have moved, both still require live `gsc` URL Inspection,
      which this session cannot do. No code changes made tonight (nothing new/fixable was found,
      and the one thing that could have been checked — indexing status — was unreachable). Next run
      with working `gsc` tools should treat 2026-09-28's numbers as the baseline to compare against,
      not tonight's.
- [x] **2026-09-28 — checked whether the 4 dedicated SEO landing pages
      (`/ai-exam-generator-lebanon`, `/bac-francais-exam-generator`,
      `/generateur-examen-bac-libanais`, `/ib-exam-generator`) are actually getting found for
      their target queries, per founder request (continuation of yesterday's near-zero-organic
      investigation).** Pulled per-page query data (`get_search_by_page_query`, 90d
      2026-06-30→2026-09-28): `/ai-exam-generator-lebanon` has **1 impression total** — for the
      bare brand query `imtihan`, not any target phrase, 0 clicks, position 4. The other 3 pages
      have **zero impressions each, zero queries** — literally no search data at all. URL
      Inspection (re-checked today, `batch_url_inspection`): only `/ai-exam-generator-lebanon` is
      indexed (`PASS`, `Submitted and indexed`, last crawled 2026-07-22); `/bac-francais-exam-generator`
      = Discovered - currently not indexed (never crawled — flipped sub-state from yesterday's
      "URL is unknown to Google," `/generateur-examen-bac-libanais` unchanged at Crawled - currently
      not indexed (crawled 2026-09-21), `/ib-exam-generator` now reads "URL is unknown to Google"
      (flipped from yesterday's Discovered state) — both flips are Google's indexing-queue churn
      between two not-indexed sub-states, not a regression (confirmed the one internal link each
      still has from the homepage strip is unchanged, via `grep`).
      **On-page query-match sanity check (the honest-gap check this task specifically asked for):
      not a gap.** Read all 4 page files directly — title tags, H1s, and opening paragraphs already
      target realistic query language prominently, not generic marketing copy that merely touches
      the topic: `/bac-francais-exam-generator`'s title is literally "Générateur de Devoir Bac
      Français | Imtihan," its H1 reads "Le générateur de devoir Bac Français conçu pour les
      professeurs," matching the exact example phrase this task asked to check for.
      `/generateur-examen-bac-libanais` similarly titles/H1s on "Générateur d'Examen Bac Libanais
      IA" / "générateur d'examen Bac Libanais." `/ib-exam-generator` and `/ai-exam-generator-lebanon`
      do the same for their respective English-language target phrases. No content rewrite needed
      here — this isn't the bottleneck.
      **Found one real, additional, fixable gap beyond yesterday's "3 of 4 not indexed" finding, by
      cross-referencing site-wide query data against page-level data (not just checking the 4 pages
      in isolation):** filtered site-wide queries for `bac`/`ib`/`exam generator` — the only
      real (non-brand) query with any impressions site-wide is `bac libanais` (3 impr, position 8,
      90d), and it's landing on a **blog post**
      (`/blog/the-2026-rentre-playbook-standardizing-diagnostic-assessments-across-bac-libanais-french-bac-and-ib-xzi2`,
      confirmed indexed and about exactly this topic — Bac Libanais/French Bac/IB standardization),
      **not** on `/generateur-examen-bac-libanais`, the page actually purpose-built for that query.
      Fetched the live post (`WebFetch`): it has **zero outbound links** to any of the 3 curricula
      landing pages despite being topically about all three. Checked the root cause structurally,
      not just for this one post: `PublicFooter.tsx` (renders on all 12 marketing/blog page files,
      including every one of the 37 blog posts via the shared static and dynamic templates) still
      had **no link to any of the 4 landing pages** — they were only ever linked once, from the
      homepage hero curricula strip (the 2026-09-18 fix), which is evidently not enough internal-link
      signal for Google to index 3 of them. This is the same orphan/thin-internal-linking pattern
      already fixed twice this month for `/about`+`/pricing` (2026-09-27) and the 3 curricula pages
      themselves (2026-09-18) — recurring because the footer fix that day only covered `/about`/
      `/pricing`, not these 4.
      **Fix applied:** added a compact "Exam generators" link row to `PublicFooter.tsx` (Bac
      Libanais, Bac Français, IB Diploma, Lebanon AI Generator → the 4 landing pages), below the
      existing nav row, using only existing utility classes (no color/Tailwind-config changes).
      This puts a real crawlable link to all 4 pages on every marketing page and every blog post
      (currently ~37, cron-generated ones included) instead of just the homepage — the single
      highest-leverage internal-linking change available, since it reaches every page at once
      rather than editing one post's content. Verified via `grep` that `PublicFooter` still renders
      on the same 12 files (`src/app/page.tsx`, both blog templates, all 4 landing pages
      themselves, `/about`, `/contact`, `/privacy`, `/terms`). `npx tsc --noEmit --skipLibCheck`
      clean.
      **Honest bottom line, consistent with yesterday's finding, not contradicted by it:** this
      internal-linking fix addresses a real, verifiable gap (thin internal links to these 4 pages)
      but won't by itself flip 3 pages from not-indexed to indexed overnight — Google still needs
      to re-crawl the footer on enough pages to register the new links, and the underlying cause
      (brand-new domain, low crawl-priority allocation) is unchanged from yesterday's conclusion.
      Once Google reflects it, `/generateur-examen-bac-libanais` in particular should start
      competing more fairly for "bac libanais"-style queries instead of ceding that impression to
      a blog post that doesn't even target it as its primary topic. Requesting indexing for the 3
      non-indexed pages in the GSC UI (flagged 2026-09-27, still a human-only action via the read-only
      API tools available) remains the fastest complementary lever if a human has 2 minutes.
- [x] **2026-09-27 — investigated why organic traffic reads as ~zero (founder request, GA4↔GSC
      just linked; GA4's own 28d numbers: 816 sessions, 809 Direct, only 6 Organic Search).
      Real GSC numbers (`sc-domain:imtihan.live`, 28d 2026-08-30→2026-09-27): 10 clicks / 573
      impressions / 1.75% CTR / avg pos 5.8 — and 508 of those 573 impressions (89%) plus all
      10 clicks are on the homepage alone; every other URL gets 0-24 impressions, 0 clicks.**
      Sitemap: `https://imtihan.live/sitemap.xml`, Valid, 48 URLs submitted, 0 errors, 0
      warnings — but its own "indexed" count for the WEB content type reads **0/48** (a known
      GSC sitemap-report lag, not literal — cross-checked against real per-URL inspection
      below). Ran `check_indexing_issues` + individual URL Inspections on 9 important pages
      (homepage, `/pricing`, `/about`, `/blog`, the one blog post with real impressions, the 3
      curricula landing pages, `/ai-exam-generator-lebanon`): only **3 of 9 are actually
      indexed** (homepage, `/ai-exam-generator-lebanon`, the `...-sx7l` blog post — the same 3
      already known from the 2026-09-27 GSC-follow-up entry below). No robots-blocked URLs, no
      canonical-mismatch issues found on any of the 9 — ruling out the two most common "actively
      blocking" causes. Confirmed no accidental `noindex`: grepped `/pricing`, `/about`,
      `/blog` source for `robots` metadata (none set) and re-fetched live `robots.txt` (no
      disallow entry for either page).
      **Found one concrete, fixable cause for 2 of the non-indexed pages specifically** — not
      a blanket explanation, but a real bug: `/about` inspects as **"URL is unknown to
      Google"** with **zero referring URLs at all** (Google hasn't even properly discovered it
      through a crawl path, only knows it exists from the sitemap listing itself) — grepped the
      *entire* `src/` tree for `href="/about"` and got **zero matches, anywhere** — the page has
      no internal link pointing to it from any other page in the app, ever. `/pricing` inspects
      as "Discovered - currently not indexed" with its only referring URL being `sitemap.xml`
      itself — traced every `href="/pricing"` in the app: 4 deep marketing sub-pages
      (`/about`, `/ib-exam-generator`, `/bac-francais-exam-generator`, `/create/generate`'s
      upgrade CTA) link to it, but **not the homepage, global nav, or footer** —
      `LandingNav.tsx`'s "Pricing" link is a same-page `#pricing` anchor to the homepage's own
      embedded pricing section, not a crawlable `<a href="/pricing">`. This is the identical
      orphan-page pattern already diagnosed and fixed once before for the 3 curricula landing
      pages (2026-09-18 entry below) — recurring on 2 more pages that fix didn't cover, and
      notably on the two pages a converting visitor most needs (`/about`, `/pricing`), reached
      via the page carrying 89% of the site's own impressions.
      **Fix applied:** added `/about` and `/pricing` links to `PublicFooter.tsx` (confirmed via
      grep to render on all 12 marketing/blog page files, including the homepage and every
      curricula landing page). Verified: `npx tsc --noEmit --skipLibCheck` clean; re-confirmed
      `PublicFooter` import present in `src/app/page.tsx` and 10 other files. Not re-deployed/
      re-crawled yet in this run (code-only fix; Google needs to re-crawl the homepage to pick up
      the new links, same as any content change).
      **Honest bigger picture, stated plainly rather than inventing more fixes:** this linking
      fix will not by itself move organic traffic off near-zero. The dominant explanation for
      3/48 sitemap URLs being indexed, with a clean sitemap, no robots blocks, and no canonical
      issues, is that **this is a brand-new, pre-launch domain with no backlinks and no external
      authority signals yet** — Google allocates crawl/index priority roughly in proportion to
      perceived site authority, and a clean technical setup doesn't override that. This matches
      what every prior GSC-data entry in this doc has already found (single-digit clicks,
      double-digit-to-low-hundreds impressions, homepage-dominated). There is no further
      technical-SEO lever to pull here beyond continuing to fix real orphan-page/internal-linking
      gaps like the one above as they're found — real indexing growth will come from actual
      launch activity and backlinks, which is a marketing/business timeline question, not a
      technical one. GA4's 809/816 Direct-vs-6-Organic split is consistent with this and with the
      founder's own read (internal QA/founder browsing during a heavy work week, not real
      acquisition) — no separate GA4-side issue found or expected once the GSC integration
      backfills over the next 24-48h.
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
- [x] **2026-09-27 — checked homepage's low CTR (2.46% at avg position 5.8, 690 impr/17 clicks,
      2026-08-01→2026-09-27) for a title/meta-description opportunity — verified it's not one, so
      didn't touch the copy.** Pulled query-level data behind that page: the top query is the bare
      brand term `imtihan` (90 impressions, position 5.7, **0 clicks**), followed by Arabic
      transliterations/spellings of the generic word "exam" (`امتحان` 61 impr, `امتحن` 12 impr,
      `امتحتن` 6 impr, etc.) and misspellings (`imithan`, `mtihan`, `imtiha`, `itihan`) — every
      single one of these 36 queries has **0 clicks**, several at very strong positions (2-3),
      which rules out "buried in results" as the cause. Re-read `src/app/layout.tsx`'s root
      `metadata` (title, description, OG/Twitter copy) — already accurate, on-brand, and
      appropriately concise (no length/truncation issue, matches `CLAUDE.md` §9 scope, no stale
      claims). **Conclusion: the low aggregate CTR is explained by the query mix (bare-brand/
      generic-Arabic-word/misspelling impressions that were never going to convert, likely low
      commercial intent or unrelated matches on the common word "امتحان"/"imtihan"), not a
      fixable on-page defect** — no code change made, logging the verified non-finding so a future
      run doesn't re-investigate the same homepage CTR number from scratch. Separately re-checked
      indexing status of the 3 orphan curricula pages flagged this morning: unchanged (still
      needs a human to click "Request Indexing" in the GSC UI) — not re-logging as new.

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
