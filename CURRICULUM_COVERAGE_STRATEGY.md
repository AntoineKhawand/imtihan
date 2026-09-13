# Curriculum Coverage & Exemplar-Learning Strategy — Imtihan

Living backlog for the new **Wednesday** slot in the scheduled `imtihan-daily-improvement-loop`
task. Started 2026-09-04 at Antoine's request: make sure the app's chapter/exercise coverage for
Bac Français, Bac Libanais, and IB is actually grounded in the right sources (see
`docs/DATA_SOURCING.md`), and give the generation pipeline a way to "learn" from previous exam
generations over time.

Pick **one item per Wednesday run**, move it to "Done" with the date and a one-line result, and
add anything newly discovered to the backlog — same discipline as `SEO_STRATEGY.md`. One item per
run, small reviewable diffs, never introduce new colors/tokens (this is a UI-adjacent day only in
that it shares the weekday, not in scope).

## Chosen approach (decided 2026-09-04, see rationale below)

**Curated exemplar bank, not active AI-generation testing.** The scheduled task does **not** spend
extra Gemini/Claude credits to "test" or "train" itself daily. Instead:

1. Chapter/objective **accuracy** is improved by periodic manual-style audits against
   `docs/DATA_SOURCING.md`'s official sources (CRDP, Éduscol/BO, IBO subject guides) — a research +
   `src/data/curricula/*.ts` edit, same shape as any other code change.
2. Exercise **quality signal over time** comes from data the app already collects for free: when a
   teacher explicitly shares an exercise to their School Bank, that's a real person vouching for
   its quality. A small helper queries a handful of shared exercises per chapter and injects 1-2 as
   few-shot examples into the generation prompt for that chapter — no new AI calls, no new
   collection schema, just reusing what's already being written.

Rejected for now: (a) having the scheduled task itself generate and grade test exercises daily —
real API cost for a benefit that's hard to measure without a labeling process first; (b) a
pure-analytics/no-automation approach — rejected because Antoine specifically asked for the tool to
improve itself from generation history, and the exemplar-bank approach *is* automatic (no human
review step required to take effect), it just doesn't spend extra tokens doing it.

## ⚠️ Known blocker to fix before building the exemplar bank

`src/lib/schoolBank.ts` (collection `"school_bank"`, field `"school"`) is **dead code** — grep
confirms zero imports anywhere in `src/`. The actual live School Bank feature is implemented as a
local, inline function inside `src/app/bank/page.tsx` (`shareToSchoolBank`/
`getSchoolBankExercises`, collection `"schoolBank"`, field `"schoolSlug"`), and
`src/app/student/practice/page.tsx` reads from that same live collection with a fallback to a
non-existent `"school"` field for backward compatibility with data that was never actually written
by anything. **Before building on top of School Bank data, either delete the dead
`src/lib/schoolBank.ts` file (and its stale `"school"`-field fallback read in
`student/practice/page.tsx`) or consolidate the inline `bank/page.tsx` logic into it** — don't
leave two competing implementations of the same feature. This is a pre-existing bug unrelated to
today's `/bank` fix (that fix touched the *user-facing dead link*, not this data-layer split) —
flagging it here rather than silently fixing it today since it touches a live Firestore read path
students depend on (`student/practice`) and deserves its own careful, reviewable diff.

## Backlog (pick one per Wednesday, highest priority first)

### Data accuracy audits (grounded in `docs/DATA_SOURCING.md`)
- [x] **2026-09-09:** Audited `bac-libanais.ts` Terminale-S mathematics chapters against the
      official CRDP "Curriculum of Mathematics" (crdp.org, General Sciences section, Third Year).
      Found and fixed a real inaccuracy: `ter-math-probability`'s objectives (normal/exponential
      distributions, confidence intervals) do not exist anywhere in the CRDP programme — replaced
      with the actual Third Year unit (conditional probability, total probability, discrete random
      variable law). Also added three chapters present in the official programme but entirely
      missing from the file: logarithmic/exponential functions, differential equations, and
      analytic geometry in space (all 20–40h units, heavily represented on real exams). EB9→Seconde
      →Première-S chapters spot-checked against the same source and look accurate as summaries; a
      full line-by-line audit of those levels (plus Bac Français and IB per the other two backlog
      items below) is left for future Wednesday runs — one curriculum/level slice per run keeps
      diffs reviewable.
- [ ] Audit `bac-francais.ts` chapters against the current BO programme edition — flag anything
      that looks like it's from a pre-2019-reform programme.
- [ ] Audit `ib.ts` command-term usage in `src/lib/prompts/generate.ts` against the current IBO
      command term glossary edition — IB revises subject guides periodically; verify [1]/[2]/[3]
      mark notation and M1/A1/ecf conventions are still current.

### Exemplar-bank build-out (no extra AI cost)
- [ ] **Blocker above must be resolved first** — consolidate `schoolBank` into one implementation.
- [ ] Write `getChapterExemplars(curriculumId, levelId, subject, chapterId)` in
      `src/lib/schoolBank.ts` (once consolidated) — queries School Bank exercises tagged with a
      chapter, returns up to 2, ranked by recency.
- [ ] Wire `getChapterExemplars()` into `buildChaptersSummary()` (`src/data/curricula/index.ts`)
      or directly into `src/lib/prompts/generate.ts` — inject as "Example of a previously
      well-received exercise for this chapter:" context, clearly labeled as an example, not an
      instruction to copy verbatim (avoid the model just repeating the same exercise every time).
      Guard against near-zero-data chapters (most chapters will have 0 shared exercises for a long
      time post-launch) — the feature should be a no-op, not an error, when no exemplar exists.
- [ ] Add a lightweight regression test (Playwright or unit) confirming generation still succeeds
      when a chapter has zero exemplars (the common case pre-launch) and when it has one.

### Secondary signal (also no extra AI cost)
- [ ] Track chapter-coverage misses (`chapterCoverage[].missing` in
      `src/app/create/generate/page.tsx`) into a lightweight Firestore counter per
      curriculum/subject/chapter — chapters that are *frequently* missing coverage even after
      generation is a signal that either the chapter's objectives are too vague for the model to
      act on, or the model needs a stronger nudge for that topic. Surface as a simple report, not
      an automated prompt rewrite — a human should read the pattern before changing prompts.

## Notes for whoever (human or agent) picks the next item

- This track does not run real Gemini/Claude generation calls as part of its own work — audits and
  wiring only. If a future item genuinely needs a live generation to verify, treat that like any
  other real-cost action and say so explicitly in `DAILY_LOG.md`, same as the Playwright suite's
  documented real-cost calls in `summary.md`.
- Run `npx tsc --noEmit --skipLibCheck` after every change before committing.
- One item per run. Small, safe, reviewable diffs — this runs unattended and pushes itself.
