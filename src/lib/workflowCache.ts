import type { ExamContext } from "@/types/exam";

/**
 * Single source of truth for the `sessionStorage` cache-key format used by
 * the Generate step (`src/app/create/generate/page.tsx`) to decide whether a
 * previously-generated/edited exercises list can be restored on remount
 * (e.g. browser back-navigation from Export) instead of triggering a brand
 * new /api/generate call.
 *
 * BUG-039: this used to be duplicated inline in two places — the mount
 * effect's read side and a `persistExercises` write helper that several call
 * sites (regenerate/edit/remove/save-to-bank) bypassed entirely by writing
 * `imtihan_exercises` directly via `sessionStorage.setItem` without ever
 * updating `imtihan_exercises_key`. That left the key stale (or missing)
 * after any edit, so the next remount's key comparison always failed,
 * wiping the cache and silently re-generating the exam. Centralizing the
 * key format here (and routing every write through it) removes the
 * possibility of the two sides drifting apart again.
 */
export function buildExercisesCacheKey(context: ExamContext, templateId: string): string {
  return JSON.stringify({ c: context, t: templateId });
}
