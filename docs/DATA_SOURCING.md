# Data Sourcing — Imtihan

> Referenced from `CLAUDE.md` §9 ("University Curriculum" note) but never written until now
> (2026-09-04). This is the source-of-truth for **where curriculum/chapter data and exam content
> should come from**, and how to keep it accurate. Read this before touching anything in
> `src/data/curricula/` or writing exam-generation prompts that claim to be "curriculum-grounded."

## Why this matters

Imtihan's core promise is that generated exams match what a specific curriculum actually teaches,
in the actual vocabulary and format students see on real exams. `CLAUDE.md` §4 already states the
non-negotiable rule: *"Any curriculum chapter the AI references MUST exist in
`src/data/curricula/`. If it doesn't, we're hallucinating exam content, which is unacceptable."*
This doc is what makes that rule actually enforceable — it defines what "correct" means for each
curriculum and where to verify it.

## Per-curriculum sourcing

### Bac Libanais (Lebanese Baccalaureate)

- **Primary source: CRDP** (Centre de Recherche et de Développement Pédagogiques — Lebanon's
  Ministry of Education curriculum body). Official Lebanese national curriculum documents
  (`المنهج`) are published per subject and per grade (EB7–EB12/Terminale).
- **Chapter granularity**: CRDP programmes are organized by *unité* (unit), each with explicit
  learning objectives — this maps directly to `Chapter.objectives` in
  `src/data/curricula/bac-libanais.ts`.
- **Verification signal**: past official Bac Libanais exam papers (session ordinaire and session
  complémentaire, published yearly) are the ground truth for exercise *style*, command-term
  vocabulary, and mark distribution — distinct from the CRDP programme, which gives topic
  coverage. Cross-check both: programme for *what*, past exams for *how it's asked*.
- **Known limitation**: CRDP's official site availability is inconsistent; when it's unreachable,
  cross-reference against a Lebanese public/private school's published syllabus for the same grade
  (many schools publish CRDP-aligned syllabi on their own sites) rather than guessing.

### Bac Français (French Baccalaureate)

- **Primary source: Éduscol** (education.gouv.fr's pedagogical resource site) and the **Bulletin
  officiel de l'Éducation nationale (BO)**, which publishes the legally binding *programmes*
  per subject and per class (Seconde, Première, Terminale).
- **Chapter granularity**: BO programmes list *thèmes* and *capacités attendues* (expected
  competencies) — the latter maps to `Chapter.objectives`.
2026 note: the French baccalauréat has gone through several reform cycles (2019 "nouveau bac",
  ongoing adjustments) — always check the BO date to confirm you're reading the programme that
  applies to *this* generation of students, not a superseded one.
- **Verification signal**: annales (compiled past exam papers, published by Éduscol and major
  French publishers like Annabac/Bordas) for exercise style and the official *grilles de
  correction* (marking grids) for barème conventions.

### IB (International Baccalaureate)

- **Primary source: IBO subject guides** (published by the International Baccalaureate
  Organization for each subject, DP1/DP2, SL/HL). These are the only authoritative source — IB
  command terms, syllabus content, and assessment objectives are tightly specified and
  version-controlled by subject-guide edition.
- **Chapter granularity**: IB subject guides list syllabus content by topic/sub-topic with
  "guidance" notes — maps to `Chapter.objectives`. The command-term table already embedded in
  `src/lib/prompts/generate.ts` (`COMMAND_TERMS["ib-english"]`) is sourced from the official IBO
  command term glossary and must stay verbatim — do not paraphrase IB command term definitions,
  since exact wording is part of what makes IB mark schemes valid.
- **Verification signal**: IB past papers and mark schemes (restricted-access via IBO's
  programme resource centre for schools, but widely available via IB-focused study sites) —
  IB's [1]/[2]/[3] mark notation and M1/A1/ecf conventions are non-negotiable and already encoded
  in the generation prompt; any future changes to IB assessment conventions should be verified
  against a current subject guide, not an old cached memory of the rules.

### University ("free-form")

Per `CLAUDE.md` §9, university is intentionally open-ended — there's no fixed
`src/data/curricula/university.ts` chapter list (see the file: all levels have `chapters: {}`).
Grounding comes from two places instead:

- **The teacher's own description and any uploaded syllabus** — the primary source for what to
  generate, per course.
- **"Dawrat" (past exam sessions)** — for Lebanese university courses specifically, past exam
  papers from the relevant faculty (commonly circulated among students as "دورات") are the
  reference for authentic question style and difficulty. When a teacher's description references
  a specific Lebanese university course, prefer matching the *style* of that institution's past
  exams over generic international university exam conventions, if both are plausible.
- University content should **never** be silently mapped onto a `src/data/curricula/` chapter
  list — that would violate the "no hallucinated curriculum chapters" rule in reverse (claiming a
  chapter *exists* when the course is actually open-ended). Keep it as free-text context.

## How to add or fix a chapter

1. Find the official source above for the relevant curriculum/subject/grade.
2. Write `Chapter.objectives` as short, literal phrases straight from the source document — not
   paraphrased summaries. This keeps `buildChaptersSummary()` (in
   `src/data/curricula/index.ts`) injecting text that's traceable back to something real.
3. Note the source and its date/edition in a code comment directly above the chapter entry when
   it's not obvious from context (the existing `bac-libanais.ts` file header comment — "Source:
   CRDP" — is the minimum bar; individual chapters don't need a citation unless the source is
   unusual or the topic is contested).
4. Run `npx tsc --noEmit --skipLibCheck` — chapter objects are typed, so a malformed entry fails
   to compile rather than silently shipping bad data.

## Relationship to the exemplar-bank / coverage work

See `CURRICULUM_COVERAGE_STRATEGY.md` for the ongoing backlog that uses this doc as its
methodology reference — chapter audits, past-exam-grounded objective checks, and the per-chapter
exemplar bank all cite back to the sourcing rules above rather than re-deriving them.

## Getting real text out of official CRDP exam PDFs (2026-09-15)

CRDP's own past-exam archive (`crdp.org/official-exams-corrections-lebanon`, filterable by
subject/branch/year/session) is real and complete back to 2006 — but `WebFetch` cannot read most
of these PDFs directly: it reports "binary/compressed content" because it converts pages to
Markdown via a renderer that doesn't handle these files' embedded fonts well, especially older
scanned Arabic papers. Don't conclude the content is unextractable from that alone.

**Working method:** call `WebFetch` on the PDF URL anyway — even though it can't read it, the tool
saves the raw binary to a local path (shown at the end of its response), *and that copy is fully
usable*. Run `pdftotext -layout -enc UTF-8 <saved-path> -` (via Bash; `pdftotext` is available in
this environment at `/mingw64/bin/pdftotext`, no install needed) to get real, legible extracted
text — this worked cleanly on a 2024 digitally-generated exam PDF (see the Sociology entry below)
even though `WebFetch` itself failed on the same file. Older, more heavily scanned PDFs (tested:
2006-2017 Sociology & Economics papers) extract as garbled/illegible text even via `pdftotext` —
if that happens, look for a more recent session of the same subject/branch before giving up; recent
CRDP papers tend to be digitally typeset, not scanned.

**Verified example:** `src/lib/prompts/generate.ts`'s `bac-libanais-sociology` few-shot exemplar
is built from the real text of the official Sociology exam, Sciences Sociales et Économiques
branch, session ordinaire 2024 (4 juillet 2024) —
`https://www.crdp.org/sites/default/files/SE_Socio_2024_1_Ar.pdf`, extracted via this exact method.
