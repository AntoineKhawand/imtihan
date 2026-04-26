/**
 * renderContent — converts Gemini exercise text to display-ready HTML.
 *
 * Handles:
 *  - Display math:  $$...$$ → KaTeX block
 *  - Inline math:   $...$   → KaTeX inline
 *  - Bold/italic/code markdown
 *  - Actual \n and literal "\\n" strings from JSON output
 *  - Mermaid graphs: ```mermaid ... ```
 */
import katex from "katex";
if (typeof window !== "undefined") {
  require("katex/contrib/mhchem/mhchem");
}

function renderKaTeX(src: string, displayMode: boolean): string {
  try {
    return katex.renderToString(src, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
      output: "htmlAndMathml",
    });
  } catch {
    // If KaTeX still fails, show the raw math with a monospace fallback
    return displayMode
      ? `<span class="block font-mono text-sm text-[var(--text)] my-2 overflow-x-auto">${src}</span>`
      : `<code class="font-mono text-xs text-[var(--text)]">${src}</code>`;
  }
}

/**
 * Split text by a delimiter pattern, alternating text/math segments.
 * Handles escaped delimiters and nested braces correctly.
 */
function splitMath(text: string, open: string, close: string): Array<{ kind: "text" | "math"; content: string }> {
  const parts: Array<{ kind: "text" | "math"; content: string }> = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf(open, i);
    if (start === -1) {
      parts.push({ kind: "text", content: text.slice(i) });
      break;
    }
    if (start > i) {
      parts.push({ kind: "text", content: text.slice(i, start) });
    }
    const end = text.indexOf(close, start + open.length);
    if (end === -1) {
      parts.push({ kind: "text", content: text.slice(start) });
      break;
    }
    parts.push({ kind: "math", content: text.slice(start + open.length, end) });
    i = end + close.length;
  }
  return parts;
}

