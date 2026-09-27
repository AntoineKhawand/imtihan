import type { Exercise, McqOption } from "@/types/exam";

/**
 * Real Version B merge logic (FOUNDER_DECISIONS.md #9, option (a)).
 *
 * Previously (see BUG-036/BUG-042) this file only shuffled exercise/
 * sub-question order — same statement text, same numbers, just reordered
 * and relabeled. That was the actual root cause of BUG-042: the marketing
 * copy and the Pro-gated UI both implied a real second variant, but nothing
 * in the app ever changed a single number or word.
 *
 * The new real Version B flow (src/app/api/generate/version-b/route.ts)
 * asks Claude/Gemini to rewrite each exercise's numbers/names/context and
 * fully recompute its solution (src/lib/prompts/variantExam.ts). This file's
 * job is the safety net on the way back: an AI response is never trusted to
 * perfectly preserve the structural/gradable metadata that makes Version B
 * fair (difficulty, points, chapter coverage, sub-question/option counts) —
 * `mergeVariantExercise()` force-copies those fields from the original
 * Version A exercise no matter what the model returned, and only takes
 * *content* fields (statement, options text, solution) from the AI. This
 * makes "same difficulty, same points distribution as Version A" a
 * structural guarantee enforced in code, not just a prompt instruction.
 */

/** Loosely-typed shape of whatever the AI returned for one exercise — may be
 *  malformed, missing fields, or otherwise not trustworthy on its own. */
type VariantCandidate = Record<string, unknown>;

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asStringArrayOrUndefined(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((v): v is string => typeof v === "string");
  return strings.length > 0 ? strings : undefined;
}

function asRecord(value: unknown): VariantCandidate | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as VariantCandidate) : undefined;
}

function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

/**
 * Merge sub-questions: NUMBER, "label", and "points" always come from the
 * original (structural/gradable) — only "statement" may come from the AI
 * variant, matched by position. A count mismatch from the AI is ignored
 * entirely (original wins) rather than risk silently dropping or duplicating
 * a graded sub-question.
 */
function mergeSubQuestions(
  original: Exercise["subQuestions"],
  variantSubs: unknown
): Exercise["subQuestions"] {
  if (!original) return original;
  const variantArr = asArray(variantSubs) ?? [];
  return original.map((orig, i) => {
    const cand = asRecord(variantArr[i]);
    return {
      label: orig.label,
      points: orig.points,
      statement: asString(cand?.statement, orig.statement),
    };
  });
}

/**
 * Merge MCQ options: "label" (A/B/C/D, or the Arabic equivalents) and the
 * COUNT always come from the original. "text" may come from the AI variant.
 * "isCorrect" may also move to a different option (the correct numeric
 * answer can land on a different letter once the numbers changed) — but
 * only if the AI variant has exactly one option marked correct; otherwise
 * fall back to the original correctness pattern entirely, so a malformed
 * AI response can never produce an exercise with zero or multiple correct
 * options.
 */
function mergeOptions(original: Exercise["options"], variantOptions: unknown): Exercise["options"] {
  if (!original) return original;
  const variantArr = asArray(variantOptions) ?? [];
  const candidates = original.map((orig, i) => asRecord(variantArr[i]));
  const correctCount = candidates.filter((c) => c?.isCorrect === true).length;
  const useVariantCorrectness = correctCount === 1;

  return original.map((orig, i): McqOption => {
    const cand = candidates[i];
    return {
      label: orig.label,
      text: asString(cand?.text, orig.text),
      isCorrect: useVariantCorrectness ? cand?.isCorrect === true : orig.isCorrect,
    };
  });
}

/**
 * Merge bareme/microBareme-shaped arrays: every field EXCEPT the given
 * `contentKey` (the free-text criterion/step-description field) comes from
 * the original. Generic over the two shapes since they only differ in which
 * field holds the identifying label ("label" vs "step").
 */
function mergeGradingEntries<T extends Record<string, unknown>>(
  original: T[] | undefined,
  variantEntries: unknown,
  contentKey: keyof T & string
): T[] | undefined {
  if (!original) return original;
  const variantArr = asArray(variantEntries) ?? [];
  return original.map((orig, i) => {
    const cand = asRecord(variantArr[i]);
    const candContent = cand?.[contentKey];
    return {
      ...orig,
      [contentKey]: typeof candContent === "string" && candContent.trim().length > 0 ? candContent : orig[contentKey],
    };
  });
}

/**
 * Produce one Version B exercise: content (statement, options text, sub-
 * question statements, solution) comes from `variant` where present and
 * valid; every structural/gradable field is force-copied from `original`
 * regardless of what `variant` contains. Never throws — a completely
 * unusable `variant` (e.g. not an object at all) degrades gracefully to
 * returning `original` unchanged for that one exercise, rather than failing
 * the whole Version B generation over one bad exercise.
 */
export function mergeVariantExercise(original: Exercise, variant: unknown): Exercise {
  const cand = asRecord(variant);
  if (!cand) return original;

  const candSolution = asRecord(cand.solution);

  return {
    // Structural/gradable — always the original's, never the AI's.
    id: original.id,
    number: original.number,
    type: original.type,
    difficulty: original.difficulty,
    points: original.points,
    chapterIds: original.chapterIds,
    estimatedMinutes: original.estimatedMinutes,
    mathPlots: original.mathPlots,
    // Content — from the AI variant where present, original as fallback.
    statement: asString(cand.statement, original.statement),
    options: mergeOptions(original.options, cand.options),
    subQuestions: mergeSubQuestions(original.subQuestions, cand.subQuestions),
    solution: {
      finalAnswer: asString(candSolution?.finalAnswer, original.solution.finalAnswer),
      methodology: asString(candSolution?.methodology, original.solution.methodology),
      commonMistakes: asStringArrayOrUndefined(candSolution?.commonMistakes) ?? original.solution.commonMistakes,
      bareme: mergeGradingEntries(original.solution.bareme, candSolution?.bareme, "criterion"),
      microBareme: mergeGradingEntries(original.solution.microBareme, candSolution?.microBareme, "criterion"),
    },
  };
}

/**
 * Merge a full Version B response against the original Version A exercise
 * list. Matched strictly by position (index), not by "id", since the AI is
 * only ever asked to preserve order, never asked to invent new ids.
 * A shorter/malformed `variants` array is padded with the original
 * exercises rather than throwing — see mergeVariantExercise's own
 * graceful-degradation note.
 */
export function mergeVariantExercises(originals: Exercise[], variants: unknown[]): Exercise[] {
  return originals.map((orig, i) => mergeVariantExercise(orig, variants[i]));
}
