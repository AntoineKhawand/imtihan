/**
 * GET /api/cron/sync-styles
 *
 * Reads all documents in the `live_exams` Firestore collection, groups them
 * by (teacherId, curriculumId, subject), computes style profiles, and writes
 * them to users/{uid}/teacherStyle/{curriculumId}-{subject}.
 *
 * Call this once to bootstrap profiles from published exam history, then
 * schedule it weekly via Vercel Cron (vercel.json) to keep profiles fresh.
 *
 * Security: requires CRON_SECRET header matching the env variable.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  buildStyleFromExams,
  mergeAndSaveStyle,
  type ExamSummaryForStyle,
} from "@/lib/teacherStyle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Group key → array of exam summaries
type StyleGroups = Map<string, ExamSummaryForStyle[]>;

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── 1. Read live_exams (cap at 500 per run to stay within timeout) ────────
    const snapshot = await adminDb
      .collection("live_exams")
      .orderBy("createdAt", "desc")
      .limit(500)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ processed: 0, groups: 0 });
    }

    // ── 2. Group by (teacherId, curriculumId, subject) ─────────────────────
    const groups: StyleGroups = new Map();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const uid: string = data.teacherId;
      const ctx = data.context ?? {};
      const curriculumId: string = ctx.curriculumId ?? "";
      const subject: string = ctx.subject ?? "";

      if (!uid || !curriculumId || !subject) continue;

      const key = `${uid}::${curriculumId}::${subject}`;
      if (!groups.has(key)) groups.set(key, []);

      const exercises: ExamSummaryForStyle["exercises"] = (
        data.exercises ?? []
      )
        .slice(0, 5) // cap per exam to keep payload small
        .map((ex: any) => ({
          statement: String(ex.statement ?? "").slice(0, 500),
          type: String(ex.type ?? "problem_solving"),
          difficulty: String(ex.difficulty ?? "medium"),
        }));

      groups.get(key)!.push({
        context: {
          curriculumId,
          subject,
          exerciseCount: Number(ctx.exerciseCount ?? exercises.length),
          difficultyMix: ctx.difficultyMix ?? { easy: 0.2, medium: 0.45, hard: 0.35 },
          examType: String(ctx.examType ?? "midterm"),
        },
        exercises,
      });
    }

    // ── 3. Compute style per group and write to Firestore ──────────────────
    let written = 0;
    const writes: Promise<void>[] = [];

    for (const [key, exams] of groups) {
      const [uid, curriculumId, subject] = key.split("::");
      const style = buildStyleFromExams(exams);
      writes.push(
        mergeAndSaveStyle(uid, curriculumId, subject, style).catch((err) =>
          console.error(`[sync-styles] Failed for ${key}:`, err)
        )
      );
      written++;
    }

    await Promise.all(writes);

    console.log(
      `[sync-styles] Processed ${snapshot.size} live_exams → ${written} style profiles updated`
    );

    return NextResponse.json({
      processed: snapshot.size,
      groups: written,
    });
  } catch (err) {
    console.error("[sync-styles] Cron failed:", err);
    return NextResponse.json(
      { error: "Sync failed", detail: String(err) },
      { status: 500 }
    );
  }
}
