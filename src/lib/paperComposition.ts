import type { ExamContext, Exercise } from "@/types/exam";
import { PaperCompositionSchema, type PaperComposition, type PaperSection } from "@/lib/schemas/sourceDocument";
import { compatiblePaperProfiles } from "@/data/paperProfiles";

export function paperProfileIssues(context: { curriculumId: string; subject: string; levelId: string; paperComposition?: PaperComposition }): string[] {
  const id = context.paperComposition?.profileId;
  return id && !compatiblePaperProfiles(context as ExamContext).some(profile => profile.id === id)
    ? ["The paper reference does not match the selected curriculum, subject or level. Review the paper type."] : [];
}

export function paperTotals(paper: PaperComposition) {
  const marks = paper.sections.flatMap(s => s.marks);
  return { exerciseCount: marks.length, pointsPerExercise: marks,
    totalPoints: paper.sections.reduce((sum, s) => sum + (s.answerCount < s.marks.length ? s.answerCount * s.marks[0] : s.marks.reduce((a, b) => a + b, 0)), 0) };
}
export function applyPaper(context: ExamContext, paper: PaperComposition): ExamContext {
  return { ...context, ...paperTotals(paper), paperComposition: paper, paperCompositionReviewed: true };
}
export function sectionAt(paper: PaperComposition | undefined, index: number): { section: PaperSection; start: number } | undefined {
  let start = 0;
  for (const section of paper?.sections ?? []) {
    if (index >= start && index < start + section.marks.length) return { section, start };
    start += section.marks.length;
  }
}
export function sectionInstruction(section: PaperSection, language: string): string {
  const offered = section.marks.length, required = section.answerCount;
  return language === "arabic" ? `أجب عن ${required} من أصل ${offered}. ${section.instructions}`
    : language === "french" ? `Traiter ${required} exercice(s) sur ${offered}. ${section.instructions}`
    : `Answer ${required} of ${offered} questions. ${section.instructions}`;
}
export function paperContextIssues(context: Pick<ExamContext, "paperComposition" | "exerciseCount" | "totalPoints" | "pointsPerExercise">): string[] {
  if (!context.paperComposition) {
    const marks = context.pointsPerExercise;
    if (!marks) return [];
    return [marks.length !== context.exerciseCount ? "Question marks must match the requested question count." : "",
      marks.some(mark => !Number.isFinite(mark) || mark <= 0) ? "Every question must carry positive marks." : "",
      Math.abs(marks.reduce((sum, mark) => sum + mark, 0) - context.totalPoints) > 0.001 ? "Question marks must add up to the exam total." : ""].filter(Boolean);
  }
  const result = PaperCompositionSchema.safeParse(context.paperComposition);
  if (!result.success) return result.error.issues.map(i => i.message);
  const totals = paperTotals(result.data);
  return [totals.exerciseCount !== context.exerciseCount ? "Question count does not match the reviewed sections." : "",
    totals.totalPoints !== context.totalPoints ? "Maximum candidate mark does not match the reviewed sections." : "",
    context.pointsPerExercise && JSON.stringify(totals.pointsPerExercise) !== JSON.stringify(context.pointsPerExercise) ? "Question marks do not match the reviewed sections." : ""].filter(Boolean);
}
export function paperExerciseIssues(context: Pick<ExamContext, "paperComposition" | "exerciseCount" | "totalPoints" | "pointsPerExercise">, exercises: Pick<Exercise, "points">[]): string[] {
  const issues = paperContextIssues(context);
  if (!exercises.length) return [...issues, "The exam has no questions."];
  if (!context.paperComposition) {
    if (typeof context.exerciseCount === "number" && exercises.length !== context.exerciseCount) issues.push(`The exam requests ${context.exerciseCount} questions; ${exercises.length} are present.`);
    const offered = exercises.reduce((sum, ex) => sum + ex.points, 0);
    if (Math.abs(offered - context.totalPoints) > 0.001) issues.push(`Question marks total ${offered}, but the header says ${context.totalPoints}. Update the marks before exporting.`);
    return issues;
  }
  const expected = paperTotals(context.paperComposition).pointsPerExercise;
  if (exercises.length !== expected.length) issues.push(`This paper requires ${expected.length} questions; ${exercises.length} are present.`);
  exercises.forEach((ex, i) => { if (expected[i] !== undefined && Math.abs(ex.points - expected[i]) > 0.001) issues.push(`Question ${i + 1} must carry ${expected[i]} marks.`); });
  return issues;
}
export function paperPrompt(context: ExamContext): string {
  const paper = context.paperComposition;
  if (!paper) return "";
  let offset = 0;
  return `REVIEWED PAPER COMPOSITION (MANDATORY; overrides generic curriculum defaults):
Title: ${paper.title}
${paper.instructions.join("\n")}
${paper.sections.map(s => {
  const start = offset + 1; offset += s.marks.length;
  return `${s.title}: questions ${start}–${offset}; marks ${s.marks.join(", ")}; ${sectionInstruction(s, context.language)}`;
}).join("\n")}
The candidate maximum is ${context.totalPoints}; optional questions are offered alternatives, not extra compulsory marks. Generate ALL ${context.exerciseCount} offered questions. Put section titles and candidate instructions in the document composition, not repeated inside each statement. Give a complete solution and tabular mark scheme for EVERY offered question, including alternatives. Stay within selected chapters; this is a practice paper, never claim it was issued by an official examining authority.`;
}
export function singleExerciseContext(context: ExamContext, points: number, chapterIds = context.chapterIds): ExamContext {
  return { ...context, chapterIds, exerciseCount: 1, totalPoints: points, pointsPerExercise: [points], paperComposition: undefined, teacherNotes: `${context.teacherNotes ?? ""}\nSINGLE-QUESTION ADJUSTMENT: Generate only one question worth exactly ${points} marks. Ignore whole-paper counts and alternative-choice totals in the source document. Keep the selected syllabus and requested reasoning difficulty.` };
}
