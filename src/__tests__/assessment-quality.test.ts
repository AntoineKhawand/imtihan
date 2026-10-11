import { expect, it } from "vitest";
import { buildGenerateSystemPrompt, buildRegenerateExercisePrompt } from "@/lib/prompts/generate";
import { buildVariantExamSystemPrompt } from "@/lib/prompts/variantExam";
import type { ExamContext } from "@/types/exam";
const context: ExamContext = {curriculumId:"ib",levelId:"dp2",subject:"physics",chapterIds:[],language:"english",examType:"final",duration:60,totalPoints:20,exerciseCount:2,difficultyMix:{easy:0,medium:0,hard:1}};
it.each(["english","french","arabic"] as const)("guards given data and visual answer leaks across generation and regeneration in %s", language => {
  const ctx={...context,language};
  for (const prompt of [buildGenerateSystemPrompt(ctx),buildRegenerateExercisePrompt(ctx,1,"hard","hard"),buildVariantExamSystemPrompt(ctx)]) {
    expect(prompt).toContain("Never give the target answer");
    expect(prompt).toContain("majority of marks depend on connected reasoning");
    expect(prompt).toContain("Preserve teacher-supplied measurements");
    expect(prompt).toContain("do not display the completed curve");
    expect(prompt).toContain("exactly one correct answer");
    expect(prompt).toContain("enough independent information");
    expect(prompt).toContain("Respect an explicit teacher choice of Easy or Medium");
  }
});
