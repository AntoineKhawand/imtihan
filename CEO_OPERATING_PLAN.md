# IMTIHAN — امتحان
# CEO Operating Plan & Roadmap

Running the business end-to-end with an eight-department AI agent organization

Prepared for: Antoine El Khawand, Founder & CEO
Date: 2026-09-27
Status: Live — nightly automation is switched on and has produced its first real PRs

This is the tracked source for `Imtihan-CEO-Operating-Plan.docx`. Edit this file, then regenerate the `.docx` with `node scripts/build-ceo-plan.mjs`.

## 1. Executive Summary

Imtihan is a solo-founder, pre-launch SaaS product that generates curriculum-aligned exams for Lebanese, French, and IB teachers, targeting a Q3 2026 launch. Work runs through an eight-department AI agent organization — Engineering, SEO & Growth, Content & Curriculum, QA, Design, Marketing, Database, and Security — coordinating through a standing async channel (`TEAM_CHAT.md`), a single founder-decision inbox (`FOUNDER_DECISIONS.md`), and a structured cross-team planning workflow (`team-sync`).

Since the previous version of this plan (2026-09-22), the organization went from proposed to running: nightly automation is live on a Windows Scheduled Task, has produced real dated PRs, and a security department was added and has already caught two real, shipped-but-unverified bugs before they reached production unreviewed. Five of the six decisions blocking automation in the last plan are now answered and applied. What's left is smaller and more specific: one unauthenticated-routes cost-exposure decision, one pricing-copy mismatch, and a QA tooling gap that is now blocking live browser verification of Pro-tier features across multiple sessions in a row.

**BOTTOM LINE**
The product is feature-complete for MVP scope. Automation is running, not just proposed. What's left before this is fully trustworthy without a human watching every PR: two founder decisions (Appendix), and fixing the QA live-verification tooling gap so "code review looks correct" and "actually confirmed working in a browser" stop being different things.

## 2. Where We Stand — 2026-09-29 update

Six of eight departments shipped real, reviewed work tonight (`nightly/2026-09-29`, 8 commits — `qa` and `marketing` correctly sat out: `qa`'s two verification paths were both unavailable tonight, and `marketing`'s backlog is fully resolved). Engineering built a real feature (School Bank exemplars now inform generation prompts); content-curriculum closed the largest remaining gap in the Bac Français physics-chemistry audit; design and database each found and fixed real drift/staleness that no prior pass had caught; security empirically confirmed a prior fix instead of re-trusting a code review. Full detail in each domain doc's 2026-09-29 entry.

**One recurring operational issue worth attention, not another one-off:** three separate teams tonight (`seo-growth`, `design`, and — per its own log — `qa` on 2026-09-27) found their dispatch was missing an MCP tool (`gsc`, `chrome-devtools`) that's listed in their own agent frontmatter and in `CLAUDE.md` §15's team table. Each one correctly refused to fake the missing capability and fell back to real alternative work instead of stalling — but this is now a pattern, not a fluke, and is quietly costing real backlog progress (the screenshot-verification pass on several dark-mode fixes is still outstanding after 10+ nights, entirely because of this). Worth someone checking the dispatch tool-provisioning path directly rather than each team re-discovering the same gap independently.

**Product**

- MVP remains feature-complete per `ROADMAP.md`. Of 49 logged issues since this operating model started, only one (BUG-036, a Free/Pro marketing-copy mismatch) is still genuinely open.
- Version A/B generation — flagged in the last plan as weaker than its own marketing copy claimed — is now a real second AI-generated exam variant, not a reorder. A structural safety net (`mergeVariantExercise`) force-copies every gradable field (points, difficulty, chapter coverage) from Version A in code, so fairness is a guarantee, not a prompt hope.
- School Bank's consent gap (a share action was silently also exposing full solutions to students) is fixed with an explicit opt-in.
- The three Firestore index deploys that were blocking the "My School" tab and the whole School Bank feature are deployed. Both features are live.

**Trust & brand**

- The three live blog posts lost in an earlier test-harness incident (BUG-029) were replaced with fresh, source-verified articles and confirmed live — the root-cause rule (never call a real production API/Admin SDK directly, from any team, in any dispatch) is now written into `CLAUDE.md` itself, not just one script's own prompt.
- Font, accent color, and pricing/quota decisions from the last plan are all made, applied, and verified live on production (not just code-reviewed).
- The blog-auto-publish cron was migrated from Gemini to Claude-primary (with Gemini fallback) after a founder-reported generation error; confirmed working live.

