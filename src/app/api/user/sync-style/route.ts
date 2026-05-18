/**
 * POST /api/user/sync-style
 *
 * Called by the client (generate page) on first load to push the teacher's
 * localStorage exam history to the server so it can seed their style profile.
 *
 * The client sends lightweight exam summaries — no solutions, statements
 * capped at 500 chars — so the payload stays small even with many saved exams.
 *
 * The endpoint groups summaries by (curriculumId, subject), computes style
 * metrics in one pass, then merges into the Firestore teacherStyle documents.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySession } from "@/lib/firebase-admin";
import { buildStyleFromExams, mergeAndSaveStyle } from "@/lib/teacherStyle";
import { createSecurityHeaders } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Zod schema for incoming exam summaries ───────────────────────────────────

const ExerciseSummarySchema = z.object({
  statement: z.string().max(600),
  type: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

const ExamSummarySchema = z.object({
  context: z.object({
    curriculumId: z.string(),
    subject: z.string(),
    exerciseCount: z.number(),
    difficultyMix: z.object({
      easy: z.number(),
      medium: z.number(),
      hard: z.number(),
    }),
    examType: z.string(),
  }),
  exercises: z.array(ExerciseSummarySchema).max(10),
});

const RequestSchema = z.object({
  exams: z.array(ExamSummarySchema).max(100),
});

// ── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  const uid = await verifySession(req);
  if (!uid) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: createSecurityHeaders() }
    );
  }

  // Parse
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  const { exams } = parsed.data;
  if (exams.length === 0) {
    return NextResponse.json({ success: true, updated: 0 });
  }

  // Group by (curriculumId, subject)
  const groups = new Map<string, typeof exams>();
  for (const exam of exams) {
    const key = `${exam.context.curriculumId}::${exam.context.subject}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(exam);
  }

  // Build style per group and merge into Firestore (parallel writes)
  const writes: Promise<void>[] = [];
  for (const [key, groupExams] of groups) {
    const [curriculumId, subject] = key.split("::");
    const style = buildStyleFromExams(groupExams);
    writes.push(
      mergeAndSaveStyle(uid, curriculumId, subject, style).catch((err) =>
        console.error(`[sync-style] Failed for uid=${uid} key=${key}:`, err)
      )
    );
  }

  await Promise.all(writes);

  return NextResponse.json(
    { success: true, updated: groups.size },
    { headers: createSecurityHeaders() }
  );
}
