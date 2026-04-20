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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { context, exercises, format, header } = parsed.data;

    if (format === "word") {
      const buffer = await generateWordDocument(context, exercises, header ?? {});
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="Imtihan_${context.subject}_${context.levelId}.docx"`,
        },
      });
    }

    // PDF — placeholder: redirect to word for now, full PDF in v1.1
    const buffer = await generateWordDocument(context, exercises, header ?? {});
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
  exercises: z.infer<typeof RequestSchema>["exercises"],
  header: z.infer<typeof RequestSchema>["header"]
): Promise<Buffer> {
  const subjectName = SUBJECT_LABELS[context.subject] ?? context.subject;
  const lang = context.language === "french" ? "fr" : "en";
  const exerciseWord = lang === "fr" ? "Exercice" : "Exercise";

  const children: Paragraph[] = [];

  // ─── Header ────────────────────────────────────────────────
  if (header?.schoolName) {
    children.push(new Paragraph({
      children: [new TextRun({ text: header.schoolName, bold: true, size: 24 })],
      alignment: AlignmentType.CENTER,
    }));
  }

  children.push(new Paragraph({
    children: [new TextRun({
      text: `${subjectName} — ${context.levelId}`,
      bold: true,
      size: 28,
    })],
    alignment: AlignmentType.CENTER,
    heading: HeadingLevel.HEADING_1,
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ text: `Durée: ${context.duration} min`, size: 20 }),
      new TextRun({ text: "    |    ", size: 20 }),
      new TextRun({ text: `Total: ${context.totalPoints} points`, size: 20 }),
      header?.date ? new TextRun({ text: `    |    ${header.date}`, size: 20 }) : new TextRun(""),
    ],
    alignment: AlignmentType.CENTER,
  }));

  children.push(new Paragraph({ text: "" })); // spacer
  children.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1a5e3f" } },
    text: "",
  }));
  children.push(new Paragraph({ text: "" }));

  // ─── Exercises ─────────────────────────────────────────────
  for (const ex of exercises) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${exerciseWord} ${ex.number}`, bold: true, size: 24, color: "1a5e3f" }),
        new TextRun({ text: `  (${ex.points} points)`, size: 20, color: "666666" }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    }));

    // Strip basic markdown from statement
    const plainStatement = ex.statement
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1");

    children.push(new Paragraph({
      children: [new TextRun({ text: plainStatement, size: 22 })],
      spacing: { after: 120 },
    }));

    if (ex.subQuestions) {
      for (const sq of ex.subQuestions) {
        const plainSQ = sq.statement.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${sq.label}  `, bold: true, size: 22 }),
            new TextRun({ text: plainSQ, size: 22 }),
            new TextRun({ text: `  (${sq.points} pts)`, size: 20, color: "888888" }),
          ],
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
    children: [new TextRun({ text: lang === "fr" ? "CORRIGÉ" : "ANSWER KEY", bold: true, size: 28 })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }));
  children.push(new Paragraph({ text: "" }));

  for (const ex of exercises) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `${exerciseWord} ${ex.number}`, bold: true, size: 24, color: "1a5e3f" })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: lang === "fr" ? "Réponse: " : "Answer: ", bold: true, size: 22 }),
        new TextRun({ text: ex.solution.finalAnswer.replace(/\*\*(.*?)\*\*/g, "$1"), size: 22 }),
      ],
      spacing: { after: 80 },
    }));

    const methodLines = ex.solution.methodology.split("\n");
    for (const line of methodLines) {
      children.push(new Paragraph({
        children: [new TextRun({ text: line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1"), size: 20, color: "444444" })],
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
