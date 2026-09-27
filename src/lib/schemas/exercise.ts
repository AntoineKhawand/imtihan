import { z } from "zod";

/**
 * AI-response validation for a single generated exercise — the Zod boundary
 * CLAUDE.md §10 requires for anything coming from the AI. Extracted from
 * src/app/api/generate/route.ts into its own dependency-free module (no
 * next/server, no firebase-admin) so it can be:
 *  1. Reused as-is by src/app/api/generate/version-b/route.ts — a real
 *     Version B exercise is still just "an exercise object" (see
 *     FOUNDER_DECISIONS.md #9), so there is no reason for a second,
 *     possibly-drifting schema.
 *  2. Imported directly by unit tests without pulling in Next.js route-only
 *     server dependencies (see src/__tests__/qcm.test.ts's own comment on
 *     why it previously had to inline a copy instead).
 */

export const McqOptionAISchema = z.object({
  label: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const SubQuestionAISchema = z.object({
  label: z.string(),
  statement: z.string(),
  points: z.number(),
});

export const BaremeEntryAISchema = z.object({
  label: z.string(),
  points: z.number(),
  criterion: z.string(),
});

export const MicroBaremeEntryAISchema = z.object({
  step: z.string(),
  points: z.number(),
  criterion: z.string(),
});

// "essay" is a valid Exercise type in src/types/exam.ts but is not part of
// the AI-facing schema in src/lib/prompts/generate.ts — kept in sync with
// that prompt's JSON schema block, not the broader app-level type.
export const AIExerciseSchema = z
  .object({
    id: z.string(),
    number: z.number(),
    type: z.enum([
      "multiple_choice",
      "short_answer",
      "problem_solving",
      "proof",
      "calculation",
      "lab_analysis",
    ]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    points: z.number(),
    statement: z.string(),
    options: z.array(McqOptionAISchema).nullable().optional(),
    subQuestions: z.array(SubQuestionAISchema).nullable().optional(),
    solution: z.object({
      finalAnswer: z.string(),
      methodology: z.string(),
      commonMistakes: z.array(z.string()).optional(),
      bareme: z.array(BaremeEntryAISchema).optional(),
      microBareme: z.array(MicroBaremeEntryAISchema).optional(),
    }),
    chapterIds: z.array(z.string()).optional().default([]),
    estimatedMinutes: z.number().optional(),
    mathPlots: z.array(z.string()).optional(),
  })
  // Preserve any other field the model emits (e.g. future additions) rather
  // than silently dropping it.
  .passthrough();
