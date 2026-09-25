import { describe, it, expect, beforeEach } from "vitest";
import { buildExercisesCacheKey } from "@/lib/workflowCache";
import type { ExamContext, Exercise } from "@/types/exam";

// Regression test for BUG-039: browser back-navigation from Export (Step 5)
// to Generate (Step 4) discarded the generated/edited exam and silently
// re-triggered a fresh /api/generate call, instead of restoring from the
// sessionStorage cache as designed.
//
// Root cause: the mount effect's restore check compares a stored
// `imtihan_exercises_key` against a freshly-computed key built from the
// current `context`/`templateId`. The write side (`persistExercises` in
// `src/app/create/generate/page.tsx`) is the only place meant to keep that
// key in sync — but 6 of its 7 write call sites (initial generation,
// stream-ended-without-done, regenerate, add-chapter-exercise, remove, and
// edit-save) wrote `imtihan_exercises` directly via a raw
// `sessionStorage.setItem`, bypassing `persistExercises` entirely, so
// `imtihan_exercises_key` was left stale (or, on first generation, never
// written at all). On the next mount (e.g. real browser back-navigation),
// the mismatch-cleanup branch saw a present `imtihan_exercises` value next
// to a missing/stale key, concluded the cache was stale, wiped both entries,
// and the page's `context && status === "idle"` effect immediately
// re-triggered generateExam().
//
// The fix routes every write through `persistExercises`, which now delegates
// key-building to the single shared `buildExercisesCacheKey()` helper also
// used by the mount effect's read side — so a write and a subsequent read
// can never compute the key differently.

const baseContext: ExamContext = {
  curriculumId: "bac-libanais",
  levelId: "terminale-s",
  subject: "physics",
  chapterIds: ["mechanics-1", "waves-2"],
  language: "french",
  examType: "final",
  duration: 120,
  exerciseCount: 3,
  totalPoints: 20,
  difficultyMix: { easy: 0.3, medium: 0.5, hard: 0.2 },
};

const exercise: Exercise = {
  id: "ex-1",
  number: 1,
  type: "problem_solving",
  difficulty: "medium",
  points: 7,
  statement: "Determine the velocity of the projectile.",
  solution: {
    finalAnswer: "v = 12 m/s",
    methodology: "Apply conservation of energy...",
  },
  chapterIds: ["mechanics-1"],
  estimatedMinutes: 15,
};

describe("buildExercisesCacheKey", () => {
  it("is deterministic for the same context/templateId", () => {
    const a = buildExercisesCacheKey(baseContext, "classic");
    const b = buildExercisesCacheKey(baseContext, "classic");
    expect(a).toBe(b);
  });

  it("is stable across a JSON.stringify -> JSON.parse round trip of the context (mirrors sessionStorage persistence)", () => {
    // This mirrors exactly what the mount effect does: `imtihan_context` is
    // stored once as a raw string and re-parsed on every mount. As long as
    // the raw string itself doesn't change, JSON.parse is deterministic, so
    // the rebuilt key must match the originally-written key.
    const roundTripped = JSON.parse(JSON.stringify(baseContext)) as ExamContext;
    const originalKey = buildExercisesCacheKey(baseContext, "classic");
    const afterRoundTripKey = buildExercisesCacheKey(roundTripped, "classic");
    expect(afterRoundTripKey).toBe(originalKey);
  });

  it("differs when templateId differs", () => {
    const classic = buildExercisesCacheKey(baseContext, "classic");
    const modern = buildExercisesCacheKey(baseContext, "modern");
    expect(classic).not.toBe(modern);
  });

  it("differs when the context genuinely changes (e.g. a different chapter selection)", () => {
    const original = buildExercisesCacheKey(baseContext, "classic");
    const changed = buildExercisesCacheKey({ ...baseContext, chapterIds: ["mechanics-1"] }, "classic");
    expect(original).not.toBe(changed);
  });
});

describe("BUG-039 repro: write-then-remount cache round trip via sessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  /** Mirrors the fixed `persistExercises()` in generate/page.tsx. */
  function persistExercises(list: Exercise[], context: ExamContext, templateId: string) {
    sessionStorage.setItem("imtihan_exercises", JSON.stringify(list));
    sessionStorage.setItem("imtihan_exercises_key", buildExercisesCacheKey(context, templateId));
  }

  /** Mirrors the mount effect's restore-or-wipe decision in generate/page.tsx. */
  function readCacheOnMount(context: ExamContext, templateId: string): { restored: Exercise[] | null; wiped: boolean } {
    const cachedEx = sessionStorage.getItem("imtihan_exercises");
    const cachedKey = sessionStorage.getItem("imtihan_exercises_key");
    const currentKey = buildExercisesCacheKey(context, templateId);

    if (cachedEx && cachedKey === currentKey) {
      const parsed = JSON.parse(cachedEx) as Exercise[];
      return { restored: parsed.length > 0 ? parsed : null, wiped: false };
    } else if (cachedEx && cachedKey !== currentKey) {
      sessionStorage.removeItem("imtihan_exercises");
      sessionStorage.removeItem("imtihan_exercises_key");
      return { restored: null, wiped: true };
    }
    return { restored: null, wiped: false };
  }

  it("restores the edited exam on remount instead of wiping the cache (the exact QA repro: generate, edit, export, browser back)", () => {
    const templateId = "classic";

    // Step 4 (Generate): initial generation completes.
    persistExercises([exercise], baseContext, templateId);

    // Teacher edits Exercise 1 (difficulty/points) via the Edit modal, Save.
    const edited: Exercise = { ...exercise, difficulty: "hard", points: 10 };
    persistExercises([edited], baseContext, templateId);

    // Step 5 (Export) — export page only reads, never rewrites
    // imtihan_context/imtihan_exercises/imtihan_exercises_key.

    // Real browser back-navigation remounts the Generate page. `imtihan_context`
    // is re-read and JSON.parsed fresh (same raw string -> same object shape).
    const remountedContext = JSON.parse(JSON.stringify(baseContext)) as ExamContext;
    const result = readCacheOnMount(remountedContext, templateId);

    expect(result.wiped).toBe(false);
    expect(result.restored).not.toBeNull();
    expect(result.restored?.[0].difficulty).toBe("hard");
    expect(result.restored?.[0].points).toBe(10);
  });

  it("still correctly discards a genuinely stale cache when the context actually changed", () => {
    const templateId = "classic";
    persistExercises([exercise], baseContext, templateId);

    // Teacher went back further and changed chapter selection on Confirm,
    // producing a real new context before landing on Generate again.
    const newContext: ExamContext = { ...baseContext, chapterIds: ["thermodynamics-1"] };
    const result = readCacheOnMount(newContext, templateId);

    expect(result.wiped).toBe(true);
    expect(result.restored).toBeNull();
    expect(sessionStorage.getItem("imtihan_exercises")).toBeNull();
    expect(sessionStorage.getItem("imtihan_exercises_key")).toBeNull();
  });

  it("demonstrates the pre-fix bug shape: a write that skips the key desyncs the very next remount", () => {
    // Simulates the old, broken call sites that wrote imtihan_exercises
    // directly via sessionStorage.setItem without ever touching the key.
    sessionStorage.setItem("imtihan_exercises", JSON.stringify([exercise]));
    // imtihan_exercises_key deliberately left unset, as the old bug did.

    const result = readCacheOnMount(baseContext, "classic");

    expect(result.wiped).toBe(true);
    expect(result.restored).toBeNull();
  });
});
