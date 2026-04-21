import type { ExamContext } from "@/types/exam";
import { buildChaptersSummary } from "@/data/curricula";

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  french: "Write the entire exam in French. Use French mathematical and scientific notation conventions. Refer to SI units in French (ex: m/s, N, J). Address students as 'vous'.",
  english: "Write the entire exam in English. Use standard international scientific notation. Use SI units in English.",
  arabic: "Write the entire exam in Modern Standard Arabic (MSA). Use Arabic mathematical notation. Ensure RTL compatibility in all text.",
};

const CURRICULUM_STYLE: Record<string, string> = {
  "bac-libanais": "Follow the Bac Libanais examination style: exercises are numbered (Exercice 1, 2, 3...), sub-questions are labeled (a, b, c or 1., 2., 3.), total points are out of 20. Use rigorous scientific method in corrigé.",
  "bac-francais": "Follow the French Bac examination style: exercises use standard CNDP format, questions are detailed with partial credit in mind, total out of 20. Corrigé should show full methodology.",
  ib: "Follow IB examination style: command terms (Calculate, Explain, Deduce, Evaluate...) must be used appropriately. Mark scheme in corrigé with clear marking points [1] [2]. Total out of the specified points.",
  university: "University-level rigor. Exercises can be longer and more open-ended. Corrigé must include full proofs or derivations where appropriate.",
};

const DIFFICULTY_GUIDE = `
Difficulty levels:
- easy: Directly applies a single formula or definition. Students who attended class should get this right.
- medium: Requires 2–3 steps, may combine concepts from the same chapter.
- hard: Multi-step, may combine chapters, requires analytical thinking or extended reasoning.`;

/**
 * Build the system prompt for exam generation.
 * This is called once per generate request.
 */
export function buildGenerateSystemPrompt(context: ExamContext): string {
  const isUniversity = context.curriculumId === "university";

  const chaptersSummary = isUniversity
    ? null
    : buildChaptersSummary(context.curriculumId, context.levelId, context.subject, context.chapterIds);

  const languageInstruction = LANGUAGE_INSTRUCTIONS[context.language] ?? LANGUAGE_INSTRUCTIONS.english;
  const curriculumStyle = CURRICULUM_STYLE[context.curriculumId] ?? "";

  const chapterBlock = isUniversity
    ? `<course_context>
University mode: use the teacher's notes and course description to determine the exact topics to test.
Generate exercises that match university-level rigor for the subject described.
</course_context>`
    : `<selected_chapters>
${chaptersSummary}
</selected_chapters>`;

  return `You are an expert teacher and examiner. You will generate a complete, high-quality exam based on the specification below.

${languageInstruction}

${curriculumStyle}
${DIFFICULTY_GUIDE}

${chapterBlock}

CRITICAL RULES:
1. All exercises must be solvable — verify your own calculations before writing them.
2. Numbers in problems must be realistic and consistent with the level (e.g. no negative masses, no speeds > c).
3. Each exercise must test concepts from the selected chapters — do not introduce topics outside this scope.
4. MATH NOTATION — JSON REQUIRES DOUBLE-ESCAPED BACKSLASHES: write \\frac, \\sqrt, \\alpha, \\vec, \\int, etc. (two backslashes). Single backslash LaTeX like \frac or \alpha is INVALID inside a JSON string and will crash the parser. Always use $\\frac{a}{b}$ not $\frac{a}{b}$.
5. OUTPUT FORMAT: Start your response with [ and end with ]. Output ONLY the raw JSON array — zero prose, zero markdown fences, zero explanation before or after.

SOLUTION QUALITY — this is what makes Imtihan valuable. The methodology must be a true STEP-BY-STEP corrigé a student can learn from:
- Write the methodology as numbered steps ("**Étape 1 :** ..."  or "**Step 1:** ..." depending on language).
- Each step states WHAT is done and WHY (the physical/mathematical principle invoked, not just arithmetic).
- Show intermediate results explicitly — do not skip algebra; a weak student must be able to follow.
- Identify the formula or theorem cited before applying it, with proper LaTeX.
- End with a boxed final answer formatted "$\\\\boxed{...}$" and units where applicable.
- commonMistakes: 2–3 realistic errors a student at this level might make, not trivial slips.
- For multi-part exercises, repeat this structure per sub-question.

JSON schema for each exercise:
{
  "id": string,
  "number": number,
  "type": "multiple_choice" | "short_answer" | "problem_solving" | "proof" | "calculation" | "lab_analysis",
  "difficulty": "easy" | "medium" | "hard",
  "points": number,
  "statement": string,
  "subQuestions": [
    { "label": string, "statement": string, "points": number }
  ] | null,
  "solution": {
    "finalAnswer": string,
    "methodology": string,
    "commonMistakes": string[]
  },
  "chapterIds": string[],
  "estimatedMinutes": number
}`;
}

/**
 * Build the user-facing generation request message.
 */
export function buildGenerateUserPrompt(context: ExamContext): string {
  const difficultyBreakdown = `
- Easy exercises: ${Math.round(context.difficultyMix.easy * context.exerciseCount)} (${Math.round(context.difficultyMix.easy * 100)}%)
- Medium exercises: ${Math.round(context.difficultyMix.medium * context.exerciseCount)} (${Math.round(context.difficultyMix.medium * 100)}%)
- Hard exercises: ${Math.round(context.difficultyMix.hard * context.exerciseCount)} (${Math.round(context.difficultyMix.hard * 100)}%)`;

  return `Generate ${context.exerciseCount} exercises. Reply with ONLY a JSON array starting with [ — no other text:

- Curriculum: ${context.curriculumId}
- Level: ${context.levelId}
- Subject: ${context.subject}
- Language: ${context.language}
- Exam type: ${context.examType}
- Duration: ${context.duration} minutes
- Total points: ${context.totalPoints}
- Difficulty breakdown: ${difficultyBreakdown}
${context.teacherNotes ? `\nAdditional teacher notes:\n${context.teacherNotes}` : ""}

Distribute points to sum to exactly ${context.totalPoints}. Return the JSON array now.`;
}

/**
 * Build a prompt to regenerate a single exercise at a different difficulty.
 */
export function buildRegenerateExercisePrompt(
  context: ExamContext,
  exerciseNumber: number,
  currentDifficulty: string,
  targetDifficulty?: string
): string {
  const isUniversity = context.curriculumId === "university";

  const chapterBlock = isUniversity
    ? `<course_context>University mode — use the teacher's course description for topic scope.</course_context>`
    : `<selected_chapters>
${buildChaptersSummary(context.curriculumId, context.levelId, context.subject, context.chapterIds)}
</selected_chapters>`;

  return `You previously generated exercise #${exerciseNumber} at ${currentDifficulty} difficulty.
Generate a NEW, DIFFERENT exercise covering the same topics but${targetDifficulty ? ` at ${targetDifficulty} difficulty.` : " with fresh numbers and a different approach."}

${chapterBlock}

Return ONLY a single JSON exercise object (not an array) matching the schema. No prose.`;
}
