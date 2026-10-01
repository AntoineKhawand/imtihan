import { describe, it, expect } from "vitest";
import {
  buildStyleFromExams,
  buildTeacherStylePrompt,
  type ExamSummaryForStyle,
  type TeacherStyleData,
} from "@/lib/teacherStyle";

// ---------------------------------------------------------------------------
// src/lib/teacherStyle.ts had zero test coverage before this file. Only the
// two pure, synchronous functions are covered here — `getTeacherStyle`,
// `saveTeacherStyle`, and `mergeAndSaveStyle` all read/write `adminDb`
// (Firestore Admin SDK) and are intentionally left untested at the unit
// level, same precedent as `schoolBank-exemplars.test.ts` /
// `generate-prompts.test.ts` for this codebase's other Firestore-backed
// prompt-context builders — real Firestore access must not be exercised
// from an unattended test run (CLAUDE.md §15).
// ---------------------------------------------------------------------------

function exam(overrides: Partial<ExamSummaryForStyle> = {}): ExamSummaryForStyle {
  return {
    context: {
      curriculumId: "bac-libanais",
      subject: "mathematics",
      exerciseCount: 4,
      difficultyMix: { easy: 0.2, medium: 0.5, hard: 0.3 },
      examType: "final",
    },
    exercises: [
      { statement: "Résoudre l'équation.", type: "algebra", difficulty: "medium" },
    ],
    ...overrides,
  };
}

describe("buildStyleFromExams", () => {
  it("returns count/averages/frequencies for a single exam", () => {
    const result = buildStyleFromExams([exam()]);
    expect(result.count).toBe(1);
    expect(result.avgExerciseCount).toBe(1); // exam.exercises.length (1), not context.exerciseCount (4)
    expect(result.avgDifficultyMix).toEqual({ easy: 0.2, medium: 0.5, hard: 0.3 });
    expect(result.preferredExerciseTypes).toEqual({ algebra: 1 });
    expect(result.recentExamples).toHaveLength(1);
    expect(result.recentExamples[0]).toEqual({
      statement: "Résoudre l'équation.",
      type: "algebra",
      difficulty: "medium",
    });
  });

  it("falls back to context.exerciseCount when an exam's exercises array is empty", () => {
    const result = buildStyleFromExams([
      exam({ exercises: [], context: { ...exam().context, exerciseCount: 6 } }),
    ]);
    expect(result.avgExerciseCount).toBe(6);
    expect(result.recentExamples).toHaveLength(0);
    expect(result.preferredExerciseTypes).toEqual({});
  });

  it("averages exerciseCount and difficultyMix across multiple exams", () => {
    const examA = exam({
      exercises: [{ statement: "A1", type: "algebra", difficulty: "easy" }],
      context: {
        curriculumId: "bac-libanais",
        subject: "mathematics",
        exerciseCount: 2,
        // Powers-of-two fractions so the averaged sums below are exact in
        // IEEE 754 — avoids asserting on a value like 0.30000000000000004.
        difficultyMix: { easy: 0.5, medium: 0.25, hard: 0.25 },
        examType: "final",
      },
    });
    const examB = exam({
      exercises: [
        { statement: "B1", type: "geometry", difficulty: "hard" },
        { statement: "B2", type: "geometry", difficulty: "hard" },
        { statement: "B3", type: "algebra", difficulty: "medium" },
      ],
      context: {
        curriculumId: "bac-libanais",
        subject: "mathematics",
        exerciseCount: 3,
        difficultyMix: { easy: 0.0, medium: 0.25, hard: 0.75 },
        examType: "final",
      },
    });
    const result = buildStyleFromExams([examA, examB]);

    expect(result.count).toBe(2);
    // totalExCount = 1 (examA has 1 exercise) + 3 (examB has 3) = 4; avg = 2.0
    expect(result.avgExerciseCount).toBe(2);
    expect(result.avgDifficultyMix).toEqual({ easy: 0.25, medium: 0.25, hard: 0.5 });
    expect(result.preferredExerciseTypes).toEqual({ algebra: 2, geometry: 2 });
  });

  it("caps recentExamples at 4 total across multiple exams, keeping the freshest-first order", () => {
    const manyExercises = Array.from({ length: 3 }, (_, i) => ({
      statement: `Exercise ${i + 1}`,
      type: "algebra",
      difficulty: "medium",
    }));
    const examA = exam({ exercises: manyExercises });
    const examB = exam({ exercises: manyExercises });
    const result = buildStyleFromExams([examA, examB]);

    expect(result.recentExamples).toHaveLength(4);
    expect(result.recentExamples.map((e) => e.statement)).toEqual([
      "Exercise 1",
      "Exercise 2",
      "Exercise 3",
      "Exercise 1",
    ]);
  });

  it("truncates an overlong exercise statement to 500 characters in recentExamples", () => {
    const long = "x".repeat(600);
    const result = buildStyleFromExams([
      exam({ exercises: [{ statement: long, type: "algebra", difficulty: "medium" }] }),
    ]);
    expect(result.recentExamples[0].statement).toHaveLength(500);
  });
});

describe("buildTeacherStylePrompt", () => {
  const baseStyle: TeacherStyleData = {
    count: 5,
    avgExerciseCount: 4.4,
    avgDifficultyMix: { easy: 0.25, medium: 0.5, hard: 0.25 },
    preferredExerciseTypes: { algebra: 8, geometry: 5, probability: 3, calculus: 1 },
    recentExamples: [
      { statement: "Résoudre $x^2 = 4$.", type: "algebra", difficulty: "medium" },
      { statement: "Calculer l'aire du triangle.", type: "geometry", difficulty: "easy" },
    ],
    updatedAt: Date.now(),
  };

  it("returns an empty string when count is below 2 (not enough history yet)", () => {
    expect(buildTeacherStylePrompt({ ...baseStyle, count: 1 })).toBe("");
    expect(buildTeacherStylePrompt({ ...baseStyle, count: 0 })).toBe("");
  });

  it("returns an empty string when recentExamples is empty, even with count >= 2", () => {
    expect(buildTeacherStylePrompt({ ...baseStyle, count: 3, recentExamples: [] })).toBe("");
  });

  it("builds a full prompt with rounded percentages and the top 3 exercise types by frequency", () => {
    const prompt = buildTeacherStylePrompt(baseStyle);
    expect(prompt).toContain("learned from 5 past exams");
    expect(prompt).toContain("25% easy / 50% medium / 25% hard");
    // 4 types present (algebra, geometry, probability, calculus) — only the
    // top 3 by frequency should appear, least-frequent ("calculus") dropped.
    expect(prompt).toContain("algebra, geometry, probability");
    expect(prompt).not.toContain("calculus");
    expect(prompt).toContain("Avg exercises per exam: 4");
    expect(prompt).toContain("Style example 1 (algebra, medium):\nRésoudre $x^2 = 4$.");
    expect(prompt).toContain("Style example 2 (geometry, easy):\nCalculer l'aire du triangle.");
    expect(prompt).toContain("Mirror the above examples");
    expect(prompt).toContain("Do not copy them verbatim");
  });
});
