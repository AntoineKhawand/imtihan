import { describe, it, expect } from "vitest";
import { mergeVariantExercise, mergeVariantExercises } from "@/lib/variant";
import { AIExerciseSchema } from "@/lib/schemas/exercise";
import type { Exercise } from "@/types/exam";

// ---------------------------------------------------------------------------
// Real Version B (FOUNDER_DECISIONS.md #9, option (a)): src/lib/variant.ts's
// mergeVariantExercise()/mergeVariantExercises() are the safety net that
// makes "same difficulty / points distribution as Version A" a structural
// GUARANTEE, not just a prompt instruction the AI might ignore. These tests
// exercise that merge logic directly (no real AI call), plus the same
// AIExerciseSchema src/app/api/generate/version-b/route.ts uses to validate
// the AI's raw response before merging.
// ---------------------------------------------------------------------------

const originalMcq: Exercise = {
  id: "ex-1",
  number: 1,
  type: "multiple_choice",
  difficulty: "easy",
  points: 4,
  statement: "Which of the following is the SI unit of force?",
  options: [
    { label: "A", text: "Joule", isCorrect: false },
    { label: "B", text: "Newton", isCorrect: true },
    { label: "C", text: "Watt", isCorrect: false },
    { label: "D", text: "Pascal", isCorrect: false },
  ],
  solution: { finalAnswer: "B — Newton", methodology: "The Newton is the SI unit of force." },
  chapterIds: ["ter-phy-mechanics"],
  estimatedMinutes: 3,
};

const originalProblem: Exercise = {
  id: "ex-2",
  number: 2,
  type: "problem_solving",
  difficulty: "medium",
  points: 12,
  statement: "A ball of mass 2 kg is dropped from a height of 10 m.",
  subQuestions: [
    { label: "a)", statement: "Find its velocity on impact.", points: 6 },
    { label: "b)", statement: "Find the time of fall.", points: 6 },
  ],
  solution: {
    finalAnswer: "$v = 14 \\, m/s$",
    methodology: "Étape 1: Apply energy conservation...",
    bareme: [
      { label: "a)", points: 6, criterion: "Correct velocity formula" },
      { label: "b)", points: 6, criterion: "Correct time formula" },
    ],
    microBareme: [
      { step: "Étape 1", points: 4, criterion: "Writes conservation of energy" },
      { step: "Étape 2", points: 8, criterion: "Substitutes correct values" },
    ],
  },
  chapterIds: ["ter-phy-mechanics"],
  estimatedMinutes: 20,
};

describe("mergeVariantExercise — structural/gradable metadata is always preserved", () => {
  it("keeps id, number, type, difficulty, points, chapterIds, estimatedMinutes from the original even when the AI tries to change them", () => {
    const maliciousVariant = {
      id: "hacked-id",
      number: 99,
      type: "essay",
      difficulty: "hard",
      points: 999,
      chapterIds: ["invented-chapter"],
      estimatedMinutes: 999,
      statement: "A ball of mass 3 kg is dropped from a height of 20 m.",
      solution: { finalAnswer: "$v = 20 \\, m/s$", methodology: "New methodology." },
    };
    const merged = mergeVariantExercise(originalProblem, maliciousVariant);
    expect(merged.id).toBe(originalProblem.id);
    expect(merged.number).toBe(originalProblem.number);
    expect(merged.type).toBe(originalProblem.type);
    expect(merged.difficulty).toBe(originalProblem.difficulty);
    expect(merged.points).toBe(originalProblem.points);
    expect(merged.chapterIds).toEqual(originalProblem.chapterIds);
    expect(merged.estimatedMinutes).toBe(originalProblem.estimatedMinutes);
    // Content DOES come from the AI variant.
    expect(merged.statement).toBe(maliciousVariant.statement);
    expect(merged.solution.finalAnswer).toBe(maliciousVariant.solution.finalAnswer);
  });

  it("falls back to the original exercise entirely when the AI variant is unusable (not an object)", () => {
    expect(mergeVariantExercise(originalProblem, null)).toEqual(originalProblem);
    expect(mergeVariantExercise(originalProblem, "not an object")).toEqual(originalProblem);
    expect(mergeVariantExercise(originalProblem, undefined)).toEqual(originalProblem);
  });

  it("falls back per-field to the original when a field is missing from the AI variant", () => {
    const partialVariant = { statement: "A different-context statement." };
    const merged = mergeVariantExercise(originalProblem, partialVariant);
    expect(merged.statement).toBe("A different-context statement.");
    expect(merged.solution.finalAnswer).toBe(originalProblem.solution.finalAnswer);
    expect(merged.solution.methodology).toBe(originalProblem.solution.methodology);
  });
});

