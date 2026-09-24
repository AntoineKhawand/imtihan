import { describe, it, expect } from "vitest";
import {
  buildAnalyzeSystemPrompt,
  buildAnalyzeUserPrompt,
} from "@/lib/prompts/analyze";
import {
  buildRubricSystemPrompt,
  buildRubricUserPrompt,
} from "@/lib/prompts/rubric";
import {
  buildTranslateExamSystemPrompt,
  buildTranslateExamUserPrompt,
  type TranslateExamInput,
} from "@/lib/prompts/translateExam";
import {
  FRAGMENT_INSTRUCTION_PRESETS,
  buildRegenerateFragmentSystemPrompt,
  buildRegenerateFragmentUserPrompt,
} from "@/lib/prompts/regenerateFragment";
import type { ExamContext, Exercise } from "@/types/exam";

// ---------------------------------------------------------------------------
// Shared fixtures
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
    exerciseCount: 4,
    totalPoints: 20,
    difficultyMix: { easy: 0.2, medium: 0.45, hard: 0.35 },
    ...overrides,
  };
}

function baseExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex-1",
    number: 1,
    type: "calculation",
    difficulty: "medium",
    points: 4,
    statement: "Résoudre l'équation $z^2 + 1 = 0$.",
    chapterIds: ["ter-math-complex"],
    estimatedMinutes: 10,
    solution: {
      finalAnswer: "$z = \\pm i$",
      methodology: "Étape 1 : factoriser...",
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// src/lib/prompts/analyze.ts
// ---------------------------------------------------------------------------

describe("buildAnalyzeSystemPrompt", () => {
  it("is a deterministic string containing the required JSON schema keys", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toBe(buildAnalyzeSystemPrompt());
    expect(prompt).toContain('"curriculumId"');
    expect(prompt).toContain('"difficultyMix"');
    expect(prompt).toContain("must sum to exactly 1.0");
  });

  it("documents the default difficulty mix and the anti-hallucination chapterIds rule", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt).toContain("{ easy: 0.20, medium: 0.45, hard: 0.35 }");
    expect(prompt).toContain("an id that doesn't appear verbatim in <curriculum_reference> is worse than an empty array");
  });
});

describe("buildAnalyzeUserPrompt", () => {
  it("wraps the teacher description and curriculum reference in their XML tags", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "Exam on complex numbers for Terminale S",
      hasUploadedDocument: false,
      availableCurricula: "CURRICULUM: bac-libanais",
    });
    expect(prompt).toContain("<teacher_description>\nExam on complex numbers for Terminale S\n</teacher_description>");
    expect(prompt).toContain("<curriculum_reference>\nCURRICULUM: bac-libanais\n</curriculum_reference>");
  });

  it("omits the uploaded_document tag and its mention when no document was uploaded", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "desc",
      hasUploadedDocument: false,
      availableCurricula: "ref",
    });
    expect(prompt).not.toContain("<uploaded_document>");
    expect(prompt).toContain("Based on the teacher's description, extract the exam specification as JSON.");
  });

  it("includes the uploaded_document tag and its mention when a document was uploaded", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "desc",
      hasUploadedDocument: true,
      availableCurricula: "ref",
    });
    expect(prompt).toContain("<uploaded_document>A document has been uploaded.");
    expect(prompt).toContain("Based on the teacher's description and the uploaded document, extract the exam specification as JSON.");
  });
});

// NOTE: buildCurriculaReference() is intentionally not exercised here.
// It loads curriculum data via a runtime `require("@/data/curricula")`
// (see the "Import here to avoid circular deps" comment in analyze.ts) —
// that path-aliased `require()` resolves fine under Next.js's webpack/
// Turbopack bundler but throws "Cannot find module '@/data/curricula'"
// under vitest's vite-node runtime, which does not rewrite runtime
// `require()` calls the same way it rewrites `import`. This is a real
// portability gap worth knowing about (flagged in the routine summary),
// but rewriting it to a static import risks reintroducing the circular
// dependency the comment says the runtime require was added to avoid —
// out of scope to change here per this routine's "never modify
// application code to make a test pass" rule.

