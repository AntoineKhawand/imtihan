import type { ExamContext, Exercise } from "@/types/exam";
import { LANGUAGE_INSTRUCTIONS } from "./generate";

/**
 * Real "Version B" exam-variant prompt — replaces the previous client-side
 * reorder-only implementation (`src/lib/variant.ts`'s old `buildVersionB()`,
 * see BUG-036/BUG-042/FOUNDER_DECISIONS.md #9). This prompt asks Claude/
 * Gemini to produce a genuinely different second exam covering the exact
 * same skills, difficulty, and point distribution as an already-finished
 * "Version A" — different numbers, names, and contexts, not just a shuffle.
 *
 * SCOPE (read this before touching this file): like translateExam.ts, this
 * is a TRANSFORM pass over an already-generated, already-correct exam, not
 * curriculum-grounded generation from scratch. It must never be given raw
 * chapter/curriculum data to "improve" or re-derive the exam — the whole
 * point is that Version B stays exactly as valid, and exactly as hard, as
 * Version A, just not byte-identical. Every structural/gradable field this
 * prompt is told to preserve (type, difficulty, points, chapterIds,
 * subQuestion/option counts and labels, bareme/microBareme point values) is
 * ALSO force-preserved in code afterward by `mergeVariantExercise()` in
 * src/lib/variant.ts — this prompt's own instructions are the first line of
 * defense, not the only one. Don't remove that merge step even if the model
 * seems to behave — a single ignored instruction here would otherwise let a
 * generated Version B silently differ in total points or difficulty mix from
 * Version A, which is exactly the fairness gap this feature exists to close.
 */

export interface VariantExamInput {
  context: ExamContext;
  exercises: Exercise[];
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export function buildVariantExamSystemPrompt(context: ExamContext): string {
  const languageInstruction = LANGUAGE_INSTRUCTIONS[context.language] ?? LANGUAGE_INSTRUCTIONS.english;

  return `You are an expert examiner producing "Version B" of an already-finished exam ("Version A") for a teacher who wants to give two different-looking exams to two halves of the same class — the classic anti-cheating technique of seating neighbours with visibly different papers. Version B must be EQUALLY VALID and EQUALLY DIFFICULT as Version A: same skills tested, same curriculum coverage, same point distribution — but NOT a disguised copy. A student who saw Version A's paper on a neighbour's desk should not be able to copy a single final numeric answer or a verbatim sentence.

TARGET LANGUAGE — write entirely in ${context.language}, following these conventions (same as the original exam):
${languageInstruction}

=====================================================================
WHAT YOU MUST CHANGE (this is the entire point of Version B)
=====================================================================
For every exercise, rewrite its "statement" (and "subQuestions[].statement", and "options[].text" for MCQs) so that:
- Every numeric quantity, coefficient, date, name, dataset value, or measurement is DIFFERENT from Version A — new realistic numbers, not a relabeling of the same ones (e.g. don't just swap "5 kg" for "kg 5" — pick an actually different mass).
- The surface context/scenario changes where natural (a different named object, a different city, a different chemical compound of the same family, a different function of the same type, a different fictional company) — but the underlying concept/skill/chapter being tested must stay identical.
- For exercises with no natural numeric parameter (an essay, a document-analysis, a proof with no numbers, a dissertation-style question): change the concrete scenario/documents/examples/named entities while asking for the exact same reasoning skill, in the same number of parts.
- Recompute "solution.finalAnswer" and "solution.methodology" completely, from scratch, against your NEW numbers — every intermediate value and the final boxed answer must be internally consistent with the new statement. Never reuse Version A's numeric answer with a new statement around it — that is the single most common way this task goes wrong, so verify your own arithmetic before finalizing.
- For multiple_choice exercises: keep exactly 4 options, but the distractors and the correct answer's numeric value must be recomputed for the new numbers — the correct option is allowed to land on a different letter (A/B/C/D) than in Version A, since the underlying calculation changed. Exactly one option must be correct.

=====================================================================
WHAT YOU MUST NOT CHANGE (structural/gradable metadata — preserve exactly)
=====================================================================
These fields carry no content of their own to vary — they define the shape and fairness of the exam, and must be copied through unchanged, in the same order:
- "id", "number", "type", "difficulty", "points" (exercise-level).
- "chapterIds", "estimatedMinutes", "mathPlots".
- The NUMBER of "subQuestions" and their "label"s and "points" — only their "statement" text changes.
- The NUMBER of MCQ "options" (always 4) and their "label"s ("A"/"B"/"C"/"D" or the Arabic equivalents) — only "text" and which one "isCorrect" changes.
- "solution.bareme[].label" and "solution.bareme[].points" — only "criterion" wording may change if the new numbers make the original criterion inaccurate.
- "solution.microBareme[].step" and "solution.microBareme[].points" — only "criterion" wording may change.
Even though you are asked to reproduce these fields, they will also be verified and force-corrected in code after your response — so focus your effort on making the CONTENT genuinely different and correct, not on double-checking these structural numbers.

=====================================================================
JSON OUTPUT FORMAT (CRITICAL)
=====================================================================
- Output ONLY a single JSON object of the shape { "exercises": [ ... ] } — no prose, no markdown code fences, no explanation before or after.
- The "exercises" array MUST contain exactly the same number of exercise objects, in the exact same order, as the source Version A you were given — one variant per source exercise, matched by position.
- Every exercise object must have the exact same JSON shape as the source (all fields present).
- JSON STRING ESCAPING: use double-escaped backslashes for any LaTeX inside a string — \\\\frac, \\\\sqrt, \\\\alpha, \\\\vec, \\\\ce. A single backslash inside a JSON string is invalid and will crash the parser.
- Return valid, parseable JSON. No trailing commas, no comments, no unescaped control characters.`;
}

// ---------------------------------------------------------------------------
// User prompt
// ---------------------------------------------------------------------------

export function buildVariantExamUserPrompt(input: VariantExamInput): string {
  const { context, exercises } = input;
  const sourceJson = JSON.stringify({ exercises }, null, 2);

  return `Produce Version B for the exam below — a genuinely different variant, not a reorder or relabeling.

<source_metadata>
This metadata is for CONTEXT ONLY — Version B must stay within the same scope. Do NOT introduce a concept outside these chapters, and do NOT change the exercise count, difficulty mix, or total points.
Curriculum : ${context.curriculumId}
Level      : ${context.levelId}
Subject    : ${context.subject}
Language   : ${context.language}
Exercise count : ${exercises.length}
Total points   : ${exercises.reduce((s, e) => s + (e.points ?? 0), 0)}
</source_metadata>

<version_a_json>
${sourceJson}
</version_a_json>

Following the system rules exactly: rewrite every exercise's numbers/names/context and fully recompute its solution, while preserving every structural/gradable field listed (id, number, type, difficulty, points, chapterIds, estimatedMinutes, mathPlots, subQuestion/option counts and labels, bareme/microBareme labels and points).

Return exactly ${exercises.length} variant exercise object(s), in the same order, as a single JSON object { "exercises": [...] }. Output ONLY that JSON object — no prose, no markdown fences.`;
}
