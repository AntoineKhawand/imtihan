/**
 * School Bank exemplars — read-only helper that pulls a small number of
 * previously-shared `schoolBank` exercises tagged with a given chapter, to
 * use as prompt context ("here's an example of a previously well-received
 * exercise for this chapter") when generating a new exam. Purely additive
 * and advisory: never influences generation on its own, and a chapter with
 * zero shared exercises (the common case for a long time post-launch) is a
 * silent no-op, not an error.
 *
 * NOTE ON WHY THIS USES adminDb, NOT THE CLIENT SDK:
 * This is wired into src/app/api/generate/route.ts, which runs server-side
 * (Node.js runtime, `export const runtime = "nodejs"`). src/lib/firebase.ts's
 * client SDK explicitly bails out of initializing whenever
 * `typeof window === "undefined"` — i.e. it is NEVER initialized in an API
 * route, so a client-SDK query placed here would silently query an
 * uninitialized `db` and either throw or (worse) always resolve to nothing,
 * defeating the feature without ever surfacing an error. The exact same
 * situation already exists for src/lib/teacherStyle.ts (also queries
 * Firestore for prompt-injection context from inside this same route) and
 * src/app/api/tools/chapter-performance/route.ts (also reads `schoolBank`
 * server-side) — both use adminDb, which this module follows for
 * consistency. This is ordinary production server code reading its own
 * app's Firestore data to serve a real user request — not the
 * script/harness pattern CLAUDE.md §15 / BUG-029 bans (minting admin
 * credentials in an ad-hoc script to bypass the real app and hit production
 * data directly).
 *
 * Firestore path: schoolBank/{docId}, exercise.chapterIds: string[]
 */

import { adminDb } from "@/lib/firebase-admin";
import { SchoolBankExemplarDocSchema } from "@/lib/schemas/schoolBank";
import type { ChapterExemplar } from "@/types/schoolBank";

const MAX_EXEMPLARS_RETURNED = 2;
// Defensive cap on documents read per chapter before sorting locally by
// recency — see the code comment below on why this query intentionally
// does NOT use Firestore `orderBy("sharedAt", "desc")`.
const MAX_DOCS_SCANNED = 50;

function millisOf(value: unknown): number {
  if (value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

/**
 * Returns up to 2 exercises from the `schoolBank` collection tagged with
 * `chapterId` (matched against the doc's `exercise.chapterIds` array),
 * scoped to the same curriculum + subject, most-recently-shared first.
 * Returns [] on any failure (missing index, permissions, malformed docs) —
 * this is advisory prompt context, never worth failing a real exam
 * generation request over.
 *
 * `levelId` is accepted for signature symmetry with getChapter()/
 * buildChaptersSummary() (chapterId alone is not guaranteed globally unique
 * across levels), but schoolBank docs don't currently carry a levelId field
 * (same accepted limitation src/app/api/tools/chapter-performance/route.ts
 * documents for the same collection) — not used to filter here.
 */
export async function getChapterExemplars(
  curriculumId: string,
  levelId: string,
  subject: string,
  chapterId: string
): Promise<ChapterExemplar[]> {
  try {
    // Composite index already exists for exactly this shape — see
    // firestore.indexes.json's schoolBank entry (curriculumId ASC, subject
    // ASC, exercise.chapterIds CONTAINS), added for
    // /api/tools/chapter-performance. Deliberately does NOT add
    // .orderBy("sharedAt", "desc") — that would require a *new* composite
    // index (curriculumId + subject + chapterIds CONTAINS + sharedAt),
    // which doesn't exist, and firestore.indexes.json is `database` team's
    // file to change, not engineering's, per CLAUDE.md §15's team
    // boundaries. Sorting the bounded result set by sharedAt in JS below
    // gets the same "most recent first" behavior without a schema change.
    const snap = await adminDb
      .collection("schoolBank")
      .where("curriculumId", "==", curriculumId)
      .where("subject", "==", subject)
      .where("exercise.chapterIds", "array-contains", chapterId)
      .limit(MAX_DOCS_SCANNED)
      .get();

    if (snap.empty) return [];

    const candidates: Array<{ millis: number; exemplar: ChapterExemplar }> = [];
    for (const doc of snap.docs) {
      const parsed = SchoolBankExemplarDocSchema.safeParse(doc.data());
      if (!parsed.success) continue; // malformed/legacy doc — skip, don't crash
      candidates.push({
        millis: millisOf(parsed.data.sharedAt),
        exemplar: {
          statement: parsed.data.exercise.statement,
          difficulty: parsed.data.exercise.difficulty,
          points: parsed.data.exercise.points,
        },
      });
    }

    return candidates
      .sort((a, b) => b.millis - a.millis)
      .slice(0, MAX_EXEMPLARS_RETURNED)
      .map((c) => c.exemplar);
  } catch (err) {
    console.warn("[schoolBank] getChapterExemplars failed — proceeding with no exemplars:", err);
    return [];
  }
}
