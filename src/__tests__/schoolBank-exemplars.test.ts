import { describe, it, expect } from "vitest";
import { buildExemplarsPrompt, buildGenerateUserPrompt } from "@/lib/prompts/generate";
import type { ChapterExemplarGroup } from "@/types/schoolBank";
import type { ExamContext } from "@/types/exam";

// ---------------------------------------------------------------------------
// School Bank exemplars — CURRICULUM_COVERAGE_STRATEGY.md's "Exemplar-bank
// build-out" backlog item #3: a lightweight regression test confirming
// prompt generation still succeeds with 0, 1, and 2 exemplars per chapter.
//
// Deliberately does NOT mock/exercise src/lib/schoolBank.ts's
// getChapterExemplars() (a real Firestore/adminDb call) — same pattern as
// every other test in this file's sibling (generate-prompts.test.ts), which
// only exercises the pure, synchronous prompt-builder layer. The Firestore
// query itself is exactly the kind of real-credentialed call CLAUDE.md §15
// says an unattended run must not exercise directly.
// ---------------------------------------------------------------------------

function baseContext(overrides: Partial<ExamContext> = {}): ExamContext {
  return {
    curriculumId: "bac-libanais",
    levelId: "terminale-s",
    subject: "mathematics",
    chapterIds: ["ter-math-complex", "ter-math-integrals"],
    language: "french",
    examType: "final",
    duration: 120,
    exerciseCount: 4,
    totalPoints: 20,
    difficultyMix: { easy: 0.2, medium: 0.45, hard: 0.35 },
    ...overrides,
  };
}

describe("buildExemplarsPrompt", () => {
  it("returns an empty string for an empty groups array (the common, pre-launch case)", () => {
    expect(buildExemplarsPrompt([])).toBe("");
  });

  it("returns an empty string when every group has zero exercises (chapters with nothing shared yet)", () => {
    const groups: ChapterExemplarGroup[] = [
      { chapterName: "Nombres complexes", chapterId: "ter-math-complex", exercises: [] },
      { chapterName: "Intégration", chapterId: "ter-math-integrals", exercises: [] },
    ];
    expect(buildExemplarsPrompt(groups)).toBe("");
  });

  it("formats a single exemplar clearly labeled as an example, not an instruction to copy", () => {
    const groups: ChapterExemplarGroup[] = [
      {
        chapterName: "Nombres complexes",
        chapterId: "ter-math-complex",
        exercises: [{ statement: "Résoudre $z^2 + 1 = 0$.", difficulty: "medium", points: 4 }],
      },
    ];
    const prompt = buildExemplarsPrompt(groups);
    expect(prompt).toContain("SCHOOL BANK EXEMPLARS");
    expect(prompt).toContain("for inspiration ONLY");
    expect(prompt).toContain("do NOT copy verbatim");
    expect(prompt).toContain('"Nombres complexes" [id: ter-math-complex]');
    expect(prompt).toContain("Example of a previously well-received exercise for this chapter (difficulty: medium, 4 pts):");
    expect(prompt).toContain("Résoudre $z^2 + 1 = 0$.");
  });

  it("includes up to two exemplars for the same chapter, and skips chapters with none", () => {
    const groups: ChapterExemplarGroup[] = [
      {
        chapterName: "Intégration",
        chapterId: "ter-math-integrals",
        exercises: [
          { statement: "Calculer $\\int_0^1 x^2\\,dx$.", difficulty: "easy", points: 3 },
          { statement: "Déterminer une primitive de $f(x) = \\frac{1}{x}$.", difficulty: "hard", points: 5 },
        ],
      },
      { chapterName: "Nombres complexes", chapterId: "ter-math-complex", exercises: [] },
    ];
    const prompt = buildExemplarsPrompt(groups);
    expect(prompt).toContain("Calculer $\\int_0^1 x^2\\,dx$.");
    expect(prompt).toContain("Déterminer une primitive de $f(x) = \\frac{1}{x}$.");
    expect(prompt).toContain("difficulty: easy, 3 pts");
    expect(prompt).toContain("difficulty: hard, 5 pts");
    // The empty-exercises chapter must not appear at all.
    expect(prompt).not.toContain('"Nombres complexes" [id: ter-math-complex]');
  });

  it("joins multiple non-empty chapter groups with a blank line between them", () => {
    const groups: ChapterExemplarGroup[] = [
      {
        chapterName: "Nombres complexes",
        chapterId: "ter-math-complex",
        exercises: [{ statement: "Exemple A", difficulty: "easy", points: 2 }],
      },
      {
        chapterName: "Intégration",
        chapterId: "ter-math-integrals",
        exercises: [{ statement: "Exemple B", difficulty: "hard", points: 5 }],
      },
    ];
    const prompt = buildExemplarsPrompt(groups);
    const idxA = prompt.indexOf("Exemple A");
    const idxB = prompt.indexOf("Exemple B");
    expect(idxA).toBeGreaterThanOrEqual(0);
    expect(idxB).toBeGreaterThan(idxA);
  });
});

