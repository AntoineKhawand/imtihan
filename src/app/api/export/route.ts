import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { 
  Document, Packer, Paragraph, TextRun, HeadingLevel, 
  AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType,
  ImageRun
} from "docx";


/**
 * Splits text into paragraphs, tables and images.
 */
async function processContentBlocks(
  text: string, 
  baseOptions: { size: number; color?: string; font?: string; indent?: number; bidirectional?: boolean }
): Promise<(Paragraph | Table)[]> {
  const blocks: (Paragraph | Table)[] = [];
  
  // Normalise text to remove extra vertical space
  const cleanText = text.replace(/\n\n\n+/g, "\n\n").trim();
  const lines = cleanText.split("\n");
  
  let currentParagraphLines: string[] = [];
  let currentTableLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const content = currentParagraphLines.join(" ").trim();
      if (content) {
        blocks.push(new Paragraph({
          children: createFormattedTextRuns(content, baseOptions),
          spacing: { after: 120 },
          indent: baseOptions.indent ? { left: baseOptions.indent } : undefined,
          bidirectional: baseOptions.bidirectional,
          alignment: baseOptions.bidirectional ? AlignmentType.RIGHT : undefined,
        }));
      }
      currentParagraphLines = [];
    }
  };

  const flushTable = () => {
    if (currentTableLines.length > 0) {
      const rows = currentTableLines
        .filter(line => {
          const content = line.replace(/[^|:-]/g, "");
          return !/^[|\s:-]+$/.test(content);
        })
        .map(line => {
          const cells = line.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1);
          return new TableRow({
            children: cells.map(cell => new TableCell({
              children: [new Paragraph({ 
                children: createFormattedTextRuns(cell.trim(), { ...baseOptions, size: baseOptions.size - 2 }),
                alignment: baseOptions.bidirectional ? AlignmentType.RIGHT : AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                bidirectional: baseOptions.bidirectional,
              })],
              verticalAlign: AlignmentType.CENTER,
              width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
            })),
          });
        });

      if (rows.length > 0) {
        blocks.push(new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 40, bottom: 40, left: 100, right: 100 },
        }));
      }
      currentTableLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle [IMAGE: ...] / [GRAPH: ...] / [VISUAL: ...]
    // We do NOT use external image services (Pollinations etc.) — they are
    // unreliable on Vercel and cause blank images in the exported document.
    // Instead, render a clearly-labelled description box, which always works.
    const graphMatch = line.match(/\[(?:IMAGE|GRAPH|VISUAL):\s*(.*?)\]/i);
    if (graphMatch) {
      flushParagraph();
      const description = graphMatch[1].trim();
      const descriptionLabel = lang === "fr" ? "📊 Description de la figure" : lang === "ar" ? "📊 وصف الشكل" : "📊 Figure description";
      if (description) {
        blocks.push(new Paragraph({
          children: [new TextRun({ text: descriptionLabel, bold: true, size: 18, color: "1a5e3f" })],
          spacing: { before: 240, after: 60 },
        }));
        blocks.push(new Paragraph({
          children: [new TextRun({ text: description, italics: true, size: 18, color: "374151" })],
          spacing: { after: 240 },
          indent: { left: 360 },
        }));
      }
      continue;
    }

    // Handle Mermaid blocks
    if (line.startsWith("```mermaid")) {
      flushParagraph();
      let mermaidCode = "";
      i++; // Skip the ```mermaid line
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        mermaidCode += lines[i] + "\n";
        i++;
      }
      
      if (mermaidCode.trim()) {
        try {
          // Use mermaid.ink to get a PNG of the chart
          const base64Code = Buffer.from(mermaidCode.trim()).toString('base64');
          const imgRes = await fetch(`https://mermaid.ink/img/${base64Code}?type=png`);
          
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            blocks.push(new Paragraph({
              children: [
                new ImageRun({
                  type: "png",
                  data: buffer,
                  transformation: { width: 450, height: 300 },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }));
          }
        } catch (e) {
          console.error("Failed to fetch mermaid image for DOCX:", e);
          // Fallback: just show the code or a placeholder
          currentParagraphLines.push("[Diagramme Mermaid]");
        }
      }
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      currentTableLines.push(line);
    } else {
      if (currentTableLines.length > 0) {
        flushTable();
      }
      if (line === "") {
        flushParagraph();
      } else {
        currentParagraphLines.push(line);
      }
    }
  }
  flushParagraph();
  flushTable();

  return blocks;
}

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
      bareme: z.array(z.object({
        label: z.string(),
        points: z.number(),
        criterion: z.string(),
      })).optional(),
      microBareme: z.array(z.object({
        step: z.string(),
        points: z.number(),
        criterion: z.string(),
      })).optional(),
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
  
  // 1. Handle \ce{...} - Convert chemical indices to subscript notation _{x}
  cleaned = cleaned.replace(/\\ce\{([^}]+)\}/g, (_, formula) => {
    // Basic heuristic to add subscripts to numbers in chemical formulas
    return formula.replace(/([A-Z][a-z]?)(\d+)/g, "$1_{$2}");
  });
  
  // 2. Remove math mode markers
  cleaned = cleaned.replace(/\$\$/g, "");
  cleaned = cleaned.replace(/\$/g, "");
  
  // 3. Replace common text blocks and formatting
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\textbf\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\textit\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\text\s+/g, ""); 
  
  // 4. Advanced symbol mapping
  const latexMap: Record<string, string> = {
    "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\Delta": "Δ", "\\delta": "δ",
    "\\epsilon": "ε", "\\theta": "θ", "\\lambda": "λ", "\\mu": "μ", "\\pi": "π",
    "\\rho": "ρ", "\\sigma": "σ", "\\Omega": "Ω", "\\omega": "ω",
    "\\circ": "°", "\\times": "×", "\\cdot": "·", "\\approx": "≈", "\\neq": "≠",
    "\\leq": "≤", "\\geq": "≥", "\\infty": "∞", "\\rightarrow": "→", "\\implies": "⇒",
    "\\rightleftharpoons": "⇌", "\\pm": "±", "\\degree": "°", "\\parallel": "∥",
    "\\perp": "⊥", "\\forall": "∀", "\\exists": "∃", "\\in": "∈", "\\sum": "Σ",
    "\\dots": "...", "\\ldots": "...", "\\vec": "", "\\overrightarrow": ""
  };
  
  for (const [key, val] of Object.entries(latexMap)) {
    cleaned = cleaned.split(key).join(val);
  }
  
  // 5. Fractions and roots
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
  
  // 6. Cleanup remaining LaTeX commands and strip HTML tags
  cleaned = cleaned.replace(/\\(sin|cos|tan|ln|log|exp)/g, "$1");
  cleaned = cleaned.replace(/\\( )/g, " "); // escaped spaces
  cleaned = cleaned.replace(/\\{/g, "{").replace(/\\}/g, "}");
  cleaned = cleaned.replace(/<[^>]*>?/gm, ""); // Strip any accidental HTML tags (like <img>)
  cleaned = cleaned.replace(/\\/g, ""); // Remove any remaining backslashes
  
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
  baseOptions: { size: number; color?: string; font?: string; bidirectional?: boolean }
): TextRun[] {
  const { bidirectional, ...runOptions } = baseOptions;
  const runs: TextRun[] = [];
  const cleanText = cleanLatexForWord(text.replace(/`(.*?)`/g, '$1'));

  // Regex to capture formatting.
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_\{(.+?)\})|(\^\{(.+?)\})|_(.)|\^(.)|([^_*^]+)/g;

  let match;
  while ((match = regex.exec(cleanText)) !== null) {
    const [ , , boldText, , italicText, , subBrace, , supBrace, subSingle, supSingle, plainText ] = match;

    const common = { ...runOptions, rightToLeft: bidirectional };

    if (boldText) {
      runs.push(new TextRun({ ...common, text: boldText, bold: true }));
    } else if (italicText) {
      runs.push(new TextRun({ ...common, text: italicText, italics: true }));
    } else if (subBrace) {
      runs.push(new TextRun({ ...common, text: subBrace, subScript: true }));
    } else if (supBrace) {
      runs.push(new TextRun({ ...common, text: supBrace, superScript: true }));
    } else if (subSingle) {
      runs.push(new TextRun({ ...common, text: subSingle, subScript: true }));
    } else if (supSingle) {
      runs.push(new TextRun({ ...common, text: supSingle, superScript: true }));
    } else if (plainText) {
      runs.push(new TextRun({ ...common, text: plainText }));
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
    const msg = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function generateWordDocument(
  context: z.infer<typeof RequestSchema>["context"],
  templateId: string,
  exercises: z.infer<typeof RequestSchema>["exercises"],
  header: z.infer<typeof RequestSchema>["header"]
): Promise<Buffer> {
  const subjectName = SUBJECT_LABELS[context.subject] ?? context.subject;
  const lang = context.language === "french" ? "fr" : context.language === "arabic" ? "ar" : "en";
  const isArabic = lang === "ar";
  const exerciseWord = lang === "fr" ? "Exercice" : lang === "ar" ? "تمرين" : "Exercise";
  const pointsWord = lang === "ar" ? "نقاط" : "points";
  const professorWord = lang === "fr" ? "Professeur" : lang === "ar" ? "الأستاذ" : "Teacher";
  const durationWord = lang === "fr" ? "Durée" : lang === "ar" ? "المدة" : "Duration";
  const totalWord = lang === "ar" ? "المجموع" : "Total";

  // Template configuration
  const isModern = templateId === "modern";
  const isFormal = templateId === "formal";

  const fontBody = isModern ? "Arial" : isFormal ? "Times New Roman" : "Georgia";
  const fontHeader = isModern ? "Arial" : isFormal ? "Times New Roman" : "Georgia";
  const primaryColor = isModern ? "2563eb" : isFormal ? "000000" : "1a5e3f"; // Blue for modern, Black for formal, Green for classic
  const textColor = isModern ? "1f2937" : isFormal ? "000000" : "333333";
  const metaColor = isModern ? "6b7280" : isFormal ? "000000" : "666666";

  const children: (Paragraph | Table)[] = [];

  // ─── Header ────────────────────────────────────────────────
  if (header?.schoolName) {
    children.push(new Paragraph({
      children: [new TextRun({ text: header.schoolName, bold: true, size: 26, font: fontHeader, color: primaryColor, rightToLeft: isArabic })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      bidirectional: isArabic,
    }));
  }

  children.push(new Paragraph({
    children: [new TextRun({
      text: `${subjectName} — ${context.levelId}`,
      bold: true,
      size: 32,
      font: fontHeader,
      color: textColor,
      rightToLeft: isArabic,
    })],
    alignment: AlignmentType.CENTER,
    heading: HeadingLevel.HEADING_1,
    bidirectional: isArabic,
  }));

  children.push(new Paragraph({
    children: [
      new TextRun({ text: `${professorWord}: ${header?.teacherName ?? "..."}`, size: 18, font: fontBody, color: metaColor, rightToLeft: isArabic }),
      new TextRun({ text: "    |    ", size: 18, font: fontBody, color: metaColor }),
      new TextRun({ text: `${durationWord}: ${context.duration} min`, size: 18, font: fontBody, color: metaColor, rightToLeft: isArabic }),
      new TextRun({ text: "    |    ", size: 18, font: fontBody, color: metaColor }),
      new TextRun({ text: `${totalWord}: ${context.totalPoints} ${pointsWord}`, size: 18, font: fontBody, color: metaColor, rightToLeft: isArabic }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    bidirectional: isArabic,
  }));

  // Horizontal Rule
  children.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: primaryColor } },
    spacing: { after: 240 },
  }));

  // ─── Score Summary Table (Teachers love this) ──────────────
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    rows: [
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: exerciseWord, bold: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], 
            shading: { fill: "F3F4F6" },
            verticalAlign: AlignmentType.CENTER
          }),
          ...exercises.map(ex => new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: String(ex.number), bold: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })],
            verticalAlign: AlignmentType.CENTER
          })),
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Total" : lang === "ar" ? "المجموع" : "Total", bold: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })], 
            shading: { fill: "F3F4F6" },
            verticalAlign: AlignmentType.CENTER
          }),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Max" : lang === "ar" ? "الأقصى" : "Max", bold: true, size: 18 })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })],
            shading: { fill: "F9FAFB" }
          }),
          ...exercises.map(ex => new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: String(ex.points), size: 18 })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })] 
          })),
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: String(context.totalPoints), bold: true, size: 18 })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })],
            shading: { fill: "F9FAFB" }
          }),
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Note" : lang === "ar" ? "العلامة" : "Score", bold: true, size: 18 })], alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } })],
            shading: { fill: "F9FAFB" }
          }),
          ...exercises.map(() => new TableCell({ 
            children: [new Paragraph({ text: "" })] 
          })),
          new TableCell({ 
            children: [new Paragraph({ text: "", spacing: { before: 200, after: 200 } })],
            shading: { fill: "F9FAFB" }
          }),
        ]
      })
    ]
  }));

  children.push(new Paragraph({ text: "", spacing: { after: 400 } }));

  // ─── Exercises ─────────────────────────────────────────────
  for (const ex of exercises) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${exerciseWord} ${isFormal ? String(ex.number) + "." : ex.number}`, bold: true, size: 24, color: primaryColor, font: fontHeader, rightToLeft: isArabic }),
        new TextRun({ text: `  (${ex.points} ${pointsWord})`, size: 20, color: metaColor, font: fontBody, rightToLeft: isArabic }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      bidirectional: isArabic,
      alignment: isArabic ? AlignmentType.RIGHT : undefined,
    }));

    children.push(...(await processContentBlocks(ex.statement, { size: 22, font: fontBody, color: textColor, bidirectional: isArabic })));

    if (ex.subQuestions && Array.isArray(ex.subQuestions) && ex.subQuestions.length > 0) {
      for (const sq of ex.subQuestions) {
        // Handle sub-questions by merging label, statement, and points on one line if possible
        const statementBlocks = await processContentBlocks(sq.statement, { size: 22, font: fontBody, color: textColor, indent: 720, bidirectional: isArabic });
        
        if (statementBlocks.length > 0 && statementBlocks[0] instanceof Paragraph) {
          // Take the children of the first paragraph and prepend the label + append points
          const firstBlock = statementBlocks[0] as any;
          // Note: In docx, we can't easily merge existing Paragraph objects without internal access.
          // Instead, we re-parse the first line of the statement.
          const lines = sq.statement.split("\n").filter(l => l.trim());
          const firstLine = lines[0] || "";
          const remainingLines = lines.slice(1).join("\n");

          children.push(new Paragraph({
            indent: { left: 720 },
            spacing: { before: 80, after: 80 },
            bidirectional: isArabic,
            alignment: isArabic ? AlignmentType.RIGHT : undefined,
            children: [
              new TextRun({ text: `${sq.label}  `, bold: true, size: 22, font: fontBody, color: textColor, rightToLeft: isArabic }),
              ...createFormattedTextRuns(firstLine, { size: 22, font: fontBody, color: textColor, bidirectional: isArabic }),
              new TextRun({ text: `  (${sq.points} pts)`, size: 20, color: metaColor, font: fontBody, italics: true, rightToLeft: isArabic }),
            ],
          }));

          // If there were other blocks (tables, more lines), add them
          if (remainingLines.trim()) {
            children.push(...(await processContentBlocks(remainingLines, { size: 22, font: fontBody, color: textColor, indent: 720, bidirectional: isArabic })));
          }
          // If there were other non-paragraph blocks from the original statement, add them
          const nonParaBlocks = statementBlocks.slice(1).filter(b => !(b instanceof Paragraph));
          children.push(...nonParaBlocks);
        } else {
          // Fallback
          children.push(new Paragraph({
            children: [
              new TextRun({ text: `${sq.label}  `, bold: true, size: 22, font: fontBody, color: textColor, rightToLeft: isArabic }),
              new TextRun({ text: `  (${sq.points} pts)`, size: 20, color: metaColor, font: fontBody, italics: true, rightToLeft: isArabic }),
            ],
            indent: { left: 720 },
            spacing: { before: 80, after: 80 },
            bidirectional: isArabic,
            alignment: isArabic ? AlignmentType.RIGHT : undefined,
          }));
          children.push(...statementBlocks);
        }
      }
    }

    children.push(new Paragraph({ text: "" }));
  }

  // ─── Corrigé ──────────────────────────────────────────────
  const corrigWord = lang === "fr" ? "CORRIGÉ" : lang === "ar" ? "الإجابة النموذجية" : "ANSWER KEY";
  children.push(new Paragraph({
    pageBreakBefore: true,
    children: [new TextRun({ text: corrigWord, bold: true, size: 28, font: fontHeader, color: textColor, rightToLeft: isArabic })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    bidirectional: isArabic,
  }));
  children.push(new Paragraph({ text: "" }));

  for (const ex of exercises) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `${exerciseWord} ${isFormal ? String(ex.number) + "." : ex.number}`, bold: true, size: 24, color: primaryColor, font: fontHeader, rightToLeft: isArabic })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      bidirectional: isArabic,
      alignment: isArabic ? AlignmentType.RIGHT : undefined,
    }));

    // Barème table
    if (ex.solution.bareme && ex.solution.bareme.length > 0) {
      const baremeWord = lang === "fr" ? "Barème :" : lang === "ar" ? "سلم التصحيح:" : "Marking Scheme:";
      children.push(new Paragraph({
        children: [new TextRun({ text: baremeWord, bold: true, size: 20, color: primaryColor, font: fontHeader, rightToLeft: isArabic })],
        spacing: { before: 120, after: 60 },
        bidirectional: isArabic,
        alignment: isArabic ? AlignmentType.RIGHT : undefined,
      }));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Question" : lang === "ar" ? "السؤال" : "Question", bold: true, size: 18, color: primaryColor })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Points" : lang === "ar" ? "النقاط" : "Points", bold: true, size: 18, color: primaryColor })] })], width: { size: 12, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Critère d'attribution" : lang === "ar" ? "معيار التصحيح" : "Criterion", bold: true, size: 18, color: primaryColor })] })], width: { size: 73, type: WidthType.PERCENTAGE } }),
            ],
          }),
          ...ex.solution.bareme.map((b) => new TableRow({
            children: [
              new TableCell({ 
                children: [new Paragraph({ children: [new TextRun({ text: b.label, bold: true, size: 18, font: fontBody })], spacing: { before: 40, after: 40 } })],
                verticalAlign: AlignmentType.CENTER
              }),
              new TableCell({ 
                children: [new Paragraph({ children: [new TextRun({ text: String(b.points), size: 18, font: fontBody })], alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } })],
                verticalAlign: AlignmentType.CENTER
              }),
              new TableCell({ 
                children: [new Paragraph({ children: createFormattedTextRuns(b.criterion, { size: 18, font: fontBody, color: textColor, bidirectional: isArabic }), spacing: { before: 40, after: 40 }, bidirectional: isArabic })],
                verticalAlign: AlignmentType.CENTER
              }),
            ],
          })),
        ],
      }));
      children.push(new Paragraph({ text: "" }));
    }

    children.push(...(await processContentBlocks(ex.solution.finalAnswer, { size: 22, font: fontBody, color: textColor, bidirectional: isArabic })));
    const formattedMethodology = (ex.solution.methodology || "").replace(/(?<!^|[\n\r])(\*\*?(?:Étape|Step|خطوة)\s*\d+(?:\s*[:：])?)/gi, "\n\n$1");
    children.push(...(await processContentBlocks(formattedMethodology, { size: 20, color: metaColor, font: fontBody, bidirectional: isArabic })));

    // Micro-barème table
    if (ex.solution.microBareme && ex.solution.microBareme.length > 0) {
      const microWord = lang === "fr" ? "Micro-barème :" : lang === "ar" ? "سلم تنقيط تفصيلي:" : "Micro Mark Scheme:";
      children.push(new Paragraph({
        children: [new TextRun({ text: microWord, bold: true, size: 20, color: primaryColor, font: fontHeader, rightToLeft: isArabic })],
        spacing: { before: 160, after: 60 },
        bidirectional: isArabic,
        alignment: isArabic ? AlignmentType.RIGHT : undefined,
      }));
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Étape" : lang === "ar" ? "الخطوة" : "Step", bold: true, size: 18, color: primaryColor })] })], width: { size: 18, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pts", bold: true, size: 18, color: primaryColor })] })], width: { size: 10, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lang === "fr" ? "Critère observable" : lang === "ar" ? "المعيار الملاحظ" : "Observable criterion", bold: true, size: 18, color: primaryColor })] })], width: { size: 72, type: WidthType.PERCENTAGE } }),
            ],
          }),
          ...ex.solution.microBareme.map((mb) => new TableRow({
            children: [
              new TableCell({ 
                children: [new Paragraph({ children: [new TextRun({ text: mb.step, bold: true, size: 18, font: fontBody })], spacing: { before: 40, after: 40 } })],
                verticalAlign: AlignmentType.CENTER
              }),
              new TableCell({ 
                children: [new Paragraph({ children: [new TextRun({ text: String(mb.points), size: 18, font: fontBody })], alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } })],
                verticalAlign: AlignmentType.CENTER
              }),
              new TableCell({ 
                children: [new Paragraph({ children: createFormattedTextRuns(mb.criterion, { size: 18, font: fontBody, color: textColor, bidirectional: isArabic }), spacing: { before: 40, after: 40 }, bidirectional: isArabic })],
                verticalAlign: AlignmentType.CENTER
              }),
            ],
          })),
        ],
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
