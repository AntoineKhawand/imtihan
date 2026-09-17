import { describe, it, expect } from "vitest";
import {
  buildGenerateSystemPrompt,
  buildGenerateUserPrompt,
  buildRegenerateExercisePrompt,
} from "@/lib/prompts/generate";
import {
  getCurriculum,
  getCurriculumLevel,
  getChapter,
  getAllChapterIds,
  buildChaptersSummary,
} from "@/data/curricula";
import type { ExamContext } from "@/types/exam";

// ---------------------------------------------------------------------------
// Fixtures — real bac-libanais Terminale-S data (audited 2026-09-09, see
// DAILY_LOG.md and docs/DATA_SOURCING.md), so these tests exercise the real
// curriculum lookups rather than a synthetic stand-in.
// ---------------------------------------------------------------------------

const TS_MATH_CHAPTERS = [
  "ter-math-complex",
  "ter-math-log-exp",
  "ter-math-integrals",
  "ter-math-diff-eq",
  "ter-math-space-geometry",
  "ter-math-probability",
];

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

// ---------------------------------------------------------------------------
// src/data/curricula/index.ts — curriculum/chapter resolution helpers
// ---------------------------------------------------------------------------

describe("getCurriculum / getCurriculumLevel", () => {
  it("returns the bac-libanais curriculum with its real id and languages", () => {
    const curriculum = getCurriculum("bac-libanais");
    expect(curriculum.id).toBe("bac-libanais");
    expect(curriculum.subjects).toContain("mathematics");
  });

  it("finds the terminale-s level by id", () => {
    const level = getCurriculumLevel("bac-libanais", "terminale-s");
    expect(level).not.toBeNull();
    expect(level?.name.fr).toBe("Terminale S");
  });

  it("returns null for a level id that does not exist", () => {
    expect(getCurriculumLevel("bac-libanais", "not-a-real-level")).toBeNull();
  });
});

describe("getChapter", () => {
  it("finds a real chapter by curriculum/level/subject/id", () => {
    const chapter = getChapter("bac-libanais", "terminale-s", "mathematics", "ter-math-diff-eq");
    expect(chapter).not.toBeNull();
    expect(chapter?.name.en).toBe("Differential equations");
    expect(chapter?.objectives.length).toBeGreaterThan(0);
  });

  it("returns null for a chapter id that doesn't exist in that subject", () => {
    expect(getChapter("bac-libanais", "terminale-s", "mathematics", "not-a-real-chapter")).toBeNull();
  });

  it("returns null when the level itself doesn't exist", () => {
    expect(getChapter("bac-libanais", "not-a-real-level", "mathematics", "ter-math-complex")).toBeNull();
  });

  it("returns null for a subject with no chapters defined at that level", () => {
    // terminale-s has no "nsi" chapters at all (Partial<Record<Subject, Chapter[]>>)
    expect(getChapter("bac-libanais", "terminale-s", "nsi", "anything")).toBeNull();
  });
});

describe("getAllChapterIds", () => {
  it("returns every math chapter id for terminale-s, matching the audited CRDP set", () => {
    const ids = getAllChapterIds("bac-libanais", "terminale-s", "mathematics");
    expect(ids.sort()).toEqual([...TS_MATH_CHAPTERS].sort());
  });

  it("returns an empty array for a nonexistent level", () => {
    expect(getAllChapterIds("bac-libanais", "not-a-real-level", "mathematics")).toEqual([]);
  });
});

