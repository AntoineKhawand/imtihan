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

## ✅ Known blocker to fix before building the exemplar bank — RESOLVED 2026-09-24

**Update 2026-09-24 (`engineering`):** Dead `src/lib/schoolBank.ts` (collection `"school_bank"`,
field `"school"`) has been deleted, and the stale `"school"`-field fallback read (plus its unused
type field) in `src/app/student/practice/page.tsx` has been removed. This was a pure cleanup — the
live `src/app/bank/page.tsx` implementation (`shareToSchoolBank`/`getSchoolBankExercises`,
collection `"schoolBank"`, field `"schoolSlug"`) was left untouched, not consolidated. `getChapterExemplars()`
below still needs to be written fresh against `bank/page.tsx`'s inline pattern (there is no
`schoolBank.ts` module to add it to anymore) — see the build-out checklist. `npm run type-check`
clean; not yet reviewed by `qa`.

Original note, kept for history:

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

## 2026-09-24 — Bac Français pre-2019-reform audit: blocked, no verification possible this session

Picked up the open backlog item "Audit `bac-francais.ts` chapters against the current BO programme
edition — flag anything that looks like it's from a pre-2019-reform programme," specifically the
part left unaudited after 2026-09-15 (everything in `src/data/curricula/bac-francais.ts` other than
the three `premiere-fr-spe-math` chapters already confirmed that day: "Second degré", "Dérivation",
"Trigonométrie" — not re-checked here, per instruction).

**Full read done, no edits made.** Read `src/data/curricula/bac-francais.ts` in full (all 11
levels: `cinquieme-fr` through `terminale-fr-spe-ses`) and `docs/DATA_SOURCING.md`'s Bac Français
section. The levels/subjects still needing this specific pre-2019-reform-drift check are:
`premiere-fr-spe-math`'s remaining math chapters (`pre-fr-math-exponential`,
`pre-fr-math-sequences`) plus its non-MVP subjects (french, history-geography, philosophy, ses);
all of `terminale-fr-spe-math` (6 math chapters); all of `terminale-fr-spe-pc` (3 physics + 3
chemistry chapters); and the non-MVP-subject levels (`terminale-fr-spe-svt`, `terminale-fr-spe-nsi`,
`terminale-fr-spe-ses`). None of these were verified this session — see why below.

**Blocker: no external-verification tool was actually available this session, contrary to the
task's premise.** The task instructions said "WebFetch is not available this session... use
WebSearch instead," matching the pattern already established in the 2026-09-19 IB command-terms
entry above. In practice, every `WebSearch` call this session returned a hard tool-level
`"Permission to use WebSearch has been denied"` error — not a network failure or a per-site block
like the 403s/TLS errors logged in `docs/DATA_SOURCING.md` and the 2026-09-15 entry, but a denial
at the permission layer, on three different queries (BO Première spé-math programme content, BO
Terminale spé-math programme content, BO spécial n°8 25 juillet 2019 full text). `WebFetch` is not
even in this session's tool list. That leaves **zero** tools capable of checking a claim against any
external source this run.

**Why nothing in `bac-francais.ts` was touched:** this team's own operating rule (and
`docs/DATA_SOURCING.md`'s explicit methodology) is to require independent secondary sources to
converge before treating any programme-content claim as reliable, and to never invent or guess
chapter content. I do have background knowledge (from training, not a live-verified source) that
makes a few things in the unaudited sections worth a *flag* for a future pass with working
`WebSearch`/`WebFetch`:
- `terminale-fr-spe-math` has no chapter for **nombres complexes** (complex numbers), which was
  added to the Terminale spécialité mathématiques programme as part of the 2019-reform rollout and
  is heavily examined — if genuinely absent from the real BO programme's current edition this would
  be a real gap, but this is *unverified this session* and must not be treated as confirmed.
- `ter-fr-math-probability`'s objectives list "loi normale" (normal distribution) — my own
  recollection is that continuous/normal-distribution content sits in the *Enseignement
  scientifique* tronc-commun programme rather than the spécialité mathématiques one, which would
  make this a possible mis-attribution, but again this is **not verified against any source this
  session** and should not be acted on without confirmation.
- `premiere-fr-spe-math` has no chapter covering vecteurs/produit scalaire or probabilités
  (variables aléatoires, loi binomiale), both of which I recall being part of the Première
  spécialité mathématiques programme — again, unverified, flagged only as a lead.

None of the three points above were changed in `bac-francais.ts` — they are explicitly *leads for a
future pass*, not confirmed findings, because they rest on unverified background knowledge rather
than a real source check. Presenting them as fixed would be exactly the "confident but wrong"
failure mode this team is instructed to avoid.

**What was done:** `npm run type-check` was run against the unmodified file and is clean (no
changes were made, so this simply confirms the pre-existing baseline is still clean). No changes to
`src/data/curricula/bac-francais.ts` in this session.

