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

## 2026-09-15 — Root-cause investigation: "Second degré" / "Dérivation" / "Trigonométrie" coverage flags

Triggered by Antoine seeing these three Bac Français Première-spé-math chapters flagged "!" on
`/create/generate`'s Chapter Coverage card. A separate, parallel fix is adding a manual "add one
question for this missing chapter" UI safety net (`src/app/create/generate/page.tsx`, not touched
by this investigation). This section is the deeper grounding question: is the coverage gap a
curriculum-data problem (Problem A) or a generation-pipeline problem (Problem B)? Verdict: **almost
entirely Problem B** — a real, findable regression, not a curriculum content gap.

### Problem A check — curriculum data is fine for these three chapters

`src/data/curricula/bac-francais.ts` lines 392-426, level `premiere-fr-spe-math` ("Première —
Spécialité Mathématiques"):
- `pre-fr-math-second-degree` — "Résoudre équations et inéquations du second degré", "Étudier
  signe du trinôme", "Utiliser forme canonique".
- `pre-fr-math-derivation` — "Calculer dérivées usuelles", "Étudier variations et extremums",
  "Déterminer équation de tangente".
- `pre-fr-math-trigonometry` — "Utiliser le cercle trigonométrique", "Résoudre équations
  trigonométriques".

All three match the real 2019-reform BO programme content for this level (see Sources below —
canonical form/discriminant/sign-of-trinomial for second degré, derivative number/tangent/usual
derivatives for dérivation, unit circle/trig equations for trigonométrie). **No correction is
being proposed for these three chapters** — they are not missing, not stubbed, not wrong.

### Problem B — confirmed: a real schema regression in `src/lib/prompts/generate.ts`

Found via `git log -p --follow -- src/lib/prompts/generate.ts`:

- Commit `9515e8a` ("feat: implement AI exam generation service with curriculum-specific prompt
  templates and routing", 2026-05-15) restructured the AI-facing JSON output schema from a flat
  per-exercise array to `{ header, exercises: [...] }` (to add
  `header.schoolName/className/teacherName/date`). In doing so it **silently dropped two fields
  from the per-exercise schema that existed just before: `"chapterIds": string[]` and
  `"estimatedMinutes": number`.** `src/lib/prompts/generate.ts.bak` — a tracked leftover copy of
  the file, committed 2026-04-23 in `61f2718`, i.e. three weeks *before* the regression — still has
  the pre-regression schema (line 529: `"chapterIds": string[],`) for direct before/after
  comparison.
- Today's schema (`generate.ts` lines 592-631, inside `buildGenerateSystemPrompt()`) lists
  `id, number, type, difficulty, points, statement, options, subQuestions, solution` — **no
  `chapterIds`, no `estimatedMinutes`.** The model is never asked to tag which chapter(s) an
  exercise covers.
- Meanwhile `buildChapterDistribution()` (`generate.ts` lines 648-673) *does* still correctly
  build a "CHAPTER COVERAGE (MANDATORY)" block mapping each exercise number to chapter **display
  names** ("Second degré", "Dérivation", "Trigonométrie") — so the model most likely is still
  writing exercise content that touches each chapter. The break is downstream: nothing tells the
  model to *label* which exercise covers which chapter in a machine-readable way. The frontend
  coverage counter (`src/app/create/generate/page.tsx` lines 369-379,
  `for (const cid of ex.chapterIds ?? []) ...`) then sees `ex.chapterIds` as empty/undefined for
  most exercises and flags the chapter "missing" even when the exercise content is actually fine.
- **The frontend counting loop itself is correct** (one of the specific things this task asked to
  check): it iterates `for (const cid of ex.chapterIds ?? [])` for every exercise, i.e. it counts
  *all* of an exercise's assigned chapterIds, not just the first one — a multi-chapter exercise
  would be counted correctly for every chapter it lists, if that list were ever populated. The bug
  is entirely upstream of this loop.
- Two things make a same-shaped hot-fix (just re-adding `"chapterIds": string[]` to the schema)
  insufficient on its own:
  1. **No canonical chapter-ID vocabulary is ever shown to the model.** `buildChaptersSummary()`
     (`src/data/curricula/index.ts` lines 51-70) injects `ch.name.fr` and `ch.objectives` into the
     `<selected_chapters>` block — never `ch.id`. Even a model that dutifully fills in
     `chapterIds` would have to *guess* an ID string (e.g. `"second-degre"`) that will very likely
     not byte-for-byte match the real ID (`pre-fr-math-second-degree`) the frontend compares
     against.
  2. **No Zod (or any) validation of the AI's response.** `src/app/api/generate/route.ts` parses
     the model's JSON straight into `any` (`robustParse()`/`JSON.parse()`, lines 464, 493) and
     streams it to the client verbatim. `RequestSchema`/`ExamContextSchema` (lines 30, 61) validate
     the *incoming* request only — nothing validates the AI's *output* against the `Exercise`
     shape. This is a gap against CLAUDE.md §10 ("Zod at every boundary... Parse anything coming
     from the AI"), and it's exactly why the May 15 schema drift shipped silently — nothing failed
     loudly when the field disappeared. Notably, `Exercise.chapterIds` and `estimatedMinutes` are
     typed as **required** in `src/types/exam.ts` (lines 93-96, no `?`), yet the frontend already
     defends against them being absent at runtime (`ex.chapterIds ?? []`) — a sign whoever wrote
     that widget already suspected the field wasn't reliably present.

**Conclusion for Antoine:** the "!" flags on these (and likely most other) chapters are primarily
a generation-pipeline bug — a field silently dropped from the output schema five weeks ago, with
no canonical ID vocabulary given to the model and no output validation to catch drift — not a
curriculum-grounding problem. Fixing it is a `src/lib/prompts/generate.ts` prompt change plus
(ideally) an `api/generate/route.ts` output-validation change; out of scope for this
research-only pass, flagged here for whoever picks it up next.

### Sources verified — Bac Français Première-spé-math content (for the Problem A check above)

- Primary source per `docs/DATA_SOURCING.md`: *Programme d'enseignement de spécialité de
  mathématiques de la classe de première de la voie générale*, Bulletin officiel spécial n°1 du 22
  janvier 2019 — https://www.education.gouv.fr/bo/19/Special1/MENE1901632A.htm. **Direct fetch of
  this URL returned HTTP 403** from this environment — content below is corroborated via secondary
  compilations, not quoted verbatim from the BO page itself. Flagging this explicitly rather than
  presenting it as a direct primary-source read.
- Secondary corroboration (independent sites, same 2019-reform Première-spécialité content,
  consistent with each other and with `bac-francais.ts`):
  - Second degré: forme canonique, discriminant/racines, signe du trinôme, résolution
    d'inéquations — https://mathlvl.fr/premiere-spe-maths/second-degre,
    https://www.geniesdessciences.com/chapitres/maths-1re-second-degre/
  - Dérivation: nombre dérivé, tangente à une courbe, dérivées usuelles, lien signe de la dérivée /
    variations — https://www.annales2maths.com/1ere-cours-nombre-derive/
  - Trigonométrie: cercle trigonométrique, radian, valeurs remarquables, fonctions sinus/cosinus,
    équations trigonométriques — https://www.math93.com/lycee/155-pedagogie/lycee/premiere-maths-specialite/1112-premiere-spe-maths-trigonometrie.html
- **Open item, not resolved:** literal BO "contenus / capacités attendues" wording was not
  obtained (403 on the primary source; one compiled programme PDF found was binary/unreadable via
  fetch). A future audit pass should get the literal BO wording on file — this narrows (not
  replaces) the still-open backlog item below, "Audit `bac-francais.ts`... flag anything from a
  pre-2019-reform programme": these 3 chapters are now confirmed content-accurate, just not yet
  literally-quoted from the primary source.

### "Chamel" / "Shamel" — real name confirmed: **Al-Shamel** (الشامل)

- Correct spelling is **"Al-Shamel"**, not "Chamel". Confirmed via:
  - Google Books: *"Al-Shamel for Brevet Exams: Sessions of 2019-2020: Biology-Math-English-
    Physics-Chemistry"*, George Maroun, 2020 —
    https://books.google.com.lb/books/about/Al_shamel_for_Brevet_Exams.html?id=FtA6zgEACAAJ
  - kitabon.com sells "AL-SHAMEL MATH BOOKLET" per-grade booklets (fetch blocked by a TLS cert
    mismatch from this environment; confirmed via search snippet only) —
    https://kitabon.com/product/al-shamel-math-booklet-1st-elementary-first-semester-second-semester/
  - A Lebanese-student blog describes it as compiling "samples that came in previous years in
    every subject", sold split into three books for "Bac2" (Terminale) —
    https://lebanesestudent.wordpress.com/tag/alshamel/
- **Curriculum-track mismatch to flag:** Al-Shamel is built around **official Lebanese exam
  sessions** ("Brevet", "Bac2"/"GS"/"LS") — i.e. it is a **Bac Libanais (CRDP)** resource, not a
  Bac Français (Éduscol/BO) one. The three flagged chapters are in the **Bac Français** track.
  Using Al-Shamel to ground Bac Français "Second degré"/"Dérivation"/"Trigonométrie" would source
  from the wrong curriculum track — CRDP's programme and the French BO programme overlap but are
  not identical at this level (this split is already the whole premise of
  `docs/DATA_SOURCING.md`'s per-curriculum sourcing sections). If Antoine meant Al-Shamel for Bac
  **Libanais** chapters specifically, it's a legitimate resource for that track only.
- **Copyright status:** Al-Shamel is a commercial, copyrighted compiled workbook (~38,000 LL for
  the Bac2 edition per the source above) — its own selection/editing/answer keys are not freely
  reusable as grounding data. The material it compiles (official CRDP past exam sessions,
  "dawrat") **is** public-sector-published, and is exactly the source
  `docs/DATA_SOURCING.md`'s "Verification signal" section for Bac Libanais already recommends.
  **Recommendation: source past exam papers directly (CRDP's own published sessions, or
  established open archives) rather than the Al-Shamel workbook itself** — same authority, no
  copyright ambiguity.
- **For Bac Français specifically**, an equivalent real-past-exam source already exists and is
  directly on-topic: the French Baccalauréat is officially zoned by exam center, and **Lebanon is
  its own zone ("Liban")** with full past papers publicly archived — e.g.
  https://www.sujetdebac.fr/annales/s-mathematiques-specialite-2018-liban,
  https://www.freemaths.fr/annales-bac-mathematiques-terminales-s/sujets-et-corrections-bac-maths-s-liban,
  https://www.mathsbook.fr/annales/bac-maths/s/liban. These are literal official exam papers set
  for French-track schools in Lebanon (Mission Laïque, LFB, etc. — exactly `bac-francais.ts`'s
  stated audience, file header lines 4-5) — a stronger, more directly relevant source than generic
  French annales or the Lebanese-track Al-Shamel.

### Concrete, scoped proposal

1. **Fix the schema regression first (highest leverage, smallest diff):** restore
   `"chapterIds": string[]` and `"estimatedMinutes": number` to the per-exercise JSON schema in
   `buildGenerateSystemPrompt()`, AND pass canonical chapter `id` strings (not just display names)
   into `buildChaptersSummary()`'s `<selected_chapters>` block and/or
   `buildChapterDistribution()`'s per-exercise mapping, so the model has real IDs to echo back
   instead of guessing. This is a prompt-only change with no schema/type changes needed — but it's
   a real fix to a real regression, out of scope for this research-only pass. Flagging it here for
   whoever next touches `src/lib/prompts/generate.ts`.
2. **Add output validation** for the AI's exercise JSON (Zod, per CLAUDE.md §10) in
   `src/app/api/generate/route.ts` — would have caught this regression the day it shipped instead
   of five weeks later as a user-visible "!" on the coverage card.
3. **Longer-term grounding** (this file's actual mandate): don't rely on the model's own
   training-data notion of what "Second degré" covers — attach short, real sub-topic summaries
   sourced from the official programme (BO for Bac Français, CRDP for Bac Libanais, IBO guides for
   IB, per `docs/DATA_SOURCING.md`'s existing methodology) directly onto each `Chapter` object,
   and/or real past-exam exercise summaries as generation-time few-shot grounding — generalizing
   this file's existing exemplar-bank backlog item to include *official* past exams (CRDP dawrat,
   "Liban"-zone BO annales) as a second source alongside teacher-shared School Bank exercises. For
   Bac Français chapters specifically, prefer the "Liban" exam-zone annales linked above over
   generic French annales — same student population Imtihan targets.
4. **Do not use Al-Shamel as a direct content source** for either track without further legal
   review (commercial compiled workbook); source official past exams directly instead, per point 3.

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
      that looks like it's from a pre-2019-reform programme. **Partial progress 2026-09-15:** the
      three `premiere-fr-spe-math` chapters "Second degré"/"Dérivation"/"Trigonométrie" were
      spot-checked against secondary compilations of the 2019-reform BO spécial n°1 programme and
      look accurate — see the dated section above. Literal BO wording still not obtained (403 on
      the primary source from this environment) and the rest of the file is still unaudited.
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