**Security — the newest department, already earning its keep**

- Security's first full-codebase pass found and fixed three real vulnerabilities (an auth bypass on several admin-style routes, an XSS gap, an outdated Next.js version).
- A GitHub CodeQL scan surfaced 14 open findings; the two critical ones (a request-forgery gap in the diagram-export route) are fixed. The rest are lower-severity and mostly confirmed-safe patterns already covered by existing escaping.
- When engineering shipped the real Version A/B feature, security's adversarial review caught a real, verified bug within hours: a malformed request could trigger a full billed AI call that crashed before quota was charged — a genuine, repeatable free-cost exploit. Fixed same day. This is exactly the review discipline this operating model exists to run.

**What's genuinely blocking full trust in automation today**

- Two founder decisions remain open (full detail in the Appendix): the unauthenticated AI-cost routes, and the Version A/B pricing-copy mismatch (this second one may already be answered by the time you read this — check `FOUNDER_DECISIONS.md`).
- QA has now been blocked from live browser verification of a Pro-tier feature across four consecutive dispatches — first by credential/device-limit issues (now fixed), then by a missing browser-tooling connection in the dispatch itself. This means "the code looks correct" is currently doing more work than it should before something ships to real users.
- The nightly Scheduled Task ran silently broken for several nights (a PowerShell logging incompatibility swallowed every log write and made every run look like a failure) before being caught and fixed today. It is now producing real output again, but this is a reminder that unattended automation needs its own health-check, not just trust that it's working.

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

**Security was the one department added since the last plan** — split out once it became clear that reviewing whether a fix is actually safe is a distinct skill from designing the fix in the first place. It has already justified itself: the Version A/B quota-bypass bug above was caught by security review on the same day engineering shipped the feature, not weeks later by a real user finding it.

**Still not added, and why:**

- **Sales.** Imtihan is still a self-serve product — a teacher signs up and pays without talking to a human. The trigger to add this department is unchanged: a real "school/Institutions" tier being approved and priced.
- **Legal & Compliance.** Still a founder responsibility. Unchanged reasoning: the product handles minors' data across three markets, which needs a human accountable, not an agent. Trigger: before real user data flows in at launch.
- **Customer Success & Growth Analytics**, both proposed in the last plan, are still not stood up. This is worth revisiting — the pricing/quota question this plan flagged as blocked on real numbers is still being decided by founder judgment call rather than a metrics dashboard, which is exactly the gap Growth Analytics was proposed to close.

## 4. Operating Model — How the Business Runs Itself

**The nightly cycle is live, not proposed.** A Windows Scheduled Task fires `scripts/nightly-ops.ps1` every night at midnight, which dispatches departments on their next safe, unblocked, verifiable task and opens one dated PR (`nightly/YYYY-MM-DD`) for founder review each morning. It has now produced real, mergeable PRs — including one that fixed its own logging bug, and one that caught a performance/DoS issue in same-night engineering work before it shipped unreviewed.

**What actually happened when it ran for real, worth learning from:**

- The first few nights, the wrapper's own log-writing broke silently (a PowerShell version incompatibility), so every run *looked* like a failure with no record of what happened. Automation needs a health-check that alerts on "no log produced," not just "log shows an error."
- A test run of the wrapper, while other work was in flight, found and fixed a real quadratic-complexity bug in same-day engineering code (BUG-047) — a concrete example of the cross-team review model catching something a single department working alone would have missed.
- Documents get updated by whichever team touches them last; a couple of purely cosmetic collisions (an auto-generated framework notice getting swept into a commit, a stray debug log file) have shown up and been caught before committing, not after.

**The one rule that hasn't changed:** departments fix, document, and flag. They do not decide pricing, launch timing, brand identity, legal risk, or anything that deploys to production infrastructure. Every real decision that mattered this week — the security-risk acceptance on BUG-026, the pricing number, the Version A/B direction, the School Bank consent design — went through this exact path: flagged in `FOUNDER_DECISIONS.md`, decided by the founder, then implemented and verified.

## 5. Roadmap

**Phase 0 — Pre-Launch Hardening (in progress)**
- [x] Resolve the founder decisions blocking automation from the last plan (5 of 6 answered and applied).
- [x] Deploy the Firestore index fixes (BUG-013/045) — done, both dependent features confirmed live.
- [x] Resolve the font/accent/pricing decisions and verify each live.
- [ ] Resolve the two remaining open founder decisions (Appendix).
- [ ] Close the QA live-verification tooling gap — this is now the single biggest gap between "reviewed" and "confirmed working."
- [ ] A legal-pages accuracy pass against what the product actually does today, given student data is involved — not yet started.
- [ ] Stand up Growth Analytics' first metrics dashboard before real traffic arrives — not yet started.

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

