import { describe, it, expect } from "vitest";
import {
  buildAnalyzeSystemPrompt,
  buildAnalyzeUserPrompt,
  buildCurriculaReference,
} from "@/lib/prompts/analyze";
import {
  FRAGMENT_INSTRUCTION_PRESETS,
  buildRegenerateFragmentSystemPrompt,
  buildRegenerateFragmentUserPrompt,
} from "@/lib/prompts/regenerateFragment";
import { buildRubricSystemPrompt, buildRubricUserPrompt } from "@/lib/prompts/rubric";
import {
  buildTranslateExamSystemPrompt,
  buildTranslateExamUserPrompt,
  type TranslateExamInput,
} from "@/lib/prompts/translateExam";
import { CURRICULA, getAllChapterIds } from "@/data/curricula";
import type { CurriculumId, Subject } from "@/types/curriculum";
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
    type: "problem_solving",
    difficulty: "medium",
    points: 5,
    statement: "Solve for x.",
    chapterIds: ["ter-math-complex"],
    estimatedMinutes: 15,
    solution: {
      finalAnswer: "x = 3",
      methodology: "Isolate x on one side.",
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// src/lib/prompts/analyze.ts
// ---------------------------------------------------------------------------

describe("buildAnalyzeSystemPrompt", () => {
  it("returns a non-empty JSON-only instruction naming every ExamContext field", () => {
    const prompt = buildAnalyzeSystemPrompt();
    expect(prompt.length).toBeGreaterThan(100);
    for (const field of [
      "curriculumId",
      "levelId",
      "subject",
      "chapterIds",
      "language",
      "examType",
      "duration",
      "exerciseCount",
      "totalPoints",
      "difficultyMix",
      "confidence",
    ]) {
      expect(prompt).toContain(`"${field}"`);
    }
    expect(prompt).toContain("bac-libanais");
    expect(prompt).toContain("ONLY a valid JSON object");
  });
});

describe("buildAnalyzeUserPrompt", () => {
  it("embeds the teacher description and curriculum reference verbatim", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "Terminale S exam on complex numbers, 2 exercises.",
      hasUploadedDocument: false,
      availableCurricula: "CURRICULUM: bac-libanais (Bac Libanais)",
    });
    expect(prompt).toContain("Terminale S exam on complex numbers, 2 exercises.");
    expect(prompt).toContain("<curriculum_reference>");
    expect(prompt).toContain("CURRICULUM: bac-libanais (Bac Libanais)");
    expect(prompt).toContain("<teacher_description>");
  });

  it("adds the uploaded_document hint only when hasUploadedDocument is true", () => {
    const withDoc = buildAnalyzeUserPrompt({
      teacherDescription: "desc",
      hasUploadedDocument: true,
      availableCurricula: "ref",
    });
    const withoutDoc = buildAnalyzeUserPrompt({
      teacherDescription: "desc",
      hasUploadedDocument: false,
      availableCurricula: "ref",
    });

    expect(withDoc).toContain("<uploaded_document>");
    expect(withDoc).toContain("and the uploaded document");
    expect(withoutDoc).not.toContain("<uploaded_document>");
    expect(withoutDoc).not.toContain("and the uploaded document");
  });

  it("handles an empty teacher description without throwing or losing structure", () => {
    const prompt = buildAnalyzeUserPrompt({
      teacherDescription: "",
      hasUploadedDocument: false,
      availableCurricula: "",
    });
    expect(prompt).toContain("<teacher_description>");
    expect(prompt).toContain("</teacher_description>");
  });
});

