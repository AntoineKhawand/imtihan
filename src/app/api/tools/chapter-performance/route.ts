import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";

const RequestSchema = z.object({
  curriculumId: z.string().min(1).max(50),
  subject: z.string().min(1).max(50),
  chapterIds: z.array(z.string().min(1).max(50)).min(1).max(20),
});

type Difficulty = "easy" | "medium" | "hard";
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

interface DifficultyStats {
  attempts: number;
  correct: number;
  pct: number;
}

/** Splits an array into chunks of at most `size` items. */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

/**
 * POST /api/tools/chapter-performance
 *
 * Read-only aggregation, purely advisory: given a curriculum + subject + set of
 * chapters, looks up shared `schoolBank` exercises tagged with those chapters,
 * joins to `student_attempts` by exercise (schoolBank doc) id, and returns a
 * per-difficulty correctness breakdown so the UI can show a "students scored
 * X% on medium questions last time" note. Never influences generation.
 *
 * schoolBank docs don't carry a levelId, so this scopes only by
 * curriculumId + subject + chapterIds — an accepted limitation, not a bug.
 *
 * Deliberately left unauthenticated: unlike /api/generate and
 * /api/exam/translate, this is not a billed AI call and returns only
 * aggregate, non-identifying percentages (no per-student data, no PII).
 * Worst case for an anonymous caller is a handful of extra Firestore reads,
 * bounded by the request Zod schema (chapterIds capped at 20) and by
 * MAX_SCHOOLBANK_IDS below. If this route ever starts returning anything
 * more granular than aggregate stats, add verifySession() here too.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request." },
        { status: 400, headers: createSecurityHeaders() }
      );
    }

    const { curriculumId, subject, chapterIds } = parsed.data;

    // 1. Find schoolBank exercises tagged with any of the requested chapters,
    //    scoped to this curriculum + subject. Firestore caps array-contains-any
    //    at 10 values, so chunk and merge/de-dupe by doc id.
    const difficultyByDocId = new Map<string, Difficulty>();

    for (const chapterChunk of chunk(chapterIds, 10)) {
      const snap = await adminDb
        .collection("schoolBank")
        .where("curriculumId", "==", curriculumId)
        .where("subject", "==", subject)
        .where("exercise.chapterIds", "array-contains-any", chapterChunk)
        .get();

      for (const doc of snap.docs) {
        if (difficultyByDocId.has(doc.id)) continue;
        const data = doc.data();
        const difficulty = (data?.exercise as { difficulty?: unknown } | undefined)?.difficulty;
        if (isDifficulty(difficulty)) {
          difficultyByDocId.set(doc.id, difficulty);
        }
      }
    }

    // Cap the number of matched exercises we join against before fanning out
    // "in" queries below — this route is unauthenticated (see route-level
    // comment), so without a cap a request naming broad/high-traffic chapters
    // could force an unbounded number of Firestore reads. 300 is generous for
    // this advisory feature (it only needs a representative sample, not every
    // attempt ever made) and keeps the worst case at 10 reads (chunk of 30).
    const MAX_SCHOOLBANK_IDS = 300;
    const schoolBankIds = [...difficultyByDocId.keys()].slice(0, MAX_SCHOOLBANK_IDS);
    if (schoolBankIds.length === 0) {
      return NextResponse.json(
        { success: true, hasData: false, sampleSize: 0 },
        { headers: createSecurityHeaders() }
      );
    }

    // 2. Join to student_attempts by exerciseId == schoolBank doc id.
    //    Firestore caps "in" queries at 30 values, so chunk.
    const totals: Record<Difficulty, { attempts: number; correct: number }> = {
      easy: { attempts: 0, correct: 0 },
      medium: { attempts: 0, correct: 0 },
      hard: { attempts: 0, correct: 0 },
    };

    for (const idChunk of chunk(schoolBankIds, 30)) {
      const snap = await adminDb
        .collection("student_attempts")
        .where("exerciseId", "in", idChunk)
        .get();

      for (const doc of snap.docs) {
        const data = doc.data();
        const exerciseId = data?.exerciseId;
        const isCorrect = data?.isCorrect;
        if (typeof exerciseId !== "string" || typeof isCorrect !== "boolean") continue;

        const difficulty = difficultyByDocId.get(exerciseId);
        if (!difficulty) continue;

        totals[difficulty].attempts += 1;
        if (isCorrect) totals[difficulty].correct += 1;
      }
    }

    const sampleSize = DIFFICULTIES.reduce((sum, d) => sum + totals[d].attempts, 0);
    if (sampleSize === 0) {
      return NextResponse.json(
        { success: true, hasData: false, sampleSize: 0 },
        { headers: createSecurityHeaders() }
      );
    }

    const byDifficulty: Partial<Record<Difficulty, DifficultyStats>> = {};
    for (const d of DIFFICULTIES) {
      const { attempts, correct } = totals[d];
      if (attempts === 0) continue;
      byDifficulty[d] = {
        attempts,
        correct,
        pct: Math.round((correct / attempts) * 100),
      };
    }

    return NextResponse.json(
      { success: true, hasData: true, byDifficulty, sampleSize },
      { headers: createSecurityHeaders() }
    );
  } catch (err) {
    console.error("[/api/tools/chapter-performance]", err);
    return NextResponse.json(
      { success: false, error: "Aggregation failed." },
      { status: 500, headers: createSecurityHeaders() }
    );
  }
}
