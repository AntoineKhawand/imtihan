# Agent Teams — Standing Cloud Routines

> Five recurring cloud agents ("teams") that work on Imtihan continuously,
> without a human kicking off each run. This file is their shared source of
> truth — each routine's prompt points back here so their mission, output
> location, and guardrails stay in one place instead of drifting across five
> separate prompts. Update this file first when a team's scope changes, then
> update the routine.

## Hard rules for every team (no exceptions)

1. **Never merge to master.** Every team does its work on a branch, pushes,
   and opens a PR. A human (the founder) reviews and merges. This mirrors the
   "merge without review" guardrail already enforced on this account — don't
   try to route around it.
2. **Never invent curriculum content.** Per `CLAUDE.md` §4: any chapter/exam
   structure referenced by the AI must exist in `src/data/curricula/`. Ground
   everything in real sources (official CRDP pages, real past exams) using
   the sourcing method in `docs/DATA_SOURCING.md` (WebFetch + `pdftotext` for
   PDFs `WebFetch` can't parse directly).
3. **Never email or message anyone except the founder.** Only
   antoine.elkhawand@aliston.fr may receive email from these routines. No
   team sends anything to a teacher, school, parent, or any other third
   party — outreach work produces *drafts and prospect lists for the founder
   to review and send himself*, never live sends. This is a hard boundary,
   not a default to loosen later without the founder explicitly saying so.
4. **Log everything.** Bugs go in `BUGS.md` (existing format). Feature/UX
   proposals go in `docs/UX_PROPOSALS.md`. Curriculum work goes in
   `docs/DATA_SOURCING.md` + the PR description. Competitor research goes in
   `docs/COMPETITOR_RESEARCH.md`. Outreach research goes in
   `docs/OUTREACH_PLAN.md`. Every file is dated, append-only history — don't
   delete past entries, mark them resolved/superseded instead.
5. **Respect MVP scope.** `CLAUDE.md` §9 lists what's deliberately out of
   MVP (Arabic-general, Biology, custom uploads, school accounts, etc. —
   Sociology/Arabic-for-Sociology is an approved exception already shipped).
   Flag scope creep in a proposal instead of building it.

---

## Team 1 — QA / Regression Testing

**Cadence:** daily, 08:00 Beirut (05:00 UTC).
**Mission:** Walk the real 5-step workflow (Describe → Confirm → Structure →
Generate → Export) end to end, as both unit tests and integration checks —
every button does what it says, every input validates correctly, every step
transition preserves state. Grow a persistent Playwright/integration suite
under `tests/` over time rather than starting from scratch each run.

**Standing priority #1 (until resolved):** `/print` (the PDF path) renders
through `src/lib/renderContent.ts` — the same live web pipeline the browser
shows. `src/app/api/export/route.ts`'s `generateWordDocument` independently
rebuilds the document with the `docx` library's own `Paragraph` objects —
a second, separate renderer for the same content. Audit every content
feature (tables, KaTeX/math, mhchem, document source-citation boxes,
Mermaid/visual blocks, RTL Arabic, bold/paragraph spacing, per-exercise
point overrides) in both pipelines and file a `BUGS.md` entry for every
place they diverge. This is expected to take several runs to fully cover —
track progress as a checklist in the PR description each run.

**Output:** `BUGS.md` entries for anything broken, PR with fixes (once a fix
is safe and verified — never a PR that only reports without attempting a fix
when the fix is small and clear), PR with new/expanded test coverage under
`tests/`. Daily email to the founder: pass/fail summary + new bugs found.

---

## Team 2 — UX & Feature Research

**Cadence:** weekly, Monday 09:00 Beirut (06:00 UTC).
**Mission:** Propose concrete UX improvements and new features grounded in
the actual codebase (friction points visible in the 5-step flow, gaps
against what teachers in a Lebanese/French/IB exam-writing workflow would
expect) and in outside research (edtech UX patterns, competitor products).

**Approval loop (read this carefully before acting):**
1. Each run, first check `docs/UX_PROPOSALS.md` for any item marked
   `Status: Approved` that isn't yet `Status: Done`. Build it: branch,
   implement, test, open a PR, mark it `Status: Done — PR #<n>`.
2. Then propose new ideas: append new entries to `docs/UX_PROPOSALS.md` as
   `Status: Proposed`, each with a short rationale and expected effort.
3. Email the founder a summary of (1) what got built this run and (2) new
   proposals awaiting his review. **Nothing new gets built until the founder
   changes an entry's status to `Approved`** — that's the actual approval
   mechanism (edit the file, or tell the assistant in chat, which will edit
   it). Do not start implementing a "Proposed" item on your own initiative.

**Output:** `docs/UX_PROPOSALS.md` (running log), PRs for approved+built
items only, weekly email.

---

## Team 3 — Curriculum & Exercise Architecture Research

**Cadence:** weekly, Wednesday 09:00 Beirut (06:00 UTC).
**Mission:** Extend and verify `src/data/curricula/` — real chapter lists,
exam structures, and exercise conventions for subjects/curricula the
platform should support (Bac Libanais, Bac Français, IB, University —
per `CLAUDE.md` §9's in-scope subjects, plus flag anything currently
missing coverage). Follow the same grounding method used for the Sociology
addition: official curriculum authority pages + real past exams, verified
via `WebFetch`/`pdftotext`, never invented. Where a real official structure
differs from the app's generic `STRUCTURE RULES`, add an explicit exception
(the pattern already used in `src/lib/prompts/generate.ts`'s few-shot
system).

**Output:** PR touching `src/data/curricula/*.ts` and, where useful, a new
few-shot exemplar in `src/lib/prompts/generate.ts`. Every new/changed
chapter cites its real source in the PR description (never just "AI
generated"). No merge — founder reviews for curriculum accuracy.

---

## Team 4 — Market & School Outreach Research (draft-only, see hard rule 3)

**Cadence:** weekly, Tuesday 09:00 Beirut (06:00 UTC).
**Mission:** Research the real Lebanese teacher/school/parent landscape —
public school associations, teacher unions and Facebook/LinkedIn groups,
private school directories, education conferences, Ministry of Education
resources — and build a prospect list + draft outreach copy (newsletter,
cold-intro email, one-pager) targeted at Lebanese teachers and parents
specifically. **Never send anything to any of these contacts.** The
deliverable is research + drafts for the founder to personally review and
send through whatever channel he chooses.

**Output:** `docs/OUTREACH_PLAN.md` — dated sections: prospect list (name,
org, public contact channel, source link), draft copy variants, a short
rationale per channel. Weekly email to the founder with the summary and a
reminder that nothing has been sent.

---

## Team 5 — Competitor Research

**Cadence:** monthly, 1st, 09:00 Beirut (06:00 UTC).
**Mission:** Identify and profile real competitors — Lebanese/MENA edtech,
exam-generator tools, AI homework/worksheet generators, and anyone else a
Lebanese teacher might compare Imtihan against. For each: pricing, subject/
curriculum coverage, language support, and the one or two things they do
well that Imtihan doesn't yet. End with a short "what this suggests we
should build or fix" section — feed strong candidates into
`docs/UX_PROPOSALS.md` as `Status: Proposed` entries for Team 2 to pick up.

**Output:** `docs/COMPETITOR_RESEARCH.md` (dated, append-only), monthly
email summary.

---

## Tracking / mapping

Each team also gets a corresponding entry in the 3D Agent Control Room
(the Three.js artifact used to visualize agent activity across this
account). Its shared database is the live "who's doing what" view; this
file is the durable "why and how" reference the routines and the founder
both read.
