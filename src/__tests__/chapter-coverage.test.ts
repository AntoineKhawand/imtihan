import { describe, expect, it } from "vitest";
import {
  aggregateCoverage,
  buildCoverageSamples,
  type CoverageContext,
  type CoverageDailyRow,
} from "@/lib/chapter-coverage";
const context: CoverageContext = {
  curriculumId: "bac-libanais",
  levelId: "eb9",
  subject: "mathematics",
  chapterIds: ["eb9-math-algebra", "eb9-math-statistics"],
};

describe("coverage sample accuracy", () => {
  it("records covered selections as well as misses, once per distinct chapter", () => {
    const result = buildCoverageSamples(
      {
        ...context,
        chapterIds: [...context.chapterIds, "eb9-math-algebra", "invented"],
      },
      [{ chapterIds: ["eb9-math-algebra", "invented"] }],
    );
    expect(result).toHaveLength(2);
    expect(
      result.map(({ chapterId, selectionCount, missCount }) => ({
        chapterId,
        selectionCount,
        missCount,
      })),
    ).toEqual([
      { chapterId: "eb9-math-algebra", selectionCount: 1, missCount: 0 },
      { chapterId: "eb9-math-statistics", selectionCount: 1, missCount: 1 },
    ]);
  });
  it("treats missing or malformed tags as untagged without crashing", () => {
    expect(
      buildCoverageSamples(context, [
        null,
        {},
        { chapterIds: "eb9-math-algebra" },
      ]).every((row) => row.missCount === 1),
    ).toBe(true);
  });
  it("excludes university and invalid level/chapter combinations", () => {
    expect(
      buildCoverageSamples({ ...context, curriculumId: "university" }, []),
    ).toEqual([]);
    expect(
      buildCoverageSamples({ ...context, levelId: "seconde" }, []),
    ).toEqual([]);
  });
});

describe("coverage rates", () => {
  const row: CoverageDailyRow = {
    day: "2026-10-10",
    ...context,
    chapterId: "eb9-math-algebra",
    selectionCount: 1,
    missCount: 1,
    lastMissedAt: 100,
  };
  it("uses summed selections, not an average of daily percentages", () => {
    const [result] = aggregateCoverage([
      { ...row, selectionCount: 900, missCount: 9 },
      {
        ...row,
        day: "2026-10-09",
        selectionCount: 100,
        missCount: 1,
        lastMissedAt: 50,
      },
    ]);
    expect(result).toMatchObject({
      selectionCount: 1000,
      missCount: 10,
      missRate: 0.01,
      lastMissedAt: 100,
    });
  });
  it("keeps identically named chapters at different levels separate", () => {
    expect(
      aggregateCoverage([
        row,
        { ...row, levelId: "other-level", selectionCount: 5, missCount: 5 },
      ]),
    ).toHaveLength(2);
  });
  it("includes zero-miss selections in the report", () => {
    expect(
      aggregateCoverage([{ ...row, missCount: 0, lastMissedAt: null }])[0],
    ).toMatchObject({ missRate: 0, lastMissedAt: null });
  });
});
