import { describe, it, expect } from "vitest";
import { renderContent } from "@/lib/renderContent";

// ---------------------------------------------------------------------------
// renderContent.ts's internal `parseNakedMath()` (lazy-derivative, naked
// physics-equation, and naked chemistry-formula heuristics) and the inline
// "bare LaTeX safety net" block had ZERO test coverage before this file —
// confirmed via `npm run test:coverage` (lines 162-189 and 573-592 of
// src/lib/renderContent.ts showed 0 hits). Neither helper is exported, so
// both are exercised the same way the rest of this codebase's
// renderContent-*.test.ts files already do: through the public
// `renderContent()` entry point, asserting on the emitted `data-raw`
// attribute (the original LaTeX source renderKaTeX was given) rather than
// the full KaTeX-rendered markup, which is an implementation detail of the
// katex package, not of this codebase.
//
// Writing these tests surfaced three real, previously undocumented bugs in
// `parseNakedMath` — logged as BUG-062 in BUGS.md, NOT fixed here per this
// task's scope (never modify application code to make a test pass). The
// tests below assert the CURRENT (buggy) behavior, same precedent as
// BUG-056's "known gaps (documented, not fixed)" block in
// export-plot-equation.test.ts, so a future fix has something to flip green.
// ---------------------------------------------------------------------------

function rawAttrs(html: string): string[] {
  return [...html.matchAll(/data-raw="([^"]*)"/g)].map((m) => m[1]);
}

describe("parseNakedMath — lazy derivative detection (BUG-062)", () => {
  it("wraps a squared lazy-derivative pattern as a \\frac — but mislabels the variable and hardcodes the denominator (BUG-062a)", () => {
    // Intended behavior would be $\frac{d^2v}{dt^2}$ for "d2v/dt2". Actual:
    // the replacer takes the LAST letter in the whole match ("t", from "dt2")
    // as the numerator variable instead of the physical variable ("v"), and
    // always hardcodes the denominator to "dt^2" regardless of input.
    const html = renderContent("The acceleration is d2v/dt2 here.");
    expect(rawAttrs(html)).toContain("$\\frac{d^2t}{dt^2}$");
  });

  it("mangles an already-correct single-derivative notation like dx/dt into \\frac{dt}{dd} (BUG-062a)", () => {
    // "dx/dt" is already properly written derivative notation. The heuristic
    // still matches it as "lazy" and corrupts it: numerator becomes the
    // LAST letter of the match ("t") and denominator is always the literal
    // string "dd" (first captured letter "d" reused as both the \d command
    // and the variable), never the actual independent variable.
    const html = renderContent("dx/dt");
    expect(rawAttrs(html)).toContain("$\\frac{dt}{dd}$");
  });

  it("produces the identical (wrong) \\frac{dt}{dd} output for dv/dt, regardless of the numerator variable actually used", () => {
    // Demonstrates the bug is systemic, not specific to one variable name:
    // any "d<X>/d<Y>" input collapses to the same nonsensical denominator.
    const htmlDx = renderContent("dx/dt");
    const htmlDv = renderContent("dv/dt");
    expect(rawAttrs(htmlDv)).toEqual(rawAttrs(htmlDx));
  });

  it("does not touch prose that merely contains the letter d near a slash", () => {
    const html = renderContent("The deadline for drafts/d is tomorrow.");
    // No $...$-wrapped math-node should appear — this is plain prose, not a
    // derivative. Sanity check that the heuristic doesn't fire on arbitrary text.
    expect(html).not.toContain("math-node");
  });
});

describe("parseNakedMath — naked physics-equation heuristic (BUG-062b)", () => {
  it("wraps a genuine physics equation that ends in a recognized unit", () => {
    const html = renderContent("Given B = 0,5 T, find the flux.");
    expect(rawAttrs(html)).toContain("$B = 0$");
  });

  it("also wraps ordinary English prose shaped like 'letter = short phrase', with no unit at all (false positive)", () => {
    // Intended gate: only wrap when a recognized unit (m, kg, s, N, J, T, Ω,
    // V, A, mol) appears. Actual gate is `/[=|]/.test(match) || ...` — and
    // match ALWAYS contains "=" by construction of the outer regex, so the
    // unit check is dead code and every "X = ..." shaped span gets wrapped,
    // including plain prose with no physics content whatsoever.
    const html = renderContent("Let x = the unknown value in the problem.");
    expect(rawAttrs(html)).toContain("$x = the$");
  });
});

