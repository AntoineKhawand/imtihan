import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import {
  buildCoverageSamples,
  type CoverageContext,
} from "@/lib/chapter-coverage";

/** Await telemetry separately from quota writes: a report failure must not cancel quota accounting. */
export async function recordChapterCoverage(
  context: CoverageContext,
  exercises: unknown[],
) {
  const samples = buildCoverageSamples(context, exercises);
  if (!samples.length) return;
  const day = new Date().toISOString().slice(0, 10);
  const batch = adminDb.batch();
  for (const sample of samples) {
    const scope = [
      sample.curriculumId,
      sample.levelId,
      sample.subject,
      sample.chapterId,
    ];
    const id = createHash("sha256").update(JSON.stringify(scope)).digest("hex");
    batch.set(
      adminDb.collection("chapterCoverageDaily").doc(`${day}__${id}`),
      {
        ...sample,
        day,
        selectionCount: admin.firestore.FieldValue.increment(1),
        missCount: admin.firestore.FieldValue.increment(sample.missCount),
        ...(sample.missCount
          ? { lastMissedAt: admin.firestore.FieldValue.serverTimestamp() }
          : {}),
      },
      { merge: true },
    );
  }
  await batch.commit();
}
