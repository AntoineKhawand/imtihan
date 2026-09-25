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

*(empty — first `security` team review pass not yet run; Shannon's own CI/CD scans run independently of this team's work, see `.github/workflows/security.yml`)*

## Open questions for the founder

*(empty)*
