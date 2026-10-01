import { z } from "zod";

/**
 * Zod boundary for reading `schoolBank` Firestore docs back out (CLAUDE.md
 * §10 — "Zod at every boundary" isn't only for AI/user input; schoolBank
 * docs are written by other teachers via src/app/bank/page.tsx's
 * shareToSchoolBank(), so a malformed/legacy doc (missing a field, wrong
 * type) must be skipped rather than crashing the generation request that's
 * merely trying to read an exemplar).
 *
 * Deliberately minimal — only the fields getChapterExemplars() actually
 * reads (statement/difficulty/points/chapterIds/sharedAt/schoolSlug).
 * Ignores everything else on the doc (solution, contributor, ...).
 *
 * `schoolSlug` IS read (not ignored) — getChapterExemplars() uses it to
 * scope exemplars to the requesting teacher's own school, matching every
 * other schoolBank read/write in the app (src/app/bank/page.tsx,
 * src/app/student/practice/page.tsx). Without this, a query keyed only on
 * curriculumId/subject/chapterIds would surface any school's shared
 * exercise content, verbatim, as prompt context for a completely unrelated
 * teacher — a real cross-tenant content leak, not the "cross-teacher
 * within a school" scoping schoolBank documents everywhere else.
 */
export const SchoolBankExemplarDocSchema = z.object({
  schoolSlug: z.string().optional().default(""),
  exercise: z.object({
    statement: z.string().min(1),
    difficulty: z.enum(["easy", "medium", "hard"]),
    points: z.number(),
    chapterIds: z.array(z.string()).optional().default([]),
  }),
  // Firestore Timestamp is a class instance (admin.firestore.Timestamp), not
  // a plain object — validating its exact shape here would mean importing
  // firebase-admin's type into a schema file that should stay
  // dependency-free (same rationale as src/lib/schemas/exercise.ts's own
  // "no next/server, no firebase-admin" comment). Left as `unknown`;
  // src/lib/schoolBank.ts's millisOf() does a safe runtime duck-type check
  // (`typeof value?.toMillis === "function"`) instead.
  sharedAt: z.unknown().optional(),
});

export type SchoolBankExemplarDoc = z.infer<typeof SchoolBankExemplarDocSchema>;
