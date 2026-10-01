import { describe, it, expect } from "vitest";
import { renderContent, fixBoxedMath } from "@/lib/renderContent";

// renderContent() has three distinct "AI content marker -> visual placeholder"
// extraction passes (Mermaid diagrams, [IMAGE:]/[GRAPH:]/[VISUAL:] tags, naked
// xychart-beta charts, and [VARIATION:]/[TABLE_VAR:] tables) that had zero
// test coverage before this file (confirmed via `npm run test:coverage`'s
// per-branch v8 report — every branch inside these blocks showed 0 hits).
// These are pure string-in/string-out transforms, same as the rest of this
// module, so they follow the same test pattern as renderContent-structure.test.ts
// and renderContent-xss.test.ts.

describe("renderContent — Mermaid diagrams", () => {
  it("converts a fenced ```mermaid code block into a diagram image, stripping the fence", () => {
    const code = "graph TD\nA-->B";
    const md = `Here is a diagram:\n\`\`\`mermaid\n${code}\n\`\`\`\nEnd.`;
    const html = renderContent(md);
    expect(html).not.toContain("```");
    expect(html).not.toContain("mermaid\n");
    expect(html).toContain(`src="/api/visual/mermaid?code=${encodeURIComponent(code)}"`);
    expect(html).toContain('alt="Diagram"');
  });

  it("converts a long-enough naked (unfenced) mermaid block that starts with a known keyword", () => {
    const md = "Consider the flow:\ngraph TD\nA-->B\nC-->D\n\nSummary follows.";
    const html = renderContent(md);
    expect(html).toContain("/api/visual/mermaid?code=");
    expect(html).toContain("Summary follows.");
    // The placeholder token itself must be fully replaced by the real
    // diagram markup, not left dangling in the output.
    expect(html).not.toContain("%%MERMAID_");
    expect(html).toContain('alt="Diagram"');
  });

  it("boundary: a naked mermaid match under 10 characters is left as plain text, not converted", () => {
    // "graph a".trim() is 7 characters — below the `rawContent.length < 10`
    // guard meant to avoid tiny accidental matches (e.g. the word "graph"
    // appearing in ordinary prose).
    const md = "See the graph a bit further down.";
    const html = renderContent(md);
    expect(html).not.toContain("/api/visual/mermaid");
  });
});

describe("renderContent — [IMAGE:]/[GRAPH:]/[VISUAL:] tags", () => {
  it("converts an [IMAGE: ...] tag into an image placeholder with an encoded prompt and a visible caption", () => {
    const html = renderContent("Diagram: [IMAGE: a red apple on a white background]");
    expect(html).toContain("/api/image/generate?prompt=");
    expect(html).toContain(encodeURIComponent("a red apple on a white background"));
    expect(html).not.toContain("%%VISUAL_");
    // Visible caption paragraph (distinct from the raw text preserved in the
    // click-to-edit `data-raw` attribute).
    expect(html).toContain(">a red apple on a white background</p>");
  });

  it("hides the caption text for an [IMAGE_PROMPT: ...] tag (isImagePrompt branch)", () => {
    const html = renderContent("[IMAGE_PROMPT: a labelled diagram of a neuron]");
    expect(html).toContain("/api/image/generate?prompt=");
    // No visible <p> caption for an *_PROMPT tag — only the shown [IMAGE:] case gets one.
    expect(html).not.toContain("a labelled diagram of a neuron</p>");
  });

  it("drops a tag with an empty/whitespace-only description instead of rendering a broken placeholder", () => {
    const html = renderContent("Before [IMAGE:    ] After");
    expect(html).not.toContain("/api/image/generate");
    expect(html).toContain("Before");
    expect(html).toContain("After");
  });

  it("truncates the visible caption to 100 characters with an ellipsis (data-raw itself keeps the full text for editing)", () => {
    const longDesc = "a".repeat(150);
    const html = renderContent(`[IMAGE: ${longDesc}]`);
    expect(html).toContain(`>${"a".repeat(100)}…</p>`);
    expect(html).not.toContain(`>${"a".repeat(101)}`);
  });
});

describe("renderContent — naked xychart-beta charts", () => {
  it("converts a naked xychart-beta block (no code fence) into an image placeholder", () => {
    const md = 'xychart-beta\n  title "Sales"\n  x-axis [jan, feb, mar]';
    const html = renderContent(md);
    expect(html).toContain("/api/image/generate?prompt=");
    expect(html).toContain(encodeURIComponent("xychart-beta"));
    expect(html).not.toContain("%%VISUAL_");
  });
});

