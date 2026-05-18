/**
 * Teacher style learning system.
 *
 * After each successful generation we snapshot the teacher's choices (difficulty
 * mix, exercise count, preferred question types) and a few anonymised exercise
 * statements into Firestore.  Before the next generation for the same
 * curriculum+subject we fetch that snapshot and inject it into the system
 * prompt so Claude produces output that feels consistent with the teacher's
 * established style.
 *
 * Firestore path: users/{uid}/teacherStyle/{curriculumId}-{subject}
 */

import { adminDb } from "@/lib/firebase-admin";
import type { ExamContext } from "@/types/exam";

export interface TeacherStyleData {
  /** How many times this teacher has generated for this curriculum+subject */
  count: number;
  /** Running average of exerciseCount across past generations */
  avgExerciseCount: number;
  /** Running average of difficultyMix across past generations */
  avgDifficultyMix: { easy: number; medium: number; hard: number };
  /** Frequency map: exerciseType → number of times used */
  preferredExerciseTypes: Record<string, number>;
  /** Last N exercise statements used as style examples for the prompt */
  recentExamples: Array<{ statement: string; type: string; difficulty: string }>;
  updatedAt: number;
}

function styleDocId(curriculumId: string, subject: string): string {
  return `${curriculumId}-${subject}`;
}

export async function getTeacherStyle(
  uid: string,
  curriculumId: string,
  subject: string
): Promise<TeacherStyleData | null> {
  try {
    const snap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("teacherStyle")
      .doc(styleDocId(curriculumId, subject))
      .get();
    if (!snap.exists) return null;
    return snap.data() as TeacherStyleData;
  } catch {
    return null;
  }
}

export async function saveTeacherStyle(
  uid: string,
  context: ExamContext,
  exercises: Array<{ statement: string; type: string; difficulty: string }>
): Promise<void> {
  const docRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("teacherStyle")
    .doc(styleDocId(context.curriculumId, context.subject));

  const snap = await docRef.get();
  const prev = snap.exists ? (snap.data() as TeacherStyleData) : null;

  const count = (prev?.count ?? 0) + 1;

  // Weighted running average — new values count as 1 sample
  const lerp = (old: number, next: number) =>
    prev ? (old * (count - 1) + next) / count : next;

  const avgExerciseCount = lerp(prev?.avgExerciseCount ?? context.exerciseCount, context.exerciseCount);

  const prevMix = prev?.avgDifficultyMix ?? context.difficultyMix;
  const avgDifficultyMix = {
    easy:   lerp(prevMix.easy,   context.difficultyMix.easy),
    medium: lerp(prevMix.medium, context.difficultyMix.medium),
    hard:   lerp(prevMix.hard,   context.difficultyMix.hard),
  };

  // Accumulate exercise type frequency
  const preferredExerciseTypes = { ...(prev?.preferredExerciseTypes ?? {}) };
  for (const ex of exercises) {
    preferredExerciseTypes[ex.type] = (preferredExerciseTypes[ex.type] ?? 0) + 1;
  }

  // Keep the latest 2 exercise statements as style examples (rotate out old ones)
  const newExamples = exercises.slice(0, 2).map((ex) => ({
    statement: ex.statement.slice(0, 500),
    type: ex.type,
    difficulty: ex.difficulty,
  }));
  const recentExamples = [...newExamples, ...(prev?.recentExamples ?? [])].slice(0, 4);

  await docRef.set({
    count,
    avgExerciseCount: Math.round(avgExerciseCount * 10) / 10,
    avgDifficultyMix,
    preferredExerciseTypes,
    recentExamples,
    updatedAt: Date.now(),
  });
}

// ─── Lightweight exam shape sent from client / cron ────────────────────────

export interface ExamSummaryForStyle {
  context: {
    curriculumId: string;
    subject: string;
    exerciseCount: number;
    difficultyMix: { easy: number; medium: number; hard: number };
    examType: string;
  };
  exercises: Array<{ statement: string; type: string; difficulty: string }>;
}

/**
 * Compute a TeacherStyleData from a batch of past exams in one pass.
 * Used by the cron endpoint (live_exams) and the client-sync endpoint (localStorage).
 */
