import { z } from "zod";
import type { Exercise } from "@/types/exam";
import type { ExerciseTransform } from "@/lib/prompts/transformExercise";

const PatchSchema = z.object({
  statement: z.string().trim().min(1).max(60000),
  mathPlots: z.array(z.string().max(1000)).max(20).optional(),
});

/** Parse complete JSON only. Never silently accept truncated output or mutate marks/answers. */
export function parseExerciseTransform(raw: string, original: Exercise, type: ExerciseTransform): Exercise {
  const fenced = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const patch = PatchSchema.parse(JSON.parse(fenced?.[1] ?? raw.trim()));
  if (type === "insertPlot" && !/\[PLOT:\s*[^\]]+\]/i.test(patch.statement)) throw new Error("Missing inline plot");
  if (type === "image" && !/\[IMAGE:\s*[^\]]+\]/i.test(patch.statement)) throw new Error("Missing illustration");
  if (type === "visual" && !/```mermaid\s+[\s\S]+?```/i.test(patch.statement)) throw new Error("Missing diagram");
  if (type === "table" && !/\|[^\n]+\|\s*\n\s*\|?\s*:?-{3,}/.test(patch.statement)) throw new Error("Missing table");
  if (type === "plot" && !patch.mathPlots?.length) throw new Error("Missing plot equations");
  return { ...original, statement: patch.statement, ...(type === "plot" ? { mathPlots: patch.mathPlots } : {}) };
}
