import { describe, it, expect } from "vitest";
import { buildGenerateUserPrompt } from "@/lib/prompts/generate";
import {
  buildVariantExamSystemPrompt,
  buildVariantExamUserPrompt,
} from "@/lib/prompts/variantExam";
import { buildTranslateExamSystemPrompt } from "@/lib/prompts/translateExam";
import type { ExamContext, Exercise } from "@/types/exam";

// ---------------------------------------------------------------------------
// Targeted regression tests for specific previously-unexercised branches in
// src/lib/prompts/* (identified from a real `npm run test:coverage` v8/lcov
// report — src/__tests__ already has broad coverage of these prompt
// builders, so this file deliberately does NOT re-test what's already
// covered; it only adds the exact missing branches below, each confirmed
// uncovered via `coverage/lcov.info`'s BRDA records before this file existed:
//   - prompts/variantExam.ts:38  — LANGUAGE_INSTRUCTIONS[...] ?? ...english fallback
//   - prompts/variantExam.ts:95  — exercise.points ?? 0 fallback in the total-points reduce
//   - prompts/generate.ts:852    — context.visualPreference block
//   - prompts/generate.ts:853    — extraContext ("DOMAIN DATA CONTEXT") block
//   - prompts/generate.ts:855    — teacherStylePrompt prefix block
//   - prompts/translateExam.ts:45 — LANGUAGE_INSTRUCTIONS[...] ?? ...english fallback
// ---------------------------------------------------------------------------

function baseContext(overrides: Partial<ExamContext> = {}): ExamContext {
  return {
    curriculumId: "bac-libanais",
    levelId: "terminale-s",
    subject: "mathematics",
    chapterIds: ["ter-math-complex"],
    language: "french",
    examType: "final",
    duration: 120,
    exerciseCount: 2,
    totalPoints: 20,
    difficultyMix: { easy: 0.2, medium: 0.5, hard: 0.3 },
    ...overrides,
  };
}

describe("buildVariantExamSystemPrompt — language fallback (variantExam.ts:38)", () => {
  it("falls back to the English language instructions for an unrecognized language value", () => {
    // Language is a closed union at the type level — this mirrors the exact
    // defensive test already written for buildGenerateSystemPrompt's
    // identical `?? LANGUAGE_INSTRUCTIONS.english` fallback, which is only
    // reachable via a value that bypasses the type system (e.g. a raw
    // Firestore read of previously-stored data, or a future bug upstream).
    const context = baseContext({ language: "klingon" as ExamContext["language"] });
    const prompt = buildVariantExamSystemPrompt(context);
    expect(prompt).toContain("Write the entire exam in English.");
  });
});

describe("buildVariantExamUserPrompt — missing points field (variantExam.ts:95)", () => {
  it("treats a missing/undefined 'points' on a source exercise as 0 in the total-points summary line, instead of throwing or producing NaN", () => {
    const exerciseWithoutPoints = {
      id: "ex-1",
      number: 1,
      type: "problem_solving",
      difficulty: "medium",
      statement: "A malformed exercise missing its points field.",
      solution: { finalAnswer: "x", methodology: "y" },
      chapterIds: [],
      estimatedMinutes: 5,
      // `points` deliberately omitted — real Exercise always has it, but the
      // reduce()'s own `?? 0` fallback implies this is defended against at
      // runtime for data that bypassed the type system.
    } as unknown as Exercise;
    const wellFormedExercise: Exercise = {
      id: "ex-2",
      number: 2,
      type: "multiple_choice",
      difficulty: "easy",
      points: 8,
      statement: "A well-formed exercise.",
      options: [
        { label: "A", text: "x", isCorrect: true },
        { label: "B", text: "y", isCorrect: false },
        { label: "C", text: "z", isCorrect: false },
        { label: "D", text: "w", isCorrect: false },
      ],
      solution: { finalAnswer: "A", methodology: "y" },
      chapterIds: [],
      estimatedMinutes: 5,
    };

    const prompt = buildVariantExamUserPrompt({
      context: baseContext({ exerciseCount: 2, totalPoints: 8 }),
      exercises: [exerciseWithoutPoints, wellFormedExercise],
    });
    // 0 (missing) + 8 (well-formed) = 8, not NaN.
    expect(prompt).toContain("Total points   : 8");
    expect(prompt).not.toContain("NaN");
  });
});

describe("buildTranslateExamSystemPrompt — language fallback (translateExam.ts:45)", () => {
  it("falls back to the English language instructions for an unrecognized language value", () => {
    const prompt = buildTranslateExamSystemPrompt("klingon" as ExamContext["language"]);
    expect(prompt).toContain("Write the entire exam in English.");
  });
});

describe("buildGenerateUserPrompt — visualPreference block (generate.ts:852)", () => {
  it("includes a 'Visual & Graph Requirements' block when context.visualPreference is set", () => {
    const withVisual = buildGenerateUserPrompt(
      baseContext({ visualPreference: "Include a labelled diagram of the circuit for exercise 1." }),
    );
    expect(withVisual).toContain("Visual & Graph Requirements:\nInclude a labelled diagram of the circuit for exercise 1.");
  });

  it("omits the block entirely when visualPreference is not set", () => {
    const withoutVisual = buildGenerateUserPrompt(baseContext({ visualPreference: undefined }));
    expect(withoutVisual).not.toContain("Visual & Graph Requirements");
  });
});

describe("buildGenerateUserPrompt — extraContext / DOMAIN DATA CONTEXT block (generate.ts:853)", () => {
  it("includes a 'DOMAIN DATA CONTEXT' block when extraContext is passed", () => {
    const prompt = buildGenerateUserPrompt(
      baseContext(),
      "Source document excerpt: the chapter covers Kepler's third law.",
    );
    expect(prompt).toContain("DOMAIN DATA CONTEXT:\nSource document excerpt: the chapter covers Kepler's third law.");
  });

  it("omits the block when extraContext is undefined", () => {
    const prompt = buildGenerateUserPrompt(baseContext(), undefined);
    expect(prompt).not.toContain("DOMAIN DATA CONTEXT");
  });

  it("omits the block when extraContext is an empty string", () => {
    const prompt = buildGenerateUserPrompt(baseContext(), "");
    expect(prompt).not.toContain("DOMAIN DATA CONTEXT");
  });
});

describe("buildGenerateUserPrompt — teacherStylePrompt prefix (generate.ts:855)", () => {
  it("prepends the given teacherStylePrompt string, followed by a blank line, before the rest of the prompt", () => {
    const teacherStylePrompt = "TEACHER STYLE PROFILE (learned from 5 past exams by this teacher on this subject): ...";
    const prompt = buildGenerateUserPrompt(
      baseContext(),
      undefined,
      undefined,
      teacherStylePrompt,
    );
    expect(prompt.startsWith(`${teacherStylePrompt}\n\n`)).toBe(true);
  });

  it("does not prepend anything when teacherStylePrompt is undefined", () => {
    const prompt = buildGenerateUserPrompt(baseContext());
    expect(prompt.startsWith("TEACHER STYLE PROFILE")).toBe(false);
  });
});
