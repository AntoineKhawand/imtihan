# Metrics — Imtihan

## Current snapshot — 2026-10-10 (supersedes historical figures below)

| Metric | Verified value | Source / limits |
|---|---|---|
| Automated checks | 412/412 tests, 31 files; TypeScript clean | Final serial Vitest run on maintenance branch |
| CodeQL alerts | 6 open (all labelled high upstream) | Fresh GitHub API read; unresolved, not silently dismissed |
| Production dependency findings | 12: 8 moderate, 4 high, 0 critical | Fresh `npm audit --omit=dev`, down from 23 on the branch baseline; remaining Firebase/Google SDK chains need migration review |
| GA4 sessions / active users | 1,011 sessions / 993 active users | Imtihan property 538422391; Sep 12–Oct 9; active users is not Data API totalUsers |
| GA4 channels | Direct 968 (95.75%); organic social 18; organic search 17 (1.68%); AI Assistant 5; referral 3 | Traffic acquisition UI, same 28 days |
| Engagement | 564 engaged sessions, 55.79%; 3m16s per session | GA4 traffic acquisition UI |
| Key events | `sign_up` and `exam_generated` enabled today | Saved in GA4 Admin; historical key-event zeros are not retroactively repaired |
| GSC, Sep 12–Oct 9 | 19 clicks / 582 impressions, 3.26% CTR | WEB, domain property, date rows, data_state=all; returned dates through Oct 8; recent days may be incomplete |
| GSC, Oct 3–9 | 5 clicks / 158 impressions, 3.16% CTR | Same query semantics and freshness caveat |
| Indexing | Homepage + all 4 exam-generator landing pages indexed | Fresh 8-URL inspection; not comparable to old 9-URL count |
| Indexing gaps | `/pricing` and `/about` unknown to Google; `/blog` discovered, not indexed | Inspection on Oct 10; latest homepage crawl Oct 7 |
| Nightly task | Enabled, Ready, next Oct 11 at 00:00 Beirut; last actual run failed | Isolated checkout routing installed and clean preflight passed; full post-repair AI run not yet verified |

The admin Analytics tab is now implemented in the maintenance branch. Its three GA4 reporting variables are absent locally; production configuration has not been verified. Missing configuration displays setup guidance instead of invented zeros. Cost per exam, revenue and unique-teacher conversion rates remain unmeasured.

Memory pressure was observed (about 0.52–1.19 GB free out of 15.45 GB during this session), but it is **not proven** to cause MCP failures. GSC worked via its existing configuration today. The browser viewport override did not take effect, so mobile QA is not certified.


A living dashboard of real, verifiable numbers — flagged as the single most overdue gap across three versions of `CEO_OPERATING_PLAN.md`. Every number here is either pulled directly from a real data source (GA4, Search Console, the test suite, `BUGS.md`) with the date it was measured, or explicitly marked as not yet tracked. Nothing here is estimated or invented — see CLAUDE.md's anti-fabrication rule.

**Owned by:** no department yet (Growth Analytics was proposed but never stood up — see `CEO_OPERATING_PLAN.md` §3). Whoever updates this file should refresh the "as of" date on whatever section they touch, not just assume last week's number still holds.

---

## Engineering health

| Metric | Value | As of | Source |
|---|---|---|---|
| Test suite size | 250 tests, 21 files | 2026-10-01 | `npx vitest run --no-file-parallelism` (default parallel run hits worker-pool timeouts on this machine under memory pressure — see Known Gaps) |
| Test pass rate | 100% (250/250) | 2026-10-01 | same run |
| Open bugs (literal "Open" status) | 0 | 2026-10-01 | `BUGS.md`, 50 total logged issues |
| Bugs confirmed broken live (fix on disk, not deployed) | 0 — BUG-026 deployed and fully verified (incl. real teacher UI check) | 2026-10-01 | Founder ran the deploy, confirmed live via Firebase Console, then confirmed the UI itself works for a real teacher |
| CodeQL open findings | 14 found 2026-09-27; 2 critical (SSRF) fixed same day, rest triaged as lower-severity/already-covered | 2026-09-27 | GitHub code scanning |
| `npm audit` vulnerabilities | 20 (1 low, 12 moderate, 6 high, 1 critical) | 2026-09-30 | `npm audit --omit=dev` — unchanged since 2026-09-27; `npm audit fix` itself crashes on this repo (npm 10.8.2 resolver bug, confirmed from a clean `npm ci`, not stale cache) |
| Firestore composite index backlog | 0 confirmed deployed (the 3 that were explicitly tracked) | 2026-09-27 | Founder ran `firebase deploy --only firestore:indexes`; see Known Gaps for the 2 indexes whose deploy status is inferred, not confirmed |

## Traffic & acquisition

