import { describe, it, expect } from "vitest";
import { AIExerciseSchema } from "@/lib/schemas/exercise";

// Regression for BUG-048 (security review, 2026-09-27): /api/generate/version-b's
// RequestSchema used to accept `exercises: z.array(z.any())` — a malformed
// element (null, or an object missing `solution`) reached mergeVariantExercise()
// AFTER a real, billed AI call, crashed with a plain TypeError, and was never
// charged against quota (the increment only fires on the success path). The
// fix validates incoming exercises with the same AIExerciseSchema used for
// the AI's own response, rejecting garbage with a 400 before any AI call.
describe("AIExerciseSchema as the /api/generate/version-b request-boundary validator (BUG-048)", () => {
  it("rejects null (the exact BUG-048 repro element)", () => {
    expect(AIExerciseSchema.safeParse(null).success).toBe(false);
  });

  it("rejects an exercise object missing solution", () => {
    const malformed = {
      id: "ex-1",
      number: 1,
      type: "short_answer",
      difficulty: "easy",
      points: 5,
      statement: "2 + 2 = ?",
      // no `solution` field
    };
    expect(AIExerciseSchema.safeParse(malformed).success).toBe(false);
  });

  it("accepts a well-formed exercise", () => {
    const ok = {
      id: "ex-1",
      number: 1,
      type: "short_answer",
      difficulty: "easy",
      points: 5,
      statement: "2 + 2 = ?",
      solution: { finalAnswer: "4", methodology: "Add 2 and 2." },
    };
    expect(AIExerciseSchema.safeParse(ok).success).toBe(true);
  });
});
