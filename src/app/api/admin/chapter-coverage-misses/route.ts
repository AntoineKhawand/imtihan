import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";
import { aggregateCoverage } from "@/lib/chapter-coverage";
import { getChapter, getCurriculumLevel } from "@/data/curricula";
import type { CurriculumId, Subject } from "@/types/curriculum";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const rowSchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  curriculumId: z.enum(["bac-libanais", "bac-francais", "ib"]),
  levelId: z.string(),
  subject: z.string(),
  chapterId: z.string(),
  selectionCount: z.number().int().positive(),
  missCount: z.number().int().nonnegative(),
});

export async function GET(request: NextRequest) {
  try {
    const uid = await verifyIdToken(request);
    if (!uid || !(await isAdmin(uid)))
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers },
      );
    const days = z
      .enum(["7", "28"])
      .safeParse(request.nextUrl.searchParams.get("days") ?? "28");
    if (!days.success)
      return NextResponse.json(
        { error: "days must be 7 or 28" },
        { status: 400, headers },
      );
    const now = new Date();
    const endDay = now.toISOString().slice(0, 10);
    now.setUTCDate(now.getUTCDate() - Number(days.data) + 1);
    const startDay = now.toISOString().slice(0, 10);
    const snap = await adminDb
      .collection("chapterCoverageDaily")
      .where("day", ">=", startDay)
      .where("day", "<=", endDay)
      .orderBy("day", "desc")
      .limit(5001)
      .get();
    if (snap.docs.length > 5000)
      throw new Error(
        "Report exceeds bounded read; never return partial rates.",
      );
    const rows = snap.docs.map((doc) => {
      const data = doc.data();
      const row = rowSchema.parse(data);
      if (row.missCount > row.selectionCount)
        throw new Error("Invalid coverage totals");
      return { ...row, lastMissedAt: data.lastMissedAt?.toMillis?.() ?? null };
    });
    const grouped = aggregateCoverage(rows);
    const misses = grouped.slice(0, 50).map((row) => {
      const curriculumId = row.curriculumId as CurriculumId;
      const level = getCurriculumLevel(curriculumId, row.levelId);
      const chapter = getChapter(
        curriculumId,
        row.levelId,
        row.subject as Subject,
        row.chapterId,
      );
      return {
        ...row,
        chapterName: chapter?.name.en ?? chapter?.name.fr ?? row.chapterId,
        levelName: level?.name.en ?? level?.name.fr ?? row.levelId,
      };
    });
    return NextResponse.json(
      {
        misses,
        startDay,
        endDay,
        totalChapters: grouped.length,
        firstSampleDay: rows.length
          ? rows.map((row) => row.day).sort()[0]
          : null,
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Coverage report unavailable. Retry in a moment." },
      { status: 503, headers },
    );
  }
}