// ---------------------------------------------------------------------------
// src/lib/prompts/rubric.ts
// ---------------------------------------------------------------------------

describe("buildRubricSystemPrompt", () => {
  it("uses French instructions for language 'french'", () => {
    const prompt = buildRubricSystemPrompt("french");
    expect(prompt).toContain("Rédige la grille entièrement en français.");
  });

  it("uses English instructions for language 'english'", () => {
    const prompt = buildRubricSystemPrompt("english");
    expect(prompt).toContain("Write the grading rubric entirely in English.");
  });

  it("uses Arabic (MSA) instructions for language 'arabic'", () => {
    const prompt = buildRubricSystemPrompt("arabic");
    expect(prompt).toContain("Modern Standard Arabic (MSA)");
  });

  it("falls back to English instructions for an unrecognized language string", () => {
    const prompt = buildRubricSystemPrompt("klingon");
    expect(prompt).toContain("Write the grading rubric entirely in English.");
  });

  it("requires the sum of criteria points to equal totalPoints exactly", () => {
    const prompt = buildRubricSystemPrompt("english");
    expect(prompt).toContain("Sum of criteria points MUST equal totalPoints exactly.");
  });
});

describe("buildRubricUserPrompt", () => {
  it("includes the exercise's total points, statement, final answer, and methodology", () => {
    const exercise = baseExercise({ points: 6 });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).toContain("total 6 points");
    expect(prompt).toContain("Résoudre l'équation $z^2 + 1 = 0$.");
    expect(prompt).toContain("$z = \\pm i$");
    expect(prompt).toContain("Étape 1 : factoriser...");
  });

  it("omits the sub-questions block entirely when subQuestions is undefined", () => {
    const exercise = baseExercise({ subQuestions: undefined });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).not.toContain("Sub-questions:");
  });

  it("omits the sub-questions block when subQuestions is an empty array", () => {
    const exercise = baseExercise({ subQuestions: [] });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).not.toContain("Sub-questions:");
  });

  it("lists every sub-question with its label and points when present", () => {
    const exercise = baseExercise({
      subQuestions: [
        { label: "a)", statement: "Calculer le discriminant.", points: 2 },
        { label: "b)", statement: "En déduire les racines.", points: 4 },
      ],
    });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).toContain("Sub-questions:");
    expect(prompt).toContain("a) (2 pts) — Calculer le discriminant.");
    expect(prompt).toContain("b) (4 pts) — En déduire les racines.");
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/translateExam.ts
// ---------------------------------------------------------------------------

describe("buildTranslateExamSystemPrompt", () => {
  it("uses the correct step/exercise/data words per target language", () => {
    const french = buildTranslateExamSystemPrompt("french");
    expect(french).toContain('"Étape"');
    expect(french).toContain('"Exercice"');
    expect(french).toContain('"Données :" / "Données:"');

    const english = buildTranslateExamSystemPrompt("english");
    expect(english).toContain('"Step"');
    expect(english).toContain('"Exercise"');
    expect(english).toContain('"Data :" / "Data:"');

    const arabic = buildTranslateExamSystemPrompt("arabic");
    expect(arabic).toContain("الخطوة");
    expect(arabic).toContain("تمرين");
  });

  it("forbids altering any number, id, difficulty, or MCQ correctness during translation", () => {
    const prompt = buildTranslateExamSystemPrompt("english");
    expect(prompt).toContain('"id" — never regenerate, never reformat.');
    expect(prompt).toContain("NEVER move the correct answer to a different letter.");
    expect(prompt).toContain("A translation that changes a single digit is a critical bug.");
  });

  it("never mentions curriculum/chapter grounding — translation-only scope", () => {
    const prompt = buildTranslateExamSystemPrompt("french");
    expect(prompt).not.toContain("<selected_chapters>");
    expect(prompt).not.toContain("chapter objectives");
  });
});

describe("buildTranslateExamUserPrompt", () => {
  const exercises: Exercise[] = [baseExercise({ id: "ex-1" }), baseExercise({ id: "ex-2", number: 2 })];

  it("embeds the source/target languages, exercise count, and full exercise JSON", () => {
    const input: TranslateExamInput = { context: baseContext({ language: "french" }), exercises };
    const prompt = buildTranslateExamUserPrompt(input, "english");
    expect(prompt).toContain('Translate the exam below from "french" into "english".');
    expect(prompt).toContain("Exercise count   : 2");
    expect(prompt).toContain('"id": "ex-1"');
    expect(prompt).toContain('"id": "ex-2"');
    expect(prompt).toContain("Return exactly 2 translated exercise object(s)");
  });

  it("serializes header as null when no header is provided", () => {
    const input: TranslateExamInput = { context: baseContext(), exercises: [] };
    const prompt = buildTranslateExamUserPrompt(input, "arabic");
    expect(prompt).toContain('"header": null');
  });

  it("serializes a provided header's fields verbatim", () => {
    const input: TranslateExamInput = {
      context: baseContext(),
      header: { schoolName: "Collège Notre-Dame", teacherName: "M. Khawand" },
      exercises: [],
    };
    const prompt = buildTranslateExamUserPrompt(input, "english");
    expect(prompt).toContain('"schoolName": "Collège Notre-Dame"');
    expect(prompt).toContain('"teacherName": "M. Khawand"');
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/regenerateFragment.ts
// ---------------------------------------------------------------------------

describe("FRAGMENT_INSTRUCTION_PRESETS", () => {
  it("defines exactly the four expected presets with non-empty instructions", () => {
    expect(Object.keys(FRAGMENT_INSTRUCTION_PRESETS).sort()).toEqual(
      ["change-numbers", "harder", "rephrase", "simplify"].sort(),
    );
    for (const value of Object.values(FRAGMENT_INSTRUCTION_PRESETS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

describe("buildRegenerateFragmentSystemPrompt", () => {
  it("interpolates the exam's curriculum and language into the instructions", () => {
    const prompt = buildRegenerateFragmentSystemPrompt(baseContext({ curriculumId: "ib", language: "english" }));
    expect(prompt).toContain("expert ib exam editor");
    expect(prompt).toContain("Every word must be in english.");
  });

  it("instructs the model to preserve existing LaTeX/mhchem notation", () => {
    const prompt = buildRegenerateFragmentSystemPrompt(baseContext());
    expect(prompt).toContain("\\ce{...}");
    expect(prompt).toContain("don't introduce a different notation");
  });
});

describe("buildRegenerateFragmentUserPrompt", () => {
  it("wraps the full context and selection in their tags and includes the instruction verbatim", () => {
    const prompt = buildRegenerateFragmentUserPrompt(
      "Full exercise text with a selected fragment inside.",
      "selected fragment",
      FRAGMENT_INSTRUCTION_PRESETS.simplify,
    );
    expect(prompt).toContain("<exercise_context>\nFull exercise text with a selected fragment inside.\n</exercise_context>");
    expect(prompt).toContain("<selection>\nselected fragment\n</selection>");
    expect(prompt).toContain(`Instruction: ${FRAGMENT_INSTRUCTION_PRESETS.simplify}`);
  });

  it("keeps the selection distinct from surrounding context even when the fragment text recurs elsewhere", () => {
    const prompt = buildRegenerateFragmentUserPrompt(
      "The value 42 appears twice: once here and once later as 42 again.",
      "42",
      "Change the numbers.",
    );
    expect(prompt).toContain("<selection>\n42\n</selection>");
  });
});