describe("mergeVariantExercise — sub-questions", () => {
  it("preserves sub-question labels and points; only takes statement text from the AI", () => {
    const variant = {
      statement: "A ball of mass 3 kg is dropped from a height of 20 m.",
      subQuestions: [
        { label: "z)", statement: "Find its new velocity on impact.", points: 999 },
        { label: "y)", statement: "Find its new time of fall.", points: 999 },
      ],
      solution: { finalAnswer: "new", methodology: "new" },
    };
    const merged = mergeVariantExercise(originalProblem, variant);
    expect(merged.subQuestions).toEqual([
      { label: "a)", points: 6, statement: "Find its new velocity on impact." },
      { label: "b)", points: 6, statement: "Find its new time of fall." },
    ]);
  });

  it("keeps the original sub-question statement if the AI's array is shorter", () => {
    const variant = { subQuestions: [{ label: "a)", statement: "Only one rewritten.", points: 1 }] };
    const merged = mergeVariantExercise(originalProblem, variant);
    expect(merged.subQuestions?.[0].statement).toBe("Only one rewritten.");
    expect(merged.subQuestions?.[1].statement).toBe(originalProblem.subQuestions![1].statement);
    expect(merged.subQuestions?.[1].points).toBe(6);
  });
});

describe("mergeVariantExercise — MCQ options", () => {
  it("preserves option labels/count; takes new text and allows the correct answer to move", () => {
    const variant = {
      statement: "Which of the following is the SI unit of energy?",
      options: [
        { label: "A", text: "Joule", isCorrect: true },
        { label: "B", text: "Newton", isCorrect: false },
        { label: "C", text: "Watt", isCorrect: false },
        { label: "D", text: "Pascal", isCorrect: false },
      ],
      solution: { finalAnswer: "A — Joule", methodology: "The Joule is the SI unit of energy." },
    };
    const merged = mergeVariantExercise(originalMcq, variant);
    expect(merged.options).toHaveLength(4);
    expect(merged.options?.map((o) => o.label)).toEqual(["A", "B", "C", "D"]);
    expect(merged.options?.map((o) => o.text)).toEqual(["Joule", "Newton", "Watt", "Pascal"]);
    expect(merged.options?.filter((o) => o.isCorrect)).toHaveLength(1);
    expect(merged.options?.find((o) => o.isCorrect)?.label).toBe("A");
  });

  it("falls back to the original correctness pattern if the AI variant has zero or multiple correct options", () => {
    const zeroCorrect = {
      options: [
        { label: "A", text: "x", isCorrect: false },
        { label: "B", text: "y", isCorrect: false },
        { label: "C", text: "z", isCorrect: false },
        { label: "D", text: "w", isCorrect: false },
      ],
    };
    const merged1 = mergeVariantExercise(originalMcq, zeroCorrect);
    expect(merged1.options?.filter((o) => o.isCorrect)).toHaveLength(1);
    expect(merged1.options?.find((o) => o.isCorrect)?.label).toBe("B"); // original's correct letter

    const twoCorrect = {
      options: [
        { label: "A", text: "x", isCorrect: true },
        { label: "B", text: "y", isCorrect: true },
        { label: "C", text: "z", isCorrect: false },
        { label: "D", text: "w", isCorrect: false },
      ],
    };
    const merged2 = mergeVariantExercise(originalMcq, twoCorrect);
    expect(merged2.options?.filter((o) => o.isCorrect)).toHaveLength(1);
  });
});