// NOTE on buildCurriculaReference(): the exported function itself resolves
// its curricula data via a runtime `require("@/data/curricula")` (see
// src/lib/prompts/analyze.ts) instead of a static top-level import. That
// only resolves under a bundler that rewrites the "@/..." alias for
// `require` calls too (Next.js/webpack does, which is why it works in
// production). Under Vitest — and under plain Node/ts-node/Jest-without-
// moduleNameMapper — the alias is resolved by Node's real CJS loader, which
// has no idea what "@/data/curricula" means and throws
// `Cannot find module '@/data/curricula'` (confirmed while writing this
// suite; reproduces even through `vi.mock`, since the dynamic `require`
// bypasses Vitest's own module graph entirely). This is a genuine fragility
// in the function, not a test-authoring gap — documented in BUGS.md rather
// than "fixed" here, since swapping it for a static import is an
// application-code change and this routine's job is tests, not code
// changes. `describe.skip` below records that the real exported function
// can't be called in this environment; the test after it exercises an
// inlined copy of the exact same iteration logic (same pattern
// src/__tests__/qcm.test.ts already uses for generate/route.ts's pure
// helpers) against the real curricula data, so the algorithm itself is
// still verified against every real curriculum/level/subject/chapter.
describe.skip("buildCurriculaReference — see BUGS.md, not callable outside a webpack/Next.js bundle", () => {
  it("would list every curriculum id and every real chapter id, if callable here", () => {
    const reference = buildCurriculaReference();
    expect(reference).toBeTruthy();
  });
});

function buildCurriculaReferenceLogic(curricula: typeof CURRICULA): string {
  const lines: string[] = [];
  for (const [currId, curriculum] of Object.entries(curricula) as [CurriculumId, (typeof CURRICULA)[CurriculumId]][]) {
    lines.push(`\nCURRICULUM: ${currId} (${curriculum.name.en})`);
    for (const level of curriculum.levels) {
      lines.push(`  LEVEL: ${level.id} — ${level.name.en}`);
      for (const [subject, chapters] of Object.entries(level.chapters) as [Subject, (typeof level.chapters)[Subject]][]) {
        if (!chapters || chapters.length === 0) continue;
        lines.push(`    SUBJECT: ${subject}`);
        for (const ch of chapters) {
          lines.push(`      CHAPTER_ID: ${ch.id} — ${ch.name.en ?? ch.name.fr}`);
        }
      }
    }
  }
  return lines.join("\n");
}

