# Security — Imtihan

> Owned by the `security` team. Adversarial review of the whole app — auth, injection, XSS, secret exposure, dependency vulnerabilities, and whether an access-control fix actually closes the exploit it claims to. Distinct from `database` (owns Firestore schema/rules *design*) and `engineering` (owns product code) — security's job is to try to break what they built, not to build it.

---

## Scope

- Security review of any diff touching authentication, authorization, Firestore rules, API routes that accept user input, secrets/credentials, or third-party dependencies.
- Dependency vulnerability scanning (`npm audit`) and flagging known-CVE packages.
- Adversarial testing of access-control logic: given a rule or an auth check, actually try to find the self-writable field, missing server-side check, or spoofable claim that breaks it (the same method that found BUG-026).
- Verifying that a claimed security fix actually closes the exploit, not just that it looks reasonable (second-review pattern, same as BUG-026's `database` review).
- Running/reviewing findings from the existing Shannon integration below — this predates the `security` team (April 2026) and is real, live tooling, not something to rebuild.

## Out of scope (belongs elsewhere)

- Designing Firestore schema/rules from scratch — that's `database`'s call. Security flags a gap or exploit found in a rule; `database` owns deciding the actual rule design, though security can propose an exact diff.
- General app bugs with no security dimension — `engineering`'s.
- Accepting a security risk (deciding to ship with a known gap, choosing a verification model like BUG-026's) — the founder's call, always. Log it in `FOUNDER_DECISIONS.md`, never decide it.
- Any actual penetration testing against the live production site that could cause real damage, downtime, or rate-limiting — review code and test locally/against the Firestore emulator instead. This is defensive review, not an authorized pentest engagement against production. (Shannon's own disclaimer below already says the same thing — treat it as binding, not a suggestion.)

## Standing rules

- Never run destructive or disruptive tests against `imtihan.live` in production. Local code review, `npm run test:rules` against the local Firestore emulator, and careful read-only checks (e.g., confirming a route returns 401 without a token) are fine; anything that could degrade the live service is not.
- Never accept a security risk on the founder's behalf. Found a real gap with no easy fix? Log it in `FOUNDER_DECISIONS.md` with the concrete exploit scenario (not just "this could be risky") — mirror BUG-026's entry as the template for what a good one looks like.
- Use the built-in `security-review` skill (invoke via the `Skill` tool) for reviewing a diff — it's built for exactly this and shouldn't be reinvented ad hoc.
- Never fix a vulnerability by hiding the symptom (e.g., swallowing an error instead of fixing the auth check) — fix the actual gap or flag it, don't paper over it.

---

## Existing tooling: Shannon integration (pre-dates the `security` team, still live)

This project integrates **Shannon** by Keygraph for automated AI-powered penetration testing. This is real, working infrastructure committed 2026-04-23 — the `security` team should use it, not duplicate it.

| File | Purpose |
|------|---------|
| `scripts/security-scan.sh` | Manual security scan script |
| `.github/workflows/security.yml` | CI/CD automated scans |
| `src/app/api/security/route.ts` | On-demand scan API |

### Prerequisites

1. **Docker** - Must be running
2. **Anthropic API Key** - Get from [console.anthropic.com](https://console.anthropic.com)

### Usage

**1. Manual Security Scan**

```bash
# Set your API key
export ANTHROPIC_API_KEY=your-key

# Start your app
npm run dev

# Run security scan
bash scripts/security-scan.sh
```

**2. CI/CD Integration (GitHub Actions)**

The workflow runs:
- On every push to main/develop
- On every pull request
- Weekly (Sundays at 2 AM)
- Manually via workflow dispatch

**Required secrets:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key

**3. On-Demand API**

```bash
# Trigger scan for authenticated users
POST /api/security?token=<firebase-token>
{
  "targetUrl": "https://your-production-url.com"
}

# Get scan status
GET /api/security?workspace=scan-123
```

### Security Reports

Reports are saved to:
- Manual: `security-reports/`
- CI/CD: `security-reports/` (uploaded as artifacts)
- API: Returns workspace name for retrieval

### Disclaimers

⚠️ **Important:**
- Shannon is a white-box pentesting tool - it expects access to source code
- DO NOT run against production without explicit authorization
- Review all findings before taking action
- This integration is for educational/testing purposes

### Cost

Shannon uses Claude API credits. Monitor your usage at [console.anthropic.com](https://console.anthropic.com)

---

## Audit log

### 2026-09-25 — First-pass full sweep (security team's first-ever run)

Scope matched the "first pass — full sweep" other teams ran when stood up: every `src/app/api/**/route.ts` for auth, `firestore.rules` cross-checked against BUG-026, tracked-file secret grep, XSS/injection review, `npm audit`, and the existing Shannon CI integration's actual run history/findings. Full technical detail is in `BUGS.md` (BUG-032/033/034); this is the audit-trail summary.

**1. Auth/authz on every API route.** Read all ~62 `route.ts` files. Found and fixed 5 with zero server-side auth check that should have had one (BUG-032): `GET /api/admin/temp-promo` (hardcoded-email Pro-subscription grant, most severe — closed), `GET /api/admin/blog/check-env` (leaked Gemini-key prefix + config flags), `GET /api/admin/blog/seed` (unauthenticated Firestore write), `GET /api/admin/blog/diag` (leaked blog-post metadata), `POST /api/exam/publish` (no auth, trusted a client-supplied `teacherId` — BUG-026's spoofable-field pattern applied to an API route instead of a Firestore rule; also confirmed dead/uncalled from any current UI, but was still live). All 5 fixed with the standard `verifyIdToken` + `isAdmin` gate already used correctly by every sibling admin route. Every cron route (`src/app/api/cron/*`) does check a `CRON_SECRET` header/bearer token — **but every one of them fails open if `CRON_SECRET` is unset in the deploy environment** (the check is `if (cronSecret && secret !== cronSecret)` or equivalent — skipped entirely when the env var itself is missing). Could not verify from the repo whether `CRON_SECRET` is actually set in the Vercel production environment (out of scope — no prod env access). **Flagging as a backlog item, not fixing**: making these fail-closed risks silently breaking real scheduled cron runs if `CRON_SECRET` genuinely isn't configured, which only the founder/whoever manages Vercel env vars can confirm. Low-severity either way (impact is bulk-email sending, not data exposure) but worth a 5-minute check.

**2. Firestore rules cross-check against BUG-026.** Re-read `firestore.rules` end-to-end looking for other instances of "self-writable field gates access to something it shouldn't." Did not find a new instance — `database`'s own second-review (`DATABASE.md`, 2026-09-18) had already found and documented the only real one (`users/{uid}.role`/`.school`), and the founder already accepted that risk (`FOUNDER_DECISIONS.md` #1) pending real school onboarding. `schoolBank/{exerciseId}` (`allow write: if request.auth != null` — any signed-in account, no ownership/role check) isn't a *new* access-control gap by itself (it's an intentional, already-documented honor-system feature per `DATABASE.md`), but it is the concrete reachability path for the stored-XSS finding below (#3) — any signed-in account, including a student, can write arbitrary content there. `live_exams` (written by `/api/exam/publish` via the Admin SDK, which bypasses rules) has **no rule at all** — falls to the deny-all fallback, meaning `/exam/[id]/page.tsx`'s client-side `getDoc()` read of it is always denied in production. This is the opposite of a vulnerability (over-restrictive, not under-restrictive) but looks like a live functional bug in a shipped feature — flagged to `engineering`/`database` in `TEAM_CHAT.md` rather than security fixing it, since it's not a security issue.

**3. Secrets grep.** `git ls-files | xargs grep` across the tracked working tree for API-key-shaped strings, PEM private key headers, and AWS-style keys — one hit, and it's the placeholder text in `.env.example` (`AIzaSy-xxxxxxxxxxxxxxxxxxxx`, `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`), not a real secret. No hardcoded credentials found in `scripts/`, committed config, or anywhere else in the tracked tree.

**4. Injection/XSS.** Found and fixed a real stored-XSS gap (BUG-033): `src/lib/renderContent.ts` — the shared renderer behind every `dangerouslySetInnerHTML` call for AI/user exercise text (`ExerciseCard`, `ExerciseEditor`, `/bank`, `/student/practice`, `/exam/[id]`, `/print`) — passed literal HTML straight through unescaped in three spots (`applyMarkdown()`, `renderCellMath()`, the "document block" body renderer). Concrete exploit: any signed-in account edits an exercise statement to include `<img src=x onerror=...>`, shares it to School Bank (`schoolBank`, open to any authenticated write per #2 above), and every other viewer at that school executes it. **This exact pattern was already sitting as 9 open, unreviewed CodeQL alerts** (`js/xss-through-dom`, severity high) from Shannon's own CI integration (`gh api repos/.../code-scanning/alerts`) — alerts #2, #3, #4, #5, #6, #7, #22, #33, #35 — since before this team existed; nobody had been reading them. Fixed by escaping before markdown substitution in all three spots; added a 5-test regression suite (`src/__tests__/renderContent-xss.test.ts`); verified legitimate bold/italic/list/KaTeX rendering is unaffected. Full detail and exploit walkthrough in BUG-033.
Also reviewed (no fix needed): `SchemaOrg.tsx` and `blog/[slug]/page.tsx`'s JSON-LD `dangerouslySetInnerHTML` uses (both insert `JSON.stringify()` output into a `<script type="application/ld+json">`, not HTML — safe). `src/lib/security.ts`'s `sanitizeHTML()` is a denylist-regex tag filter — also independently flagged by CodeQL (`js/bad-tag-filter`) as the classic bypassable-blocklist anti-pattern, but confirmed via grep it's dead code (never actually called anywhere in `src/`) — no live exposure, logged as a cleanup item rather than an active vulnerability.
`GET /api/visual/mermaid` (CodeQL: `js/request-forgery`, marked critical) — reviewed and downgraded on inspection: the user-supplied `code` param becomes part of a URL *path* segment, not the host, for two hardcoded destinations (`mermaid.ink`, `kroki.io`) — not classic SSRF to internal infra. Real residual risk is lower: an unauthenticated, unbounded proxy to two third-party services (cost/abuse surface, not a data-exposure one). Logged as a backlog item, not fixed this pass.

**5. `npm audit`.** 42 vulnerabilities before any fix (3 low, 25 moderate, 12 high, 2 critical). The two criticals were both in `next@16.2.4` (unauthenticated RCE, CVSS 9.0 — GHSA-p293-qw3h-jr36 — and an AVIF-image-optimization RCE — GHSA-2xp9-vwfh-vxw4), both fixed in `16.3.3`+. Upgraded to `next@16.3.6` (same-major patch bump, no breaking-change flag, satisfies the existing `^16.2.4` package.json range) — fixed directly per BUG-034 (unambiguous, verified with `type-check` + full `npm test` 138/138 + a clean `npm run build`). Post-upgrade: 39 vulnerabilities (1 critical remaining: `websocket-driver`, transitively via `firebase`'s Realtime Database submodule → `faye-websocket`, not something this app's server hosts as an inbound WS server, so practical exploitability here is low — the app only uses Firestore, not Realtime Database). The remaining ~38 findings are almost entirely `firebase-tools` (devDependency, local-only Firestore-emulator CLI, never deployed) or unused direct dependencies (`mermaid`, `express-rate-limit`, `rate-limiter-flexible` are declared in `package.json` but never imported in `src/` — dead weight). Full breakdown in BUG-034.

**6. Existing Shannon integration.** `.github/workflows/security.yml` has been running on every push/PR since 2026-04-23 and every run shows green (`gh run list --workflow=security.yml`) — but "green" only means the job didn't error; its `dependency-scan` step runs `npm audit ... || true` and only ever posts a non-blocking `::warning::` annotation, and its CodeQL step doesn't fail the build on findings either. That's how the Next.js CVEs (#5) and the 9 XSS alerts (#4) sat unnoticed through months of green CI. **Found and read all 17 open CodeQL alerts** (`gh api repos/.../code-scanning/alerts`) — the `js/xss-through-dom` ones are addressed by BUG-033; `js/bad-tag-filter` and `js/request-forgery` reviewed above (dead code / lower real severity than labeled); `js/insecure-randomness` (3 alerts, all in `renderContent.ts`) is `Math.random()` used only to generate DOM element IDs for image/mermaid placeholders, not a real security control — no fix needed; `js/incomplete-multi-character-sanitization` (`api/export/route.ts:288`, the `.docx`-export LaTeX cleanup's HTML-tag-stripping regex) doesn't reach a browser-rendering context (output is a Word document, not HTML), so not currently exploitable as XSS — logged as a hardening item, not fixed.

**Fixed this pass (all verified: `npm run type-check`, `npm test` 138/138, `npm run build` all clean):**
- BUG-032 — 5 routes missing server-side auth (`temp-promo`, `blog/check-env`, `blog/seed`, `blog/diag`, `exam/publish`).
- BUG-033 — stored XSS in `renderContent.ts` (3 unescaped-passthrough spots), plus a 5-test regression suite.
- BUG-034 — `next` upgraded 16.2.4 → 16.3.6, closing 2 critical + ~10 high/moderate CVEs.

**Logged as backlog, not fixed this pass** (see items above for detail): cron routes' fail-open-if-`CRON_SECRET`-unset pattern (needs a prod-env check, not a code change); several unauthenticated-but-costly AI-calling routes (`/api/generate/transform`, `/api/image/generate`, `/api/rubric`, `/api/scanner`, `/api/translate` — all call a paid AI API or a fetch-proxy with zero auth or rate limiting, bypassing the 1-free-exam quota entirely; logged to `FOUNDER_DECISIONS.md` since closing this is a product/UX call, not a narrow code fix); `/api/visual/mermaid`'s unauthenticated third-party-proxy surface; `live_exams` Firestore rule gap (functional bug, not security); dead unused npm dependencies (`mermaid`, `express-rate-limit`, `rate-limiter-flexible`); dead `sanitizeHTML()` denylist function in `src/lib/security.ts`; `createSecurityHeaders()` (CSP/X-Frame-Options) applied inconsistently across routes, not universally.

### 2026-09-27 — Nightly review of commits c9701ff..6e0be62 (read-only, no code changed)

**Reviewed:** `1cbb0e4` (cron routes' ID-token path), `ad944b6` (brace-aware LaTeX-to-Word conversion in `src/app/api/export/route.ts`), plus skim of `b1afe02` (CI permission only), `95c9615` (dead-dep/dead-code removal), `c9701ff`/`97024b5`/`7f9ca64` (data/CSS/docs, no security surface).

**1. `1cbb0e4` — cron `isAdmin` change: correct.** Both `blog-auto-publish` and `newsletter-checklist-backfill` now require `verifyIdToken` AND `isAdmin(uid)` on the Bearer-ID-token path, matching sibling `/api/admin/*` routes. `verifyIdToken` failure is caught and leaves `isAuthorized=false`. No self-writable-field spoof: `isAdmin` is uid-based (`ADMIN_UIDS`), not a Firestore-stored role. The earlier open item (cron routes fail open if `CRON_SECRET` is unset) is unchanged and still needs a prod-env check.

**2. `ad944b6` — `convertBraceCommands` / `cleanLatexForWord`: DoS finding, NOT fixed.** `POST /api/export` has no auth, and `RequestSchema` puts no `.max()` on any string (statement, options, subQuestions, solution text). By reading the code:
- Unbalanced input such as `\frac{` repeated n times (or `\sqrt{`, `\dot{`): each loop iteration matches at index 0, `readBraceGroup` scans to end of string (O(n)) and fails, then `rest = rest.slice(after)` copies O(n). Total O(n^2). No exponential/regex backtracking (the `cmd` regex is linear), so it is a plain quadratic loop rather than classic ReDoS, but at request-body scale (up to Vercel's ~4.5 MB) it is enough to keep a serverless function's CPU busy until timeout. One request per function instance, so blast radius is cost and availability per invocation, not shared-state corruption.
- Balanced deep nesting (`\frac{\frac{...}}`) recurses once per level and re-scans the inner text each level, so O(n * depth); very deep nesting throws `RangeError` (stack overflow), which is caught by the route's try/catch and returns 500, not a crash.
- Not verified empirically: my Bash access was denied partway through this run, so I could not time a payload. Treat the complexity analysis as code-read only.
- Suggested narrow fix (for `engineering`, or a later security run with Bash): add `.max()` (for example 20k chars) to the statement/option/solution strings in `RequestSchema`, and/or make `convertBraceCommands` return `text` unchanged past a length or recursion-depth limit; also make the unbalanced case advance without rescanning (remember that a `{` at position p has no closing brace and skip). Add a regression test with a 200k-char `\frac{` string asserting completion under a time bound. Same route already reachable unauthenticated per the existing FOUNDER_DECISIONS AI-route item; adding auth would also close this but is a product call, not made here.
- `js/incomplete-multi-character-sanitization` note from 2026-09-25 (`<[^>]*>?` strip) is unchanged; output is .docx text runs, not HTML.
- Newly exported `cleanLatexForWord`/`convertBraceCommands` from a route file: `generateWordDocument` was already exported this way, so no new build risk observed.

**3. `npm audit --omit=dev`:** 20 vulnerabilities (1 low, 12 moderate, 6 high, 1 critical). No new vulnerable package classes versus the 2026-09-25 log: critical is still `websocket-driver` (via firebase's Realtime Database submodule, not used); the rest are the `firebase-admin` -> `@google-cloud/*`/`google-gax`/`uuid` chain, plus `browserslist`, `nanoid`, `form-data`, `protobufjs`, `fast-xml-builder`, `@grpc/grpc-js`, `fflate`, `@anthropic-ai/sdk` (moderate, direct). Prod-only count is down from 39 (which included devDependencies) mainly because of the 2026-09-27 dead-dependency removal and the `--omit=dev` scope; the earlier log did not record a prod-only baseline, so the "new vs. old" comparison is by package name only. `@anthropic-ai/sdk` and `nanoid`/`form-data`/`browserslist` high/moderate entries were not itemised in the earlier log, so a follow-up should check whether `npm audit fix` (non-breaking) clears them. Not run this session.

**Changed this run:** `SECURITY.md`, `TEAM_CHAT.md` only. No code changed, so `type-check`/`npm test` not run.

## Open questions for the founder

- **Unauthenticated, cost-incurring AI-proxy routes bypass the 1-free-exam quota entirely.** See `FOUNDER_DECISIONS.md` for the concrete scenario — this needs a product decision (require auth, add rate-limiting, or accept the cost exposure pre-launch), not a unilateral security fix, since some of these may be intentionally public for landing-page/try-it-free UX.
- **Cron routes fail open if `CRON_SECRET` isn't set in the Vercel environment.** Not logged to `FOUNDER_DECISIONS.md` (this is a config-verification ask, not a risk-acceptance judgment call) — whoever manages Vercel env vars should confirm `CRON_SECRET` is actually set in production; if it is, there's nothing to do, if it isn't, every `/api/cron/*` route is unauthenticated today.