describe("buildChaptersSummary", () => {
  it("reports 'No chapter information found.' when the level doesn't exist", () => {
    expect(buildChaptersSummary("bac-libanais", "not-a-real-level", "mathematics", ["x"]))
      .toBe("No chapter information found.");
  });

  it("reports 'No chapters selected.' for an empty chapterIds array", () => {
    expect(buildChaptersSummary("bac-libanais", "terminale-s", "mathematics", []))
      .toBe("No chapters selected.");
  });

  it("reports 'No chapters selected.' when none of the given ids match real chapters", () => {
    expect(buildChaptersSummary("bac-libanais", "terminale-s", "mathematics", ["hallucinated-chapter"]))
      .toBe("No chapters selected.");
  });

  it("renders selected chapters with French name headers and bulleted objectives", () => {
    const summary = buildChaptersSummary("bac-libanais", "terminale-s", "mathematics", ["ter-math-diff-eq"]);
    expect(summary).toContain("### Équations différentielles");
    expect(summary).toContain("  - Résoudre une équation différentielle à variables séparables");
  });

  it("follows the curriculum's own chapter order, not the order chapterIds were passed in", () => {
    // ter-math-integrals appears before ter-math-diff-eq in bac-libanais.ts,
    // even though we request them in the opposite order here.
    const summary = buildChaptersSummary(
      "bac-libanais",
      "terminale-s",
      "mathematics",
      ["ter-math-diff-eq", "ter-math-integrals"],
    );
    const integralsIdx = summary.indexOf("### Intégration");
    const diffEqIdx = summary.indexOf("### Équations différentielles");
    expect(integralsIdx).toBeGreaterThanOrEqual(0);
    expect(diffEqIdx).toBeGreaterThan(integralsIdx);
  });

  it("silently drops ids with no matching chapter instead of crashing or fabricating content", () => {
    const summary = buildChaptersSummary(
      "bac-libanais",
      "terminale-s",
      "mathematics",
      ["ter-math-complex", "hallucinated-chapter"],
    );
    expect(summary).toContain("### Nombres complexes");
    expect(summary).not.toContain("hallucinated-chapter");
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/generate.ts — buildGenerateUserPrompt (incl. the private
// chapter-distribution logic exercised through the public entry point)
// ---------------------------------------------------------------------------

describe("buildGenerateUserPrompt — chapter coverage distribution", () => {
  it("assigns one chapter per exercise, in order, when exerciseCount === chapterIds.length", () => {
    const context = baseContext({ chapterIds: TS_MATH_CHAPTERS, exerciseCount: 6 });
    const prompt = buildGenerateUserPrompt(context);
    expect(prompt).toContain('- Exercise 1 → "Nombres complexes"');
    expect(prompt).toContain('- Exercise 6 → "Probabilités conditionnelles"');
    expect(prompt).not.toContain("cover EACH as a distinct sub-question");
  });

  it("cycles back through the chapter list when there are more exercises than chapters", () => {
    const context = baseContext({
      chapterIds: ["ter-math-complex", "ter-math-integrals"],
      exerciseCount: 5,
    });
    const prompt = buildGenerateUserPrompt(context);
    // a=complex, b=integrals; expected pattern per buildChapterDistribution: a,b,a,b,a
    expect(prompt).toContain('- Exercise 1 → "Nombres complexes"');
    expect(prompt).toContain('- Exercise 2 → "Intégration"');
    expect(prompt).toContain('- Exercise 3 → "Nombres complexes"');
    expect(prompt).toContain('- Exercise 4 → "Intégration"');
    expect(prompt).toContain('- Exercise 5 → "Nombres complexes"');
  });

  it("packs multiple chapters into one exercise (as distinct sub-questions) when there are fewer exercises than chapters", () => {
    const context = baseContext({ chapterIds: TS_MATH_CHAPTERS, exerciseCount: 3 });
    const prompt = buildGenerateUserPrompt(context);
    expect(prompt).toContain("CHAPTER COVERAGE (MANDATORY");
    // 6 chapters / 3 exercises -> every exercise gets 2 chapters
    expect(prompt).toContain('- Exercise 1 → "Nombres complexes" + "Équations différentielles" (cover EACH as a distinct sub-question within this exercise — do not drop any of them)');
    // every selected chapter must still appear somewhere in the block
    for (const id of TS_MATH_CHAPTERS) {
      const chapter = getChapter("bac-libanais", "terminale-s", "mathematics", id);
      expect(prompt).toContain(chapter!.name.fr);
    }
  });

  it("falls back to the raw chapter id when a chapterId doesn't exist in curriculum data (no hallucinated names)", () => {
    const context = baseContext({ chapterIds: ["ter-math-complex", "not-a-real-chapter"], exerciseCount: 2 });
    const prompt = buildGenerateUserPrompt(context);
    expect(prompt).toContain('"not-a-real-chapter"');
  });

  it("omits the CHAPTER COVERAGE block entirely for university curriculum, even with chapterIds set", () => {
    const context = baseContext({
      curriculumId: "university",
      chapterIds: ["some-topic"],
      subject: "mathematics",
      levelId: "custom",
    });
    const prompt = buildGenerateUserPrompt(context);
    expect(prompt).not.toContain("CHAPTER COVERAGE");
    expect(prompt).toContain("University mode: use the teacher's description to determine topics exactly.");
  });

  it("omits the CHAPTER COVERAGE block when chapterIds is empty", () => {
    const context = baseContext({ chapterIds: [] });
    const prompt = buildGenerateUserPrompt(context);
    expect(prompt).not.toContain("CHAPTER COVERAGE");
  });
});

describe("buildGenerateUserPrompt — general fields", () => {
  it("includes chapters summary block for non-university curricula", () => {
    const context = baseContext();
    const chaptersSummary = buildChaptersSummary(
      context.curriculumId,
      context.levelId,
      context.subject,
      context.chapterIds,
    );
    const prompt = buildGenerateUserPrompt(context, undefined, chaptersSummary);
    expect(prompt).toContain("<selected_chapters>");
    expect(prompt).toContain("### Nombres complexes");
    expect(prompt).toContain("Only generate exercises on these chapters.");
  });

  it("adds the document-translation note only when hasDocument is true", () => {
    const context = baseContext({ language: "french" });
    const withDoc = buildGenerateUserPrompt(context, undefined, undefined, undefined, true);
    const withoutDoc = buildGenerateUserPrompt(context, undefined, undefined, undefined, false);
    expect(withDoc).toContain("DOCUMENT LANGUAGE NOTE");
    expect(withDoc).toContain("every word of the exam must be in french");
    expect(withoutDoc).not.toContain("DOCUMENT LANGUAGE NOTE");
  });

  it("includes teacher notes only when present", () => {
    const withNotes = buildGenerateUserPrompt(baseContext({ teacherNotes: "Focus on integrals" }));
    const withoutNotes = buildGenerateUserPrompt(baseContext({ teacherNotes: undefined }));
    expect(withNotes).toContain("Teacher notes:\nFocus on integrals");
    expect(withoutNotes).not.toContain("Teacher notes:");
  });

  it("uses the standard-layout instruction for the modern template, and layout extraction for uploaded", () => {
    const modern = buildGenerateUserPrompt(baseContext({ templateType: "modern" }));
    expect(modern).toContain("Use the standard Modern (Standard) layout");

    const uploaded = buildGenerateUserPrompt(
      baseContext({ templateType: "uploaded", layoutPreferences: "Header with school crest" }),
    );
    expect(uploaded).toContain("Extract and replicate the visual layout");
    expect(uploaded).toContain("Header with school crest");
  });

  it("computes the difficulty breakdown from the difficulty mix and exercise count", () => {
    const prompt = buildGenerateUserPrompt(baseContext({ exerciseCount: 4, difficultyMix: { easy: 0.25, medium: 0.5, hard: 0.25 } }));
    expect(prompt).toContain("Easy:   1 exercise(s) (25%)");
    expect(prompt).toContain("Medium: 2 exercise(s) (50%)");
    expect(prompt).toContain("Hard:   1 exercise(s) (25%)");
  });

  it("documents a real rounding gap: the app's own default difficulty mix (0.20/0.45/0.35) does not sum back to the requested exercise count for exerciseCount=7", () => {
    // Each of easy/medium/hard is rounded independently (Math.round), so the
    // three displayed exercise counts can add up to less (or more) than
    // context.exerciseCount. This is the exact default mix documented in
    // src/lib/prompts/analyze.ts ("Default when not specified: 0.20/0.45/0.35"),
    // so a 7-exercise exam is a realistic case that hits this gap.
    const prompt = buildGenerateUserPrompt(baseContext({ exerciseCount: 7, difficultyMix: { easy: 0.2, medium: 0.45, hard: 0.35 } }));
    expect(prompt).toContain("Easy:   1 exercise(s)");
    expect(prompt).toContain("Medium: 3 exercise(s)");
    expect(prompt).toContain("Hard:   2 exercise(s)");
    // 1 + 3 + 2 = 6, one short of the 7 exercises actually requested.
    expect(1 + 3 + 2).toBe(6);
    expect(6).not.toBe(7);
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/generate.ts — buildGenerateSystemPrompt branch selection
// ---------------------------------------------------------------------------

describe("buildGenerateSystemPrompt — curriculum/language branch selection", () => {
  it("uses IB command terms and structure regardless of language", () => {
    const prompt = buildGenerateSystemPrompt(baseContext({ curriculumId: "ib", levelId: "dp2", language: "english" }));
    expect(prompt).toContain("Marks shown in square brackets immediately after the question");
    expect(prompt).toContain("STRUCTURE RULES (IB)");
  });

  it("uses Arabic command terms for bac-libanais when language is arabic", () => {
    const prompt = buildGenerateSystemPrompt(baseContext({ curriculumId: "bac-libanais", language: "arabic" }));
    expect(prompt).toContain("الخطوة");
  });

  it("uses French command terms for bac-francais when language is french", () => {
    const prompt = buildGenerateSystemPrompt(baseContext({ curriculumId: "bac-francais", language: "french" }));
    expect(prompt).toContain("STRUCTURE RULES (Bac Français)");
    expect(prompt).toContain("Étape");
  });

  it("picks the English step word for English exams and French for French exams", () => {
    const french = buildGenerateSystemPrompt(baseContext({ language: "french" }));
    const english = buildGenerateSystemPrompt(baseContext({ language: "english" }));
    expect(french).toContain('"Étape 1 :", "Étape 2 :"');
    expect(english).toContain('"Step 1:", "Step 2:"');
  });

  it("falls back to English language instructions for an unrecognized language value", () => {
    const context = baseContext({ language: "klingon" as ExamContext["language"] });
    const prompt = buildGenerateSystemPrompt(context);
    expect(prompt).toContain("Write the entire exam in English.");
  });

  it("includes university structural rules and generic phrasing for university curriculum", () => {
    const prompt = buildGenerateSystemPrompt(baseContext({ curriculumId: "university", levelId: "custom" }));
    expect(prompt).toContain("STRUCTURE RULES (University)");
    expect(prompt).toContain("university-level courses");
  });

  it("does not crash and produces no literal 'undefined' when subject conventions are undefined for a subject", () => {
    // "law" has no SUBJECT_CONVENTIONS entry for bac-libanais at all.
    const prompt = buildGenerateSystemPrompt(baseContext({ subject: "law" }));
    expect(prompt).not.toContain("undefined");
  });
});

// ---------------------------------------------------------------------------
// src/lib/prompts/generate.ts — buildRegenerateExercisePrompt
// ---------------------------------------------------------------------------

describe("buildRegenerateExercisePrompt", () => {
  it("uses the real chapters summary for non-university curricula", () => {
    const prompt = buildRegenerateExercisePrompt(baseContext(), 2, "medium", "hard");
    expect(prompt).toContain("<selected_chapters>");
    expect(prompt).toContain("### Nombres complexes");
    expect(prompt).toContain("Generate a NEW, DIFFERENT replacement for exercise #2.");
    expect(prompt).toContain("Target difficulty: hard.");
  });

  it("uses the university course_context block instead of chapter lookups", () => {
    const context = baseContext({ curriculumId: "university", levelId: "custom", chapterIds: [] });
    const prompt = buildRegenerateExercisePrompt(context, 1, "easy");
    expect(prompt).toContain("<course_context>");
    expect(prompt).not.toContain("<selected_chapters>");
  });

  it("defaults to 'keep the same difficulty' phrasing when no targetDifficulty is given", () => {
    const prompt = buildRegenerateExercisePrompt(baseContext(), 1, "medium");
    expect(prompt).toContain("Keep the same difficulty but use fresh numbers and a different approach.");
    expect(prompt).not.toContain("Target difficulty:");
  });
});
