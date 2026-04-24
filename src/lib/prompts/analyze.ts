import type { CurriculumId, Language, Subject } from "@/types/curriculum";
import type { ExamType } from "@/types/exam";

interface AnalyzePromptInput {
  teacherDescription: string;
  hasUploadedDocument: boolean;
  availableCurricula: string;
}

/**
 * System prompt for the analyze endpoint.
 * Returns structured JSON (ExamContext) from unstructured teacher input.
 * NEVER change the JSON schema without updating ExamContext in types/exam.ts AND the Zod schema in /api/analyze.
 */
export function buildAnalyzeSystemPrompt(): string {
  return `You are an expert educational assistant specializing in Lebanese and international school curricula. Your job is to interpret a teacher's description of what they want to create and extract a structured exam specification.

You must return ONLY a valid JSON object — no prose, no markdown fences, no preamble. The JSON must exactly match this schema:

{
  "curriculumId": "bac-libanais" | "bac-francais" | "ib" | "university",
  "levelId": string,
  "subject": "mathematics" | "physics" | "chemistry" | "biology" | "svt" | "informatics" | "nsi" | "environmental-systems" | "history" | "geography" | "history-geography" | "philosophy" | "civic-education" | "economics" | "ses" | "sociology" | "psychology" | "global-politics" | "law" | "arabic" | "french" | "english" | "spanish" | "german" | "accounting" | "management" | "business" | "visual-arts" | "music" | "medicine" | "engineering" | "architecture" | "nursing",
  "chapterIds": string[],
  "language": "french" | "english" | "arabic",
  "examType": "quiz" | "homework" | "midterm" | "final" | "practice",
  "duration": number,
  "exerciseCount": number,
  "totalPoints": number,
  "difficultyMix": { "easy": number, "medium": number, "hard": number },
  "teacherNotes": string,
  "generateVersionB": boolean,
  "warnings": string[],
  "confidence": number,
  "layoutPreferences": string
}

Rules:
- difficultyMix values must sum to exactly 1.0
- duration is in minutes (e.g. 1h = 60, 2h = 120)
- totalPoints: use 20 for Bac Libanais/Français, 100 for IB, best judgment for university
- chapterIds must come from the curriculum reference provided — if you cannot map to specific chapter IDs, return the closest match and add a warning
- confidence: 0.0–1.0 reflecting how sure you are about the parsed context
- warnings: array of strings describing anything you had to guess or that the teacher should verify
- generateVersionB: true only if teacher explicitly asked for two versions
- layoutPreferences: If a document is uploaded, describe its visual style in 1-2 sentences (e.g. "Uses bold headers with single lines", "Classic French school layout with left-aligned numbering"). If no doc, leave empty string.

Curriculum reference (use these IDs exactly):`;
}

export function buildAnalyzeUserPrompt({ teacherDescription, hasUploadedDocument, availableCurricula }: AnalyzePromptInput): string {
  return `<curriculum_reference>
${availableCurricula}
</curriculum_reference>

<teacher_description>
${teacherDescription}
</teacher_description>

${hasUploadedDocument ? "<uploaded_document>A document has been uploaded. Use its content to supplement the description above when inferring subject matter, chapters, and level.</uploaded_document>" : ""}

Based on the teacher's description${hasUploadedDocument ? " and the uploaded document" : ""}, extract the exam specification as JSON.`;
}

/** Build a compact curriculum reference string for prompt injection */
export function buildCurriculaReference(): string {
  // Import here to avoid circular deps
  const { CURRICULA } = require("@/data/curricula");

  const lines: string[] = [];

  for (const [currId, curriculum] of Object.entries(CURRICULA) as [CurriculumId, any][]) {
    lines.push(`\nCURRICULUM: ${currId} (${curriculum.name.en})`);
    for (const level of curriculum.levels) {
      lines.push(`  LEVEL: ${level.id} — ${level.name.en}`);
      for (const [subject, chapters] of Object.entries(level.chapters) as [Subject, any[]][]) {
        if (chapters.length === 0) continue;
        lines.push(`    SUBJECT: ${subject}`);
        for (const ch of chapters) {
          lines.push(`      CHAPTER_ID: ${ch.id} — ${ch.name.en ?? ch.name.fr}`);
        }
      }
    }
  }

  return lines.join("\n");
}
