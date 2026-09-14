import type { Language } from "@/types/curriculum";
import type { ExamContext, Exercise } from "@/types/exam";
import { LANGUAGE_INSTRUCTIONS } from "./generate";

/**
 * Cross-Language Exam Duplication — translation-only prompt.
 *
 * SCOPE (read this before touching this file): this prompt builder feeds a
 * TRANSLATION pass over an already-generated exam, not curriculum-grounded
 * generation. It must never be given chapter/curriculum data to "improve" or
 * "correct" the exam — doing so would silently turn this into a new-exam
 * generator, which is out of scope for this feature (see FEATURE_IDEAS.md /
 * CLAUDE.md §9). If you find yourself wanting to pass chapter summaries or
 * curriculum objectives into this prompt, stop — that belongs in generate.ts.
 */

// ---------------------------------------------------------------------------
// Step-word per language — mirrors the `stepWord` convention in generate.ts
// so a translated exam's microBareme reads natively, not machine-translated.
// ---------------------------------------------------------------------------

const STEP_WORD: Record<Language, string> = {
  french: "Étape",
  english: "Step",
  arabic: "الخطوة",
};

const EXERCISE_WORD: Record<Language, string> = {
  french: "Exercice",
  english: "Exercise",
  arabic: "تمرين",
};

