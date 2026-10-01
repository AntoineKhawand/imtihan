# Metrics — Imtihan

A living dashboard of real, verifiable numbers — flagged as the single most overdue gap across three versions of `CEO_OPERATING_PLAN.md`. Every number here is either pulled directly from a real data source (GA4, Search Console, the test suite, `BUGS.md`) with the date it was measured, or explicitly marked as not yet tracked. Nothing here is estimated or invented — see CLAUDE.md's anti-fabrication rule.

**Owned by:** no department yet (Growth Analytics was proposed but never stood up — see `CEO_OPERATING_PLAN.md` §3). Whoever updates this file should refresh the "as of" date on whatever section they touch, not just assume last week's number still holds.

---

## Engineering health

| Metric | Value | As of | Source |
|---|---|---|---|
| Test suite size | 250 tests, 21 files | 2026-10-01 | `npx vitest run --no-file-parallelism` (default parallel run hits worker-pool timeouts on this machine under memory pressure — see Known Gaps) |
| Test pass rate | 100% (250/250) | 2026-10-01 | same run |
| Open bugs (literal "Open" status) | 0 | 2026-10-01 | `BUGS.md`, 50 total logged issues |
| Bugs in an ambiguous/unconfirmed state | 1 (BUG-026) | 2026-10-01 | See Known Gaps — real risk this feature is still broken live |
| CodeQL open findings | 14 found 2026-09-27; 2 critical (SSRF) fixed same day, rest triaged as lower-severity/already-covered | 2026-09-27 | GitHub code scanning |
| `npm audit` vulnerabilities | 20 (1 low, 12 moderate, 6 high, 1 critical) | 2026-09-30 | `npm audit --omit=dev` — unchanged since 2026-09-27; `npm audit fix` itself crashes on this repo (npm 10.8.2 resolver bug, confirmed from a clean `npm ci`, not stale cache) |
| Firestore composite index backlog | 0 confirmed deployed (the 3 that were explicitly tracked) | 2026-09-27 | Founder ran `firebase deploy --only firestore:indexes`; see Known Gaps for the 2 indexes whose deploy status is inferred, not confirmed |

## Traffic & acquisition

| Metric | Value | As of | Source |
|---|---|---|---|
| Total sessions (28d) | 816 | 2026-09-28 | GA4 |
| Direct traffic share | 99.1% (809/816) | 2026-09-28 | GA4 — largely internal QA/testing activity during a heavy work week, not real visitors |
| Organic search share | 0.7% (6/816) | 2026-09-28 | GA4 |
| GSC clicks / impressions (28d) | 9 clicks / 554 impressions, 1.6% CTR, avg position 5.8 | 2026-09-27 | Google Search Console — last real pull; `gsc` tools have failed to attach on nightly dispatches since (see Known Gaps), so this number has not been refreshed |
| Indexed pages (of important pages checked) | 1 of 9 checked (homepage) as of last confirmation | 2026-09-27/28 | GSC URL Inspection — 3 landing pages had manual re-indexing requested 2026-09-28/30, not yet confirmed re-crawled |
| GA4 conversion events tracked | 2: `sign_up`, `exam_generated` | 2026-09-28 | `src/lib/analytics.ts` — added this week; not yet marked as GA4 "key events" since no real production traffic has fired either event yet |

**The honest read:** near-zero organic traffic is not a technical problem. Confirmed via code review (clean sitemap, no robots blocks, no canonical issues) — it's a brand-new domain with no backlinks or authority yet, which is expected pre-launch, not a bug.

## Growth channels in motion (not yet measurable)

| Channel | Status |
|---|---|
| School outreach emails | 25 drafted (8 individual teachers, 17 schools), 0 confirmed sent — waiting on the founder |
| Teacher-community outreach (ALEF, ANEFL) | Identified as real, active associations; not yet contacted |
| Product Hunt launch | Launch kit prepared (tagline, description, screenshots, maker's comment); Hypership challenge declined; launch date not yet confirmed |

## Unit economics

| Metric | Value |
|---|---|
| AI cost per exam generated | **Not tracked.** Flagged 3 times now across successive CEO plans as the single clearest gap between "a pricing decision was made" and "a pricing decision was made with real data." |
| Revenue per Pro user | **Not tracked** — payment is handled manually via WhatsApp confirmation, no automated revenue ledger exists yet. |

## Known gaps in this dashboard itself

- **BUG-026 (`/teacher/students`) is likely still broken in production.** Its fix needs both a `firestore.rules` deploy and the matching composite indexes. Only the indexes deploy is confirmed (2026-09-27); nothing in this repo can confirm whether `firestore.rules` was ever separately deployed — that needs a direct Firebase Console check by the founder (Firestore → Rules tab, compare against this repo's `firestore.rules`). Until confirmed, every teacher viewing their student list likely still sees a false "No students yet."
- **`gsc` and `chrome-devtools` MCP tools have failed to attach to nightly dispatches on 4-6 recent sessions**, blocking fresh Search Console pulls and live QA browser verification. Traced to this machine running critically low on memory (0.82GB free of 15.45GB observed 2026-10-01) — not a code or config bug. The GSC/traffic numbers above are stale until this is resolved.
- **Default `vitest run` (parallel) currently fails with worker-pool timeouts** on this machine — same memory-pressure root cause. `--no-file-parallelism` works reliably; use it until the underlying memory issue is resolved.
