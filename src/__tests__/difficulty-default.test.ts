import { describe, expect, it } from "vitest";
import {
  difficultyPreset,
  HARD_DIFFICULTY,
  normalizeDifficulty,
} from "@/lib/difficulty";
import { buildAnalyzeSystemPrompt } from "@/lib/prompts/analyze";
import { buildGenerateUserPrompt } from "@/lib/prompts/generate";
import type { ExamContext } from "@/types/exam";
describe("hard default with teacher control", () => {
  it("defaults missing, empty and invalid mixes to hard", () => {
    for (const mix of [
      undefined,
      { easy: 0, medium: 0, hard: 0 },
      { easy: NaN, medium: 0, hard: 1 },
    ])
      expect(normalizeDifficulty(mix)).toEqual(HARD_DIFFICULTY);
  });
  it("preserves explicit easier choices and normalizes proportional custom mixes", () => {
    expect(normalizeDifficulty({ easy: 1, medium: 0, hard: 0 })).toEqual({
      easy: 1,
      medium: 0,
      hard: 0,
    });
    expect(normalizeDifficulty({ easy: 1, medium: 2, hard: 1 })).toEqual({
      easy: 0.25,
      medium: 0.5,
      hard: 0.25,
    });
    expect(difficultyPreset(HARD_DIFFICULTY)).toBe("hard");
    expect(difficultyPreset({ easy: 0.25, medium: 0.5, hard: 0.25 })).toBe(
      "custom",
    );
  });
  it("instructs analysis to default hard without overriding explicit requests", () => {
    expect(buildAnalyzeSystemPrompt()).toContain(
      "{ easy: 0, medium: 0, hard: 1 }",
    );
    expect(buildAnalyzeSystemPrompt()).toContain(
      "Honour an explicitly requested easier or mixed difficulty",
    );
  });
  it("allocates every requested exercise to hard for the default mix", () => {
    const context: ExamContext = {
      curriculumId: "bac-libanais",
      levelId: "eb9",
      subject: "mathematics",
      chapterIds: ["eb9-math-algebra"],
      language: "english",
      examType: "midterm",
      duration: 60,
      exerciseCount: 3,
      totalPoints: 20,
      difficultyMix: HARD_DIFFICULTY,
    };
    expect(buildGenerateUserPrompt(context)).toContain(
      "Hard:   3 exercise(s) (100%)",
    );
  });
});