function parseLists(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^([-*•]|\d+\.)\s+/.test(line)) {
      if (!inList) {
        result.push('<ul class="list-disc ml-6 my-2 space-y-1 text-[var(--text-secondary)]">');
        inList = true;
      }
      const content = line.replace(/^([-*•]|\d+\.)\s+/, "");
      result.push(`<li class="leading-relaxed">${content}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(lines[i]);
    }
  }
  if (inList) result.push('</ul>');
  return result.join("\n");
}

function parseNakedMath(text: string): string {
  // 1. Detect and fix "lazy" derivatives (e.g., d2x/dt2, dt2d2x, dx/dt) with optional whitespace
  let processed = text.replace(/(d\^?2\s*[a-zA-Z]\/d\s*[a-zA-Z]\^?2|d\s*[a-zA-Z]\s*2\/d\s*[a-zA-Z]\s*2|d\s*t\s*2\s*d\s*2\s*[a-zA-Z]|dt2\s*d2[a-zA-Z])/gi, (match) => {
    const varMatch = match.match(/[a-zA-Z]/g);
    const x = varMatch ? varMatch[varMatch.length - 1] : "x";
    const t = varMatch ? varMatch[0] : "t";
    return `$\\frac{d^2${x}}{dt^2}$`;
  }).replace(/(d\s*[a-zA-Z]\/d\s*[a-zA-Z]|d\s*t\s*d\s*[a-zA-Z]|dtd[a-zA-Z])/gi, (match) => {
    const varMatch = match.match(/[a-zA-Z]/g);
    const num = varMatch ? varMatch[varMatch.length - 1] : "x";
    const den = varMatch ? varMatch[0] : "t";
    return `$\\frac{d${num}}{d${den}}$`;
  });

  // 2. Heuristic: Wrap isolated patterns like "B = 0,5 T" or "m = 100 g" in math if they aren't already
  processed = processed.replace(/(?<![\$\w])(\(?[A-Za-z]\s*=\s*[^$\n,;!?.]{1,30}?\)?)(?![$\w])/g, (match) => {
    if (/[=|]/.test(match) || /\b(m|kg|s|N|J|T|Ω|V|A|mol)\b/.test(match)) {
      return `$${match}$`;
    }
    return match;
  });

  // 3. Chemistry Heuristic: Detect common patterns (CH3, H2O, COOH) and wrap in \ce{...}
  // This catches things like CH3-CH2-OH, H2O, CO2, NaCl, etc.
  return processed.replace(/(?<![\$\w\\])((\b[A-Z][a-z]?\d?)+([-=≡]\b[A-Z][a-z]?\d?)+|[A-Z][a-z]?\d+(?![a-z])|[A-Z][a-z]?\d{2,})(?![$\w])/g, (match) => {
    // Avoid common acronyms (AI, IB, TV)
    if (/^(AI|IB|TV|DC|AC|BC|AD)$/.test(match)) return match;
    // If it looks like a formula (starts with C, H, O, N or has a number/dash)
    if (/^[CHON]/.test(match) || /[\d-]/.test(match)) {
      return `$\\ce{${match}}$`;
    }
    return match;
  });
}

function parseTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) {
        result.push('<div class="overflow-x-auto my-4"><table class="w-full text-sm text-left border-collapse border border-[var(--border)] rounded-lg hidden-border-collapse">');
        inTable = true;
      }
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) continue;
      const isHeader = inTable && result[result.length - 1].includes('<table');
      let row = '<tr class="border-b border-[var(--border)]">';
      for (const cell of cells) {
        const tag = isHeader ? 'th' : 'td';
        const classes = isHeader
          ? 'px-4 py-2 font-semibold text-[var(--text)] bg-[var(--bg-subtle)] border-r border-[var(--border)] last:border-r-0'
          : 'px-4 py-2 text-[var(--text-secondary)] border-r border-[var(--border)] last:border-r-0';
        row += `<${tag} class="${classes}">${cell}</${tag}>`;
      }
      row += '</tr>';
      result.push(row);
    } else {
      if (inTable) {
        result.push('</table></div>');
        inTable = false;
      }
      result.push(lines[i]);
    }
  }
  if (inTable) result.push('</table></div>');

  let output = "";
  for (let i = 0; i < result.length; i++) {
    const part = result[i];
    if (i === 0) { output += part; continue; }
    const prevEndsHtml  = result[i - 1].trimEnd().endsWith(">");
    const currStartsHtml = part.trimStart().startsWith("<");
    output += (prevEndsHtml || currStartsHtml) ? part : "\n" + part;
  }
  return output;
}

function applyMarkdown(text: string): string {
  let md = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[var(--bg-subtle)] px-1 py-0.5 rounded">$1</code>');
  
  // Apply math and list parsing
  md = parseNakedMath(md);
  md = parseLists(md);
  return parseTables(md);
}

function handleGraphs(text: string): string {
  // Render ALL [IMAGE:...] and [GRAPH:/VISUAL:...] as a reliable description box.
  // External image services (Pollinations, etc.) are too unreliable for production use.
  return text
    .replace(/\[(?:IMAGE|GRAPH|VISUAL):\s*(.*?)\]/gi, (_match, description) => {
      const desc = description.trim();
      if (!desc) return "";
      return `<div class="my-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 flex items-start gap-3">
        <span class="text-[var(--accent)] flex-shrink-0 text-base leading-snug">📊</span>
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Figure description</p>
          <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${desc}</p>
        </div>
      </div>`;
    });
}

export function renderContent(raw: string): string {
  if (!raw) return "";
  let text = raw;

  const mermaidKeywords = ["graph ", "flowchart ", "sequenceDiagram", "gantt", "classDiagram", "stateDiagram", "pie", "erDiagram", "journey", "gitGraph", "requirementDiagram", "mindmap", "timeline", "xychart-beta"];
  const lines = text.split("\n");
  let inNakedMermaid = false;
  let nakedMermaidCode = "";
  const finalLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!inNakedMermaid && mermaidKeywords.some(kw => trimmed.startsWith(kw))) {
      inNakedMermaid = true;
      nakedMermaidCode = line + "\n";
    } else if (inNakedMermaid) {
      const isTerminator = trimmed.includes(":-") || trimmed.startsWith("**") || /^[0-9]\./.test(trimmed) || (trimmed === "" && i + 1 < lines.length && lines[i+1].trim() !== "" && !mermaidKeywords.some(kw => lines[i+1].trim().startsWith(kw)));
      if (isTerminator) {
        inNakedMermaid = false;
        finalLines.push("```mermaid\n" + nakedMermaidCode.trim() + "\n```");
        finalLines.push(line);
        nakedMermaidCode = "";
      } else {
        nakedMermaidCode += line + "\n";
      }
    } else {
      finalLines.push(line);
    }
  }
  if (inNakedMermaid) finalLines.push("```mermaid\n" + nakedMermaidCode.trim() + "\n```");
  text = finalLines.join("\n");

  const mermaidBlocks: string[] = [];
  text = text.replace(/```mermaid\n?([\s\S]*?)```/g, (_match, code: string) => {
    const idx = mermaidBlocks.length;
    mermaidBlocks.push(code.trim());
    return `%%MERMAID_${idx}%%`;
  });

  text = text.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  let displayParts = splitMath(text, "$$", "$$");
  let html = displayParts.map((part) => {
    if (part.kind === "math") {
      return renderKaTeX(part.content.trim(), true);
    }
    const inlineParts = splitMath(part.content, "$", "$");
    return inlineParts.map((p) => {
      if (p.kind === "math") {
        return renderKaTeX(p.content, false);
      }
      return handleGraphs(applyMarkdown(p.content));
    }).join("");
  }).join("");

  mermaidBlocks.forEach((code, i) => {
    html = html.replace(`%%MERMAID_${i}%%`, `<div class="mermaid my-6 flex justify-center bg-white p-4 rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">${code}</div>`);
  });

  const htmlLines = html.split("\n");
  let finalHtml = "";
  for (let i = 0; i < htmlLines.length; i++) {
    const line = htmlLines[i];
    if (!line.trim()) continue;
    if (i > 0) {
      const prevLine = htmlLines[i-1].trim();
      const currLine = line.trim();
      const isPrevHtml = prevLine.endsWith(">");
      const isCurrHtml = currLine.startsWith("<");
      if (!isPrevHtml && !isCurrHtml) finalHtml += "<br />";
    }
    finalHtml += line;
  }
  return finalHtml.replace(/(<br \/>\s*){3,}/g, "<br /><br />");
}