export function buildStyleFromExams(
  exams: ExamSummaryForStyle[]
): Omit<TeacherStyleData, "updatedAt"> {
  const count = exams.length;
  let totalExCount = 0;
  const diffSum = { easy: 0, medium: 0, hard: 0 };
  const typeFreq: Record<string, number> = {};
  const examples: TeacherStyleData["recentExamples"] = [];

  for (const exam of exams) {
    const exCount = exam.exercises.length || exam.context.exerciseCount;
    totalExCount += exCount;

    const d = exam.context.difficultyMix;
    diffSum.easy   += d.easy;
    diffSum.medium += d.medium;
    diffSum.hard   += d.hard;

    for (const ex of exam.exercises) {
      typeFreq[ex.type] = (typeFreq[ex.type] ?? 0) + 1;
      // Keep the freshest 4 examples (exams arrive newest-first from the client)
      if (examples.length < 4) {
        examples.push({
          statement: ex.statement.slice(0, 500),
          type: ex.type,
          difficulty: ex.difficulty,
        });
      }
    }
  }

  return {
    count,
    avgExerciseCount: Math.round((totalExCount / count) * 10) / 10,
    avgDifficultyMix: {
      easy:   diffSum.easy   / count,
      medium: diffSum.medium / count,
      hard:   diffSum.hard   / count,
    },
    preferredExerciseTypes: typeFreq,
    recentExamples: examples,
  };
}

/**
 * Merge a new batch result with an existing style doc.
 * Older data is down-weighted so recent exams have more influence.
 */
export async function mergeAndSaveStyle(
  uid: string,
  curriculumId: string,
  subject: string,
  incoming: Omit<TeacherStyleData, "updatedAt">
): Promise<void> {
  const docRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("teacherStyle")
    .doc(styleDocId(curriculumId, subject));

  const snap = await docRef.get();
  const prev = snap.exists ? (snap.data() as TeacherStyleData) : null;

  if (!prev) {
    await docRef.set({ ...incoming, updatedAt: Date.now() });
    return;
  }

  // Weight: existing data counts as (prevCount) samples, incoming as (incomingCount)
  const total = prev.count + incoming.count;
  const w0 = prev.count / total;
  const w1 = incoming.count / total;

  const merged: TeacherStyleData = {
    count: total,
    avgExerciseCount:
      Math.round((prev.avgExerciseCount * w0 + incoming.avgExerciseCount * w1) * 10) / 10,
    avgDifficultyMix: {
      easy:   prev.avgDifficultyMix.easy   * w0 + incoming.avgDifficultyMix.easy   * w1,
      medium: prev.avgDifficultyMix.medium * w0 + incoming.avgDifficultyMix.medium * w1,
      hard:   prev.avgDifficultyMix.hard   * w0 + incoming.avgDifficultyMix.hard   * w1,
    },
    preferredExerciseTypes: { ...prev.preferredExerciseTypes },
    // Incoming examples go first (most recent)
    recentExamples: [
      ...incoming.recentExamples,
      ...prev.recentExamples,
    ].slice(0, 4),
    updatedAt: Date.now(),
  };

  // Merge type frequency maps
  for (const [type, n] of Object.entries(incoming.preferredExerciseTypes)) {
    merged.preferredExerciseTypes[type] = (merged.preferredExerciseTypes[type] ?? 0) + n;
  }

  await docRef.set(merged);
}

/**
 * Builds the teacher-style section to inject into the generation system prompt.
 * Returns an empty string if there is no meaningful data yet.
 */
export function buildTeacherStylePrompt(style: TeacherStyleData): string {
  if (style.count < 2 || style.recentExamples.length === 0) return "";

  const easy   = Math.round(style.avgDifficultyMix.easy   * 100);
  const medium = Math.round(style.avgDifficultyMix.medium * 100);
  const hard   = Math.round(style.avgDifficultyMix.hard   * 100);

  const topTypes = Object.entries(style.preferredExerciseTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([t]) => t)
    .join(", ");

  const examples = style.recentExamples
    .map(
      (ex, i) =>
        `Style example ${i + 1} (${ex.type}, ${ex.difficulty}):\n${ex.statement}`
    )
    .join("\n\n");

  return `
TEACHER STYLE PROFILE (learned from ${style.count} past exams by this teacher on this subject):
- Typical difficulty mix: ${easy}% easy / ${medium}% medium / ${hard}% hard
- Preferred question types: ${topTypes}
- Avg exercises per exam: ${Math.round(style.avgExerciseCount)}

STYLE EXAMPLES — study how this teacher phrases their questions and match their writing style, level of detail, and mathematical rigour:

${examples}

Mirror the above examples in vocabulary, notation style, and question depth. Do not copy them verbatim — generate fresh content that feels consistent with this teacher's established style.`.trim();
}