**Backlog item left open, more narrowly scoped for next time:** the remaining audit
(`premiere-fr-spe-math` exponential/suites chapters, all of `terminale-fr-spe-math`, all of
`terminale-fr-spe-pc`, and non-MVP subjects in the file) requires a session with working
`WebSearch` or `WebFetch` before any further edits can be made responsibly. The three leads above
(nombres complexes gap, "loi normale" placement, vecteurs/probabilités gap in Première) are a
good starting checklist for that pass, but must be independently confirmed via convergent secondary
sources (same rigor as the 2026-09-19 IB entry) before treating them as real.

## 2026-09-25 — Bac Français pre-2019-reform audit retry: WebSearch denied a second consecutive session

Picked up the same backlog item as 2026-09-24 ("Audit `bac-francais.ts` chapters against the current
BO programme edition") specifically to retry the 3 unverified leads left by that session (possible
missing "nombres complexes" chapter in `terminale-fr-spe-math`; possible "loi normale"
mis-attribution in `ter-fr-math-probability`; possible missing vecteurs/probabilités chapters in
`premiere-fr-spe-math`), on the premise that `WebSearch` would be working tonight.

**It is not.** Two separate `WebSearch` calls this session — one for the terminale spé-math
"nombres complexes" question, one for the BO spécial n°8 (25 juillet 2019) programme text directly —
both returned the identical hard tool-level `"Permission to use WebSearch has been denied"` error
seen on 2026-09-24, not a network/site-level failure. `WebFetch` is again not present in this
session's toolset. That means, for the second consecutive audit attempt, there is still no tool in
this environment capable of checking any curriculum claim against a real external source.

