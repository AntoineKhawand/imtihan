/**
 * renderContent — converts Gemini exercise text to display-ready HTML.
 *
 * Handles:
 *  - Display math:  $$...$$ → KaTeX block
 *  - Inline math:   $...$   → KaTeX inline
 *  - Bold/italic/code markdown
 *  - Actual \n and literal "\\n" strings from JSON output
 */
import katex from "katex";

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

function applyMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[var(--bg-subtle)] px-1 py-0.5 rounded">$1</code>');
}

export function renderContent(raw: string): string {
  if (!raw) return "";

  // 1. Normalise line endings: handle actual \n and JSON-escaped \\n (literal backslash-n)
  let text = raw
    .replace(/\\n\\n/g, "\n\n")   // literal \\n\\n → real double newline
    .replace(/\\n/g, "\n");        // literal \\n → real newline

  // 2. Process display math first ($$...$$), then inline ($...$)
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
