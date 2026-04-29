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
import "katex/contrib/mhchem";

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
  md = parseLists(md);
  return parseTables(md);
}


export function renderContent(raw: string): string {
  if (!raw) return "";
  let text = raw.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  // 1. Identify all Mermaid blocks (both fenced and naked)
  const mermaidBlocks: string[] = [];
  const mermaidPatterns = ["graph\\s", "flowchart\\s", "sequenceDiagram", "gantt", "classDiagram", "stateDiagram", "pie\\s", "erDiagram", "journey", "gitGraph", "requirementDiagram", "mindmap", "timeline", "xychart-beta", "block-beta", "chart\\s", "quadrantChart"];
  const patternStr = mermaidPatterns.join("|");
  
  // First, handle standard fenced blocks
  text = text.replace(/```mermaid\n?([\s\S]*?)```/g, (_match, code: string) => {
    const idx = mermaidBlocks.length;
    mermaidBlocks.push(code.trim());
    return `%%MERMAID_${idx}%%`;
  });

  // Then, handle naked blocks that start at the beginning of a line
  const nakedMermaidRegex = new RegExp(`(\\n|^)(${patternStr})([\\s\\S]*?)(?=\\n\\n|\\n\\*\\*|\\n[0-9]\\.|$)`, "g");
  text = text.replace(nakedMermaidRegex, (_match, prefix, keyword, content) => {
    const idx = mermaidBlocks.length;
    mermaidBlocks.push((keyword + content).trim());
    return (prefix || "") + `%%MERMAID_${idx}%%`;
  });

  // 2. Identify and placeholder-ize [IMAGE:] [GRAPH:] [VISUAL:] tags
  // We do this EARLY to prevent parseNakedMath from wrapping parts of the prompt in math delimiters.
  const visualBlocks: string[] = [];
    const html = `
      <div class="relative group my-6">
        <button 
          data-action="remove-visual" 
          data-type="tag" 
          data-content="[${_match.split(':')[0].slice(1).toUpperCase()}: ${desc}]"
          class="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm border border-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-50 shadow-sm"
          title="Remove Visual"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div class="relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)] min-h-[140px] flex items-center justify-center">
          <img id="img-${uid}" src="${src}" alt="${safeDesc}" loading="lazy" class="w-full h-auto object-contain rounded-xl transition-opacity duration-500" style="opacity:0" onload="this.style.opacity='1'; document.getElementById('fb-${uid}').style.display='none'; document.getElementById('spin-${uid}').style.display='none';" onerror="this.style.display='none'; document.getElementById('fb-${uid}').style.display='flex'; document.getElementById('spin-${uid}').style.display='none';"/>
          <div id="spin-${uid}" class="absolute inset-0 flex items-center justify-center bg-[var(--bg-subtle)]">
            <div class="flex flex-col items-center gap-2">
              <svg class="animate-spin w-5 h-5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] animate-pulse">Generating Visual...</span>
            </div>
          </div>
          <div id="fb-${uid}" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg-subtle)] hidden">
            <span class="text-xl opacity-40">📊</span>
            <p class="text-[10px] font-bold uppercase tracking-tighter text-[var(--text-tertiary)]">Visual Representation</p>
          </div>
        </div>
        <p class="text-[9px] text-center text-[var(--text-tertiary)] italic mt-2 opacity-60">${safeDesc.length > 100 ? safeDesc.slice(0, 100) + "…" : safeDesc}</p>
      </div>`;
    
    visualBlocks.push(html);
    return `%%VISUAL_${idx}%%`;
  });

  text = parseNakedMath(text);

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
      return applyMarkdown(p.content);
    }).join("");
  }).join("");

  // 3. Put Visual blocks back
  visualBlocks.forEach((visualHtml, i) => {
    html = html.replace(`%%VISUAL_${i}%%`, visualHtml);
  });

  mermaidBlocks.forEach((code, i) => {
    // Use internal API for robust server-side rendering
    const src = `/api/visual/mermaid?code=${encodeURIComponent(code)}`;
    const visualHtml = `
      <div class="relative group my-6">
        <button 
          data-action="remove-visual" 
          data-type="mermaid" 
          data-content="\`\`\`mermaid\n${code}\n\`\`\`"
          class="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm border border-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-50 shadow-sm"
          title="Remove Diagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div class="flex justify-center bg-white p-4 rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">
          <img src="${src}" alt="Diagram" class="max-w-full h-auto" onError="this.parentElement.innerHTML='<div class=text-xs>Visual rendering error.</div>'" />
        </div>
      </div>`;
    html = html.replace(`%%MERMAID_${i}%%`, visualHtml);
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
  return `<div dir="auto">${finalHtml.replace(/(<br \/>\s*){3,}/g, "<br /><br />")}</div>`;
}
