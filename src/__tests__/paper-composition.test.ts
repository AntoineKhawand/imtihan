import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { PAPER_PROFILES, compatiblePaperProfiles } from "@/data/paperProfiles";
import { applyPaper, paperTotals, paperExerciseIssues, paperProfileIssues, singleExerciseContext, sectionAt } from "@/lib/paperComposition";
import { PaperCompositionSchema, UploadIntentSchema } from "@/lib/schemas/sourceDocument";
import { documentFingerprint, generationDocument, sourceInstruction } from "@/lib/sourceDocument";
import { buildGenerateUserPrompt } from "@/lib/prompts/generate";
import { generateWordDocument } from "@/app/api/export/route";
import type { ExamContext } from "@/types/exam";

const base: ExamContext = { curriculumId: "bac-libanais", subject: "mathematics", levelId: "terminale-s", chapterIds: ["ter-math-complex"], examType: "practice", language: "french", duration: 180, exerciseCount: 4, totalPoints: 20, difficultyMix: { easy: 0, medium: 0, hard: 1 } };
const profile = PAPER_PROFILES[0];
const context = applyPaper(base, profile.composition);
const exercises = Array.from({ length: 7 }, (_, i) => ({ number: i + 1, type: "proof", difficulty: "hard", points: 4, statement: "Question", solution: { finalAnswer: "SECRET", methodology: "Méthode", bareme: [{ label: "1", points: 4, criterion: "Raisonnement" }] } }));

describe("reviewed paper composition", () => {
  it("distinguishes offered marks from the candidate maximum", () => {
    expect(paperTotals(profile.composition)).toEqual({ exerciseCount: 7, totalPoints: 20, pointsPerExercise: [4,4,4,4,4,4,4] });
    expect(paperExerciseIssues(context, exercises)).toEqual([]);
    expect(paperExerciseIssues(context, exercises.slice(0, 5))).toContain("This paper requires 7 questions; 5 are present.");
    expect(paperExerciseIssues(context, [{ ...exercises[0], points: 5 }, ...exercises.slice(1)])).toContain("Question 1 must carry 4 marks.");
  });
  it("rejects unequal alternatives and impossible choices", () => {
    expect(PaperCompositionSchema.safeParse({ ...profile.composition, sections: [{ title: "Choice", marks: [4,5], answerCount: 1 }] }).success).toBe(false);
    expect(PaperCompositionSchema.safeParse({ ...profile.composition, sections: [{ title: "Choice", marks: [4], answerCount: 2 }] }).success).toBe(false);
  });
  it("validates every reference and its curriculum scope", () => {
    for (const p of PAPER_PROFILES) {
      expect(PaperCompositionSchema.safeParse(p.composition).success, p.id).toBe(true);
      expect(paperTotals(p.composition).totalPoints).toBeGreaterThan(0);
    }
    expect(compatiblePaperProfiles(base)).toHaveLength(2);
    expect(compatiblePaperProfiles({ ...base, subject: "physics" })).toEqual([]);
    expect(paperProfileIssues({ ...context, subject: "physics" })).toHaveLength(1);
    expect(sectionAt(profile.composition, 6)?.start).toBe(0);
  });
  it("retains mandatory offered allocations in the generation prompt", () => {
    const prompt = buildGenerateUserPrompt(context, "imtihan");
    expect(prompt).toContain("Generate ALL 7 offered questions");
    expect(prompt).toContain("Exercise 7 → exactly 4 points");
    expect(prompt).toContain("Traiter 5 exercice(s) sur 7");
  });
  it("scopes regeneration to one question instead of the full paper", () => {
    const single = singleExerciseContext(context, 4, ["ter-math-integrals"]);
    expect(single).toMatchObject({ exerciseCount: 1, totalPoints: 4, pointsPerExercise: [4], chapterIds: ["ter-math-integrals"] });
    expect(single.paperComposition).toBeUndefined();
  });
  it("exports real section rules, instructions, footer fields and a separate optional corrigé", async () => {
    const buffer = await generateWordDocument(context, "imtihan", exercises, {}, false);
    const zip = await JSZip.loadAsync(buffer);
    const xml = await zip.file("word/document.xml")!.async("string");
    expect(xml).toContain("Traiter 5 exercice(s) sur 7");
    expect(xml).toContain("Calculatrice non programmable");
    expect(xml).not.toContain("SECRET");
    const footer = await zip.file("word/footer1.xml")!.async("string");
    expect(footer).toContain("Imtihan");
    expect(footer).toContain("NUMPAGES");
    await expect(generateWordDocument(context, "imtihan", exercises.slice(0,5), {}, false)).rejects.toThrow("requires 7");
    const withAnswers = await JSZip.loadAsync(await generateWordDocument(context, "imtihan", exercises, {}, true));
    expect(await withAnswers.file("word/document.xml")!.async("string")).toContain("SECRET");
  });
});

describe("explicit source document purposes", () => {
  const base64 = "dGVhY2hlci1jb3Vyc2U=";
  const sourceDocument = { id: documentFingerprint(base64), name: "course.pdf", intent: { purposes: ["content", "structure"] as ("content" | "structure")[], instructions: "Keep the data" } };
  it("preserves the actual file through generation and fails clearly when missing or replaced", () => {
    const file = { name: "course.pdf", type: "application/pdf", size: 15, base64 };
    const storage = { getItem: () => JSON.stringify(file) };
    expect(generationDocument({ sourceDocument }, storage)).toEqual({ documentBase64: base64, documentMimeType: "application/pdf" });
    expect(() => generationDocument({ sourceDocument }, { getItem: () => null })).toThrow("missing or has changed");
    expect(() => generationDocument({ sourceDocument }, { getItem: () => JSON.stringify({ ...file, base64: "bmV3" }) })).toThrow("missing or has changed");
  });
  it("keeps branding-only uploads out of generation and honors purpose separation", () => {
    const source = { ...sourceDocument, intent: { purposes: ["branding"] as "branding"[], instructions: "" } };
    expect(generationDocument({ sourceDocument: source }, { getItem: () => null })).toEqual({});
    const prompt = sourceInstruction({ sourceDocument: source });
    expect(prompt).toContain("Ignore its question counts");
    expect(prompt).toContain("Only use the reviewed school header/footer");
    expect(UploadIntentSchema.safeParse({ purposes: [] }).success).toBe(false);
    expect(documentFingerprint(base64)).not.toBe(documentFingerprint("different"));
  });
});