**No verification was possible, so no edits were made to `src/data/curricula/bac-francais.ts`.**
Re-read the file in full to confirm nothing had drifted since 2026-09-24 (it hasn't — same content,
same 3 leads still open, same unaudited scope: `premiere-fr-spe-math`'s exponential/suites chapters
and non-MVP subjects; all of `terminale-fr-spe-math`; all of `terminale-fr-spe-pc`; and the
non-MVP-subject levels SVT/NSI/SES). Per this team's standing rule and the task's own explicit
instruction ("if WebSearch is STILL blocked/denied tonight, stop immediately, make no edits, and
report that clearly — don't improvise from memory"), none of the 3 leads were applied as fixes. They
remain exactly what they were on 2026-09-24: plausible, background-knowledge-only leads, not
confirmed findings, and must not be treated as such by a future pass.

**What was done:** `npm run type-check` run against the unmodified file — clean (confirms baseline,
not a content change). No other file touched.

**Flag, stated plainly since this is the second identical failure in a row:** this is now a
reproducible environment/tooling problem, not a one-off. Two consecutive dated sessions
(2026-09-24, 2026-09-25) targeting this exact backlog item were both fully blocked by the same
`WebSearch` permission denial, with `WebFetch` absent both times. Retrying a third time with the same
tool configuration is unlikely to produce a different result — this needs the tool-attachment/permission
fix itself (same category of fix `seo-growth` flagged for its own blocked `gsc`/`chrome-devtools` MCP
tools on 2026-09-19) before this backlog item can make further progress. Not a business decision, so
not routed to `FOUNDER_DECISIONS.md` — this is a session/tooling configuration issue for whoever
manages agent tool permissions to fix.

**Backlog item left open, unchanged in scope from 2026-09-24.** The 3 leads (nombres complexes gap,
"loi normale" placement, vecteurs/probabilités gap in Première) remain the starting checklist for
whichever future session actually gets working `WebSearch` or `WebFetch` access — do not act on them
without independent, convergent, real-source confirmation first.

## Backlog (pick one per Wednesday, highest priority first)

### Data accuracy audits (grounded in `docs/DATA_SOURCING.md`)
- [x] **2026-09-19:** Audited the `COMMAND_TERMS["ib-english"]` IB command-term glossary in
      `src/lib/prompts/generate.ts` (lines 71–117) against the current IBO Diploma Programme
      command-term conventions — this is the block `docs/DATA_SOURCING.md` explicitly flags as
      needing to "stay verbatim" since exact wording affects mark-scheme validity. **Method
      limitation, stated up front:** this session had no `WebFetch`/browser tool, only `WebSearch`
      — so nothing here is a direct quote pulled from the primary IBO subject-guide PDF itself.
      Instead, each spot-checked term was verified by requiring **multiple independent secondary
      sources (school-hosted command-term PDFs, IB-subject blogs, tutoring sites) to converge on
      identical, distinctively-worded phrasing** before treating it as reliable — a coincidental
      match across unrelated sites on an unusual exact phrase is unlikely unless they're all
      quoting the same real source. ~15 of the ~30 terms in the block were spot-checked this way.
      **Confirmed accurate, no change:** "State", "Define", "List", "Draw", "Label", "Measure",
      "Outline", "Deduce", "Explain" all matched the block's existing wording exactly. The
      M1/A1/ecf method/answer-mark convention and "[1]/[2]/[3]" bracketed mark notation
      (lines 109–117) were also confirmed still current IB Diploma Programme practice (distinct
      from MYP, which uses different notation).
      **Found and fixed 5 real wording discrepancies** (all in the OBJECTIVE 3 block):
      - `"Analyse"` was defined as "Interpret data to reach conclusions" — this doesn't match any
        source found; the real definition is **"Break down in order to bring out the essential
        elements or structure."** Fixed.
      - `"Compare"` was defined as "Give an account of similarities AND differences between two or
        more items" — this is actually the definition of **"Compare and contrast"**, a distinct
        command term. The real "Compare" definition covers similarities only: **"Give an account
        of the similarities between two or more items or situations, referring to both (all) of
        them throughout."** This one matters for grading accuracy: a generated mark scheme built
        on the old definition would have been awarding marks for differences under a term that,
        per real IB convention, shouldn't require them. Fixed.
      - `"Discuss"` was a shortened paraphrase ("Give an account including arguments for and
        against, where possible") of the real, longer definition: **"Offer a considered and
        balanced review that includes a range of arguments, factors or hypotheses. Opinions or
        conclusions should be presented clearly and supported by appropriate evidence."** Fixed.
      - `"Evaluate"` was defined as "Assess the implications and limitations" — this phrasing
        traces to the **MYP** (Middle Years Programme) glossary, not the Diploma Programme one
        Imtihan actually generates for. The real DP definition is **"Make an appraisal by weighing
        up the strengths and limitations."** Fixed.
      - `"Suggest"` was missing a clause: "Propose a hypothesis or other possible answer" should be
        **"Propose a solution, hypothesis or other possible answer."** Fixed.
      **Not spot-checked this pass** (left unchanged, not verified either way): "Calculate",
      "Describe", "Distinguish", "Estimate", "Identify", "Annotate", "Apply", "Sketch",
      "Construct", "Derive", "Determine", "Predict", "Show"/"Show that", "Solve", "Hence", "Hence
      or otherwise" — none of these showed up as obviously wrong in the searches run, but they
      weren't independently confirmed either, so treat them as unverified, not as re-confirmed.
      **Recommended follow-up:** a future pass with `WebFetch`/browser access should pull the real
      IBO subject-guide PDF text directly (the general Diploma Programme command-term glossary, or
      at minimum the Physics/Chemistry/Mathematics subject-guide appendices, since those are
      Imtihan's actual supported subjects) to close the remaining gap between "converging secondary
      sources" and an actual primary-source quote — same standard `docs/DATA_SOURCING.md` already
      applies to CRDP and BO sourcing.
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
      **2026-09-24: blocked, no progress possible.** `WebSearch` returned a hard permission denial
      on every query this session and `WebFetch` was not in the toolset at all — no external source
      could be checked, so no edits were made. Three unverified leads (possible missing "nombres
      complexes" chapter in `terminale-fr-spe-math`, possible "loi normale" mis-attribution in
      `ter-fr-math-probability`, possible missing vecteurs/probabilités chapters in
      `premiere-fr-spe-math`) were logged as a starting checklist for a future pass — see the dated
      section above — but are explicitly *not confirmed* and must not be treated as findings. Still
      fully unaudited: `premiere-fr-spe-math`'s exponential/suites chapters and non-MVP subjects,
      all of `terminale-fr-spe-math`, all of `terminale-fr-spe-pc`, and the non-MVP-subject levels
      (SVT, NSI, SES).
      **2026-09-25: retried, blocked again.** Same hard `WebSearch` permission denial on 2 separate
      queries, `WebFetch` still absent — second consecutive session unable to verify anything. No
      edits made. See the dated section above; this is now flagged as a reproducible tooling problem,
      not a one-off, worth fixing before a third retry.
- [x] **2026-09-19, partial:** Audit `ib.ts` command-term usage in `src/lib/prompts/generate.ts`
      against the current IBO command term glossary edition — see the dated section above for full
      detail. ~15 of ~30 terms spot-checked via convergent secondary sources (no `WebFetch` this
      session, so no direct primary-source PDF quote); 5 real wording errors found and fixed
      (Analyse, Compare, Discuss, Evaluate, Suggest); [1]/[2]/[3] mark notation and M1/A1/ecf
      conventions confirmed still current. Remaining ~15 terms and a primary-source PDF read are
      left for a future pass with browser/`WebFetch` access.

### Exemplar-bank build-out (no extra AI cost)
- [x] **Blocker above resolved 2026-09-24** — dead `schoolBank.ts` deleted; only `bank/page.tsx`'s
      inline implementation remains (not consolidated into a shared module).
- [ ] Write `getChapterExemplars(curriculumId, levelId, subject, chapterId)` — no `src/lib/schoolBank.ts`
      module exists anymore, so this needs a fresh home (e.g. a new `src/lib/schoolBank.ts` written
      against the current `"schoolBank"`/`"schoolSlug"` schema, or inline next to `bank/page.tsx`'s
      logic) — queries School Bank exercises tagged with a chapter, returns up to 2, ranked by recency.
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
