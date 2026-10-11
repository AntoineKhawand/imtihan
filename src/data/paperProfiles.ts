import type { ExamContext } from "@/types/exam";
import type { PaperComposition } from "@/lib/schemas/sourceDocument";

export interface PaperProfile {
  id: string; label: string; curriculumId: string; subject: string; levelIds: string[];
  duration: number; sourceUrl: string; reference: string; scope: string; verifiedOn: string;
  composition: PaperComposition;
}
const crdp = "https://www.crdp.org/sites/default/files/";
const ibGuide = "https://www.ibo.org/globalassets/new-structure/university-admission/pdfs/subject-guides/mathematics-analysis-approaches-guide.pdf";
const section = (title: string, marks: number[], answerCount = marks.length, instructions = "") => ({ title, marks, answerCount, instructions });
export const PAPER_PROFILES: PaperProfile[] = [
  { id: "lb-gs-math-2024", label: "Bac Libanais · General Sciences · Math · 2024", curriculumId: "bac-libanais", subject: "mathematics", levelIds: ["terminale-s"], duration: 180,
    sourceUrl: crdp + "SG_Math_2024_1_Fr.pdf", reference: "CRDP, General Sciences mathematics, ordinary session 2024", verifiedOn: "2026-10-11",
    scope: "2024 composition: 7 offered questions, answer 5, 4 marks each. Select this track deliberately; not a universal Lebanese format.",
    composition: { origin: "profile", profileId: "lb-gs-math-2024", title: "Bac Libanais · Sciences générales · Mathématiques · Entraînement", instructions: ["Calculatrice non programmable, sans stockage de données ni tracé graphique. Indiquer clairement les cinq exercices choisis."], sections: [section("Exercices au choix", Array(7).fill(4), 5)], footerText: "Imtihan · Entraînement", answerSpaceLines: 0 } },
  { id: "lb-ls-math-2024", label: "Bac Libanais · Life Sciences · Math · 2024", curriculumId: "bac-libanais", subject: "mathematics", levelIds: ["terminale-s"], duration: 90,
    sourceUrl: crdp + "SV_Math_2024_1_Fr.pdf", reference: "CRDP, Life Sciences mathematics, ordinary session 2024", verifiedOn: "2026-10-11",
    scope: "2024 composition: 6 offered questions, answer 4, 5 marks each. The curriculum groups science tracks under Terminale S; review Life Sciences chapters yourself.",
    composition: { origin: "profile", profileId: "lb-ls-math-2024", title: "Bac Libanais · Sciences de la vie · Mathématiques · Entraînement", instructions: ["Calculatrice non programmable, sans stockage de données ni tracé graphique. Indiquer clairement les quatre exercices choisis."], sections: [section("Exercices au choix", Array(6).fill(5), 4)], footerText: "Imtihan · Entraînement", answerSpaceLines: 0 } },
  { id: "fr-math-2026-j1", label: "Bac Français · Terminale spécialité mathématiques · 2026 J1", curriculumId: "bac-francais", subject: "mathematics", levelIds: ["terminale-fr-spe-math"], duration: 240,
    sourceUrl: "https://www.education.gouv.fr/sites/default/files/document/baccalaureat-general-2026-mathematiques-517598.pdf", reference: "Ministère de l’Éducation nationale, 26-MATJ1ME1", verifiedOn: "2026-10-11",
    scope: "This 2026 paper has four compulsory exercises, marks 5/4/6/5. These allocations are a dated reference, not a rule for every session.",
    composition: { origin: "profile", profileId: "fr-math-2026-j1", title: "Baccalauréat général · Spécialité mathématiques · Entraînement", instructions: ["Calculatrice avec mode examen actif ou sans mémoire autorisée. Présenter clairement le raisonnement et les traces de recherche."], sections: [section("Exercices", [5, 4, 6, 5])], footerText: "Imtihan · Entraînement", answerSpaceLines: 0 } },
  ...(["sl", "hl"] as const).flatMap(level => ([1, 2] as const).map(paper => {
    const id = `ib-aa-${level}-p${paper}-2021`;
    return { id, label: `IB Mathematics AA ${level.toUpperCase()} · Paper ${paper} · first assessment 2021`, curriculumId: "ib", subject: "mathematics", levelIds: [`ib-dp-math-aa-${level}`], duration: level === "sl" ? 90 : 120,
      sourceUrl: ibGuide, reference: "IB Mathematics: analysis and approaches guide, first assessment 2021", verifiedOn: "2026-10-11",
      scope: "Guide-based A/B structure and total. Individual question counts and allocations below are editable practice allocations, not fixed official counts. Not for the revised first-assessment-2029 course.",
      composition: { origin: "profile" as const, profileId: id, title: `Mathematics: analysis and approaches · ${level.toUpperCase()} · Paper ${paper} · Practice`,
        instructions: [paper === 1 ? "Calculators and other technology are not permitted." : "A graphic display calculator is required.", "Use the mathematics AA formula booklet. Show your working."],
        sections: [section("Section A", level === "sl" ? [6,6,7,7,7,7] : [8,8,9,10,10,10], undefined, "Short-response questions."), section("Section B", level === "sl" ? [13,13,14] : [18,18,19], undefined, "Extended-response questions.")], footerText: "Imtihan · Practice", answerSpaceLines: 4 } };
  })),
];
export function compatiblePaperProfiles(context: Pick<ExamContext, "curriculumId" | "subject" | "levelId">): PaperProfile[] {
  return PAPER_PROFILES.filter(p => p.curriculumId === context.curriculumId && p.subject === context.subject && p.levelIds.includes(context.levelId));
}
