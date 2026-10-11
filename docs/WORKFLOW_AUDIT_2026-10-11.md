# Exam workflow audit — 11 October 2026

## Implemented

- Four actual stages are shown: describe, configure, generate/review, export. The obsolete structure stage remains a redirect for old links.
- Upload purpose is explicit and combinable: course content, exercise inspiration, academic structure, school header/footer. Teacher instructions are preserved verbatim; source text is reference data, never an instruction authority.
- The same source bytes are carried into generation and single-question adjustments. Source identity participates in the existing context cache key. Saved exams retain source metadata, not document bytes: regeneration requires reattachment or explicit removal when the session file is missing. Branding-only generation needs no raw file.
- Upload restoration no longer clears the file on initial render. Oversized/unsupported files and browser-storage failures have visible errors. The 3 MB cap leaves room for base64 and request metadata under the hosting payload limit.
- Extraction produces reviewable sections, offered marks, number of compulsory answers, instructions and school details. Unreadable structure has an uncertainty notice and requires manual configuration rather than an invented layout.
- Composition can be flexible classroom mode, a compatible dated reference, an uploaded structure, or teacher-defined sections. Optional alternatives must carry equal marks within their section, so every candidate choice has the same maximum. The maximum candidate score is separate from the sum of all offered alternatives.
- A deliberate classroom-mode selection survives navigation instead of reapplying the upload's extracted structure. Changing subject/level clears stale chapter selections. No fake `general` chapter is inserted.
- Generation preserves visual/geographic settings at the API boundary. Single-question adjustments use one question's marks and the adjustment path, instead of full-paper allocations and a fresh-exam quota charge.
- Incomplete question counts, marks changed after editing, and incompatible profiles are detected. Teachers can return to configuration or explicitly convert the current questions into a classroom exam with a reconciled total.
- Word, PDF and email retain sections, candidate instructions, optional choices, reviewed footer and answer space. The corrigé remains a separate optional section, with the existing tabular marking scheme. Word footers contain PAGE/NUMPAGES; compatible Chromium browsers use print margin boxes for PDF numbering. Footer CSS escapes every source character.
- Tutorial text explains the new controls. New controls stack at small widths and use full-width inputs; no landing-page tutorial is added.

## Reference registry and scope

These dated compositions are practice references. They do not assert that every future session has the same question allocation. Profiles are matched to curriculum, subject and level, and never silently selected for a classroom quiz.

| Reference | Implemented composition | Official source |
|---|---|---|
| Lebanese General Sciences maths, ordinary 2024 | Seven offered questions; answer five; four marks each; candidate maximum 20; 180 minutes | [CRDP paper and corrigé](https://www.crdp.org/sites/default/files/SG_Math_2024_1_Fr.pdf) |
| Lebanese Life Sciences maths, ordinary 2024 | Six offered questions; answer four; five marks each; candidate maximum 20; 90 minutes | [CRDP paper and corrigé](https://www.crdp.org/sites/default/files/SV_Math_2024_1_Fr.pdf) |
| French Terminale specialty maths, 2026 J1 | Four compulsory exercises; 5/4/6/5 marks; 240 minutes | [Ministry paper 26-MATJ1ME1](https://www.education.gouv.fr/sites/default/files/document/baccalaureat-general-2026-mathematiques-517598.pdf) |
| IB AA SL Paper 1/2, first assessment 2021 guide | Sections A/B; 80 marks; 90 minutes; paper-specific calculator rules | [IB guide](https://www.ibo.org/globalassets/new-structure/university-admission/pdfs/subject-guides/mathematics-analysis-approaches-guide.pdf) |
| IB AA HL Paper 1/2, same guide | Sections A/B; 110 marks; 120 minutes; paper-specific calculator rules | [IB guide](https://www.ibo.org/globalassets/new-structure/university-admission/pdfs/subject-guides/mathematics-analysis-approaches-guide.pdf) |

IB individual question counts and marks in the UI are editable practice allocations, not fixed official counts. The revised first-assessment-2029 course is intentionally excluded; see [IB curriculum updates](https://ibo.org/university-admission/latest-curriculum-updates). The current curriculum data groups Lebanese science tracks in Terminale S; the Life Sciences profile explicitly asks the teacher to review chapters.

## Remaining gaps

- Other subjects/tracks and IB HL Paper 3 need separately verified references. Classroom, uploaded and teacher-defined structures work for them; the UI clearly states when a verified reference is unavailable.
- Exact official page geometry and embedded logos are not reproduced. School logos can be added using the existing export control. Generated papers use one Imtihan design and practice labels.
- Reference instructions are editable text; teachers must review their language when changing the exam language. Automatic translation of these fields is not implemented.
- PDF margin-box footer support depends on the browser; use a current Chrome/Edge for pagination. See [Chrome print documentation](https://developer.chrome.com/blog/print-margins).
- Browser visual QA could not run because browser policy denied the local preview. Component and print-DOM tests cover behavior, but responsive appearance and pagination still need a visual check in an authorized browser. No browser-policy workaround was attempted.
- No paid AI request, production Firebase invocation, or real email was used in validation. Actual model adherence to the new structure still requires a teacher's review of the generated result.