describe("parseNakedMath — naked chemistry-formula heuristic (BUG-062c)", () => {
  it("wraps a single atom with a digit subscript at a word boundary (e.g. standalone H2)", () => {
    const html = renderContent("We measured H2 at STP.");
    expect(rawAttrs(html)).toContain("$\\ce{H2}$");
  });

  it("wraps dash-separated single-letter atoms (e.g. C-H)", () => {
    const html = renderContent("A C-H bond is present.");
    expect(rawAttrs(html)).toContain("$\\ce{C-H}$");
  });

  it("does NOT wrap real multi-atom formulas with no internal dash — H2O, CO2, NaCl, Fe2O3 all pass through untouched", () => {
    // The regex's non-separator alternatives only ever match ONE atom+digit
    // group (no repetition), so a plain multi-atom formula like "H2O" can
    // never satisfy any alternative as a whole: the 2-atom case "H2" + "O"
    // leaves "O" unconsumed right after the match, which fails the trailing
    // `(?![$\w])` lookahead. In practice, this heuristic only ever fires for
    // a bare single atom+subscript or dash-chained atoms — not for the
    // common formulas a teacher would actually type.
    for (const formula of ["H2O", "CO2", "NaCl", "Fe2O3"]) {
      const html = renderContent(`The substance is ${formula} in this reaction.`);
      expect(html).not.toContain("\\ce{");
      expect(html).toContain(formula);
    }
  });

  it("does not mistake common acronyms (IB, AI, TV, DC, AC) for chemistry formulas", () => {
    const html = renderContent("The IB and AI are not formulas, nor is TV, DC, or AC.");
    expect(html).not.toContain("\\ce{");
  });
});

describe("splitMath — unclosed delimiter is treated as plain text (BUG-006 regression)", () => {
  it("does not swallow the rest of the string as a math block when a $ is never closed", () => {
    // BUG-006 root cause (a): an unclosed "$" used to create one giant
    // "math" segment running to the end of the string. The fix strips the
    // lone opening delimiter and treats everything after it as plain text.
    const html = renderContent("The price is $5 but this sentence never closes the dollar sign");
    expect(html).not.toContain("math-node");
    expect(html).toContain("but this sentence never closes the dollar sign");
  });
});

describe("renderContent — bare LaTeX safety net outside $...$ (BUG-006 regression)", () => {
  it("auto-wraps a bare \\frac{a}{b} that has no surrounding $ delimiters", () => {
    const html = renderContent("The result is \\frac{a}{b} outside math mode.");
    expect(rawAttrs(html)).toContain("$\\frac{a}{b}$");
  });

  it("auto-wraps a bare Greek letter command (\\theta) with no delimiters", () => {
    const html = renderContent("The angle \\theta is unknown here.");
    expect(rawAttrs(html)).toContain("$\\theta$");
  });

  it("auto-wraps a bare \\text{} command (the exact gap BUG-006 reported)", () => {
    const html = renderContent("Given Z_0 \\text{ Ω} is fixed.");
    expect(rawAttrs(html)).toContain("$\\text{ Ω}$");
  });

  it("auto-wraps bare subscripted variables (R_1, Z_0) outside math mode", () => {
    const html = renderContent("Given R_1 and Z_0 in the circuit.");
    const raws = rawAttrs(html);
    expect(raws).toContain("$R_1$");
    expect(raws).toContain("$Z_0$");
  });

  it("auto-wraps a bare \\ce{} chemistry command outside math mode", () => {
    const html = renderContent("The compound \\ce{H2O} forms.");
    expect(rawAttrs(html)).toContain("$\\ce{H2O}$");
  });

  it("auto-wraps a bare \\vec{} command outside math mode", () => {
    const html = renderContent("The vector \\vec{F} acts upward.");
    expect(rawAttrs(html)).toContain("$\\vec{F}$");
  });

  it("does not double-wrap a subscript that is already inside another LaTeX command's braces", () => {
    // The lookbehind `(?<![\\$\w{])` on the subscript rule must not re-wrap
    // R_1 when it's already an argument of \vec{...}.
    const html = renderContent("\\vec{R_1} is a vector.");
    expect(rawAttrs(html)).toEqual(["$\\vec{R_1}$"]);
  });

  it("does not re-wrap content that is already delimited with $...$", () => {
    const html = renderContent("$R_1$ and $\\theta$ already in math.");
    const raws = rawAttrs(html);
    expect(raws).toEqual(["$R_1$", "$\\theta$"]);
  });
});

describe("renderContent — naked-math edge cases", () => {
  it("returns an empty string for empty input without throwing", () => {
    expect(renderContent("")).toBe("");
  });

  it("leaves plain prose with no math content completely untouched by any heuristic", () => {
    const html = renderContent("This is just plain text with no math at all.");
    expect(html).not.toContain("math-node");
    expect(html).toContain("This is just plain text with no math at all.");
  });
});
