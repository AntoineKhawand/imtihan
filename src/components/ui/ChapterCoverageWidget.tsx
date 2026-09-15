"use client";

import { BookOpen } from "lucide-react";
import type { SavedExam } from "@/lib/storage";
import { getAllChapterIds, getChapter, getCurriculumLevel } from "@/data/curricula";
import { SUBJECT_LABELS } from "@/lib/utils";
import type { CurriculumId, Subject } from "@/types/curriculum";

/** Max number of (curriculum, level, subject) combos shown before collapsing into a "+N more" note */
const MAX_COMBOS = 3;
/** Max number of missing-chapter chips shown per combo before collapsing into a "+N more" note */
const MAX_CHIPS_PER_COMBO = 6;

interface CoverageGroup {
  key: string;
  label: string;
  missingChapterNames: string[];
}

interface ComboAccumulator {
  curriculumId: CurriculumId;
  levelId: string;
  subject: Subject;
  chapterIds: Set<string>;
}

/**
 * Dashboard widget — surfaces curriculum chapters that have never appeared
 * in any of the teacher's saved exams, grouped by (curriculum, level, subject).
 * Pure client-side aggregation over already-loaded data — no new AI calls,
 * no new data collection. Renders nothing when there is no gap to report.
 */
export function ChapterCoverageWidget({ exams }: { exams: SavedExam[] }) {
  if (exams.length === 0) return null;

  // Group exams by the distinct (curriculumId, levelId, subject) combos they cover.
  const byCombo = new Map<string, ComboAccumulator>();

  for (const exam of exams) {
    const { curriculumId, levelId, subject, chapterIds } = exam.context;
    if (curriculumId === "university") continue; // free-form — no chapters to diff against

    const key = `${curriculumId}|${levelId}|${subject}`;
    const existing = byCombo.get(key);
    if (existing) {
      chapterIds.forEach((id) => existing.chapterIds.add(id));
    } else {
      byCombo.set(key, { curriculumId, levelId, subject, chapterIds: new Set(chapterIds) });
    }
  }

  const groups: CoverageGroup[] = [];

  for (const { curriculumId, levelId, subject, chapterIds } of byCombo.values()) {
    const allChapterIds = getAllChapterIds(curriculumId, levelId, subject);
    if (allChapterIds.length === 0) continue; // nothing defined to compute coverage against

    const missingIds = allChapterIds.filter((id) => !chapterIds.has(id));
    if (missingIds.length === 0) continue; // full coverage — nothing to report

    const level = getCurriculumLevel(curriculumId, levelId);
    const subjectLabel = SUBJECT_LABELS[subject]?.fr ?? subject;
    const levelLabel = level?.name.fr ?? levelId;

    const missingChapterNames = missingIds.map((id) => {
      const chapter = getChapter(curriculumId, levelId, subject, id);
      return chapter?.name.fr ?? chapter?.name.en ?? id;
    });

    groups.push({
      key: `${curriculumId}|${levelId}|${subject}`,
      label: `${subjectLabel} — ${levelLabel}`,
      missingChapterNames,
    });
  }

  if (groups.length === 0) return null;

  const visibleGroups = groups.slice(0, MAX_COMBOS);
  const hiddenComboCount = groups.length - visibleGroups.length;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={15} className="text-[var(--accent)]" />
        <h2 className="text-sm font-semibold text-[var(--text)]">Chapter coverage insights</h2>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Chapters you haven&apos;t covered yet in your generated exams.
      </p>

      <div className="space-y-4">
        {visibleGroups.map((group) => {
          const visibleChips = group.missingChapterNames.slice(0, MAX_CHIPS_PER_COMBO);
          const hiddenChipCount = group.missingChapterNames.length - visibleChips.length;
          return (
            <div key={group.key}>
              <p className="text-xs font-medium text-[var(--text)] mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {visibleChips.map((name) => (
                  <span
                    key={name}
                    className="text-[11px] leading-none px-2 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border)]"
                  >
                    {name}
                  </span>
                ))}
                {hiddenChipCount > 0 && (
                  <span className="text-[11px] leading-none px-2 py-1 rounded-full text-[var(--text-tertiary)]">
                    +{hiddenChipCount} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hiddenComboCount > 0 && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-4">
          +{hiddenComboCount} more subject{hiddenComboCount !== 1 ? "s" : ""} with uncovered chapters.
        </p>
      )}
    </div>
  );
}
