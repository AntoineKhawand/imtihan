# Feature Ideas Backlog — Imtihan

Weekly proposals from the scheduled automation. **Nothing here gets built without Antoine's
approval** — this file (and the Friday email to antoinekhawand04@gmail.com) is the pitch, not
a build queue. Once an idea is approved, move it under "Approved — ready to build" with the date;
once shipped, move it to "Shipped."

## How this works

Every Friday run adds up to 3 new candidate ideas (skip if nothing new and genuinely useful —
don't pad the list to hit a quota) and emails the week's additions to antoinekhawand04@gmail.com.
Ideas should be grounded in the actual codebase/data already collected, not generic SaaS feature
lists — check `CLAUDE.md` §9 (MVP scope) and §8 (open decisions) first so proposals don't repeat
something already deferred to v1.1/v2 without flagging that explicitly.

## Week of 2026-09-01 — proposed, awaiting approval

1. **Chapter Coverage Insights (dashboard widget).** Across a teacher's saved exams, surface
   which curriculum chapters for their subject/level have never appeared in a generated exam
   this term — a simple aggregation over `chapterIds` already stored on every `SavedExam`. No
   new AI calls, no new data collection; purely a read over existing Firestore/localStorage data.
   *Effort: small (1-2 days). Risk: low — additive dashboard card only.*

2. **Performance-Aware Difficulty Calibration.** The dashboard already fetches
   `student_attempts` (correct/incorrect per exercise) for the "Student Results" panel. Extend
   this: when a teacher starts a new exam on a chapter they've tested before, show a small note
   — "students scored 92% on medium-difficulty [chapter] questions last time; consider skewing
   harder" — computed from data already being collected today, unused beyond the per-exam table.
   *Effort: medium (3-4 days, needs a cross-exam aggregation query + UI). Risk: low-medium —
   purely advisory, doesn't change generation automatically.*

3. **Cross-Language Exam Duplication.** One-click "Generate an English/Arabic version of this
   exam" on an already-generated exam, preserving structure, numbers, and diagrams while
   translating statements/instructions — useful for bilingual sections and schools running
   parallel-language classes. Reuses the existing generation pipeline with a translation-specific
   prompt rather than a full new exam. *Effort: medium (needs a dedicated prompt in
   `src/lib/prompts/`, plus UI entry point on the export or dashboard exam row). Risk: medium —
   another AI call path to test/monitor for quality; should NOT touch Arabic support scope
   already deferred to v1.1 (`CLAUDE.md` §8) if it exceeds structural translation — flag before
   building if it starts to feel like full Arabic exam generation rather than translation of an
   already-generated exam.*

## Week of 2026-09-04 — proposed, awaiting approval

1. **School-Name Autocomplete/Normalization.** Today's run replaced `/bank`'s dead "Go to
   Settings" link with an inline school-name save form (see `DAILY_LOG.md` 2026-09-04) — teachers
   can now actually set their school post-registration, via `updateDoc` on `users/{uid}`. But the
   School Bank feature matches colleagues purely by an exact-match slug
   (`schoolSlugFrom()` in `src/app/bank/page.tsx` and `src/lib/schoolBank.ts`), so two teachers at
   the same school who type "Collège Notre-Dame" vs. "College Notre Dame" end up in two separate,
   empty-feeling banks. Fix: when a teacher types a school name (at registration or in the new
   inline save form), query existing `schoolBank`/other `users` docs for a close slug match and
   suggest "Did you mean [existing school]?" before saving. No new AI calls — a simple Firestore
   prefix/slug query. *Effort: small-medium (2-3 days). Risk: low — additive UI only, doesn't
   change how the slug matching itself works.*

2. **Chapter-Level Struggle Highlighting on `/teacher/students`.** The Students dashboard already
   aggregates each student's `student_attempts` by subject (`bySubject: { total, correct }` in
   `teacher/students/page.tsx`), but every attempt record also carries enough context to group by
   chapter (exercises are generated against `chapterIds`). Add a chapter-level breakdown — e.g. a
   small bar showing "Algebra: 41% correct across 12 students" — so a teacher deciding which
   chapters to cover in their next exam has a real signal instead of guessing. Pairs naturally with
   last week's still-unapproved "Performance-Aware Difficulty Calibration" idea but is scoped
   narrower (just surfacing the aggregation on the existing page, no generation-time hook).
   *Effort: medium (needs a new Firestore aggregation query grouped by chapter, plus a chart/list
   UI block). Risk: low — read-only, additive to an existing authenticated page.*

3. **Duplicate/Overlap Warning Before Generating.** `SavedExam.context.chapterIds` is already
   stored per exam (used by last week's proposed Chapter Coverage Insights idea). When a teacher
   starts `/create` with a class profile and chapter selection that heavily overlaps
   (same subject + level + ≥70% shared `chapterIds`) with an exam they generated in the last
   ~14 days, show a small inline notice — "You generated a similar [subject] exam on [chapter] on
   [date] — view it, or continue to generate a new one anyway" — with a link to the existing exam.
   Purely advisory, never blocks generation. Reduces accidental near-duplicate Gemini/Claude calls
   (real cost) and gives teachers a faster path to reusing what they already have.
   *Effort: small (1-2 days — a client-side comparison against already-fetched saved exams before
   the `/api/analyze` or `/api/generate` call, no new backend). Risk: low.*

## Shipped

*(none yet)*

## Approved — ready to build

*(none yet)*

## Declined / parked

*(none yet — Antoine can note why here so future weeks don't re-propose the same idea)*
