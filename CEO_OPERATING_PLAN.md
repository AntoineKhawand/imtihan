# IMTIHAN — امتحان
# CEO Operating Plan & Roadmap

Running the business end-to-end with an eight-department AI agent organization

Prepared for: Antoine El Khawand, Founder & CEO
Date: 2026-10-01
Status: Live — nightly automation runs every night; both founder decisions blocking it are now resolved

This is the tracked source for `Imtihan-CEO-Operating-Plan.docx`. Edit this file, then regenerate the `.docx` with `node scripts/build-ceo-plan.mjs`.

## 1. Executive Summary

Imtihan is a solo-founder, pre-launch SaaS product that generates curriculum-aligned exams for Lebanese, French, and IB teachers, targeting a Q3 2026 launch. Work runs through an eight-department AI agent organization — Engineering, SEO & Growth, Content & Curriculum, QA, Design, Marketing, Database, and Security — coordinating through a standing async channel (`TEAM_CHAT.md`), a single founder-decision inbox (`FOUNDER_DECISIONS.md`), and a structured cross-team planning workflow (`team-sync`).

Since the last version of this plan (2026-09-27), the organization has run for five more real nights, not just one. Both decisions that were blocking full trust in automation are now resolved: the unauthenticated-routes cost exposure was fixed per-route (not a blanket policy), and the Version A/B pricing-copy mismatch is fixed. `FOUNDER_DECISIONS.md` currently has **zero open items** — the first time that's been true since this model started.

**BOTTOM LINE**
The product is feature-complete for MVP scope, and every founder decision on file is answered. What's left isn't decisions — it's reliability: the automation itself hit a real timeout bug and a real account usage-limit cutoff this week, a recurring QA/SEO tooling-attachment gap is now four sessions deep, and this machine ran critically low on memory during one of those failures. None of that is a business question. It's infrastructure that needs attention before this can run fully unattended with confidence.

## 2. Where We Stand — 2026-10-01 update

**The two decisions blocking full trust in this model are both closed.** Checked actual code before deciding (not a blanket policy): three of five flagged "unauthenticated AI-cost" routes had zero real callers anywhere in the app and were simply gated behind login; the one genuinely public demo (the scanner) got a real per-IP rate limiter; the one free, zero-cost proxy was left public with just an input cap. Version A/B's Free-plan copy now matches its Pro-only gate.

**Security earned its keep twice more this week, on features engineering had already shipped and believed were correct:**
- **BUG-048:** a malformed request to the new Version B route could trigger a full, billed AI call that crashed *after* the call completed but *before* quota was charged — a free, repeatable way to run up API costs. Found and fixed same day.
- **BUG-049, more serious:** the new "School Bank exemplar" feature — built to make AI-generated exams better by referencing previously-shared exercises — had no school-scoping at all. Any teacher generating an exam could get *another school's* shared exercise content fed verbatim into their own AI prompt. No malicious actor required; this fired for any two unrelated schools under completely normal use. Found by security's own review, fixed same day.

Both of these are exactly what the security department exists to catch, and both were caught before a real user could have found them.

**Automation itself had a rough week — worth being direct about, not smoothing over:**
- The wrapper's own PowerShell logging was broken for several nights without anyone noticing (fixed 2026-09-27).
- Once logging was fixed, a new failure appeared: the CLI's own 600-second background-task timeout killed a run mid-flight while a team's `npm ci` was still in progress — the process exited with a "success" code having shipped nothing. Fixed by removing the ceiling.
- The very next scheduled run hit a *different* wall: the Claude account's own session usage limit, after running for over an hour. This isn't a bug to fix in our own code — it's a real resource ceiling on how much unattended work one account can do in one sitting.
- During the same incident, this machine was found to have **0.82GB of free RAM out of 15.45GB total** — almost certainly the same root cause behind a separate, recurring problem: `gsc` and `chrome-devtools` MCP tools failing to attach to dispatched sessions on 4+ nights now, blocking QA and SEO from doing real verification work.
- **Fixed this week:** the founder is now notified directly by a native Windows notification every time the scheduler starts and finishes — with the real outcome (a PR link, or an explicit "no PR" / "finished with errors") instead of a silent exit code. This was built and manually verified working before being trusted.

**Product**

