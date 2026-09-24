import { describe, it, expect } from "vitest";
import { buildRubricSystemPrompt, buildRubricUserPrompt } from "@/lib/prompts/rubric";
import {
  FRAGMENT_INSTRUCTION_PRESETS,
  buildRegenerateFragmentSystemPrompt,
  buildRegenerateFragmentUserPrompt,
} from "@/lib/prompts/regenerateFragment";
import type { Exercise } from "@/types/exam";
import type { ExamContext } from "@/types/exam";

// ---------------------------------------------------------------------------
// buildRubricSystemPrompt
// ---------------------------------------------------------------------------

describe("buildRubricSystemPrompt", () => {
  it("uses the French grading-terminology instruction for language 'french'", () => {
    const prompt = buildRubricSystemPrompt("french");
    expect(prompt).toContain("Rédige la grille entièrement en français.");
  });

  it("uses the Arabic instruction for language 'arabic'", () => {
    const prompt = buildRubricSystemPrompt("arabic");
    expect(prompt).toContain("Modern Standard Arabic (MSA)");
  });

  it("uses the English instruction for language 'english'", () => {
    const prompt = buildRubricSystemPrompt("english");
    expect(prompt).toContain("Write the grading rubric entirely in English.");
  });

  it("falls back to English for an unrecognized language instead of crashing", () => {
    const prompt = buildRubricSystemPrompt("klingon");
    expect(prompt).toContain("Write the grading rubric entirely in English.");
  });

  it("requires criteria points to sum exactly to totalPoints", () => {
    const prompt = buildRubricSystemPrompt("english");
    expect(prompt).toMatch(/Sum of criteria points MUST equal totalPoints exactly\./);
  });

  it("requests double-escaped LaTeX backslashes for JSON safety", () => {
    const prompt = buildRubricSystemPrompt("english");
    expect(prompt).toContain("\\\\frac");
    expect(prompt).toContain("\\\\sqrt");
  });
});

// ---------------------------------------------------------------------------
// buildRubricUserPrompt
// ---------------------------------------------------------------------------

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex1",
    number: 1,
    type: "calculation",
    difficulty: "medium",
    points: 4,
    statement: "Résoudre l'équation $x^2 - 5x + 6 = 0$.",
    chapterIds: [],
    estimatedMinutes: 5,
    solution: {
      finalAnswer: "$x = 2$ ou $x = 3$",
      methodology: "Factoriser le polynôme.",
    },
    ...overrides,
  } as Exercise;
}

describe("buildRubricUserPrompt", () => {
  it("includes the exercise's total points, statement, final answer, and methodology", () => {
    const exercise = makeExercise();
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).toContain("total 4 points");
    expect(prompt).toContain("Résoudre l'équation $x^2 - 5x + 6 = 0$.");
    expect(prompt).toContain("$x = 2$ ou $x = 3$");
    expect(prompt).toContain("Factoriser le polynôme.");
  });

  it("omits the sub-questions block entirely when there are none", () => {
    const exercise = makeExercise({ subQuestions: undefined });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).not.toContain("Sub-questions:");
  });

  it("omits the sub-questions block when subQuestions is an empty array", () => {
    const exercise = makeExercise({ subQuestions: [] });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).not.toContain("Sub-questions:");
  });

  it("lists each sub-question with its label and points when present", () => {
    const exercise = makeExercise({
      subQuestions: [
        { label: "a)", statement: "Calculer le discriminant.", points: 1 },
        { label: "b)", statement: "En déduire les racines.", points: 3 },
      ],
    });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).toContain("Sub-questions:");
    expect(prompt).toContain("a) (1 pts) — Calculer le discriminant.");
    expect(prompt).toContain("b) (3 pts) — En déduire les racines.");
  });
});

// ---------------------------------------------------------------------------
// FRAGMENT_INSTRUCTION_PRESETS
// ---------------------------------------------------------------------------

describe("FRAGMENT_INSTRUCTION_PRESETS", () => {
  it("defines all four documented presets with non-empty instructions", () => {
    for (const key of ["rephrase", "simplify", "harder", "change-numbers"]) {
      expect(FRAGMENT_INSTRUCTION_PRESETS[key]).toBeTruthy();
      expect(typeof FRAGMENT_INSTRUCTION_PRESETS[key]).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// buildRegenerateFragmentSystemPrompt
// ---------------------------------------------------------------------------

function makeContext(overrides: Partial<ExamContext> = {}): ExamContext {
  return {
    curriculumId: "bac-francais",
    levelId: "terminale",
    subject: "physics",
    chapterIds: [],
    language: "french",
    examType: "final",
    duration: 120,
    exerciseCount: 4,
    totalPoints: 20,
    difficultyMix: { easy: 0.2, medium: 0.45, hard: 0.35 },
    ...overrides,
  } as ExamContext;
}

describe("buildRegenerateFragmentSystemPrompt", () => {
  it("interpolates the curriculum id and language into the rules", () => {
    const context = makeContext({ curriculumId: "ib", language: "english" });
    const prompt = buildRegenerateFragmentSystemPrompt(context);
    expect(prompt).toContain("expert ib exam editor");
    expect(prompt).toContain("Every word must be in english.");
  });

  it("only asks for the replacement fragment, never a full new exercise", () => {
    const context = makeContext();
    const prompt = buildRegenerateFragmentSystemPrompt(context);
    expect(prompt).toMatch(/not writing a new exercise/);
    expect(prompt).toMatch(/Reply with ONLY the replacement text/);
  });
});

// ---------------------------------------------------------------------------
// buildRegenerateFragmentUserPrompt
// ---------------------------------------------------------------------------

describe("buildRegenerateFragmentUserPrompt", () => {
  it("wraps the full context and the selected fragment in their own tags", () => {
    const prompt = buildRegenerateFragmentUserPrompt(
      "Calculer la vitesse initiale $v_0$ du projectile.",
      "$v_0$",
      FRAGMENT_INSTRUCTION_PRESETS.harder
    );
    expect(prompt).toContain("<exercise_context>\nCalculer la vitesse initiale $v_0$ du projectile.\n</exercise_context>");
    expect(prompt).toContain("<selection>\n$v_0$\n</selection>");
    expect(prompt).toContain(`Instruction: ${FRAGMENT_INSTRUCTION_PRESETS.harder}`);
  });

  it("passes a free-form custom instruction through unchanged (not just presets)", () => {
    const prompt = buildRegenerateFragmentUserPrompt("full text", "sel", "Use metric units only.");
    expect(prompt).toContain("Instruction: Use metric units only.");
  });
});
