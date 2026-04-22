import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";

const RequestSchema = z.object({
  context: z.object({
    curriculumId: z.string(),
    levelId: z.string(),
    subject: z.string(),
    language: z.string(),
    duration: z.number(),
    totalPoints: z.number(),
    examType: z.string(),
  }),
  templateId: z.string().optional().default("classic"),
  exercises: z.array(z.object({
    number: z.number(),
    type: z.string(),
    difficulty: z.string(),
    points: z.number(),
    statement: z.string(),
    subQuestions: z.array(z.object({
      label: z.string(),
      statement: z.string(),
      points: z.number(),
    })).nullable().optional(),
    solution: z.object({
      finalAnswer: z.string(),
      methodology: z.string(),
    }),
  })),
  format: z.enum(["word", "pdf"]),
  header: z.object({
    schoolName: z.string().optional(),
    className: z.string().optional(),
    teacherName: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
});

const SUBJECT_LABELS: Record<string, string> = {
  mathematics: "Mathématiques",
  physics: "Physique",
  chemistry: "Chimie",
  biology: "Biologie",
  svt: "SVT",
  informatics: "Informatique",
};

function cleanLatexForWord(text: string): string {
  let cleaned = text;
  
  // Remove math mode markers
  cleaned = cleaned.replace(/\$\$/g, "");
  cleaned = cleaned.replace(/\$/g, "");
  
  // Replace common text blocks
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\text\s+/g, ""); // fallback for missing braces
  
  // Replace common Greek letters & symbols
  const latexMap: Record<string, string> = {
    "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\Delta": "Δ", "\\delta": "δ",
    "\\epsilon": "ε", "\\theta": "θ", "\\lambda": "λ", "\\mu": "μ", "\\pi": "π",
    "\\rho": "ρ", "\\sigma": "σ", "\\Omega": "Ω", "\\omega": "ω",
    "\\circ": "°", "\\times": "×", "\\cdot": "·", "\\approx": "≈", "\\neq": "≠",
    "\\leq": "≤", "\\geq": "≥", "\\infty": "∞", "\\rightarrow": "→", "\\implies": "⇒",
    "\\rightleftharpoons": "⇌", "\\pm": "±"
  };
  
  for (const [key, val] of Object.entries(latexMap)) {
    cleaned = cleaned.split(key).join(val);
  }
  
  // Replace fractions: \frac{A}{B} -> A/B
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");
  
  // Replace square roots
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
  
  // Remove backslashes from remaining basic commands
  cleaned = cleaned.replace(/\\(sin|cos|tan|ln|log|exp)/g, "$1");
  
  return cleaned;
}

/**
 * Parses a string with markdown-like formatting for bold, italics,
 * and LaTeX-style subscripts/superscripts, and returns an array of
 * `TextRun` objects for `docx`.
 *
 * - `**text**` becomes bold.
 * - `*text*` becomes italic.
 * - `_{text}` or `_c` becomes subscript.
 * - `^{text}` or `^c` becomes superscript.
 * - `text` is stripped of backticks.
 */
function createFormattedTextRuns(
  text: string,
  baseOptions: { size: number; color?: string; font?: string }
): TextRun[] {
  const runs: TextRun[] = [];
  const cleanText = cleanLatexForWord(text.replace(/`(.*?)`/g, '$1'));

  // Regex to capture formatting.
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_\{(.+?)\})|(\^\{(.+?)\})|_(.)|\^(.)|([^_*^]+)/g;

  let match;
  while ((match = regex.exec(cleanText)) !== null) {
    const [ , , boldText, , italicText, , subBrace, , supBrace, subSingle, supSingle, plainText ] = match;

    if (boldText) {
      runs.push(new TextRun({ ...baseOptions, text: boldText, bold: true }));
    } else if (italicText) {
      runs.push(new TextRun({ ...baseOptions, text: italicText, italics: true }));
    } else if (subBrace) {
      runs.push(new TextRun({ ...baseOptions, text: subBrace, subScript: true }));
    } else if (supBrace) {
      runs.push(new TextRun({ ...baseOptions, text: supBrace, superScript: true }));
    } else if (subSingle) {
      runs.push(new TextRun({ ...baseOptions, text: subSingle, subScript: true }));
    } else if (supSingle) {
      runs.push(new TextRun({ ...baseOptions, text: supSingle, superScript: true }));
    } else if (plainText) {
      runs.push(new TextRun({ ...baseOptions, text: plainText }));
    }
  }

  return runs;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { context, templateId, exercises, format, header } = parsed.data;

    if (format === "word") {
      const buffer = await generateWordDocument(context, templateId, exercises, header ?? {});
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="Imtihan_${context.subject}_${context.levelId}.docx"`,
        },
      });
    }

    // PDF — placeholder: redirect to word for now, full PDF in v1.1
    const buffer = await generateWordDocument(context, templateId, exercises, header ?? {});
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Imtihan_${context.subject}_${context.levelId}.docx"`,
      },
    });
  } catch (error) {
    console.error("[/api/export]", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

async function generateWordDocument(
  context: z.infer<typeof RequestSchema>["context"],
  templateId: string,
  exercises: z.infer<typeof RequestSchema>["exercises"],
  header: z.infer<typeof RequestSchema>["header"]
): Promise<Buffer> {
  const subjectName = SUBJECT_LABELS[context.subject] ?? context.subject;
  const lang = context.language === "french" ? "fr" : "en";
  const exerciseWord = lang === "fr" ? "Exercice" : "Exercise";

  // Template configuration
  const isModern = templateId === "modern";
  const isFormal = templateId === "formal";

  const fontBody = isModern ? "Arial" : isFormal ? "Times New Roman" : "Georgia";
  const fontHeader = isModern ? "Arial" : isFormal ? "Times New Roman" : "Georgia";
  const primaryColor = isModern ? "2563eb" : isFormal ? "000000" : "1a5e3f"; // Blue for modern, Black for formal, Green for classic
  const textColor = isModern ? "1f2937" : isFormal ? "000000" : "333333";
  const metaColor = isModern ? "6b7280" : isFormal ? "000000" : "666666";

  const children: Paragraph[] = [];

  // ─── Header ────────────────────────────────────────────────
  if (header?.schoolName) {
    children.push(new Paragraph({
      children: [new TextRun({ text: header.schoolName, bold: true, size: 24, font: fontHeader, color: primaryColor })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }));
  }

  children.push(new Paragraph({
    children: [new TextRun({
      text: `${subjectName} — ${context.levelId}`,
      bold: true,
      size: 28,
      font: fontHeader,
      color: textColor,
    })],
    alignment: AlignmentType.CENTER,
    heading: HeadingLevel.HEADING_1,
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ text: `Durée: ${context.duration} min`, size: 20, font: fontBody, color: metaColor }),
      new TextRun({ text: "    |    ", size: 20, font: fontBody, color: metaColor }),
      new TextRun({ text: `Total: ${context.totalPoints} points`, size: 20, font: fontBody, color: metaColor }),
      header?.date ? new TextRun({ text: `    |    ${header.date}`, size: 20, font: fontBody, color: metaColor }) : new TextRun(""),
    ],
    alignment: AlignmentType.CENTER,
  }));

  children.push(new Paragraph({ text: "" })); // spacer
  children.push(new Paragraph({
    border: isFormal ? undefined : { bottom: { style: BorderStyle.SINGLE, size: 6, color: primaryColor } },
    text: "",
  }));
  if (isFormal) {
    children.push(new Paragraph({
      border: { bottom: { style: BorderStyle.DOUBLE, size: 12, color: "000000" } },
      text: "",
    }));
  }
  children.push(new Paragraph({ text: "" }));

  // ─── Exercises ─────────────────────────────────────────────
  for (const ex of exercises) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${exerciseWord} ${isFormal ? String(ex.number) + "." : ex.number}`, bold: true, size: 24, color: primaryColor, font: fontHeader }),
        new TextRun({ text: `  (${ex.points} points)`, size: 20, color: metaColor, font: fontBody }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    }));

    children.push(new Paragraph({
      children: createFormattedTextRuns(ex.statement, { size: 22, font: fontBody, color: textColor }),
      spacing: { after: 120 },
    }));

    if (ex.subQuestions) {
      for (const sq of ex.subQuestions) {
        const subQuestionRuns: TextRun[] = [
          new TextRun({ text: `${sq.label}  `, bold: true, size: 22, font: fontBody, color: textColor }),
          ...createFormattedTextRuns(sq.statement, { size: 22, font: fontBody, color: textColor }),
          new TextRun({ text: `  (${sq.points} pts)`, size: 20, color: metaColor, font: fontBody }),
        ];
        children.push(new Paragraph({
          children: subQuestionRuns,
          indent: { left: 720 },
          spacing: { after: 80 },
        }));
      }
    }

    children.push(new Paragraph({ text: "" }));
  }

  // ─── Corrigé ──────────────────────────────────────────────
  children.push(new Paragraph({
    pageBreakBefore: true,
    children: [new TextRun({ text: lang === "fr" ? "CORRIGÉ" : "ANSWER KEY", bold: true, size: 28, font: fontHeader, color: textColor })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({ text: "" }));

  for (const ex of exercises) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `${exerciseWord} ${isFormal ? String(ex.number) + "." : ex.number}`, bold: true, size: 24, color: primaryColor, font: fontHeader })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: lang === "fr" ? "Réponse: " : "Answer: ", bold: true, size: 22, font: fontBody, color: textColor }),
        ...createFormattedTextRuns(ex.solution.finalAnswer, { size: 22, font: fontBody, color: textColor }),
      ],
      spacing: { after: 80 },
    }));

    const methodLines = ex.solution.methodology.split("\n");
    for (const line of methodLines) {
      children.push(new Paragraph({
        children: createFormattedTextRuns(line, { size: 20, color: metaColor, font: fontBody }),
        spacing: { after: 40 },
      }));
    }
    children.push(new Paragraph({ text: "" }));
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