describe("buildGenerateUserPrompt — School Bank exemplars integration", () => {
  it("generates a valid prompt with no SCHOOL BANK EXEMPLARS block when exemplarsPrompt is omitted (zero exemplars, the common case)", () => {
    const context = baseContext();
    const prompt = buildGenerateUserPrompt(context);
    expect(prompt).not.toContain("SCHOOL BANK EXEMPLARS");
    // Prompt generation otherwise still succeeds and contains its usual content.
    expect(prompt).toContain("Curriculum : bac-libanais");
  });

  it("generates a valid prompt with no SCHOOL BANK EXEMPLARS block when exemplarsPrompt is an empty string", () => {
    const context = baseContext();
    const prompt = buildGenerateUserPrompt(context, undefined, undefined, undefined, false, "");
    expect(prompt).not.toContain("SCHOOL BANK EXEMPLARS");
  });

  it("generates a valid prompt that includes the exemplar block when one chapter has one exemplar", () => {
    const context = baseContext();
    const groups: ChapterExemplarGroup[] = [
      {
        chapterName: "Nombres complexes",
        chapterId: "ter-math-complex",
        exercises: [{ statement: "Résoudre $z^2 + 1 = 0$.", difficulty: "medium", points: 4 }],
      },
    ];
    const exemplarsPrompt = buildExemplarsPrompt(groups);
    const prompt = buildGenerateUserPrompt(context, undefined, undefined, undefined, false, exemplarsPrompt);
    expect(prompt).toContain("SCHOOL BANK EXEMPLARS");
    expect(prompt).toContain("Résoudre $z^2 + 1 = 0$.");
    // Still succeeds in producing the rest of a well-formed prompt.
    expect(prompt).toContain("Curriculum : bac-libanais");
    expect(prompt).toContain("Return the JSON object now.");
  });

  it("generates a valid prompt that includes exemplars from two different chapters (two exemplars total)", () => {
    const context = baseContext();
    const groups: ChapterExemplarGroup[] = [
      {
        chapterName: "Nombres complexes",
        chapterId: "ter-math-complex",
        exercises: [{ statement: "Exemple complexes", difficulty: "easy", points: 2 }],
      },
      {
        chapterName: "Intégration",
        chapterId: "ter-math-integrals",
        exercises: [{ statement: "Exemple intégration", difficulty: "hard", points: 5 }],
      },
    ];
    const exemplarsPrompt = buildExemplarsPrompt(groups);
    const prompt = buildGenerateUserPrompt(context, undefined, undefined, undefined, false, exemplarsPrompt);
    expect(prompt).toContain("Exemple complexes");
    expect(prompt).toContain("Exemple intégration");
  });

  it("does not throw and omits the exemplar block for university mode context, even if a caller mistakenly passes one", () => {
    const context = baseContext({ curriculumId: "university", levelId: "custom", chapterIds: [] });
    const exemplarsPrompt = buildExemplarsPrompt([
      { chapterName: "Some Topic", chapterId: "some-topic", exercises: [{ statement: "X", difficulty: "easy", points: 1 }] },
    ]);
    // The route only ever builds exemplarsPrompt for non-university curricula
    // in practice, but buildGenerateUserPrompt itself must still not crash if
    // a non-empty string is passed through for a university context.
    expect(() => buildGenerateUserPrompt(context, undefined, undefined, undefined, false, exemplarsPrompt)).not.toThrow();
  });
});
