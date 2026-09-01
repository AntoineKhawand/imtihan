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

## Shipped

*(none yet)*

## Approved — ready to build

*(none yet)*

## Declined / parked

*(none yet — Antoine can note why here so future weeks don't re-propose the same idea)*