- Of ~50 logged issues since this model started, the literal open-bug count is **zero** — BUG-036 (the last one, a Free/Pro copy mismatch) is fixed, and BUG-048/BUG-049 were caught and fixed the same day they were introduced. **BUG-026 fully closed today (2026-10-01):** `/teacher/students` was confirmed broken live this morning (`firestore.rules` had never actually been deployed, despite the fix sitting on disk for days). The founder ran `firebase deploy --only firestore:rules,firestore:indexes`, it was verified live against the Firebase Console (rules + both composite indexes), and the founder then confirmed the actual UI works end-to-end with a real teacher account. Nothing left open on this one.
- Content-curriculum closed a real milestone: **every MVP-subject chapter (math/physics/chemistry) across every level in the Bac Français curriculum data has now been audited against the real post-2019-reform programme at least once** — a multi-week backlog item, now done.
- Two real orphaned-page SEO bugs were found and fixed: `/about` had zero internal links anywhere in the app, and the four dedicated exam-generator landing pages were only ever linked from the homepage hero, explaining why 3 of 4 weren't indexed. Both fixed; whether Google has re-crawled them is still unconfirmed (the same `gsc` tool-attachment gap above).

**Trust & brand**

- Two Facebook Sharing Debugger warnings (missing `og:type`, missing `fb:app_id`) are fixed and verified live — the founder created a real Facebook Developer App for the second one.
- Google Analytics now has Search Console linked, and real conversion tracking (`sign_up`, `exam_generated`) beyond bare pageviews, chosen deliberately by the founder rather than tracking everything by default.

**The honest traffic number, not spun:** 816 sessions in the last 28 days measured, 99.1% direct, 0.7% organic search. The real explanation — confirmed by security/SEO review, not assumed — is that this is a brand-new domain with no backlinks or authority yet, which no amount of clean technical SEO fixes on their own. Real growth needs actual backlinks and the founder's own personal outreach to real teacher communities (two real, active Lebanese French-teacher associations were identified: ALEF and ANEFL), not another agent-side fix. A Product Hunt launch is in preparation as a secondary, lower-effort channel specifically for the backlink, not expected to move the needle on real Lebanese-teacher adoption by itself.

**What's genuinely blocking full trust in automation today**

- QA has now been blocked from live browser verification of Pro-tier features across **five consecutive dispatches** by a missing `chrome-devtools` tool grant — this is now confirmed likely tied to the machine memory issue above, not a dispatch-config bug.
- A new cross-team hazard was found this week, not yet fixed: a concurrent same-night dispatch's own commit swept up *another team's* uncommitted file edit, most likely via a `git add -A`/`commit -a` on a shared working directory. Nothing was lost (caught and re-verified), but multiple dispatches sharing one git working tree on the same night is a real structural risk, not just a tool-attachment one.
- No metrics dashboard exists yet. The pricing decision was made on founder judgment, not real conversion/cost data — this is the single clearest remaining gap between "a decision was made" and "a decision was made with numbers behind it."

## 3. Organization — The Agent Room

Eight departments now exist, each with its own scope, tools, and a written domain document it reads and updates.

| Department | Owns | Domain doc |
|---|---|---|
| Engineering | App code, API routes, product features and bugs | ROADMAP.md, BUGS.md |
| SEO & Growth | Technical SEO, GEO/AEO, indexing, Search Console data | SEO_STRATEGY.md |
| Content & Curriculum | Blog content quality, curriculum data accuracy | SEO_STRATEGY.md |
| QA | Runs and verifies the test suite and live workflows; never fixes what it finds | (reports to Engineering) |
| Design | UI/UX, component styling, accessibility, dark mode | DESIGN.md |
| Marketing | Conversion copy, positioning, pricing/email messaging | MARKETING.md |
| Database | Firestore schema, security rules, indexes | DATABASE.md |
| Security | Security review, dependency vulnerabilities, adversarial access-control testing | SECURITY.md |

Security has now paid for itself twice over in one week alone (BUG-048, BUG-049) — both real, both caught same-day, both the exact class of bug a single department working in isolation would have shipped unreviewed.

**Still not added, and why — unchanged from the last plan:**

- **Sales.** Still self-serve. Trigger: a real "school/Institutions" tier being approved and priced.
- **Legal & Compliance.** Still a founder responsibility — minors' data across three markets needs a human accountable. Trigger: before real user data flows in at launch.
- **Customer Success & Growth Analytics.** Still not stood up. This is now the most overdue gap on this list — the pricing decision, the Product Hunt launch, and every growth conversation this week has been judgment-call-driven because no metrics dashboard exists to ground it in real numbers.

