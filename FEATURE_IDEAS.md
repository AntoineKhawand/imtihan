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

## Week of 2026-09-01 — shipped 2026-09-14 (see "Shipped" below)

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

## Week of 2026-09-15 — from Antoine's chapter-coverage investigation (not the Friday loop)

1. **Restore Per-Exercise Chapter Tagging + Canonical Chapter-ID Grounding for Generation.**
   Investigating why "Second degré"/"Dérivation"/"Trigonométrie" show "!" on `/create/generate`'s
   Chapter Coverage card (full writeup: `CURRICULUM_COVERAGE_STRATEGY.md`, dated 2026-09-15 section)
   found a real regression, not a curriculum-data gap: commit `9515e8a` (2026-05-15) restructured
   `src/lib/prompts/generate.ts`'s AI-facing JSON schema and silently dropped
   `"chapterIds": string[]` (and `"estimatedMinutes": number`) from the per-exercise output spec —
   the model is never asked to tag which chapter(s) an exercise covers, so the frontend's coverage
   counter (`ex.chapterIds ?? []` in `create/generate/page.tsx`) sees nothing to count even when the
   exercise content is fine. Two things make a one-line schema re-add insufficient on its own:
   `buildChaptersSummary()` (`src/data/curricula/index.ts`) never shows the model a chapter's real
   `id` string, only its display name, so the model would have to guess an ID that won't match; and
   `src/app/api/generate/route.ts` never validates the AI's JSON output with Zod (a gap against
   CLAUDE.md §10) — the missing field shipped silently for ~5 weeks with nothing to catch it. Full
   fix: (a) restore both fields to the per-exercise schema in `buildGenerateSystemPrompt()`, (b)
   pass canonical chapter `id`s (not just names) into the `<selected_chapters>` / chapter-coverage
   prompt blocks so the model has real IDs to echo back instead of guessing, (c) add Zod validation
   of the AI's exercise JSON in `api/generate/route.ts` so a future schema drift fails loudly
   instead of silently. *Effort: small-medium (1-2 days — two focused prompt-builder edits in
   `src/lib/prompts/generate.ts` plus one new Zod schema + parse call in `api/generate/route.ts`;
   no new AI calls, no type/data-model changes since `Exercise.chapterIds`/`estimatedMinutes` are
   already declared in `src/types/exam.ts`). Risk: low-medium — touches the live generation
   endpoint, so needs a real end-to-end generation test (not just `tsc`) before merge, and the Zod
   schema must be written permissively enough not to reject otherwise-good exercises over a minor
   AI formatting slip.*

   **Update — already built, same session:** Antoine's own message that triggered this
   investigation explicitly asked for the underlying cause to be fixed, not just documented, so
   this was implemented directly rather than left as an unbuilt proposal — PR:
   `fix/restore-chapter-id-tagging`. tsc/build verified; no live end-to-end generation test was
   possible (no API key in the build environment), so treat the "needs a real generation test
   before merge" risk note above as still open until Antoine (or a routine with real secrets) runs
   one. This is the one exception to this file's own approval gate this week — logged here rather
   than silently, per this file's own norm of not deciding things quietly.

**Nothing here gets built without Antoine's approval** — same as every other idea in this file,
except the one entry above, marked explicitly.

## Shipped

### 2026-09-14 — Week of 2026-09-01 batch (all 3 approved and built in one session)

1. **Chapter Coverage Insights** — `src/components/ui/ChapterCoverageWidget.tsx`, wired into
   `/dashboard`. Client-side only, as scoped — no new AI calls or backend queries.
2. **Performance-Aware Difficulty Calibration** — new `POST /api/tools/chapter-performance`
   (Admin SDK aggregation over `schoolBank` + `student_attempts`) plus an advisory card on
   `/create/generate`, purely informational, never touches the generation request. **Needs a
   Firestore composite index before it returns real data** — see `firestore.indexes.json`
   (`schoolBank`: `curriculumId` ASC, `subject` ASC, `exercise.chapterIds` CONTAINS); not deployed
   yet, run `firebase deploy --only firestore:indexes` or create it manually in the console.
   Also required a small fix to `bank/page.tsx`'s `shareToSchoolBank()`, which wasn't writing
   `curriculumId`/`chapterIds` at all — those are the two fields this feature joins on, so it
   would have had zero matches without that fix.
3. **Cross-Language Exam Duplication** — new `POST /api/exam/translate` +
   `src/lib/prompts/translateExam.ts`, "Translate to…" action on each dashboard exam row. Verified
   live end-to-end (real Claude call): numbers, IDs, `chapterIds`, and LaTeX/`\ce{}` preserved
   exactly, only prose translated. Offers all three app languages (French/English/Arabic) since
   this is translation of already-generated content, not new curriculum-grounded generation —
   flagged explicitly per this file's own caveat, not a silent scope decision.

Built by three parallel subagents (one per feature, isolated git worktrees), then merged,
QA'd (type-check, full production build, live requests against both new API routes, code
review of the client-only widget), and two real bugs fixed before merge: `sonner`'s `<Toaster/>`
was never mounted anywhere in the app (silently swallowing toasts on several existing pages
too, not just the new one), and the `schoolBank` write gap above.

## Approved — ready to build

*(none yet)*

## Declined / parked

*(none yet — Antoine can note why here so future weeks don't re-propose the same idea)*
