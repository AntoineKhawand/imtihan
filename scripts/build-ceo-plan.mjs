#!/usr/bin/env node
// Builds Imtihan-CEO-Operating-Plan.docx from CEO_OPERATING_PLAN.md.
//
// This is the "update the CEO plan" workflow the founder asked for: edit
// CEO_OPERATING_PLAN.md (the tracked, readable source), then run
//   node scripts/build-ceo-plan.mjs
// to regenerate the polished .docx. Wired into the nightly automation prompt
// so routine updates happen automatically; can also be run by hand anytime.
//
// Supports a small markdown subset on purpose (this is a structured business
// document, not general prose): #/##/### headings, plain paragraphs, "- "
// bullet lists, "- [x]"/"- [ ]" checklist items, "1. " numbered lists, and
// GitHub-style "|a|b|" pipe tables. Bold (**text**) and inline code (`text`)
// are rendered within paragraph/list/table-cell text. Unsupported markdown
// falls back to a plain paragraph rather than throwing, so a stray line
// never breaks the whole build.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  BorderStyle,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_MD = path.join(REPO_ROOT, "CEO_OPERATING_PLAN.md");
const OUTPUT_DOCX = path.join(
  process.env.USERPROFILE ?? path.join(REPO_ROOT, ".."),
  "Downloads",
  "Imtihan-CEO-Operating-Plan.docx"
);

const ACCENT = "1A5E3F"; // Imtihan's emerald accent — CLAUDE.md §8

function parseInlineRunOptions(text) {
  // Splits on **bold**, *italic*, and `code` spans, preserving plain-text
  // segments. Returns plain option objects (not TextRun instances) so
  // callers can merge in their own overrides (color, italics, ...) without
  // needing to read a constructed TextRun's options back out — docx-js's
  // TextRun doesn't expose its config as a public `.options` property, so
  // spreading one silently produces an empty run (no `text`), which is what
  // caused every heading and every table header cell to render as blank.
  // **bold** is tried before *italic* in the alternation (both anchored at
  // the same `\*`), so a bold span is never swallowed by the italic pattern.
  const runs = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index) });
    if (m[2] !== undefined) runs.push({ text: m[2], bold: true });
    else if (m[4] !== undefined) runs.push({ text: m[4], italics: true });
    else if (m[6] !== undefined) runs.push({ text: m[6], font: "Consolas" });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs.length > 0 ? runs : [{ text }];
}

function parseInlineRuns(text, overrides = {}) {
  return parseInlineRunOptions(text).map((opts) => new TextRun({ ...opts, ...overrides }));
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableSeparator(line) {
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(line.trim());
}

function buildTable(rows) {
  const colCount = rows[0].length;
  const colWidth = Math.floor(9026 / colCount); // ~6.27" usable width at 1" margins
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth),
    rows: rows.map(
      (cells, rowIndex) =>
        new TableRow({
          children: cells.map(
            (cell) =>
              new TableCell({
                width: { size: colWidth, type: WidthType.DXA },
                shading: rowIndex === 0 ? { type: ShadingType.CLEAR, fill: ACCENT } : undefined,
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    children: parseInlineRuns(cell, rowIndex === 0 ? { bold: true, color: "FFFFFF" } : {}),
                  }),
                ],
              })
          ),
        })
    ),
  });
}

function convertMarkdownToDocxChildren(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const children = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === "") {
      i++;
      continue;
    }

    // Tables: a line starting with "|", followed by a separator line.
    if (line.startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const tableLines = [line];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        tableLines.push(lines[j].trim());
        j++;
      }
      const rows = tableLines.map(parseTableRow);
      children.push(buildTable(rows));
      children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      i = j;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      children.push(
        new Paragraph({
          heading:
            level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 140 },
          children: parseInlineRuns(text, level <= 2 ? { color: ACCENT } : {}),
        })
      );
      i++;
      continue;
    }

    // Checklist items: "- [x] text" / "- [ ] text"
    const checkMatch = line.match(/^-\s+\[( |x|X)\]\s+(.*)$/);
    if (checkMatch) {
      const checked = checkMatch[1].toLowerCase() === "x";
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: checked ? "☑ " : "☐ ", bold: true }),
            ...parseInlineRuns(checkMatch[2]),
          ],
        })
      );
      i++;
      continue;
    }

    // Bullet list items: "- text"
    const bulletMatch = line.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      children.push(new Paragraph({ bullet: { level: 0 }, children: parseInlineRuns(bulletMatch[1]) }));
      i++;
      continue;
    }

    // Numbered list items: "1. text" — rendered as a plain indented bullet
    // (docx-js numbering config is overkill for a doc this size).
    const numberedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      children.push(new Paragraph({ bullet: { level: 0 }, children: parseInlineRuns(numberedMatch[1]) }));
      i++;
      continue;
    }

    // Blockquote-as-note: "> text"
    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
          children: parseInlineRuns(quoteMatch[1], { italics: true }),
        })
      );
      i++;
      continue;
    }

    // Plain paragraph
    children.push(new Paragraph({ spacing: { after: 160 }, children: parseInlineRuns(line) }));
    i++;
  }

  return children;
}

function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.*)$/m);
  return m ? m[1] : "Imtihan — CEO Operating Plan";
}

async function main() {
  if (!fs.existsSync(SOURCE_MD)) {
    console.error(`Source not found: ${SOURCE_MD}`);
    process.exit(1);
  }
  const markdown = fs.readFileSync(SOURCE_MD, "utf-8");
  const bodyChildren = convertMarkdownToDocxChildren(markdown);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
        },
        children: bodyChildren,
      },
    ],
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
        heading1: { run: { size: 32, bold: true, color: ACCENT } },
        heading2: { run: { size: 26, bold: true, color: ACCENT } },
        heading3: { run: { size: 23, bold: true } },
      },
    },
    title: extractTitle(markdown),
  });

  const buffer = await Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(OUTPUT_DOCX), { recursive: true });
  fs.writeFileSync(OUTPUT_DOCX, buffer);
  console.log(`Wrote ${OUTPUT_DOCX} (${buffer.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