| Metric | Value | As of | Source |
|---|---|---|---|
| Total sessions (28d) | 816 | 2026-09-28 | GA4 — **not re-pulled this session; no GA4 tool access available.** Still the last real pull, now 7+ days stale. Do not treat as current. |
| Direct traffic share | 99.1% (809/816) | 2026-09-28 | GA4 — same caveat as above |
| Organic search share | 0.7% (6/816) | 2026-09-28 | GA4 — same caveat as above |
| GSC clicks / impressions (28d) | 18 clicks / 584 impressions, 3.08% CTR, avg position 5.8 | **2026-10-05** | Google Search Console — live pull this session, `gsc` tools attached and working. Up from the 2026-09-27 baseline (9 clicks / 554 impressions / 1.6% CTR / pos 5.8) — clicks doubled, CTR nearly doubled, position essentially flat. Still very low absolute volume; not a trend to over-read yet. |
| Indexed pages (of the same 9 tracked pages) | **6 of 9 indexed** (up from 1 of 9 confirmed at the last check) | **2026-10-05** | GSC `batch_url_inspection`, live pull — see detail below |
| GA4 conversion events tracked | 2: `sign_up`, `exam_generated` | 2026-09-28 | `src/lib/analytics.ts` — not re-checked this session (no GA4 tool access) |

**Indexing detail (2026-10-05, live `batch_url_inspection` on the identical 9 pages tracked since 2026-09-27/28):**
- **Indexed (PASS, "Submitted and indexed"):** homepage (crawled 2026-10-01); the `...-sx7l` FAQ blog post (crawled 2026-09-22, unchanged); and — new since the last check — all 3 landing pages that had manual re-indexing requested 2026-09-28/30: `/generateur-examen-bac-libanais`, `/ib-exam-generator`, `/bac-francais-exam-generator` (all crawled 2026-09-28); plus `/ai-exam-generator-lebanon` (crawled 2026-10-05, today).
- **The 3 manual re-indexing requests worked, and it shows in real query data, not just inspection status:** `/generateur-examen-bac-libanais` now gets impressions for "bac libanais" (position 5) and "imtihan en francais"; `/ib-exam-generator` gets 9 impressions for "ib test maker" (position 6.8); `/bac-francais-exam-generator` gets 4 impressions for "imtihan en francais" (position 8.2) — all real, on-topic, non-brand queries, all at zero before. This is a genuine, detectable crawl/index change, not just a status-field flip.
- **Still NOT indexed, still "URL is unknown to Google," never crawled even once:** `/pricing`, `/about`, `/blog` (the index page) — despite the `/about` internal-link fix (2026-09-27) and `/pricing` footer link (same date) having shipped over a week ago. **This is the honest answer to whether that fix produced a detectable change: no, not yet.** Action taken this session: resubmitted `sitemap.xml` (https://imtihan.live/sitemap.xml, 50 URLs, 0 errors/warnings) via `gsc` tools to nudge a re-crawl — status "Pending processing" as of 2026-10-05 19:52. If these three are still "unknown to Google" at the next check, a human should manually click Request Indexing in the GSC UI for them specifically — the same lever that worked for the 3 landing pages.
- The 4 exam-generator-landing-page footer links (2026-09-30 fix) now show a clear positive signal; the `/about`/`/pricing` footer-link fix (2026-09-27) does not yet, 8+ days later.

**The honest read:** near-zero organic traffic is still not primarily a technical problem — GSC's own numbers (18 clicks / 584 impressions over 28 days) confirm this is still a brand-new, low-authority domain, not a broken-pipes issue. But it is no longer true that nothing is moving: the landing-page indexing fix is now showing a real, measurable result. GA4's organic-share number above is stale and should not be read as still describing today.

## Growth channels in motion (not yet measurable)

| Channel | Status |
|---|---|
| School outreach emails | 17 of 25 sent (the full school batch: 12 AEFE/French-network + 5 IB schools) — confirmed by founder 2026-10-01. The remaining 8, to individual teacher contacts from the founder's own Apollo export, are still drafted but not yet sent. |
| Teacher-community outreach (ALEF, ANEFL) | Identified as real, active associations; not yet contacted |
| Product Hunt launch | Launch kit prepared (tagline, description, screenshots, maker's comment); Hypership challenge declined; launch date not yet confirmed |

## Unit economics

| Metric | Value |
|---|---|
| AI cost per exam generated | **Not tracked.** Flagged 3 times now across successive CEO plans as the single clearest gap between "a pricing decision was made" and "a pricing decision was made with real data." |
| Revenue per Pro user | **Not tracked** — payment is handled manually via WhatsApp confirmation, no automated revenue ledger exists yet. |

## Known gaps in this dashboard itself

- ~~BUG-026 (`/teacher/students`) broken in production~~ — **RESOLVED 2026-10-01.** Founder ran `firebase deploy --only firestore:rules,firestore:indexes`; verified live via the Firebase Console (rules + both indexes), then confirmed end-to-end with a real teacher account. Closed.
- **`gsc` and `chrome-devtools` MCP tools have failed to attach to nightly dispatches on 4-6 recent sessions**, blocking fresh Search Console pulls and live QA browser verification. Traced to this machine running critically low on memory (0.82GB free of 15.45GB observed 2026-10-01) — not a code or config bug. **Update 2026-10-05: `gsc` tools attached and worked cleanly this session** (live pull above) — `chrome-devtools` was not available in this session's toolset at all, so that half of the gap is unconfirmed either way. Treat the `gsc` attachment issue as intermittent, not permanently resolved — verify again next time rather than assuming it will keep working. GA4 has no MCP tool connected in this environment at all (not a transient failure — there is simply no GA4 tool available to call), so GA4 numbers above remain stale until someone pulls them directly from the GA4 UI.
- **Default `vitest run` (parallel) currently fails with worker-pool timeouts** on this machine — same memory-pressure root cause. `--no-file-parallelism` works reliably; use it until the underlying memory issue is resolved.
