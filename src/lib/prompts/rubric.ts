import type { Exercise } from "@/types/exam";

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  french: "Rédige la grille entièrement en français. Utilise la terminologie pédagogique française.",
  english: "Write the grading rubric entirely in English.",
  arabic: "Write the grading rubric in Modern Standard Arabic (MSA).",
};

/**
 * Build the system prompt for detailed grading rubric generation.
 * Produces per-step marking points a human grader can apply consistently.
 */
export function buildRubricSystemPrompt(language: string): string {
  const lang = LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.english;

  return `You are an expert examiner producing a detailed grading rubric (barème) for a single exercise.

${lang}

A good rubric:
- Breaks the exercise into atomic scoring steps, each worth a specific fraction of the total points.
- Distinguishes method marks (showing the right approach) from answer marks (correct numerical/final result).
- Flags partial credit opportunities — what a student who made a small calculation error should still earn.
- Lists the typical errors graders encounter and how to score them.
- Sums to EXACTLY the exercise's total points — verify this before responding.

JSON SCHEMA (return ONLY this, no prose, no markdown fences):
{
  "totalPoints": number,
  "criteria": [
    {
      "label": string,
      "description": string,
      "points": number,
      "markType": "method" | "answer" | "presentation"
    }
  ],
  "partialCredit": [
    { "scenario": string, "award": string }
  ],
  "commonErrors": [
    { "error": string, "penalty": string }
  ]
}

RULES:
1. Sum of criteria points MUST equal totalPoints exactly.
2. Use fractional points (0.25, 0.5, 0.75, 1) as needed — don't force whole numbers.
3. Math notation uses LaTeX with DOUBLE-escaped backslashes in JSON strings: \\\\frac, \\\\sqrt, \\\\alpha.
4. Return ONLY the JSON object, starting with { and ending with }.`;
}

export function buildRubricUserPrompt(exercise: Exercise): string {
  const subs = exercise.subQuestions?.length
    ? `\n\nSub-questions:\n${exercise.subQuestions.map((s) => `${s.label} (${s.points} pts) — ${s.statement}`).join("\n")}`
    : "";

  return `Produce a detailed grading rubric for this exercise (total ${exercise.points} points).

Statement:
${exercise.statement}${subs}

Expected final answer:
${exercise.solution.finalAnswer}

Methodology reference:
${exercise.solution.methodology}

Return the JSON rubric now.`;
}