describe("buildCurriculaReferenceLogic (inlined copy of buildCurriculaReference's algorithm)", () => {
  it("lists every curriculum id and, for every level/subject that has chapters, every real chapter id", () => {
    const reference = buildCurriculaReferenceLogic(CURRICULA);

    for (const curriculumId of Object.keys(CURRICULA) as CurriculumId[]) {
      const curriculum = CURRICULA[curriculumId];
      expect(reference).toContain(`CURRICULUM: ${curriculumId} (${curriculum.name.en})`);

      for (const level of curriculum.levels) {
        expect(reference).toContain(`LEVEL: ${level.id}`);

        for (const subject of Object.keys(level.chapters) as Subject[]) {
          const chapterIds = getAllChapterIds(curriculumId, level.id, subject);
          if (chapterIds.length === 0) continue;

          expect(reference).toContain(`SUBJECT: ${subject}`);
          for (const chapterId of chapterIds) {
            expect(reference).toContain(`CHAPTER_ID: ${chapterId}`);
          }
        }
      }
    }
  });

  it("emits a LEVEL line with no SUBJECT lines for a curriculum whose level defines no chapters (university, by design)", () => {
    const reference = buildCurriculaReferenceLogic(CURRICULA);
    const university = CURRICULA.university;
    const firstLevel = university.levels[0];

    expect(Object.keys(firstLevel.chapters).length).toBe(0);

    const levelLineIndex = reference.indexOf(`LEVEL: ${firstLevel.id}`);
    expect(levelLineIndex).toBeGreaterThan(-1);

    const nextLevelLineIndex = reference.indexOf("\n  LEVEL: ", levelLineIndex + 1);
    const sectionEnd = nextLevelLineIndex === -1 ? reference.length : nextLevelLineIndex;
    const section = reference.slice(levelLineIndex, sectionEnd);
    expect(section).not.toContain("SUBJECT:");
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/regenerateFragment.ts
// ---------------------------------------------------------------------------

describe("FRAGMENT_INSTRUCTION_PRESETS", () => {
  it("defines exactly the 4 presets the fragment-editor UI offers, all non-empty", () => {
    expect(Object.keys(FRAGMENT_INSTRUCTION_PRESETS).sort()).toEqual(
      ["change-numbers", "harder", "rephrase", "simplify"].sort()
    );
    for (const instruction of Object.values(FRAGMENT_INSTRUCTION_PRESETS)) {
      expect(instruction.length).toBeGreaterThan(0);
    }
  });
});

describe("buildRegenerateFragmentSystemPrompt", () => {
  it("names the curriculum and mandates the exact exercise language", () => {
    const prompt = buildRegenerateFragmentSystemPrompt(
      baseContext({ curriculumId: "ib", language: "english" })
    );
    expect(prompt).toContain("ib exam editor");
    expect(prompt).toContain("Every word must be in english");
  });

  it("adapts to a different context (arabic, bac-francais) without leaking the previous call's values", () => {
    const first = buildRegenerateFragmentSystemPrompt(baseContext({ curriculumId: "bac-libanais", language: "french" }));
    const second = buildRegenerateFragmentSystemPrompt(baseContext({ curriculumId: "bac-francais", language: "arabic" }));

    expect(first).toContain("bac-libanais exam editor");
    expect(first).toContain("Every word must be in french");
    expect(second).toContain("bac-francais exam editor");
    expect(second).toContain("Every word must be in arabic");
    expect(second).not.toContain("bac-libanais");
  });
});

describe("buildRegenerateFragmentUserPrompt", () => {
  it("places the full context, the selected fragment, and the instruction in their own tagged sections", () => {
    const prompt = buildRegenerateFragmentUserPrompt(
      "Compute $\\int_0^1 x^2 dx$ and simplify the result.",
      "$\\int_0^1 x^2 dx$",
      FRAGMENT_INSTRUCTION_PRESETS.simplify
    );

    expect(prompt).toContain("<exercise_context>");
    expect(prompt).toContain("Compute $\\int_0^1 x^2 dx$ and simplify the result.");
    expect(prompt).toContain("<selection>");
    expect(prompt).toContain("$\\int_0^1 x^2 dx$");
    expect(prompt).toContain(FRAGMENT_INSTRUCTION_PRESETS.simplify);
  });

  it("handles a selection that repeats elsewhere in the surrounding text and an empty instruction", () => {
    const fullText = "The value 5 appears here: 5 is the answer.";
    const selection = "5";
    const prompt = buildRegenerateFragmentUserPrompt(fullText, selection, "");

    expect(prompt).toContain(fullText);
    expect(prompt).toContain("<selection>\n5\n</selection>");
    expect(prompt).toContain("Instruction: ");
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/rubric.ts
// ---------------------------------------------------------------------------

describe("buildRubricSystemPrompt", () => {
  it("picks the matching language instruction for french and arabic", () => {
    expect(buildRubricSystemPrompt("french")).toContain("Rédige la grille entièrement en français");
    expect(buildRubricSystemPrompt("arabic")).toContain("Modern Standard Arabic");
  });

  it("falls back to the English instruction for an unsupported/unknown language code", () => {
    const prompt = buildRubricSystemPrompt("spanish");
    expect(prompt).toContain("Write the grading rubric entirely in English.");
  });

  it("always requires the criteria points to sum exactly to totalPoints", () => {
    const prompt = buildRubricSystemPrompt("english");
    expect(prompt).toContain("Sums to EXACTLY the exercise's total points");
    expect(prompt).toContain("Sum of criteria points MUST equal totalPoints exactly.");
  });
});

describe("buildRubricUserPrompt", () => {
  it("includes a rendered Sub-questions block when the exercise has sub-questions", () => {
    const exercise = baseExercise({
      points: 8,
      subQuestions: [
        { label: "a)", statement: "Find the derivative.", points: 3 },
        { label: "b)", statement: "Evaluate at x=0.", points: 5 },
      ],
    });

    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).toContain("total 8 points");
    expect(prompt).toContain("Sub-questions:");
    expect(prompt).toContain("a) (3 pts) — Find the derivative.");
    expect(prompt).toContain("b) (5 pts) — Evaluate at x=0.");
  });

  it("omits the Sub-questions block entirely when there are none (undefined or empty array)", () => {
    const noSubQuestions = buildRubricUserPrompt(baseExercise({ subQuestions: undefined }));
    const emptySubQuestions = buildRubricUserPrompt(baseExercise({ subQuestions: [] }));

    expect(noSubQuestions).not.toContain("Sub-questions:");
    expect(emptySubQuestions).not.toContain("Sub-questions:");
  });

  it("embeds the statement, final answer, and methodology verbatim", () => {
    const exercise = baseExercise({
      statement: "Prove that $f$ is continuous.",
      solution: { finalAnswer: "$f$ is continuous on $\\mathbb{R}$.", methodology: "Use the epsilon-delta definition." },
    });
    const prompt = buildRubricUserPrompt(exercise);
    expect(prompt).toContain("Prove that $f$ is continuous.");
    expect(prompt).toContain("$f$ is continuous on $\\mathbb{R}$.");
    expect(prompt).toContain("Use the epsilon-delta definition.");
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/translateExam.ts
// ---------------------------------------------------------------------------

describe("buildTranslateExamSystemPrompt", () => {
  it("substitutes the target language's own step/exercise/data vocabulary for arabic", () => {
    const prompt = buildTranslateExamSystemPrompt("arabic");
    expect(prompt).toContain('"الخطوة"');
    expect(prompt).toContain('"تمرين"');
    expect(prompt).toContain("المعطيات");
    expect(prompt).toContain("translate it into arabic");
  });

  it("substitutes the target language's own vocabulary for french and english", () => {
    const french = buildTranslateExamSystemPrompt("french");
    expect(french).toContain('"Étape"');
    expect(french).toContain('"Exercice"');
    expect(french).toContain("Données");

    const english = buildTranslateExamSystemPrompt("english");
    expect(english).toContain('"Step"');
    expect(english).toContain('"Exercise"');
    expect(english).toContain("Data");
  });

  it("never asks the translator to change points, ids, or math content", () => {
    const prompt = buildTranslateExamSystemPrompt("french");
    expect(prompt).toContain('"points" — every points value');
    expect(prompt).toContain("NEVER change a number");
    expect(prompt).toContain("copied through EXACTLY as-is, character for character");
  });
});

describe("buildTranslateExamUserPrompt", () => {
  const exercises = [
    baseExercise({ id: "ex-1", number: 1 }),
    baseExercise({ id: "ex-2", number: 2, points: 7 }),
  ];

  function buildInput(overrides: Partial<TranslateExamInput> = {}): TranslateExamInput {
    return {
      context: baseContext({ language: "french" }),
      exercises,
      ...overrides,
    };
  }

  it("round-trips the exact exercises array through the embedded source JSON", () => {
    const prompt = buildTranslateExamUserPrompt(buildInput(), "english");

    const match = prompt.match(/<source_exam_json>\n([\s\S]*?)\n<\/source_exam_json>/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![1]);

    expect(parsed.exercises).toEqual(exercises);
    expect(parsed.header).toBeNull();
  });

  it("defaults header to null when omitted, and preserves it verbatim when present", () => {
    const withoutHeader = buildTranslateExamUserPrompt(buildInput({ header: undefined }), "english");
    expect(withoutHeader).toContain('"header": null');

    const header = { schoolName: "Lycée Descartes", teacherName: "Mme Dupont" };
    const withHeader = buildTranslateExamUserPrompt(buildInput({ header }), "english");
    const match = withHeader.match(/<source_exam_json>\n([\s\S]*?)\n<\/source_exam_json>/);
    const parsed = JSON.parse(match![1]);
    expect(parsed.header).toEqual(header);
  });

  it("states the exact exercise count consistently and names source/target languages", () => {
    const prompt = buildTranslateExamUserPrompt(buildInput(), "arabic");
    expect(prompt).toContain('from "french" into "arabic"');
    expect(prompt).toContain("Exercise count   : 2");
    expect(prompt).toContain("Return exactly 2 translated exercise object(s)");
  });

  it("handles an exam with zero exercises without breaking the count or the JSON shape", () => {
    const prompt = buildTranslateExamUserPrompt(buildInput({ exercises: [] }), "english");
    expect(prompt).toContain("Exercise count   : 0");
    expect(prompt).toContain("Return exactly 0 translated exercise object(s)");

    const match = prompt.match(/<source_exam_json>\n([\s\S]*?)\n<\/source_exam_json>/);
    const parsed = JSON.parse(match![1]);
    expect(parsed.exercises).toEqual([]);
  });
});