## 4. Operating Model — How the Business Runs Itself

**The nightly cycle runs every night, and now tells you so directly.** A Windows Scheduled Task fires `scripts/nightly-ops.ps1` at midnight; as of this week, it sends a real Windows notification the moment it starts and another when it finishes with the real outcome — a PR link, or an honest "no PR" if nothing shipped. This replaces having to ask "did anything happen last night?" after the fact.

**What actually happened this week, worth learning fromःand not glossing over:**

- A truncated run that still exits with a "success" code is worse than a slow run that finishes — the 600-second timeout bug proved this directly: real work from four teams sat uncommitted and silently unshipped until manually recovered the next day.
- Unattended automation can run into the same resource ceilings a human would — an account usage limit, a memory-starved machine — and "the script has no bug" doesn't mean "the run succeeded." The new notification is the fix for *knowing* this quickly; the underlying resource ceilings still need the founder's attention when they recur.
- Multiple subagents sharing one git working directory on the same night is a real, now-documented risk (see §2) — not yet fixed, flagged for whoever next touches nightly-ops provisioning.

**The one rule that hasn't changed:** departments fix, document, and flag. They do not decide pricing, launch timing, brand identity, legal risk, or anything that deploys to production infrastructure. `FOUNDER_DECISIONS.md` is empty right now because every real decision this model has surfaced has gone through exactly this path and gotten a real answer — not because nothing came up.

## 5. Roadmap

**Phase 0 — Pre-Launch Hardening (in progress)**
- [x] Resolve every founder decision blocking automation (0 open as of this week).
- [x] Deploy the Firestore index fixes — done, dependent features confirmed live.
- [x] Resolve font/accent/pricing/Version-A-B-copy decisions and verify each live.
- [x] Close the orphaned-page SEO gaps (`/about`, the 4 exam-generator landing pages).
- [ ] Fix the QA/SEO `chrome-devtools`/`gsc` tool-attachment gap — now 4-5 sessions deep, likely tied to machine memory pressure.
- [ ] Investigate and resolve this machine's memory pressure directly (0.82GB free observed) — the probable root cause of the tool-attachment gap above.
- [ ] A legal-pages accuracy pass against what the product actually does today, given student data is involved — still not started.
- [ ] Stand up Growth Analytics' first metrics dashboard — still not started, now the most overdue item on this list.

**Phase 1 — Launch (Q3 2026)**
- Go-live checklist signed off by the founder.
- Monitoring and error alerting confirmed live, not assumed.
- A support channel identified before the first real user hits a problem.

**Phase 2 — Stabilize (first 6–8 weeks post-launch)**
- Real-user bug reports take priority over synthetic/internal findings.
- The pricing/quota question gets revisited using real conversion and cost data, not founder judgment alone.
- BUG-026's risk-acceptance expiry is revisited the moment a real school institution is the first one onboarded — not before, not casually after.

**Phase 3 — Expand (v1.1)**
- Arabic support, Biology/SVT/Informatique, custom template upload — sequenced by real demand signal once it exists.

**Phase 4 — Scale (v2)**
- School/Institutions accounts — the trigger point to finally stand up Sales and formalize Legal & Compliance as owned functions.

## 6. Go-To-Market — Sales & Marketing

Unchanged in shape: a bootstrapped, self-serve, pre-revenue-data product. No paid advertising, no outbound sales motion until there's a real cost-per-acquisition number to spend against.

