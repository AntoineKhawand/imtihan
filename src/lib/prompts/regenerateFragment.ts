import type { ExamContext } from "@/types/exam";

/**
 * Regenerate-a-fragment prompts — a teacher selects a piece of text (a
 * phrase, a number, a sub-clause) inside an already-generated exercise and
 * asks for just that piece to be rewritten, instead of regenerating the
 * whole exercise. Deliberately small and fast: this is meant to feel like
 * an inline quick-edit, not a full generation.
 */

export const FRAGMENT_INSTRUCTION_PRESETS: Record<string, string> = {
  rephrase: "Rephrase this in different words. Keep the same meaning, difficulty, and roughly the same length.",
  simplify: "Simplify this — easier vocabulary and sentence structure, same underlying meaning.",
  harder: "Make this more advanced and precise, while staying correct and appropriate for the level.",
  "change-numbers": "Keep the exact same structure and wording, but change any numeric values/data to different plausible ones.",
};

export function buildRegenerateFragmentSystemPrompt(context: ExamContext): string {
  return `You are an expert ${context.curriculumId} exam editor, precisely revising one small selected fragment inside an already-written exercise — not writing a new exercise.

Rules:
- Reply with ONLY the replacement text for the fragment. No prose, no explanation, no surrounding quotes, no markdown code fences.
- Every word must be in ${context.language}.
- Preserve any LaTeX math ($...$), mhchem notation (\\ce{...}), or other formatting conventions already used in the fragment or its surrounding context — match the existing style exactly, don't introduce a different notation.
- Stay factually and numerically consistent with the surrounding exercise context given to you — never contradict a fact, value, or relationship established elsewhere in the exercise unless the instruction explicitly asks you to change it.
- Match the fragment's original approximate length and register unless the instruction says otherwise.
- If the instruction asks to change numeric values, keep them realistic and internally consistent (e.g. don't produce a negative mass, an impossible probability, or a percentage over 100%).`;
}

export function buildRegenerateFragmentUserPrompt(fullText: string, selection: string, instructionText: string): string {
  return `<exercise_context>
${fullText}
</exercise_context>

The teacher selected exactly this fragment from the context above and wants ONLY it rewritten:
<selection>
${selection}
</selection>

Instruction: ${instructionText}

Return ONLY the replacement text for the selection.`;
}
