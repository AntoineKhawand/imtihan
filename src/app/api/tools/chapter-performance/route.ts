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

    const schoolBankIds = [...difficultyByDocId.keys()];
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