describe("renderContent — [VARIATION:]/[TABLE_VAR:] tables", () => {
  it("renders a variation table with at least 2 labeled rows, including special symbol icons", () => {
    const md = "[VARIATION:\nx: -1, 0, 1\ny: /, ||, \\\n]";
    const html = renderContent(md);
    expect(html).toContain("<table");
    expect(html).toContain("Variation table generated from mathematical model");
    expect(html).toContain(">x<");
    expect(html).toContain(">y<");
    // "/" -> nearrow-style up arrow SVG path
    expect(html).toContain('d="m7 17 10-10"');
    // "||" -> double bar
    expect((html.match(/bg-red-400\/60/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("renders '+' / '-' cells as styled spans and '0' as a hollow-circle marker", () => {
    const md = "[VARIATION:\nf'(x): +, 0, -\n]";
    // A single labeled row is below the 2-row minimum on its own, so pair it
    // with a second row to actually trigger table rendering.
    const md2 = "[VARIATION:\nf'(x): +, 0, -\nf(x): 1, 2, 3\n]";
    const html = renderContent(md2);
    expect(html).toContain("<table");
    expect(html).toContain(`<span class="font-bold text-xl opacity-80">+</span>`);
    expect(html).toContain(`<span class="font-bold text-xl opacity-80">-</span>`);
    expect(html).toContain('rounded-full border-2');
    void md;
  });

  it("boundary: a single labeled row (below the 2-row minimum) is left as plain, unconverted text", () => {
    const html = renderContent("[VARIATION: single: a, b]");
    expect(html).not.toContain("<table");
    expect(html).toContain("VARIATION");
  });

  it("skips a malformed line with more than one ':' instead of crashing, but still renders the valid rows", () => {
    const md = "[VARIATION:\na:b:c\nx: 1, 2\ny: 3, 4\n]";
    const html = renderContent(md);
    expect(html).toContain("<table");
    expect(html).toContain(">x<");
    expect(html).toContain(">y<");
    expect(html).not.toContain(">a<");
  });
});

describe("renderContent — [PLOT: equation] tags", () => {
  // [PLOT:] is deliberately a SEPARATE mechanism from [IMAGE:]/[GRAPH:]/
  // [VISUAL:] above — those route through the AI-image endpoint
  // (/api/image/generate), which cannot accurately draw a function curve.
  // [PLOT:] instead emits a bare mount-point div (`data-mathplot`) that
  // ExerciseCard.tsx portals the real `MathPlot` (function-plot) component
  // into after render — renderContent() itself never calls any image API
  // for this tag.
  it("converts a [PLOT: equation] tag into a data-mathplot mount div, not an image request", () => {
    const html = renderContent("Solve for x: [PLOT: sin(x)]");
    expect(html).toContain('data-mathplot="sin(x)"');
    expect(html).toContain("imtihan-mathplot-mount");
    expect(html).not.toContain("/api/image/generate");
    expect(html).not.toContain("%%MATHPLOT_");
  });

  it("preserves the exact equation text for later re-mounting, including caret/exponent syntax", () => {
    const html = renderContent("[PLOT: x^2 - 3*x + 2]");
    expect(html).toContain('data-mathplot="x^2 - 3*x + 2"');
  });

  it("includes a remove button wired to the same shared remove-visual click handler as other visual blocks", () => {
    const html = renderContent("[PLOT: cos(x)]");
    expect(html).toContain('data-action="remove-visual"');
    expect(html).toContain('data-type="plot"');
    expect(html).toContain('data-content="[PLOT: cos(x)]"');
  });

  it("does not collide with a naked mermaid block immediately followed by a [PLOT:] tag", () => {
    const md = "Consider the flow:\ngraph TD\nA-->B\nC-->D\n[PLOT: x^2]";
    const html = renderContent(md);
    expect(html).toContain("/api/visual/mermaid?code=");
    expect(html).toContain('data-mathplot="x^2"');
  });
});

describe("fixBoxedMath — unbalanced braces (bail-out branch)", () => {
  it("bails out and returns the remaining text unchanged when \\boxed{ is never closed", () => {
    const input = "Answer: \\boxed{x = 5, unterminated content here";
    const result = fixBoxedMath(input);
    expect(result).toBe(input);
  });

  it("still repairs a well-formed \\boxed{} that appears before an unrelated, separately-unbalanced one later in the text", () => {
    // The first \boxed{} is well-formed and should still be fixed even though
    // a second, unrelated one later in the string is unterminated.
    const input = "First: \\boxed{$a = 1$} then broken: \\boxed{never closed";
    const result = fixBoxedMath(input);
    expect(result).toContain("$\\boxed{a = 1}$");
    expect(result).toContain("\\boxed{never closed");
  });
});