Unchanged in shape from the last plan, still sized for what Imtihan actually is: a bootstrapped, self-serve, pre-revenue-data product. Organic search, GEO/AI-answer-engine visibility, and content marketing remain the primary channels. No paid advertising and no outbound sales motion until there's a real cost-per-acquisition number to spend against. Community-led growth in Lebanese teacher groups still runs through the founder personally, not an agent — agents prepare collateral, they don't show up in the room.

The outreach to real K-12 schools that was drafted this week (English/French pilot-invite emails for real teacher contacts) is the first real test of this channel outside pure organic search — worth tracking as its own data point once responses come in.

## 7. Metrics & KPIs

Still not owned by a dedicated department (Growth Analytics remains unstood-up — see §3). What's measurable today without it:

| Metric | Current state |
|---|---|
| Open bug count | 1 (BUG-036), down from double digits at the last plan |
| Test suite size / pass rate | 183 tests, 100% passing as of the last full run |
| CodeQL open findings | 14 found this week; 2 critical fixed same-day, rest triaged |
| Firestore index backlog | 0 — all three pending deploys are live |
| QA live-verification success rate on Pro-tier features | 0 of 4 recent attempts — this is the metric that most needs fixing next |

The unit-economics number this plan has flagged twice now (AI cost per exam vs. revenue per Pro user) still doesn't exist as a tracked number. It's still the single clearest gap between "the pricing decision was made" and "the pricing decision was made with real data."

## 8. Risk Register & Governance

| Risk | Severity | Status |
|---|---|---|
| Student PII exposure via self-declared school field (BUG-026) | High | Risk accepted for now (no real schools onboarded yet); has a documented expiry — must be revisited before the first real school |
| Unauthenticated routes that call paid AI APIs with no rate limit | Medium–High | Flagged by security 2026-09-25, still open — direct, unbounded cost exposure, not a data leak |
| QA cannot live-verify Pro-tier features | Medium | New this week — four consecutive blocked sessions; root causes (credentials, device limits, missing browser-tooling access) each identified but the pattern itself needs a structural fix |
| Version A/B Free-plan marketing copy vs. Pro-only gate | Medium (trust) | Still open (BUG-036) — may be resolved by the time this is read |
| Unsupervised AI blog cron, no review step | Medium (brand/SEO) | Accepted as-is per founder decision 2026-09-23 |
| Nightly automation's own health-check | Low–Medium | Was silently broken for several days without alerting; fixed, but no monitoring yet confirms "a run happened and produced a log" automatically |

**Governance, updated:** the mechanism keeps working under real load, not just in the proposal stage. This week alone, security caught an unsafe fix on the same day it shipped, marketing's own draft claims were flagged rather than published unchecked, and a subagent's self-reported "I updated the docs" claim was caught as false by checking `git status` rather than trusted at face value. That last one is worth keeping as a standing practice: verify a subagent's report against the actual working tree before trusting it, every time.

## 9. Immediate Action Plan (Next 14 Days)

1. Answer the two open items in `FOUNDER_DECISIONS.md` (Appendix below).
2. Fix the QA browser-tooling gap so live verification of Pro-tier features stops being blocked session after session.
3. Add a health-check to the nightly automation itself — confirm each morning that a log was actually produced, not just that no error was reported.
4. Stand up a first version of the metrics dashboard this plan has flagged twice now, even a minimal one — the pricing decision deserves real numbers before the next time it's revisited.
5. Start the legal-pages accuracy pass before real user (and minor) data starts flowing in.

## Appendix — Founder Decisions Needed Right Now

*(Live detail always lives in `FOUNDER_DECISIONS.md` — this is a snapshot as of 2026-09-27.)*

1. **Unauthenticated, cost-incurring AI routes.** Five routes call a paid AI API or proxy a third-party service with no sign-in requirement and no rate limiting — a direct, unbounded cost exposure, not a data leak. Options: require sign-in on all of them; keep them public but rate-limit by IP (the libraries are already installed, just unused); or accept the exposure pre-launch given current traffic and revisit before any paid marketing push.
2. **Version A/B pricing-copy mismatch.** The Free-plan marketing copy still lists "Version A/B generation" as included, while the real feature (now a genuine AI-generated second variant, not a reorder) is Pro-gated. Needs the copy and the gate to agree — whichever direction is correct.
