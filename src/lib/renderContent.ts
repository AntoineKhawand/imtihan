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
      output: "html",
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
      
      // Skip separator line in HTML
      if (cells.every(c => /^[-:]+$/.test(c))) continue;
      
      const isHeader = inTable && result[result.length - 1].includes('<table');
      
      // Build the row
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

  // Join: avoid adding extra \n around HTML blocks
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
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[var(--bg-subtle)] px-1 py-0.5 rounded">$1</code>');
}

function handleGraphs(text: string): string {
  let processed = text;
  
  // 1. Handle [IMAGE: description] - Renders a live AI illustration
  const imageRegex = /\[IMAGE:\s*(.*?)\]/gi;
  processed = processed.replace(imageRegex, (_, description) => {
    const desc = description.trim();
    if (!desc) return "";
    const encoded = encodeURIComponent(desc + " academic diagram, scientific illustration, high quality, centered, white background");
    return `
      <div class="my-4 flex flex-col items-center gap-2 group">
        <div class="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] shadow-sm">
          <img 
            src="https://image.pollinations.ai/prompt/${encoded}?width=800&height=450&nologo=true&model=flux" 
            alt="${desc}"
            class="max-w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <p class="text-[10px] text-[var(--text-tertiary)] italic text-center px-4">
          AI Illustration: ${desc}
        </p>
      </div>
    `;
  });

  // 2. Handle [GRAPH: description] or [VISUAL: description] - Legacy placeholder
  const graphRegex = /\[(?:GRAPH|VISUAL):\s*(.*?)\]/gi;
  processed = processed.replace(graphRegex, (_, description) => {
    const desc = description.trim();
    if (!desc) return "";
    return `
      <div class="my-4 p-5 rounded-2xl bg-[var(--bg-subtle)] border-2 border-dashed border-[var(--border)] flex flex-col items-center gap-4 text-center group hover:border-[var(--accent)] transition-all">
        <div class="w-12 h-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:scale-110 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-bold text-[var(--text)] uppercase tracking-widest">Visual Placeholder</p>
          <p class="text-[11px] text-[var(--text-secondary)] italic max-w-sm">"${desc}"</p>
        </div>
        <p class="text-[10px] text-[var(--text-tertiary)] max-w-xs">
          Use the <strong>Add Visual / Graph</strong> tool to convert this description into an interactive chart.
        </p>
      </div>
    `;
  });

  return processed;
}

export function renderContent(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 0. Detect "naked" mermaid blocks (without backticks)
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
      const isTerminator = 
        trimmed.includes(":-") || 
        trimmed.startsWith("**") || 
        /^[0-9]\./.test(trimmed) ||
        (trimmed === "" && i + 1 < lines.length && lines[i+1].trim() !== "" && !mermaidKeywords.some(kw => lines[i+1].trim().startsWith(kw)));

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
  if (inNakedMermaid) {
    finalLines.push("```mermaid\n" + nakedMermaidCode.trim() + "\n```");
  }
  text = finalLines.join("\n");

  // 0.5 Extract mermaid blocks
  const mermaidBlocks: string[] = [];
  text = text.replace(/```mermaid\n?([\s\S]*?)```/g, (_match, code: string) => {
    const idx = mermaidBlocks.length;
    mermaidBlocks.push(code.trim());
    return `%%MERMAID_${idx}%%`;
  });

  // 1. Normalise line endings
  text = text
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  // 2. Parse Tables
  text = parseTables(text);

  // 3. Apply Markdown
  text = applyMarkdown(text);

  // 4. Handle math segments (LaTeX)
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
      return handleGraphs(p.content);
    }).join("");
  }).join("");

  // 5. Restore Mermaid graphs
  mermaidBlocks.forEach((code, i) => {
    html = html.replace(`%%MERMAID_${i}%%`, `<div class="mermaid my-6 flex justify-center bg-white p-4 rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">${code}</div>`);
  });

  // 6. FINAL POLISH
  // Convert newlines to <br/> but avoid breaking HTML structures
  // We use a safe joiner: newlines between plain text lines become <br/>,
  // newlines touching HTML tags are removed to avoid gaps.
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
      
      if (!isPrevHtml && !isCurrHtml) {
        finalHtml += "<br />";
      }
    }
    finalHtml += line;
  }

  // Final collapse of multiple breaks: allow double, collapse triple+
  return finalHtml.replace(/(<br \/>\s*){3,}/g, "<br /><br />");
}