describe("mergeVariantExercise — bareme / microBareme", () => {
  it("preserves labels/points; only takes the criterion text from the AI", () => {
    const variant = {
      solution: {
        finalAnswer: "new",
        methodology: "new",
        bareme: [
          { label: "a)", points: 999, criterion: "New velocity criterion" },
          { label: "b)", points: 999, criterion: "New time criterion" },
        ],
        microBareme: [
          { step: "Étape 1", points: 999, criterion: "New step 1 criterion" },
          { step: "Étape 2", points: 999, criterion: "New step 2 criterion" },
        ],
      },
    };
    const merged = mergeVariantExercise(originalProblem, variant);
    expect(merged.solution.bareme).toEqual([
      { label: "a)", points: 6, criterion: "New velocity criterion" },
      { label: "b)", points: 6, criterion: "New time criterion" },
    ]);
    expect(merged.solution.microBareme).toEqual([
      { step: "Étape 1", points: 4, criterion: "New step 1 criterion" },
      { step: "Étape 2", points: 8, criterion: "New step 2 criterion" },
    ]);
    // Total points distribution is provably unchanged.
    const originalTotal = originalProblem.solution.bareme!.reduce((s, b) => s + b.points, 0);
    const mergedTotal = merged.solution.bareme!.reduce((s, b) => s + b.points, 0);
    expect(mergedTotal).toBe(originalTotal);
  });
});

describe("mergeVariantExercises — whole-exam merge", () => {
  it("merges by position and pads with the original when the AI array is short", () => {
    const originals = [originalMcq, originalProblem];
    const variants = [{ statement: "Only the first exercise varied." }];
    const merged = mergeVariantExercises(originals, variants);
    expect(merged).toHaveLength(2);
    expect(merged[0].statement).toBe("Only the first exercise varied.");
    expect(merged[1]).toEqual(originalProblem); // untouched, safe fallback
  });

  it("never changes the total exam points across a full merge", () => {
    const originals = [originalMcq, originalProblem];
    const variants = [
      { statement: "New MCQ statement.", points: 1, solution: { finalAnswer: "x", methodology: "y" } },
      { statement: "New problem statement.", points: 1, solution: { finalAnswer: "x", methodology: "y" } },
    ];
    const merged = mergeVariantExercises(originals, variants);
    const originalTotal = originals.reduce((s, e) => s + e.points, 0);
    const mergedTotal = merged.reduce((s, e) => s + e.points, 0);
    expect(mergedTotal).toBe(originalTotal);
  });
});

// ---------------------------------------------------------------------------
// Zod validation — same AIExerciseSchema src/app/api/generate/version-b's
// route uses to validate the AI's raw JSON response before merging.
// ---------------------------------------------------------------------------

describe("AIExerciseSchema — Version B response validation", () => {
  const validExercise = {
    id: "ex-2",
    number: 2,
    type: "problem_solving",
    difficulty: "medium",
    points: 12,
    statement: "A ball of mass 3 kg is dropped from a height of 15 m.",
    subQuestions: [
      { label: "a)", statement: "Find its velocity on impact.", points: 6 },
      { label: "b)", statement: "Find the time of fall.", points: 6 },
    ],
    solution: {
      finalAnswer: "$v = 17.1 \\, m/s$",
      methodology: "Étape 1: Apply energy conservation...",
      bareme: [
        { label: "a)", points: 6, criterion: "Correct velocity formula" },
        { label: "b)", points: 6, criterion: "Correct time formula" },
      ],
    },
    chapterIds: ["ter-phy-mechanics"],
    estimatedMinutes: 20,
  };

  it("accepts a well-formed AI variant exercise", () => {
    const result = AIExerciseSchema.safeParse(validExercise);
    expect(result.success).toBe(true);
  });

  it("rejects an exercise missing required fields (e.g. no solution)", () => {
    const { solution, ...missingSolution } = validExercise;
    const result = AIExerciseSchema.safeParse(missingSolution);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid exercise type or difficulty the AI might hallucinate", () => {
    const badType = AIExerciseSchema.safeParse({ ...validExercise, type: "fill_in_the_blank" });
    expect(badType.success).toBe(false);
    const badDifficulty = AIExerciseSchema.safeParse({ ...validExercise, difficulty: "extreme" });
    expect(badDifficulty.success).toBe(false);
  });

  it("defaults chapterIds to [] when omitted, rather than failing validation", () => {
    const { chapterIds, ...withoutChapterIds } = validExercise;
    const result = AIExerciseSchema.safeParse(withoutChapterIds);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.chapterIds).toEqual([]);
  });

  it("preserves unknown/future fields via passthrough rather than dropping them", () => {
    const result = AIExerciseSchema.safeParse({ ...validExercise, futureField: "some new data" });
    expect(result.success).toBe(true);
    if (result.success) expect((result.data as Record<string, unknown>).futureField).toBe("some new data");
  });
});
