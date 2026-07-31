/**
 * renderContent regression test — math rendering scenarios.
 * Replicates the key logic of renderContent.ts (splitMath + safety net)
 * WITHOUT needing KaTeX so it can run with plain Node.js.
 *
 * Run:  node test-render.mjs
 */

// ─── Replicated logic (must stay in sync with renderContent.ts) ───────────────

function splitMath(text, open, close) {
  const parts = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf(open, i);
    if (start === -1) { parts.push({ kind: "text", content: text.slice(i) }); break; }
    if (start > i) parts.push({ kind: "text", content: text.slice(i, start) });
    const end = text.indexOf(close, start + open.length);
    if (end === -1) {
      // Unclosed delimiter — strip it, treat rest as plain text
      parts.push({ kind: "text", content: text.slice(start + open.length) });
      break;
    }
    parts.push({ kind: "math", content: text.slice(start + open.length, end) });
    i = end + close.length;
  }
  return parts;
}

const GREEK_RE = /\\(?:Omega|omega|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi)(?![a-zA-Z{])/;
const SUBSCRIPT_RE = /(?<![\\$\w{])([A-Za-z](?:_\{[A-Za-z0-9\s]+\}|_[A-Za-z0-9]+))/;

function applySafetyNet(content) {
  const hasBareLatex = (
    content.includes('\\ce{') ||
    content.includes('\\text{') ||
    /\\(?:vec|overrightarrow|hat|tilde|bar|frac|sqrt|boxed)\{/.test(content) ||
    GREEK_RE.test(content) ||
    SUBSCRIPT_RE.test(content)
  );
  if (!hasBareLatex) return content;

  // \frac with two brace groups
  content = content.replace(
    /(\\frac\{(?:[^{}]|\{[^{}]*\})*\}\{(?:[^{}]|\{[^{}]*\})*\})/g, '$$$1$$'
  );
  // Single-brace commands
  content = content.replace(
    /(\\(?:ce|text|vec|overrightarrow|hat|tilde|bar|sqrt|boxed)\{(?:[^{}]|\{[^{}]*\})*\})/g, '$$$1$$'
  );
  // Bare Greek letters
  content = content.replace(
    /(\\(?:Omega|omega|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi)(?![a-zA-Z{]))/g,
    '$$$1$$'
  );
  // Subscripted variables (exclude those inside \cmd{...} via { in lookbehind)
  content = content.replace(
    /(?<![\\$\w{])([A-Za-z](?:_\{[A-Za-z0-9\s]+\}|_[A-Za-z0-9]+))(?![A-Za-z$])/g,
    '$$$1$$'
  );
  return content;
}

function renderSimple(raw) {
  const text = raw.replace(/\\n/g, "\n");
  const displayParts = splitMath(text, "$$", "$$");
  return displayParts.map(part => {
    if (part.kind === "math") return `[DISPLAY:${part.content.trim()}]`;
    const inlineParts = splitMath(part.content, "$", "$");
    return inlineParts.map(p => {
      if (p.kind === "math") return `[MATH:${p.content}]`;
      const fixed = applySafetyNet(p.content);
      if (fixed !== p.content) {
        // safety net kicked in — re-split
        return splitMath(fixed, "$", "$").map(rp =>
          rp.kind === "math" ? `[MATH:${rp.content}]` : `[TEXT:${rp.content}]`
        ).join("");
      }
      return `[TEXT:${p.content}]`;
    }).join("");
  }).join("");
}

// ─── Test cases ──────────────────────────────────────────────────────────────

const TESTS = [
  {
    name: "1. User-reported: Z_0 with \\text{} and trailing $",
    input: `Z_0 = $R = 50$ \\text{ Ω}$`,
    desc: "Z_0 outside $, \\text{Ω} gets separated by phantom 3rd $"
  },
  {
    name: "2. Colon prefix variant",
    input: `:Z_0 = $R = 50$ \\text{ Ω}$`,
    desc: "Same but with leading colon"
  },
  {
    name: "3. Fully wrapped (correct AI output)",
    input: `La charge est $Z_0 = R = 50\\ \\Omega$.`,
    desc: "All inside $...$ — should pass as-is"
  },
  {
    name: "4. Subscripts outside math",
    input: `La résistance R_1 = 100 Ω et R_2 = 200 Ω.`,
    desc: "R_1 and R_2 outside delimiters"
  },
  {
    name: "5. Odd $ count (unclosed block)",
    input: `Given $V = 5$ V and $I = 2$ A, then $P = VI = 10 W`,
    desc: "Last expression not closed"
  },
  {
    name: "6. \\Omega outside math",
    input: `La fréquence est $f = 1$ Hz et Z = 50 \\Omega.`,
    desc: "\\Omega after closing $"
  },
  {
    name: "7. \\ce{} without $",
    input: `La réaction: \\ce{H2O + CO2 -> H2CO3}`,
    desc: "Chemistry without delimiter"
  },
  {
    name: "8. \\frac{}{} without $",
    input: `Le rendement est \\frac{P_utile}{P_totale} × 100%`,
    desc: "\\frac with two brace groups"
  },
  {
    name: "9. Mixed good and bad (10^8)",
    input: `$E = mc^2$ where c = 3 × 10^8 m/s and $m = 0.5$ kg.`,
    desc: "10^8 has caret outside math — we don't currently wrap ^, acceptable"
  },
  {
    name: "10. Display math (correct)",
    input: `$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$`,
    desc: "Should render as DISPLAY block"
  },
  {
    name: "11. \\text{W} outside closing $",
    input: `The power is $P = 100$ \\text{W}.`,
    desc: "\\text{W} outside closing $"
  },
  {
    name: "12. \\text{rad} outside math",
    input: `$Z = R + jX$ and $\\phi = \\arctan(X/R)$ in \\text{rad}.`,
    desc: "\\text{rad} outside math"
  },
  {
    name: "13. Derivatives (correct)",
    input: `La dérivée est $f'(x) = 2x + 3$ et $f''(x) = 2$.`,
    desc: "Should be fine — apostrophes in math"
  },
  {
    name: "14. \\vec{} outside math",
    input: `\\vec{F} = m\\vec{a} = $0.5 \\times 10$ N`,
    desc: "\\vec{} before inline $"
  },
  {
    name: "15. m/s^2 with display + inline",
    input: `$$F_{net} = ma$$\nwhere $a = 9.8$ m/s^2.`,
    desc: "m/s^2 caret outside math — acceptable, not caught"
  },
  {
    name: "16. Subscript chain all inside $",
    input: `$U_{CE} = U_{CC} - R_C \\cdot I_C$ and $U_{BE} = 0.7$ V.`,
    desc: "All subscripts inside math — should pass"
  },
  {
    name: "17. Empty math between $$",
    input: `The voltage is $V_1 = 5 V$ and $V_2 = $ 10 V.`,
    desc: "Empty math between two adjacent $"
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

// These patterns in TEXT segments indicate a failure
function checkForFailures(rendered) {
  const issues = [];
  const textSegments = [...rendered.matchAll(/\[TEXT:([^\]]*)\]/g)].map(m => m[1]);

  for (const seg of textSegments) {
    if (/[A-Za-z]_[\w{]/.test(seg))
      issues.push(`  ⚠ subscript in TEXT: "${seg.trim()}"`);
    if (/\\[a-zA-Z]/.test(seg))
      issues.push(`  ⚠ raw LaTeX in TEXT: "${seg.trim()}"`);
    if (seg.trim() === "$" || (seg.includes("$") && seg.trim().startsWith("$") && !seg.includes("\\$")))
      issues.push(`  ⚠ stray $ in TEXT: "${seg.trim()}"`);
  }
  return issues;
}

console.log("═".repeat(70));
console.log("  renderContent regression test");
console.log("═".repeat(70));

let passed = 0, failed = 0;

for (const t of TESTS) {
  const rendered = renderSimple(t.input);
  const issues = checkForFailures(rendered);

  if (issues.length > 0) {
    failed++;
    console.log(`\n❌ FAIL  ${t.name}`);
    console.log(`   IN  : ${t.input}`);
    console.log(`   OUT : ${rendered.slice(0, 300)}`);
    issues.forEach(i => console.log(i));
  } else {
    passed++;
    console.log(`✅ PASS  ${t.name}`);
  }
}

console.log("\n" + "─".repeat(70));
console.log(`Results: ${passed} passed, ${failed} failed out of ${TESTS.length} tests`);
console.log("─".repeat(70));
