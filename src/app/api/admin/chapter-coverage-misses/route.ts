import { NextRequest, NextResponse } from "next/server";
import { adminDb, verifyIdToken } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Read-only report backing a new "Coverage" tab on /admin. Surfaces the
 * `chapterCoverageMisses` counters written by src/app/api/generate/route.ts
 * whenever a teacher's selected chapter comes back with zero exercises after
 * a real generation — see CURRICULUM_COVERAGE_STRATEGY.md's "Secondary
 * signal" item. Deliberately just a sorted top-N read: the backlog item this
 * closes explicitly asks for "a simple report, not an automated prompt
 * rewrite — a human should read the pattern before changing prompts."
 */
export async function GET(request: NextRequest) {
  const uid = await verifyIdToken(request);
  if (!uid || !(await isAdmin(uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snap = await adminDb
      .collection("chapterCoverageMisses")
      .orderBy("missCount", "desc")
      .limit(50)
      .get();

    const misses = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        curriculumId: typeof d.curriculumId === "string" ? d.curriculumId : "",
        subject: typeof d.subject === "string" ? d.subject : "",
        chapterId: typeof d.chapterId === "string" ? d.chapterId : "",
        missCount: typeof d.missCount === "number" ? d.missCount : 0,
        lastMissedAt: d.lastMissedAt?.toMillis?.() ?? null,
      };
    });

    return NextResponse.json({ misses }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/admin/chapter-coverage-misses]", err);
    return NextResponse.json({ error: "Failed to fetch coverage misses" }, { status: 500 });
  }
}
