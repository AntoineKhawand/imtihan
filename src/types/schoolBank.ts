import type { Difficulty } from "./exam";

/**
 * A single, minimal exercise pulled from the `schoolBank` Firestore
 * collection to use as a generation-prompt exemplar (see
 * src/lib/schoolBank.ts's getChapterExemplars()). Deliberately narrow — only
 * the fields the prompt actually needs to show "an example of a previously
 * well-received exercise for this chapter." Not the full schoolBank doc
 * shape (no solution, no contributor/school info — this is prompt context,
 * never rendered to the teacher).
 */
export interface ChapterExemplar {
  statement: string;
  difficulty: Difficulty;
  points: number;
}

/** One chapter's worth of exemplars, keyed by the chapter's display name + machine id (same [id: ...] convention used by buildChaptersSummary). */
export interface ChapterExemplarGroup {
  chapterName: string;
  chapterId: string;
  exercises: ChapterExemplar[];
}
