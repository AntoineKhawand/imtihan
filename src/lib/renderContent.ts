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
import mermaid from "mermaid";
if (typeof window !== "undefined") {
  require("katex/contrib/mhchem/mhchem");
  mermaid.initialize({ startOnLoad: false, theme: "base" });
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
      
      // Build the row as a single string — no \n inside HTML so renderContent
      // won't convert them to <br> tags (which browsers render before the table)
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

  // Join: no \n between HTML blocks, keep \n between plain-text lines only
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
    
  return parseTables(md);
}

function handleMermaid(text: string): string {
  return text.replace(/```mermaid\n?([\s\S]*?)```/g, (match, code) => {
    return `<div class="mermaid my-4 p-4 bg-white rounded-lg border border-[var(--border)] overflow-x-auto">${code.trim()}</div>`;
  });
}

function handleGraphs(text: string): string {
  // Matches [GRAPH: description] or [VISUAL: description]
  // Renders as a styled description box — no external image service needed
  return text.replace(/\[(?:GRAPH|VISUAL):\s*(.*?)\]/g, (match, description) => {
    const desc = description.trim();
    if (!desc) return "";
    return `
      <div class="my-6 rounded-xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] overflow-hidden">
        <div class="bg-[var(--bg-subtle)] border-b border-[var(--border)] px-4 py-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">📐</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Visual Representation</span>
          </div>
          <span class="text-[9px] font-medium text-[var(--text-tertiary)] italic">Automated Sketch Description</span>
        </div>
        <div class="p-6 relative">
          <!-- Subtle Grid Background for 'Draft' feel -->
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(var(--text) 1px, transparent 1px); background-size: 20px 20px;"></div>
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-12 h-12 rounded-full bg-[var(--accent-light)] flex items-center justify-center mb-4">
              <span class="text-xl">📊</span>
            </div>
            <p class="text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto italic">
              "${desc}"
            </p>
            <div class="mt-4 pt-4 border-t border-[var(--border)] w-full max-w-xs text-[10px] text-[var(--text-tertiary)]">
              Use the <strong>Add Visual / Graph</strong> tool to convert this description into an interactive chart.
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

export function renderContent(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 1. Normalise line endings and collapse excessive newlines
  text = text
    .replace(/\\n/g, "\n") // Convert escaped backslashes to real newlines
    .replace(/\r\n/g, "\n") // Normalize Windows CRLF
    .replace(/\n\s*\n/g, "\n\n") // Normalize space-filled blank lines
    .trim();

  // Collapse 3+ newlines into just 2
  text = text.replace(/\n{3,}/g, "\n\n");

  // 2. Pre-process \ce{...}
  text = text.replace(/\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g, (match) => {
    return `$${match}$`;
  });

  // 3. Process blocks (Math, Tables, Graphs)
  // Split by display math $$...$$
  const displayParts = splitMath(text, "$$", "$$");

  let html = displayParts.map((part) => {
    if (part.kind === "math") {
      return renderKaTeX(part.content.trim(), true);
    }

    // Within text segments, process inline math $...$
    const inlineParts = splitMath(part.content, "$", "$");
    return inlineParts.map((p) => {
      if (p.kind === "math") {
        return renderKaTeX(p.content, false);
      }
      
      // Apply markdown (Tables are handled here)
      let content = applyMarkdown(p.content);
      
      // Apply Mermaid
      content = handleMermaid(content);
      
      // Apply Graphs
      content = handleGraphs(content);
      
      // Smart newline handling to avoid gaps
      // Convert to paragraphs, but preserve single newlines as <br />
      return content
        .replace(/\n\n+/g, "</p><p class=\"mt-3\">")
        .replace(/\n/g, "<br />");
    }).join("");
  }).join("");

  // Final cleanup: Wrap in paragraph and remove empty ones produced by block trimming
  html = `<p>${html}</p>`;
  html = html
    .replace(/<p class="mt-3">\s*<\/p>/g, "") // Remove empty mt-3 paragraphs
    .replace(/<p>\s*<\/p>/g, "") // Remove empty paragraphs
    .replace(/<p><br \/>/g, "<p>") // Remove leading breaks in paragraphs
    .replace(/<p>\s*<div/g, "<div") // Strip P wrapper around blocks
    .replace(/<\/div>\s*<\/p>/g, "</div>") // Strip P wrapper around blocks
    .replace(/<br \/>\s*<div/g, "<div")
    .replace(/<\/div>\s*<br \/>/g, "</div>")
    .replace(/<br \/>\s*<br \/>/g, "<br />") // Collapse double breaks
    .replace(/<\/div>\s*<p>/g, "</div><p>") // Ensure no gap between block and next p
    .replace(/<\/p>\s*<div/g, "</p><div"); // Ensure no gap between p and next block

  return html;
}
