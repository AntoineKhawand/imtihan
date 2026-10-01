import { describe, it, expect } from "vitest";
import {
  buildVariantExamSystemPrompt,
  buildVariantExamUserPrompt,
} from "@/lib/prompts/variantExam";
import type { ExamContext, Exercise } from "@/types/exam";

// ---------------------------------------------------------------------------
// Real Version B generation (FOUNDER_DECISIONS.md #9, option (a)) — replaces
// the previous client-side reorder-only implementation. These tests cover
// the prompt builders that ask Claude/Gemini for a genuinely different
// second exam, not the AI call itself (see src/app/api/generate/version-b).
// ---------------------------------------------------------------------------

function baseContext(overrides: Partial<ExamContext> = {}): ExamContext {
  return {
    curriculumId: "bac-libanais",
    levelId: "terminale-s",
    subject: "physics",
    chapterIds: ["ter-phy-mechanics"],
    language: "french",
    examType: "final",
    duration: 120,
    exerciseCount: 2,
    totalPoints: 20,
    difficultyMix: { easy: 0.2, medium: 0.5, hard: 0.3 },
    ...overrides,
  };
}

const exercises: Exercise[] = [
  {
    id: "ex-1",
    number: 1,
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
    },
    chapterIds: ["ter-phy-mechanics"],
    estimatedMinutes: 20,
  },
  {
    id: "ex-2",
    number: 2,
    type: "multiple_choice",
    difficulty: "easy",
    points: 8,
    statement: "Which of the following is the SI unit of force?",
    options: [
      { label: "A", text: "Joule", isCorrect: false },
      { label: "B", text: "Newton", isCorrect: true },
      { label: "C", text: "Watt", isCorrect: false },
      { label: "D", text: "Pascal", isCorrect: false },
    ],
    solution: { finalAnswer: "B — Newton", methodology: "The Newton is the SI unit of force." },
    chapterIds: ["ter-phy-mechanics"],
    estimatedMinutes: 5,
  },
];

describe("buildVariantExamSystemPrompt", () => {
  it("is deterministic for the same context", () => {
    const a = buildVariantExamSystemPrompt(baseContext());
    const b = buildVariantExamSystemPrompt(baseContext());
    expect(a).toBe(b);
  });

  it("differs when the language changes", () => {
    const fr = buildVariantExamSystemPrompt(baseContext({ language: "french" }));
    const en = buildVariantExamSystemPrompt(baseContext({ language: "english" }));
    expect(fr).not.toBe(en);
  });

  it("instructs the model to change numbers/context, not just reorder", () => {
    const prompt = buildVariantExamSystemPrompt(baseContext());
    expect(prompt).toMatch(/DIFFERENT from Version A/i);
    expect(prompt).toMatch(/Recompute/i);
  });

  it("instructs the model to preserve structural/gradable metadata", () => {
    const prompt = buildVariantExamSystemPrompt(baseContext());
    for (const field of ["\"type\"", "\"difficulty\"", "\"points\"", "\"chapterIds\""]) {
      expect(prompt).toContain(field);
    }
  });

  it("requires the exact JSON output shape", () => {
    const prompt = buildVariantExamSystemPrompt(baseContext());
    expect(prompt).toContain('{ "exercises": [ ... ] }');
  });

  // The inline [PLOT: equation] tag mechanism (src/lib/renderContent.ts,
  // ExerciseCard.tsx's "Insert chart" action) lives inside "statement" — a
  // field Version B IS allowed to rewrite — so the model needs explicit
  // guidance to keep the tag's format intact while updating its equation.
  it("instructs the model to preserve the [PLOT: ...] tag format while updating its equation to match new numbers", () => {
    const prompt = buildVariantExamSystemPrompt(baseContext());
    expect(prompt).toMatch(/\[PLOT: equation\]/);
    expect(prompt).toMatch(/keep the exact `\[PLOT: \.\.\.\]` bracket syntax/);
    expect(prompt).toMatch(/Never delete the tag/);
  });
});

describe("buildVariantExamUserPrompt", () => {
  it("embeds the exact exercise count and total points", () => {
    const prompt = buildVariantExamUserPrompt({ context: baseContext(), exercises });
    expect(prompt).toContain("Exercise count : 2");
    expect(prompt).toContain("Total points   : 20");
    expect(prompt).toContain("Return exactly 2 variant exercise object(s)");
  });

  it("embeds the full source exam as JSON for the model to transform", () => {
    const prompt = buildVariantExamUserPrompt({ context: baseContext(), exercises });
    expect(prompt).toContain("A ball of mass 2 kg is dropped from a height of 10 m.");
    expect(prompt).toContain('"isCorrect": true');
  });

  it("is deterministic for the same input", () => {
    const a = buildVariantExamUserPrompt({ context: baseContext(), exercises });
    const b = buildVariantExamUserPrompt({ context: baseContext(), exercises });
    expect(a).toBe(b);
  });
});
