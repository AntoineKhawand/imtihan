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

## 2026-09-27 — Bac Français pre-2019-reform audit: WebSearch restored, 2 confirmed fixes + 1 refuted lead

Retried the same backlog item ("Audit `bac-francais.ts` chapters against the current BO programme
edition") specifically to resolve the 3 leads left open by 2026-09-24/2026-09-25 (both fully blocked
by a hard `WebSearch` permission denial, `WebFetch` absent). **Confirmed working this session:**
`WebSearch` returned real results on the first test query, and `WebFetch` was available too (per the
task note that it was added 2026-09-25) — though direct fetches of `education.gouv.fr/bo/...` URLs
still return HTTP 403 from this environment, same as every prior session; all verification below
relied on independent secondary compilations, cross-checked 2-4 sources deep per claim, same
convergent-sources discipline as the 2026-09-19 IB command-terms audit.

**Lead 1 — "possible missing nombres complexes chapter in `terminale-fr-spe-math`" — REFUTED, no
edit made.** This lead was backwards. Complex numbers were *removed* from the compulsory Terminale
spécialité mathématiques programme in the 2019 reform and now live **only** in the optional
"mathématiques expertes" track (a separate enseignement Imtihan doesn't model as its own subject).
Confirmed via 3 independent, detailed sources that explicitly state the specialty programme's
absence of the topic:
- https://www.cours-thales.fr/lycee/terminale/programme-mathematiques/ — verbatim: "Les grands
  absents de ce nouveau programme sont les nombres complexes" (only in maths expertes).
- https://www.jai20enmaths.com/terminale — full 16-chapter list of the compulsory specialty with no
  complex-numbers chapter present.
- Search-aggregated confirmation across sherpas.com, lesclefsdelecole.com, lyceedadultes.fr,
  annabac.com (all independently describing nombres complexes as a maths-expertes-only topic post-2019).
`terminale-fr-spe-math` correctly has **no** nombres complexes chapter — this is accurate, not a gap.
No change made.

**Lead 2 — "possible loi normale mis-attribution in `ter-fr-math-probability`" — CONFIRMED, fixed.**
"Loi normale" (normal distribution) does **not** appear anywhere in the compulsory Terminale
spécialité mathématiques probability programme. The 2019 reform explicitly *removed* lois à densité,
loi normale, and inferential-statistics content from this track, replacing it with combinatorics,
sums of random variables, and the law of large numbers. Confirmed via 3 independent sources that
each list the real 3-chapter probability programme and explicitly note loi normale's absence:
- https://www.jai20enmaths.com/terminale — verbatim: "Les grands absents... la loi normale et les
  statistiques" removed, replaced by combinatorics/sums-of-variables/law-of-large-numbers.
- https://xymaths.fr/Lycee/Terminale-generale-specialite-mathematiques/ — lists "probabilités
  conditionnelles et loi binomiale," "combinatoire et dénombrement," "somme de variables aléatoires,
  inégalités et loi des grands nombres" with no loi normale mention.
- https://groupe-reussite.fr/ressources/programme-terminale-maths/ — same 3-chapter probability
  breakdown verbatim ("Succession d'épreuves indépendantes et schéma de Bernoulli," "Sommes de
  variables aléatoires," "Concentration et loi des grands nombres"), explicitly confirming no loi
  normale anywhere in the content provided.
Fixed `ter-fr-math-probability` in `bac-francais.ts`: renamed from "Probabilités — loi binomiale et
normale" to "Probabilités — schéma de Bernoulli et variables aléatoires," and replaced the
objectives (previously: "Utiliser loi binomiale" / "Utiliser loi normale" / "Construire intervalle de
fluctuation" — the last of these is also pre-2019-reform terminology) with the real programme content:
dénombrement/Pascal's triangle, schéma de Bernoulli + loi binomiale, sums of independent random
variables, and the Bienaymé-Tchebychev inequality / law of large numbers. Chapter `id` unchanged
(grepped `src/` first — only `bac-francais.ts` itself references it, so renaming the display name and
objectives is safe).
**Not independently resolved:** whether "loi normale" instead belongs to the *Enseignement
scientifique* tronc-commun programme, as the original lead speculated. Searches on this point were
inconclusive/generic (no clean primary-source or single authoritative secondary source pinning it to
a specific ES theme) — this narrower attribution question is left open, but didn't need resolving to
fix the actual bug, since the wrong content was confirmed wrong for spé maths terminale regardless of
where (or whether) it belongs elsewhere.

**Lead 3 — "possible missing vecteurs/produit scalaire or probabilités chapters in
`premiere-fr-spe-math`" — CONFIRMED, fixed.** Both are real, present chapters in the compulsory
Première spécialité mathématiques 2019-reform programme that were entirely absent from
`premiere-fr-spe-math`'s chapter list. Confirmed via 3 independent sources:
- https://groupe-reussite.fr/ressources/programme-premiere-maths/ — 18-chapter breakdown including
  "Produit scalaire" and "Géométrie repérée" under Géométrie, and "Conditionnement et indépendance" +
  "Variables aléatoires réelles" under Probabilités et Statistiques.
- https://www.logamaths.fr/premiere-specialite-maths/ — 13-chapter list explicitly confirming both:
  "Produit scalaire de deux vecteurs dans le plan" (ch. 2 and 9) and "Probabilités, probabilités
  conditionnelles. Événements indépendants" (ch. 3) + "Variables aléatoires réelles discrètes" (ch. 7).
- https://www.lesclefsdelecole.com/Lycee/Spe-Maths-1re/Le-programme-de-la-Spe-Maths — confirms
  "Probabilités conditionnelles & indépendance" and "Les variables aléatoires" as distinct chapters
  (less conclusive on produit scalaire specifically as a standalone heading, but doesn't contradict
  the other two sources).
Added two new chapters to `premiere-fr-spe-math.mathematics` in `bac-francais.ts`:
`pre-fr-math-scalar-product` ("Produit scalaire" — dot product, vector coordinates via dot products,
orthogonality/projection applications) and `pre-fr-math-probability` ("Probabilités conditionnelles
et variables aléatoires" — conditional probability, independence, discrete random variable law,
expectation/variance/standard deviation). This closes the gap the original lead flagged; the level
now has 7 mathematics chapters instead of 5.

**Verification:** `npm run type-check` clean after both edits. `WebFetch` on the two primary
`education.gouv.fr/bo/...` BO source URLs still returned HTTP 403 both times this session (same as
every prior session) — nothing here is a direct primary-source quote; all three findings rest on
2-3-source convergent secondary-source corroboration, per this team's standing methodology. Not yet
reviewed by `qa`.

**Remaining unaudited scope, unchanged:** `premiere-fr-spe-math`'s exponential/suites chapters (now
also worth a quick recheck alongside the rest, though not flagged as suspect) and its non-MVP
subjects (french, history-geography, philosophy, ses); all of `terminale-fr-spe-math`'s other 5
chapters (limits, dérivation/primitives, logarithm, integrals, geometry-space — probability now
fixed); all of `terminale-fr-spe-pc` (3 physics + 3 chemistry chapters); non-MVP-subject levels
(`terminale-fr-spe-svt`, `terminale-fr-spe-nsi`, `terminale-fr-spe-ses`). No new leads identified for
these this session — this pass was scoped to the 3 specific leads queued from 2026-09-24/09-25, not a
fresh read of the unaudited sections.

## 2026-09-29 — Bac Français pre-2019-reform audit: `terminale-fr-spe-pc` — 8 confirmed real gaps found and fixed

Picked up the largest remaining piece of the open backlog item ("Audit `bac-francais.ts` chapters
against the current BO programme edition"), per this run's specific instruction: audit
`terminale-fr-spe-pc` (Terminale spécialité Physique-Chimie) — previously entirely unaudited across
2026-09-24/25/27.

**Primary source attempted, blocked as usual:** `education.gouv.fr/bo/20/Special2/MENE2001798N.htm`
(the URL supplied by the task) returned HTTP 403 on direct `WebFetch`, same as every prior session's
direct BO fetches. Also discovered via `WebSearch` that this specific URL is actually the note de
service on the **exam format/évaluation périmètre** ("Épreuve de l'enseignement de spécialité
physique-chimie... à compter de la session 2021"), not the programme content itself — the real
programme-content arrêté is a different BO page, **BO spécial n°8 du 25 juillet 2019**
(`education.gouv.fr/bo/19/Special8/MENE1921249A.htm`, arrêté du 19-7-2019). That URL also returned
HTTP 403 on `WebFetch`. Flagging this distinction for future sessions citing "the BO source" for this
subject — the exam-format note and the programme-content arrêté are two different documents.

**Verification method:** with both primary-source URLs blocked, used 2-3 independent secondary
sources per claim (same convergent-sources discipline as every prior entry in this file), most
substantively `sherpas.com/blog/programme-physique-chimie-en-terminale/` and
`annabac.com/terminale-generale/physique-chimie`, which independently produced near-identical
4-theme/sub-topic breakdowns (`cours-thales.fr` and `missiongrandeecole.fr` independently confirmed
just the 4 top-level theme names: Constitution et transformations de la matière, Mouvement et
interactions, L'énergie: conversions et transferts, Ondes et signaux — matching the 2 detailed sources).

**Findings — all fixed, all additive or corrective, no chapter `id`s renamed (grepped `src/` first;
only `bac-francais.ts` itself references any of these ids, so edits are safe):**

1. **Missing chapter — fluid mechanics.** "Écoulement d'un fluide" (Archimedes' principle, permanent
   flow, incompressible fluid volumetric flow rate) is a real, named sub-theme of "Mouvement et
   interactions" in both sources but had zero representation anywhere in the file. Added
   `ter-fr-phys-fluids`.
2. **Missing chapter — ideal gas / thermal transfer.** "Décrire un système thermodynamique: exemple
   du modèle du gaz parfait" (perfect gas model, state equation) and thermal-transfer content
   (thermal flux, thermal resistance, Newton's law of cooling) are real sub-themes of "L'énergie:
   conversions et transferts" that the existing `ter-fr-phys-energy` chapter's objectives ("bilan
   énergétique," "rendement d'une conversion") didn't cover at all. Added these as new objectives on
   the existing chapter rather than a new chapter (same theme, doesn't warrant a split).
3. **Missing chapter — photons/light.** "Former des images, décrire la lumière par un flux de
   photons" (photoelectric effect, astronomical-telescope optical model, photon absorption/emission)
   is a real, distinct sub-theme of "Ondes et signaux," entirely absent. Added `ter-fr-phys-photons`.
4. **Missing chapter — RC electrical circuits.** "Étudier la dynamique d'un système électrique"
   (current/charge relationship, capacitor charge-tension relation, RC circuit charge/discharge
   model) is the third named sub-theme of "Ondes et signaux," entirely absent. Added
   `ter-fr-phys-circuits`.
5. **Missing chapter — chemical analysis methods.** "Déterminer la composition d'un système par des
   méthodes physiques et chimiques" (pH measurement, Beer-Lambert/UV-vis spectrophotometry,
   conductimetry/loi de Kohlrausch, IR spectroscopy, pH-metric and conductimetric titration) is one
   of the four named sub-themes of "Constitution et transformations de la matière" and was completely
   absent from the file despite titration being extremely heavily examined content. Added
   `ter-fr-chem-analysis`.
6. **Content correction — `ter-fr-chem-organic`'s objectives were Première-level, not the real
   Terminale focus.** The existing objectives ("Nommer molécules organiques," "Identifier groupes
   caractéristiques," "Proposer mécanismes simples") describe nomenclature/functional-group/mechanism
   content that belongs to the Première spécialité programme, not Terminale's actual
   "Élaborer des stratégies en synthèse organique" theme, whose real named sub-topics (per both
   sources) are synthesis-pathway strategy, step optimization (yield, atom economy), and multi-step
   synthesis strategy — none of which involve basic nomenclature. Replaced the three objectives with
   the real strategy-focused content. Chapter `id`/name unchanged.
7. **Minor additive correction — redox explicitly missing from `ter-fr-chem-equilibrium`.** Annabac's
   breakdown lists "Sens d'évolution d'un système oxydant-réducteur" as a distinct named sub-topic
   alongside acid-base; the existing objectives only mentioned acid-base explicitly. Added a redox
   mention to the existing "prévoir sens d'évolution" objective (not a new chapter — same theme).
8. **Minor additive correction — radioactive decay missing from `ter-fr-chem-kinetics`.** Sherpas
   lists "Radioactive decay" as a real sub-topic under the same "Modéliser l'évolution temporelle
   d'un système" theme as chemical kinetics; the existing chapter had no mention of it at all. Added
   as a third objective on the existing chapter.

**Also lightly touched, not a content-accuracy fix:** renamed `ter-fr-phys-mechanics`'s display name
from "Mécanique — mouvements" to "Mouvement et interactions — dynamique" and `ter-fr-phys-waves`'s
from "Ondes et signaux" to "Phénomènes ondulatoires" (the real theme name "Ondes et signaux" now
covers 3 chapters — waves, photons, circuits — so the umbrella name moved to the section comment,
each chapter got its actual named sub-topic as its display name instead). No objective content was
removed from either chapter, only reworded/expanded (mechanics gained an explicit kinematics/Frenet
objective; waves objectives unchanged in substance).

**Physics chapter count: 3 → 6. Chemistry chapter count: 3 → 4.** This reflects real programme
breadth that was previously significantly under-represented, not scope creep — all 8 findings are
sourced to named sub-themes in 2+ independent, mutually-consistent secondary compilations.

**Not independently primary-source-quoted:** as with every prior session in this file, `WebFetch` on
both candidate `education.gouv.fr` BO URLs returned HTTP 403 — nothing above is a verbatim primary
quote; all of it rests on 2-4-source convergent secondary corroboration, per this team's standing
methodology.

**Verification:** `npx tsc --noEmit --skipLibCheck` clean after all edits. Left uncommitted for
review. Not yet reviewed by `qa`.

**Remaining unaudited scope, unchanged from 2026-09-27:** `premiere-fr-spe-math`'s exponential/suites
chapters and its non-MVP subjects (french, history-geography, philosophy, ses); all of
`terminale-fr-spe-math`'s remaining 5 chapters (limits, dérivation/primitives, logarithm, integrals,
geometry-space — probability was fixed 2026-09-27); non-MVP-subject levels (`terminale-fr-spe-svt`,
`terminale-fr-spe-nsi`, `terminale-fr-spe-ses`) — out of MVP scope per CLAUDE.md §9, skip rather than
audit. `terminale-fr-spe-pc` (this session's scope) is now fully audited against the real 2019-reform
programme's 4-theme structure.

## 2026-09-30 — Bac Français pre-2019-reform audit: `terminale-fr-spe-math`'s remaining 5 chapters — 5 real gaps found and fixed, 1 chapter refuted as accurate

Picked up the "still explicitly unaudited" slice named by this run's own instruction:
`terminale-fr-spe-math`'s other 5 chapters (limits, dérivation/primitives, logarithm, integrals,
geometry-space — probability was already fixed 2026-09-27). Read the exact current
`terminale-fr-spe-math` chapter definitions in `src/data/curricula/bac-francais.ts` (lines 532-630)
first, before researching, per this run's instruction.

**Primary source attempted, blocked as usual:** `WebFetch` on both
`education.gouv.fr/bo/19/Special8/MENE1921249A.htm` (referenced in the 2026-09-29 entry) and
`legifrance.gouv.fr/jorf/id/JORFTEXT000038799933` (the arrêté du 19 juillet 2019 itself) — the
Légifrance page loaded but only returned the decree's administrative shell (NOR, ELI, "fixed
according to annex"), not the annex content itself; the `education.gouv.fr` URL returned HTTP 403,
same as every prior session in this file.

**Verification method:** with both primary sources unreadable, used 4 independent secondary sources
per claim — `groupe-reussite.fr/ressources/programme-terminale-maths/`, a `WebFetch` of a page whose
content matched `jai20enmaths.com/terminale`'s content (16-item numbered chapter list),
`sherpas.com/blog/nouveau-programme-maths/`, and `xymaths.fr/Lycee/Terminale-generale-specialite-mathematiques/`
— all four independently converged on the same programme structure (Algèbre et géométrie / Analyse /
Probabilités / Algorithmique et logique, with near-identical chapter lists), same convergent-sources
discipline as every prior entry in this file.

**Findings — all fixed, all additive, no chapter `id`s renamed (grepped `src/` first; only
`bac-francais.ts` itself references any of `terminale-fr-spe-math`'s chapter ids, so edits are safe):**

1. **Missing chapter — sequence limits.** "Suites" (convergence/divergence, théorème des gendarmes,
   limite d'une suite définie par récurrence) is a real, distinct Analyse chapter in all 4 sources,
   separate from function limits and from Première's "suites numériques" chapter (which only covers
   arithmetic/geometric sequences and an initiation to récurrence, no limits at all). Entirely absent
   from `terminale-fr-spe-math`. Added `ter-fr-math-sequences-limits`.
2. **Missing chapter — trigonometric functions.** "Fonctions trigonométriques" (derivatives of
   sinus/cosinus, variations, equation-solving via calculus) is a real, distinct Analyse chapter in
   all 4 sources. Distinct from Première's trigonometry chapter (unit circle + trig equations only, no
   derivatives) and entirely absent from Terminale. Added `ter-fr-math-trig-functions`.
3. **Missing content — équations différentielles.** "Primitives et équations différentielles"
   (y' = ay + b, méthode d'Euler) is a real, named Analyse sub-theme in all 4 sources, grouped
   thematically with primitives, and was entirely absent from the file. Added as two new objectives
   on the existing `ter-fr-math-derivation` chapter (which already covers primitives) rather than a
   new chapter, following the same "same theme → objective, not new chapter" convention as the
   2026-09-29 `terminale-fr-spe-pc` session.
4. **Missing content — croissances comparées.** The comparative growth-rate theorem
   (exponential/logarithm/power-function hierarchy for lifting indeterminate forms) is real,
   heavily-examined Terminale logarithm content, confirmed by groupe-reussite.fr plus a second,
   independent convergence check (7 further sources — jybaudot.fr, maxicours.com, ilemaths.net,
   mathschool.fr, allomaths.com, galilee.ac, leprofduweb.com — all treating it as standard Terminale
   spé-math content). `ter-fr-math-logarithm`'s objectives previously only covered properties/ln
   study/equation-solving. Added as a new objective.
5. **Missing content — orthogonality/distance in space geometry.** "Orthogonalité et distances"
   (produit scalaire in 3D, projeté orthogonal, distance point-à-plan) and "représentations
   paramétriques" (of a line) are real, named Algèbre-et-géométrie sub-themes in all 4 sources,
   distinct from the existing objectives (vectors, plane equations, intersections only — no dot
   product, no distance calculation, no parametric line representation). Added 3 new objectives to
   the existing `ter-fr-math-geometry-space` chapter.

**Refuted, no change:** the existing `ter-fr-math-limits` ("Limites et continuité" — function limits,
IVT) and `ter-fr-math-integrals` ("Intégration" — primitives, integration by parts, areas) chapters
both match the real programme's "Limites des fonctions"/"Continuité" and "Calcul intégral" sub-themes
closely; no inaccuracy found in either.

**Not added, flagged as an open lead instead of edited — "Algorithmique et logique":** 3 of 4 sources
(jai20enmaths-content, sherpas, xymaths) list a real, distinct top-level programme section covering
Python list manipulation and mathematical logic (quantifiers, implication/contraposée, proof by
induction). This is genuinely part of the compulsory *Mathématiques* specialty programme, not the
separate NSI specialty — but it sits close enough to the CLAUDE.md §8-9 "Informatique deferred to
v1.1" boundary (the Python-list-manipulation half specifically) that a unilateral add felt like the
wrong call for a content-curriculum-only session, especially since Imtihan's export pipeline (Word/PDF,
no code execution) isn't built to grade or render runnable code exercises. The pure-logic half
(quantifiers, contraposée, récurrence) is written-exam-appropriate and could reasonably be added to an
existing chapter in a future pass, but flagging rather than deciding unilaterally tonight.

**Mathematics chapter count: 6 → 8** (2 new chapters; 3 existing chapters gained objectives; 2
chapters confirmed accurate as-is).

**Verification:** `tsc` itself is not runnable in this session — `node_modules/typescript/bin/tsc`
requires `../lib/tsc.js`, but `node_modules/typescript/lib/` only contains a placeholder `_tsc.js`
(no real compiler, no `package.json` for the package) — a pre-existing environment condition, not
caused by this edit. As a substitute: (1) re-read the edited chapter objects and confirmed they match
the existing `Chapter` type shape (`src/types/curriculum.ts`) exactly — `id: string`,
`name: {fr, en}`, `objectives: string[]`, no new/missing fields, same as every other chapter in the
file; (2) ran a `node --check` syntax pass over the file (with only the `import type`/type-annotation
line stripped, since the object literals themselves are plain JS) to catch any stray
brace/comma/quote errors — passed clean. This is not equivalent to a real type-check and should not
be presented as one; flagging the broken local `tsc` install for whoever next needs a real compile in
this environment. Left uncommitted for review. Not yet reviewed by `qa`.

**Remaining unaudited scope, per this run's instruction — unchanged:** `premiere-fr-spe-math`'s
exponential/suites chapters (still entirely unchecked) and its non-MVP subjects (french,
history-geography, philosophy, ses); non-MVP-subject levels (`terminale-fr-spe-svt`,
`terminale-fr-spe-nsi`, `terminale-fr-spe-ses`) — out of MVP scope per CLAUDE.md §9, skip rather than
audit. `terminale-fr-spe-math` (this session's scope) is now fully audited against the real
2019-reform programme structure, all 6 original chapters checked (1 previously fixed for probability,
2 confirmed accurate, 3 corrected/expanded tonight) plus 2 new chapters added for real content gaps.

## 2026-10-01 — Bac Français post-2019-reform audit: `premiere-fr-spe-math`'s exponential and suites chapters — 2 real gaps found and fixed

Picked up the last remaining unaudited slice of the math curriculum named by this run's own
instruction and reconfirmed across the 2026-09-27/09-29/09-30 entries: `pre-fr-math-exponential`
("Fonction exponentielle") and `pre-fr-math-sequences` ("Suites numériques") in
`src/data/curricula/bac-francais.ts` (lines ~411-434 before edit). Read the exact current chapter
definitions first, per this run's instruction.

**Primary source attempted, blocked as usual:** `WebFetch` on `education.gouv.fr/bo/19/Special1/MENE1900037A.htm`
(the BO spécial n°1 du 22 janvier 2019 itself, where this programme is published) returned a domain
verification failure before even reaching a 403 — same practical outcome as every prior session's
403/annex-shell-only result. `education.gouv.fr/media/23684/download` (a candidate direct-PDF URL)
and `lyceedautet.fr`'s hosted programme-summary PDF both failed too — the lycée PDF fetched but
returned only binary/compressed PDF stream data, not extractable text.

**Verification method:** with primary sources unreadable, required 2+ independent secondary sources
to converge before treating a finding as confirmed, per this session's fallback standard. For each
chapter, 3 independent sources converged: a `WebSearch` synthesis (drawing on `coursmathsaix.fr`,
`galilee.ac`, `groupe-reussite.fr`), a direct `WebFetch` of `kartable.fr`'s "Suites numériques" course
page, a direct `WebFetch` of `groupe-reussite.fr/ressources/programme-premiere-maths/`, and a direct
`WebFetch` of `galilee.ac`'s "Fonction exponentielle" fiche — all mutually consistent on the specific
wording and scope described below, no contradictions between sources.

**Findings — both fixed, both additive (existing correct objectives kept, not removed), no chapter
`id`s renamed (grepped `src/`; only `bac-francais.ts` itself references `pre-fr-math-exponential`/
`pre-fr-math-sequences`, so edits are safe):**

1. **`pre-fr-math-exponential` — missing 3 real sub-objectives.** All 3 sources converge that the
   Première spécialité maths "Fonction exponentielle" chapter opens with the defining
   existence/uniqueness property — the exponential is introduced as *the unique function f
   derivable on ℝ with f′ = f and f(0) = 1* — and includes two calculus additions specific to the
   2019 reform: the derivative of a composite `exp(u)` (equivalently `t ↦ e^(at)`, explicitly linked
   to geometric sequences per `groupe-reussite.fr`), and the function's limits at +∞ (→ +∞) and −∞
   (→ 0, horizontal asymptote). The existing objectives ("Utiliser les propriétés algébriques",
   "Étudier la fonction exponentielle", "Résoudre équations et inéquations") were accurate but too
   vague to capture any of these three — a generated exam could plausibly skip the defining property,
   the composite-derivative rule, and the limit behavior entirely, all of which are standard,
   frequently-examined content. Added 3 new objectives (defining property, `exp(u)` derivative,
   limits at ±∞); kept the 3 existing ones, reworded "Étudier la fonction exponentielle" into the more
   specific "Étudier le signe, les variations et la courbe représentative de la fonction
   exponentielle" (same substance, not a content change).
2. **`pre-fr-math-sequences` — missing 3 real sub-objectives.** All 3 sources converge on close to
   identical wording: "Générer une suite de façon explicite, par récurrence, par un algorithme ou par
   un motif géométrique, calculer le terme général et une somme de termes pour les suites
   arithmétiques et géométriques, étudier le sens de variation, conjecturer une limite." The existing
   objectives ("Étudier suites arithmétiques et géométriques", "Raisonner par récurrence (initiation)")
   omitted three real, named sub-themes: the explicit list of generation modes (explicit formula,
   recurrence, algorithm, geometric pattern), the sum of consecutive terms for arithmetic/geometric
   sequences (a standard formula students are examined on), and the intuitive/graphical approach to
   conjecturing a sequence's limit (finite or infinite) — the last being a genuine 2019-reform addition
   to Première (the formal ε-based limit definition stays Terminale-only, already captured by
   `ter-fr-math-sequences-limits` added 2026-09-30; this is the earlier, intuitive/conjectural
   version). Added 3 new objectives; kept the 2 existing ones.

**Not added, re-flagged — "Algorithmique et logique":** re-checked per this run's instruction. The
2026-09-30 entry already flagged this as a real, named top-level programme section (Python list
manipulation, quantifiers/logic, proof by induction) that sits close to the CLAUDE.md §8-9
"Informatique deferred to v1.1" boundary. Nothing found this session changes that judgment — if
anything, the Première "Suites" sources reinforce it: "générer une suite ... par un algorithme"
appears as one clause *inside* the suites chapter's own objectives (captured above), not as a
separate assessable chapter, and Imtihan's export pipeline still doesn't execute or grade runnable
code. Left un-added, same call as 2026-09-30, for the founder or a future pass to decide rather than
a unilateral add.

**Mathematics chapter count for `premiere-fr-spe-math`: unchanged (7 chapters) — both findings were
additive objectives on existing chapters, not new chapters.**

**Verification:** `npx tsc --noEmit --skipLibCheck` and `npm run type-check` both clean after the
edit (the broken-`tsc`-install condition flagged 2026-09-30 is no longer present this session). Left
uncommitted for review. Not yet reviewed by `qa`.

**Remaining unaudited scope:** `premiere-fr-spe-math`'s non-MVP subjects (french, history-geography,
philosophy, ses) — out of MVP scope per CLAUDE.md §9, skip rather than audit. Non-MVP-subject levels
(`terminale-fr-spe-svt`, `terminale-fr-spe-nsi`, `terminale-fr-spe-ses`) — same. **With this session's
fix, every MVP-subject (mathematics, physics, chemistry) chapter across every level in
`bac-francais.ts` (`premiere-fr-spe-math`, `terminale-fr-spe-math`, `terminale-fr-spe-pc`) has now
been audited against the real post-2019-reform programme at least once** — the backlog item first
opened 2026-09-15 is closed. "Algorithmique et logique" remains an open lead, flagged not decided,
across both Première and Terminale spé-math.

## Backlog (pick one per Wednesday, highest priority first)

**Reprioritized 2026-10-01 (founder-directed):** founder asked about daily curriculum re-ingestion
from source books; declined (the 2026-09-04 cost/benefit reasoning above still holds, and literally
ingesting textbook text daily is also a copyright problem, not just a cost one) in favor of keeping
weekly audits but **prioritizing the two curricula with known, named open gaps next**, ahead of any
new secondary-signal work: (1) `bac-libanais.ts` EB9/Seconde/Première-S — only spot-checked, never
line-by-line audited (Terminale-S is the only fully-audited level); (2) `ib.ts`'s actual chapter
content — only the command-term glossary in `generate.ts` has been touched, the curriculum chapter
data itself has never had an equivalent pass. Bac Français is the one curriculum that's actually
fully closed (every MVP-subject chapter, every level, as of 2026-10-01). University sourcing
(`docs/DATA_SOURCING.md`'s dawrat approach) has no completed audit logged yet either — lower
priority than the two above since it's "free-form" by design, not chapter-gated the same way.

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
- [x] Audit `bac-francais.ts` chapters against the current BO programme edition — flag anything
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
      **2026-09-27: `WebSearch`/`WebFetch` both working — 2 of 3 queued leads confirmed and fixed, 1
      refuted.** See the dated section above for full detail. Fixed: `ter-fr-math-probability`'s
      "loi normale" mis-attribution (real content is dénombrement/schéma de Bernoulli/loi
      binomiale/sommes de variables aléatoires/loi des grands nombres — no loi normale in the
      compulsory specialty programme); added two missing `premiere-fr-spe-math` chapters (produit
      scalaire, probabilités conditionnelles et variables aléatoires). Refuted: the "missing nombres
      complexes" lead was backwards — complex numbers were removed from the compulsory Terminale spé
      maths programme in 2019 and live only in the separate "mathématiques expertes" option, so their
      absence from `terminale-fr-spe-math` is correct, not a gap. Still unaudited: `premiere-fr-spe-math`'s
      exponential/suites chapters and non-MVP subjects; `terminale-fr-spe-math`'s other 5 chapters; all
      of `terminale-fr-spe-pc`; non-MVP-subject levels (SVT, NSI, SES).
      **2026-09-29: `terminale-fr-spe-pc` fully audited — 8 real gaps found and fixed.** See the
      dated section above for full detail. Both candidate primary BO source URLs (the exam-format
      note `MENE2001798N` supplied by the task, and the actual programme-content arrêté
      `MENE1921249A`) returned HTTP 403 on `WebFetch` as usual; findings rest on 2-4-source convergent
      secondary corroboration. Added 4 missing chapters (`ter-fr-phys-fluids` fluid mechanics,
      `ter-fr-phys-photons` photons/photoelectric effect, `ter-fr-phys-circuits` RC circuits,
      `ter-fr-chem-analysis` titration/spectroscopy/conductimetry analysis methods — the last being
      especially high-value since titration is heavily examined and was entirely unrepresented);
      added missing objectives to 3 existing chapters (ideal gas/thermal transfer on
      `ter-fr-phys-energy`, redox on `ter-fr-chem-equilibrium`, radioactive decay on
      `ter-fr-chem-kinetics`); and corrected `ter-fr-chem-organic`'s objectives, which described
      Première-level nomenclature/mechanism content instead of Terminale's real synthesis-strategy
      focus. Physics chapters 3→6, chemistry chapters 3→4. No chapter `id`s renamed. Still unaudited:
      `premiere-fr-spe-math`'s exponential/suites chapters and non-MVP subjects; `terminale-fr-spe-math`'s
      other 5 chapters; non-MVP-subject levels (SVT, NSI, SES).
      **2026-09-30: `terminale-fr-spe-math`'s remaining 5 chapters fully audited — 5 real gaps found
      and fixed, 2 chapters confirmed accurate.** See the dated section above for full detail. Both
      primary sources unreadable (Légifrance returned only the decree shell, `education.gouv.fr`
      403'd as usual); findings rest on 4-source convergent secondary corroboration. Added 2 missing
      chapters (`ter-fr-math-sequences-limits` — sequence convergence/limits, entirely absent and
      distinct from Première's non-limits suites chapter; `ter-fr-math-trig-functions` — derivatives
      of sinus/cosinus, distinct from Première's non-calculus trigonometry chapter); added missing
      objectives to 3 existing chapters (équations différentielles on `ter-fr-math-derivation`,
      croissances comparées on `ter-fr-math-logarithm`, orthogonality/distance/parametric-line
      representation on `ter-fr-math-geometry-space`). Confirmed `ter-fr-math-limits` and
      `ter-fr-math-integrals` accurate as-is, no change. Flagged but did not add "Algorithmique et
      logique" (a real programme section, but borderline against the CLAUDE.md §8-9 Informatique/NSI
      deferral and Imtihan's no-code-execution export pipeline) as an open lead for a future pass.
      Mathematics chapters 6→8. Local `tsc` install is broken in this session (`node_modules/typescript/lib/`
      has no real compiler) — verified via chapter-shape review + `node --check` syntax pass instead of
      a real type-check; flagged for whoever needs a working compile next. Still unaudited:
      `premiere-fr-spe-math`'s exponential/suites chapters and non-MVP subjects; non-MVP-subject levels
      (SVT, NSI, SES). `terminale-fr-spe-math` is now fully audited.
      **2026-10-01: `premiere-fr-spe-math`'s exponential and suites chapters audited — 2 real gaps
      found and fixed, both additive objectives, no new chapters.** See the dated section above for
      full detail. Primary source (`education.gouv.fr/bo/19/Special1/...`) failed before even
      reaching a 403; findings rest on 3-source convergent secondary corroboration (`kartable.fr`,
      `groupe-reussite.fr`, `galilee.ac`, plus a `WebSearch` synthesis). Added 3 objectives to
      `pre-fr-math-exponential` (defining property f′=f/f(0)=1, derivative of composite exp(u),
      limits at ±∞) and 3 to `pre-fr-math-sequences` (generation modes, sum of consecutive terms,
      intuitive limit conjecture) — all additive, existing correct objectives kept. Re-flagged, did
      not add, "Algorithmique et logique" for Première too, same judgment as 2026-09-30's Terminale
      flag. `npx tsc --noEmit --skipLibCheck` and `npm run type-check` both clean (local `tsc` install
      is no longer broken this session). **This closes the backlog item first opened 2026-09-15:
      every MVP-subject (math/physics/chemistry) chapter across every level in `bac-francais.ts` has
      now been audited against the real post-2019-reform programme at least once.** Still unaudited,
      out of MVP scope per CLAUDE.md §9 (skip, not a gap): non-MVP subjects within French levels
      (french, history-geography, philosophy, ses) and non-MVP-subject levels (SVT, NSI, SES).
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
- [x] **2026-09-29 (nightly-ops)** Wrote `getChapterExemplars(curriculumId, levelId, subject, chapterId)`
      in a fresh `src/lib/schoolBank.ts` — queries the real `schoolBank` collection
      (`curriculumId`/`subject`/`exercise.chapterIds array-contains chapterId`, via `adminDb`, using the
      composite index `firestore.indexes.json` already has for `/api/tools/chapter-performance`), sorts
      by `sharedAt` in JS (not a Firestore `orderBy`, to avoid needing a new composite index — see the
      module's own comment), returns up to 2 exemplars.
- [x] **2026-09-29 (nightly-ops)** Wired `getChapterExemplars()` directly into `src/lib/prompts/generate.ts`
      (new pure `buildExemplarsPrompt()`, same convention as `buildTeacherStylePrompt()`) and
      `src/app/api/generate/route.ts` (fetches for up to 8 selected chapters in parallel, skipped for
      university mode and regenerate/adjustment passes). Injected as a clearly-labeled "SCHOOL BANK
      EXEMPLARS (for inspiration ONLY — do NOT copy verbatim...)" block. Confirmed no-op (empty string,
      no block at all) when a chapter has 0 exemplars — the expected case for a long time post-launch.
- [x] **2026-09-29 (nightly-ops)** Added 10 Vitest tests (`src/__tests__/schoolBank-exemplars.test.ts`)
      confirming prompt generation succeeds with 0, 1, and 2 exemplars. Full detail + a real discrepancy
      from this checklist's own client-SDK assumption: `ROADMAP.md`'s 2026-09-29 entry.

### Secondary signal (also no extra AI cost)
- [x] **2026-10-02 (nightly-ops)** Track chapter-coverage misses (`chapterCoverage[].missing` in
      `src/app/create/generate/page.tsx`) into a lightweight Firestore counter per
      curriculum/subject/chapter — chapters that are *frequently* missing coverage even after
      generation is a signal that either the chapter's objectives are too vague for the model to
      act on, or the model needs a stronger nudge for that topic. Surface as a simple report, not
      an automated prompt rewrite — a human should read the pattern before changing prompts.
      **Result:** Same "zero exercises tagged to a selected chapter" signal the client already
      computes, recomputed server-side in `src/app/api/generate/route.ts` right where the existing
      `examsGenerated`/`system/stats` counters already increment (same batch, same
      `FieldValue.increment(1)` pattern, `university` mode excluded — no fixed chapter list there,
      same exclusion the client UI applies) — recorded once per real, non-adjustment generation
      regardless of whether the teacher ever looks at the Step 4 warning. One doc per
      `(curriculumId, subject, chapterId)` in a new `chapterCoverageMisses` collection (doc id
      `curriculumId__subject__sanitizedChapterId`, chapterId capped at 20 tracked/request and
      sanitized to a safe charset since, unlike `curriculumId`/`subject`, it's an unbounded string
      at the Zod layer). No new subcollection schema, no Firestore rules change needed (the
      catch-all deny-all rule already covers it, same as `rateLimits`). Read surface: new
      `GET /api/admin/chapter-coverage-misses` (same `verifyIdToken`+`isAdmin` pattern as every
      other admin route), plus a new read-only "Coverage" tab on `/admin` (top 50 by miss count,
      chapter id/curriculum/subject/last-missed/count — raw chapter id shown, not resolved to a
      display name, since that needs a `levelId` the counter doesn't track and isn't worth the
      extra plumbing for a first pass). `npm run type-check` clean; `npm test` clean after a
      transient vitest worker-pool timeout on the first run resolved on a clean re-run (same known
      flake logged in `ROADMAP.md`'s 2026-09-29 entry). Not live-verified (no `chrome-devtools`
      this dispatch, and this doesn't fire until a real generation completes with a real missing
      chapter) — `qa` should verify a real generation still streams/completes normally, and that
      the new `/admin` tab renders correctly once at least one miss exists.

## Notes for whoever (human or agent) picks the next item

- This track does not run real Gemini/Claude generation calls as part of its own work — audits and
  wiring only. If a future item genuinely needs a live generation to verify, treat that like any
  other real-cost action and say so explicitly in `DAILY_LOG.md`, same as the Playwright suite's
  documented real-cost calls in `summary.md`.
- Run `npx tsc --noEmit --skipLibCheck` after every change before committing.
- One item per run. Small, safe, reviewable diffs — this runs unattended and pushes itself.