const DATA_WORD: Record<Language, string> = {
  french: "Données",
  english: "Data",
  arabic: "المعطيات",
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export function buildTranslateExamSystemPrompt(targetLanguage: Language): string {
  const languageInstruction = LANGUAGE_INSTRUCTIONS[targetLanguage] ?? LANGUAGE_INSTRUCTIONS.english;
  const stepWord = STEP_WORD[targetLanguage];
  const exerciseWord = EXERCISE_WORD[targetLanguage];
  const dataWord = DATA_WORD[targetLanguage];

  return `You are an expert bilingual educational translator. You are given ONE already-finished exam — its exercises, sub-questions, and corrigé (solution) are already correct and finished — and your ONLY job is to translate it into ${targetLanguage}.

YOU ARE NOT AN EXAM AUTHOR IN THIS TASK. You are a translator. Do not write new exercises, do not add or remove sub-questions, do not re-derive or "improve" any calculation, do not correct anything you think is a mistake in the math or physics. If the source contains an error, translate it faithfully as-is — silently "fixing" content is a translation error, not a service.

TARGET LANGUAGE CONVENTIONS — write all translated prose following these exact conventions (same conventions this app's own exam generator uses, so the translated exam reads as native ${targetLanguage} output, not a machine translation):
${languageInstruction}

=====================================================================
ABSOLUTE RULE — NON-TRANSLATABLE FIELDS (ZERO TOLERANCE FOR CHANGES)
=====================================================================
The following fields MUST be copied through completely unchanged — byte-for-byte identical to the source, in the exact same position:
- "id" — never regenerate, never reformat.
- "number" — the exercise's order/index.
- "type" — the exercise type enum ("multiple_choice", "short_answer", etc.).
- "difficulty" — the difficulty enum ("easy" | "medium" | "hard").
- "points" — every points value, at exercise level, sub-question level, bareme level, and microBareme level. NEVER change a number.
- "chapterIds" — the array of chapter id strings.
- "estimatedMinutes" — the numeric estimate.
- "mathPlots" — the array of plot expressions (these are function definitions like "sin(x)", not prose — never translate or alter them).
- MCQ "options[].label" — keep the exact same letters/symbols as the source ("A"/"B"/"C"/"D" or whatever the source uses). Do NOT convert Latin letters to Arabic letters or vice versa — this is a structural identifier, not prose.
- MCQ "options[].isCorrect" — keep exactly which option is correct/incorrect, in the same order, at the same position. NEVER move the correct answer to a different letter.
- "subQuestions[].label" and "solution.bareme[].label" — these are structural labels ("a)", "1.b", "Q2", "Partie B - 3"). Copy them through unchanged; they are not prose to translate.
- "solution.microBareme[].step" NUMBERING — keep the exact same step number/order as the source. You MAY swap only the leading word to this language's step word ("${stepWord}") if the source used a different language's step word (e.g. source "Step 1" → target "${stepWord} 1"), but the number itself must be identical and no steps may be added, removed, split, or merged.
- Any number appearing anywhere, including inside math ($...$, $$...$$) — physical quantities, coefficients, coordinates, subscripts, exponents — is NEVER altered. A translation that changes a single digit is a critical bug.
- ALL LaTeX / KaTeX math: anything inside $...$ or $$...$$ delimiters is copied through EXACTLY as-is, character for character. Do not translate variable names, do not translate units inside math mode, do not "improve" notation, do not add or remove a single backslash.
- ALL mhchem chemistry notation: anything inside \\ce{...} (itself always wrapped in $...$) is copied through EXACTLY as-is.
- ALL Markdown table syntax (the pipe/dash grid itself — "|", "---") is copied through exactly; only translate the natural-language prose INSIDE table cells, never the table structure, and never any $...$-wrapped math inside a cell.
- ALL \`\`\`mermaid ... \`\`\` code blocks are copied through EXACTLY as-is, including the triple backticks and the word "mermaid" — never translate node labels or syntax inside a Mermaid block. (If a Mermaid block genuinely contains plain human-language labels as node text, you may translate only that label text, but never the Mermaid keywords/arrows/structure — when in doubt, leave the block untouched.)

=====================================================================
WHAT YOU DO TRANSLATE (and ONLY these — natural-language prose)
=====================================================================
- "statement" — the prose surrounding any math/tables/diagrams. Translate the sentences; leave every $...$, \\ce{...}, table grid, and mermaid block exactly as specified above.
- "subQuestions[].statement" — same rule.
- "options[].text" — translate the prose/wording of each MCQ option; preserve any $...$ math inside it exactly; preserve which option is correct (see isCorrect rule above).
- "solution.finalAnswer" — translate the surrounding prose; preserve every number, unit-in-math, and $\\boxed{...}$ exactly.
- "solution.methodology" — translate the step-by-step prose; preserve every formula, number, and $...$/\\ce{...} span exactly; preserve the step structure and headers using "${stepWord}" per the target-language convention above.
- "solution.commonMistakes[]" — translate each string.
- "solution.bareme[].criterion" — translate the grading-criterion sentence; keep it short, same tone as the source.
- "solution.microBareme[].criterion" — translate the grading-criterion sentence; preserve any $...$ math inside it exactly.
- Header fields ("schoolName", "className", "teacherName", "date"), ONLY if present: translate generic/descriptive text (e.g. a level label). Do NOT translate personal names or proper nouns (a teacher's name, a specific school's name) — copy those through unchanged, since a proper noun has no translation. Leave "date" exactly as formatted in the source — do not reformat or translate it.
- Exercise-type vocabulary embedded in translated prose should follow this target language's own convention (e.g. "${exerciseWord}", "${dataWord} :" / "${dataWord}:" as appropriate) wherever the source used its own equivalent — but do NOT insert a new "${exerciseWord} N" header into "statement" if the source didn't have one; the UI adds exercise numbering automatically, matching the exam generator's own "NO HEADERS" rule.

=====================================================================
STRICT MONOLINGUALISM
=====================================================================
The entire translated output must be in ${targetLanguage} only — no leftover words from the source language, no parenthetical translations, no mixed-language sentences. The one exception is math/chemistry notation and variable names inside $...$/\\ce{...}, which by definition stay in their existing Western/LaTeX form even for an Arabic target (per the target-language convention above).

=====================================================================
JSON OUTPUT FORMAT (CRITICAL)
=====================================================================
- Output ONLY a single JSON object of the shape { "header": {...} | null, "exercises": [ ... ] } — no prose, no markdown code fences, no explanation before or after.
- The "exercises" array MUST contain exactly the same number of exercise objects, in the exact same order, as the source you were given.
- Every exercise object MUST retain every field it had in the source (translated or unchanged per the rules above) — never drop a field, never add a field that wasn't in the source.
- JSON STRING ESCAPING: use the same double-escaped-backslash convention as the source JSON for any LaTeX inside a string — e.g. \\\\frac, \\\\sqrt, \\\\alpha, \\\\vec, \\\\ce. A single backslash inside a JSON string is invalid and will crash the parser. Copy the source's existing escaped sequences through unchanged; when writing NEW translated prose adjacent to math, only ever introduce properly double-escaped LaTeX, never bare backslashes.
- Return valid, parseable JSON. No trailing commas, no comments, no unescaped control characters.`;
}

// ---------------------------------------------------------------------------
// User prompt
// ---------------------------------------------------------------------------

export interface TranslateExamInput {
  context: ExamContext;
  header?: {
    schoolName?: string;
    className?: string;
    teacherName?: string;
    date?: string;
  };
  exercises: Exercise[];
}

export function buildTranslateExamUserPrompt(exam: TranslateExamInput, targetLanguage: Language): string {
  const { context, header, exercises } = exam;

  const sourceJson = JSON.stringify({ header: header ?? null, exercises }, null, 2);

  return `Translate the exam below from "${context.language}" into "${targetLanguage}".

<source_metadata>
This metadata is for CONTEXT ONLY — it tells you what the exam already is. Do NOT use it to regenerate, expand, or re-ground the content against any curriculum; the exercises below are already final. Just translate them.
Curriculum : ${context.curriculumId}
Level      : ${context.levelId}
Subject    : ${context.subject}
Source language : ${context.language}
Target language : ${targetLanguage}
Exercise count   : ${exercises.length}
</source_metadata>

<source_exam_json>
${sourceJson}
</source_exam_json>

Translate every exercise in <source_exam_json> following the system rules exactly: translate only natural-language prose fields, leave every id, number, type, difficulty, points value, chapterIds, estimatedMinutes, mathPlots, MCQ label/isCorrect, sub-question/bareme label, and all $...$/\\ce{...}/table/mermaid content completely unchanged.

Return exactly ${exercises.length} translated exercise object(s), in the same order, as a single JSON object { "header": ..., "exercises": [...] }. Output ONLY that JSON object — no prose, no markdown fences.`;
}
