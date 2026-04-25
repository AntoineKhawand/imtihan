import { bacLibanais } from "./bac-libanais";
import { bacFrancais } from "./bac-francais";
import { ib } from "./ib";
import { university } from "./university";
import type { Curriculum, CurriculumId, Subject } from "@/types/curriculum";

export const CURRICULA: Record<CurriculumId, Curriculum> = {
  "bac-libanais": bacLibanais,
  "bac-francais": bacFrancais,
  ib,
  university,
};

export const SUBJECT_GROUPS = {
  sciences: ["mathematics", "physics", "chemistry", "biology", "svt", "informatics", "nsi", "environmental-systems"],
  humanities: ["history", "geography", "history-geography", "philosophy", "civic-education", "economics", "ses", "sociology", "psychology", "global-politics", "law"],
  languages: ["arabic", "french", "english", "spanish", "german"],
  business: ["accounting", "management", "business"],
  arts: ["visual-arts", "music"],
  professional: ["medicine", "engineering", "architecture", "nursing"],
};

export const GEOGRAPHIC_SUBJECTS = [
  "geography", "history-geography", "economics", "ses", "sociology", 
  "global-politics", "business", "management", "accounting", "civic-education"
];

export function getCurriculum(id: CurriculumId): Curriculum {
  return CURRICULA[id];
}

export function getCurriculumLevel(curriculumId: CurriculumId, levelId: string) {
  const curriculum = getCurriculum(curriculumId);
  return curriculum.levels.find((l) => l.id === levelId) ?? null;
}

export function getChapter(curriculumId: CurriculumId, levelId: string, subject: Subject, chapterId: string) {
  const level = getCurriculumLevel(curriculumId, levelId);
  if (!level) return null;
  const chapters = level.chapters[subject] ?? [];
  return chapters.find((c) => c.id === chapterId) ?? null;
}

export function getAllChapterIds(curriculumId: CurriculumId, levelId: string, subject: Subject): string[] {
  const level = getCurriculumLevel(curriculumId, levelId);
  if (!level) return [];
  return (level.chapters[subject] ?? []).map((c) => c.id);
}

/** Build a flat summary of selected chapters for prompt injection */
export function buildChaptersSummary(
  curriculumId: CurriculumId,
  levelId: string,
  subject: Subject,
  chapterIds: string[]
): string {
  const level = getCurriculumLevel(curriculumId, levelId);
  if (!level) return "No chapter information found.";

  const chapters = (level.chapters[subject] ?? []).filter((c) => chapterIds.includes(c.id));
  if (chapters.length === 0) return "No chapters selected.";

  return chapters
    .map((ch) => {
      const name = ch.name.fr ?? ch.name.en;
      const objectives = ch.objectives.map((o) => `  - ${o}`).join("\n");
      return `### ${name}\n${objectives}`;
    })
    .join("\n\n");
}

export { bacLibanais, bacFrancais, ib, university };
