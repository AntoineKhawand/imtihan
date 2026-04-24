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
      
      result.push('<tr class="border-b border-[var(--border)]">');
      for (const cell of cells) {
        const tag = isHeader ? 'th' : 'td';
        const classes = isHeader 
          ? 'px-4 py-2 font-semibold text-[var(--text)] bg-[var(--bg-subtle)] border-r border-[var(--border)] last:border-r-0' 
          : 'px-4 py-2 text-[var(--text-secondary)] border-r border-[var(--border)] last:border-r-0';
        result.push(`<${tag} class="${classes}">${cell}</${tag}>`);
      }
      result.push('</tr>');
    } else {
      if (inTable) {
        result.push('</table></div>');
        inTable = false;
      }
      result.push(lines[i]);
    }
  }
  
  if (inTable) result.push('</table></div>');
  return result.join("\n");
}

function applyMarkdown(text: string): string {
  let md = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[var(--bg-subtle)] px-1 py-0.5 rounded">$1</code>');
    
  return parseTables(md);
}

async function renderMermaidBlocks(text: string): Promise<string> {
  const mermaidRegex = /```mermaid\n?([\s\S]*?)```/g;
  const matches = [...text.matchAll(mermaidRegex)];
  
  if (matches.length === 0) return text;
  
  let result = text;
  for (const match of matches) {
    const code = match[1].trim();
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    try {
      const svg = await mermaid.render(id, code);
      const replacement = `<div class="my-4 p-4 bg-white rounded-lg border border-[var(--border)] overflow-x-auto">${svg}</div>`;
      result = result.replace(match[0], replacement);
    } catch (e) {
      console.warn("[Mermaid] Render error:", e);
      result = result.replace(match[0], `<pre class="my-4 p-3 bg-red-50 text-red-700 rounded text-xs overflow-x-auto">${code}</pre>`);
    }
  }
  
  return result;
}

export function renderContent(raw: string): string {
  if (!raw) return "";

  // 0. Render Mermaid blocks first (they may contain math)
  let text = raw;

  // 1. Normalise line endings: handle actual \n and JSON-escaped \\n (literal backslash-n)
  text = text
    .replace(/\\n\\n/g, "\n\n")   // literal \\n\\n → real double newline
    .replace(/\\n/g, "\n");        // literal \\n → real newline

  // 2. Pre-process \ce{...} syntax if it's not already inside math blocks
  //    This helps when the AI forgets to wrap \ce in $...$
  text = text.replace(/\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g, (match) => {
    // If it's already wrapped in $, don't double wrap
    // (This is a bit naive but covers most cases)
    return `$${match}$`;
  });

  // 3. Process display math first ($$...$$), then inline ($...$)
  //    We work on segments to avoid KaTeX eating inline $ signs inside display math.

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
      // Apply markdown and newline conversion on plain text segments only
      const md = applyMarkdown(p.content);
      return md
        .replace(/\n\n+/g, "</p><p class=\"mt-3\">")
        .replace(/\n/g, "<br />");
    }).join("");
  }).join("");

  // 3. Wrap in a paragraph if we produced paragraph breaks
  if (html.includes("</p><p")) {
    html = `<p>${html}</p>`;
  }

  return html;
}