**Two real channels in motion this week, both the founder's own to execute, not an agent's:**
- **School outreach:** 25 personalized, ready-to-send emails are drafted — 8 to individual teacher contacts (from the founder's own Apollo export), 17 to real schools and their official administrative contacts (12 AEFE/Bac Français schools, 5 IB schools), each paired with the correct French or English draft. Still waiting on the founder to actually send them.
- **Teacher-community engagement:** two real, active Lebanese French-teacher associations identified (ALEF, ANEFL) — the highest-trust channel this plan has identified, and one that has to run through the founder personally, not an agent.
- **Product Hunt:** a full launch kit (tagline, description, maker's comment, screenshots) is prepared. The founder correctly declined the "Hypership" live-feature-building challenge that would have been required to launch on a specific date, given the product already has real paying users — choosing a different date instead rather than accepting that risk.

## 7. Metrics & KPIs

Still not owned by a dedicated department — see §3. A real, living dashboard now exists (`METRICS.md`, started 2026-10-01), with every number dated and sourced rather than assumed. What's measurable today:

| Metric | Current state |
|---|---|
| Open bug count (literal "Open" status) | **0**, and BUG-026's rules/indexes deploy gap (the one lingering "fix on disk" item) is now closed and verified live as of today — see `METRICS.md` |
| Test suite size / pass rate | 250 tests, 100% passing as of the last full run |
| Firestore index backlog | 0 — all pending deploys are live |
| QA live-verification success rate on Pro-tier features | 0 of 5 recent attempts — the single most overdue reliability gap on this list |
| Organic search sessions (28d) | 6 of 816 total (0.7%) — real number, not yet expected to move without real backlinks |
| GA4 conversion events tracked | 2 (`sign_up`, `exam_generated`) — added this week, not yet marked as GA4 key events since no real production traffic has fired them yet |

The unit-economics number this plan has flagged three times now (AI cost per exam vs. revenue per Pro user) still doesn't exist as a tracked number.

## 8. Risk Register & Governance

| Risk | Severity | Status |
|---|---|---|
| Student PII exposure via self-declared school field (BUG-026) | High | Risk accepted for now (no real schools onboarded yet); has a documented expiry — must be revisited before the first real school |
| QA/SEO `chrome-devtools`/`gsc` tool-attachment failures | Medium–High | 4-5 consecutive sessions blocked; now suspected tied to this machine's own memory pressure (0.82GB free observed) — needs direct investigation, not another retry |
| Unattended automation hitting real resource ceilings (timeouts, account usage limits) | Medium | Timeout fixed; usage-limit ceiling is a real constraint, not a bug — now surfaced immediately via the new notification instead of discovered a day later |
| Concurrent same-night dispatches sharing one git working tree | Medium | Newly found this week (one team's commit swept up another's uncommitted edit); not yet fixed |
| No Growth Analytics / metrics dashboard | Medium | Unchanged for weeks — every pricing/growth decision still runs on founder judgment, not real numbers |
| Unsupervised AI blog cron, no review step | Medium (brand/SEO) | Accepted as-is per founder decision 2026-09-23 |

**Governance, updated:** `FOUNDER_DECISIONS.md` sitting empty this week is the clearest evidence yet that the mechanism works — every real business/security/brand call surfaced this month got flagged, not guessed at, and got a real answer. The remaining risks above are now almost entirely infrastructure and reliability, not business judgment calls — a genuinely different, and in some ways easier, problem than the one this plan was written to solve five weeks ago.

## 9. Immediate Action Plan (Next 14 Days)

1. Investigate this machine's memory pressure directly — it's the likely root cause behind both the tool-attachment gap and one outright stalled nightly run this week.
2. Send the 25 drafted outreach emails (8 teachers, 17 schools) — nothing is blocking this except the founder's own time.
3. Reach out personally to ALEF and ANEFL — the single highest-trust growth channel identified so far.
4. Decide and execute the Product Hunt launch date (Hypership declined; pick a normal weekday instead).
5. **Done** — stand up a first version of the metrics dashboard: `METRICS.md`, 2026-10-01. Keep it fresh: the GSC/GA4 numbers in it are already a few days stale pending the `gsc` tool-attachment fix.
6. Fix the concurrent-dispatch git-collision risk before it causes real damage instead of a near-miss.
7. **Done, fully closed** — checked the live Firebase Console Rules tab directly (2026-10-01), found `firestore.rules` had never been deployed; founder ran `firebase deploy --only firestore:rules,firestore:indexes` himself, it was re-verified live (new rules published, both composite indexes `Enabled`), and the founder confirmed `/teacher/students` now works with a real teacher account. Nothing left on this item.

## Appendix — Founder Decisions Needed Right Now

*(Live detail always lives in FOUNDER_DECISIONS.md — this is a snapshot as of 2026-10-01.)*

**None.** For the first time since this operating model started, `FOUNDER_DECISIONS.md`'s Open section is empty. Everything that previously needed a founder call — the unauthenticated routes, the Version A/B copy mismatch, pricing, fonts, the accent color, Firestore deploys — has a real, applied answer on file.
