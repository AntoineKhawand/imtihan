import { getChapter } from "@/data/curricula";
import type { ExamContext } from "@/types/exam";

export type CoverageContext = Pick<
  ExamContext,
  "curriculumId" | "levelId" | "subject" | "chapterIds"
>;
export const MAX_COVERAGE_CHAPTERS = 20;

export function buildCoverageSamples(
  context: CoverageContext,
  exercises: unknown[],
) {
  if (context.curriculumId === "university") return [];
  const covered = new Set(
    exercises.flatMap((exercise) => {
      if (!exercise || typeof exercise !== "object") return [];
      const ids = (exercise as { chapterIds?: unknown }).chapterIds;
      return Array.isArray(ids)
        ? ids.filter((id): id is string => typeof id === "string")
        : [];
    }),
  );
  return [...new Set(context.chapterIds)]
    .filter((id) =>
      getChapter(context.curriculumId, context.levelId, context.subject, id),
    )
    .slice(0, MAX_COVERAGE_CHAPTERS)
    .map((chapterId) => ({
      curriculumId: context.curriculumId,
      levelId: context.levelId,
      subject: context.subject,
      chapterId,
      selectionCount: 1,
      missCount: covered.has(chapterId) ? 0 : 1,
    }));
}

export interface CoverageDailyRow {
  day: string;
  curriculumId: string;
  levelId: string;
  subject: string;
  chapterId: string;
  selectionCount: number;
  missCount: number;
  lastMissedAt: number | null;
}

export function aggregateCoverage(rows: CoverageDailyRow[]) {
  const grouped = new Map<string, CoverageDailyRow>();
  for (const row of rows) {
    const id = JSON.stringify([
      row.curriculumId,
      row.levelId,
      row.subject,
      row.chapterId,
    ]);
    const previous = grouped.get(id);
    grouped.set(
      id,
      previous
        ? {
            ...previous,
            selectionCount: previous.selectionCount + row.selectionCount,
            missCount: previous.missCount + row.missCount,
            lastMissedAt:
              Math.max(previous.lastMissedAt ?? 0, row.lastMissedAt ?? 0) ||
              null,
          }
        : { ...row },
    );
  }
  return [...grouped.entries()]
    .map(([id, row]) => ({
      ...row,
      id,
      missRate:
        row.selectionCount > 0 ? row.missCount / row.selectionCount : null,
    }))
    .sort(
      (a, b) =>
        b.missCount - a.missCount || b.selectionCount - a.selectionCount,
    );
}
