# Bug Tracker — Imtihan

Track issues here during development. Format:
```
## BUG-XXX: Short title
**Status:** Open | In Progress | Fixed | Won't Fix
**Severity:** Critical | High | Medium | Low
**Area:** API | UI | Auth | Generation | Export | Data
**Reported:** YYYY-MM-DD
**Fixed:** YYYY-MM-DD (if applicable)

**Description:** What happens vs what should happen.
**Steps to reproduce:** numbered list.
**Root cause:** (fill in when known)
**Fix:** (fill in when fixed)
```

---

## Open Issues

*None currently open.*

---

## Known Limitations (Not Bugs)

These are intentional constraints in MVP — document here to avoid re-opening as bugs.

### LaTeX rendering in exported Word/PDF files
**Status:** Known limitation, deferred to v2
**Details:** Math expressions use Unicode approximations (e.g. ∑, π, ²) rather than proper LaTeX rendering in Word/PDF exports. Full rendering requires `mathjax-node` server-side, planned for v2.
**Workaround:** Teachers can copy the LaTeX from the web preview and typeset manually if needed.

### Arabic language not supported
**Status:** Deferred to v1.1
**Details:** RTL layout, Arabic math notation, and font rendering complexity pushed to v1.1. All UI is LTR only in MVP.

### University curriculum — no predefined chapters
**Status:** By design
**Details:** University teachers describe their own course — we don't pre-define chapters. Claude uses the teacher's description + uploaded syllabus as the curriculum source. This means curriculum validation is more lenient for university.

### File upload size limit: 10 MB
**Status:** By design
**Details:** Files are sent base64-encoded in the request body. At 10 MB encoded, this approaches Next.js's body size limit (configured to 10 MB in `next.config.ts`). Large PDFs (>50 pages) should be cropped before upload.

### sessionStorage for workflow state
**Status:** MVP tradeoff
**Details:** If the teacher closes/refreshes the browser mid-workflow, progress is lost. For MVP this is acceptable. v1.1 should persist draft exams to Firestore.

### Free tier: 2 exams lifetime (not monthly)
**Status:** Product decision
**Details:** Founder confirmed: 2 exams total in the free tier to drive conversion, not 3/month. This may change based on conversion data.

---

## Fixed Issues

---

## BUG-001: Register page syntax error — double `return (` statement
**Status:** Fixed
**Severity:** Critical
**Area:** Auth / UI
**Reported:** 2026-04-24
**Fixed:** 2026-04-24

**Description:** `src/app/auth/register/page.tsx` had a duplicate `return (` statement and an extra stray `</div>`, causing a Turbopack parse error at build time. The page was completely unreachable.
**Root cause:** Manual editing left two consecutive `return (` lines inside `RegisterForm` and an unmatched closing `</div>`.
**Fix:** Rewrote the file in full to restore a single clean `return (` and correct JSX structure.

---

## BUG-002: Google sign-in redirect silently fails — session cookie not set
**Status:** Fixed
**Severity:** High
**Area:** Auth
**Reported:** 2026-04-24
**Fixed:** 2026-04-24

**Description:** Clicking "Continue with Google" on login or register appeared to do nothing — the popup completed but the user was not navigated to the dashboard/create page.
**Root cause (1):** `POST /api/auth/session` was using `cookies()` from `next/headers` to set the `__session` cookie inside a Route Handler. In Next.js 15 App Router, this does not reliably emit a `Set-Cookie` response header on client `fetch` calls. The cookie was never stored in the browser, so the middleware saw no session and immediately redirected back to `/auth/login`.
**Root cause (2):** The client-side `setSessionCookie()` helper did not check `res.ok`, so a 500 response from the session route was swallowed silently and `window.location.assign()` fired without a valid session.
**Fix:** Replaced `cookies().set()` with `response.cookies.set()` on the `NextResponse` object in the route handler. Added `if (!res.ok) throw new Error(...)` in `setSessionCookie()` so failures surface as visible error messages instead of silent loops.

---

## BUG-003: Community page fails to build — unclosed blur-container `<div>`
**Status:** Fixed
**Severity:** Critical
**Area:** UI / Community
**Reported:** 2026-04-24
**Fixed:** 2026-04-24

**Description:** Turbopack reported `Expected '</', got 'jsx text'` at the `</main>` closing tag in `src/app/community/page.tsx`, preventing the build.
**Root cause:** The wrapping `<div className={cn("transition-all duration-700", isFree && "opacity-40 blur-sm ...")}>` opened at line 191 was never closed. Its closing `</div>` was missing before `</main>`.
**Fix:** Added the missing `</div>` immediately before `</main>`.

---

## Reporting a Bug

1. Check this file first — it might already be documented.
2. Check `CLAUDE.md` section 12 "Known Gotchas" — might be a known env issue.
3. If new, add an entry above with the next BUG-XXX number.
4. If urgent (crash / data loss), mark as **Critical** and fix before any other work.
