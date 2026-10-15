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
// `parseNakedMath` — logged as BUG-062 in BUGS.md. Fixed 2026-10-15; the
// tests below now assert the CORRECTED behavior (previously they documented
// the buggy behavior, same precedent as BUG-056's "known gaps (documented,
// not fixed)" block in export-plot-equation.test.ts — this file is the
// "future fix" that block anticipated).
// ---------------------------------------------------------------------------

function rawAttrs(html: string): string[] {
  return [...html.matchAll(/data-raw="([^"]*)"/g)].map((m) => m[1]);
}

describe("parseNakedMath — lazy derivative detection (BUG-062, fixed 2026-10-15)", () => {
  it("wraps a squared lazy-derivative pattern as a \\frac with the correct numerator and denominator (BUG-062a, fixed)", () => {
    // "d2v/dt2" is the dependent variable "v" over the independent variable
    // "t", squared: $\frac{d^2v}{dt^2}$. Previously the replacer took the
    // LAST letter in the whole match ("t") as the numerator and hardcoded
    // the denominator to "dt^2", producing the nonsensical $\frac{d^2t}{dt^2}$.
    const html = renderContent("The acceleration is d2v/dt2 here.");
    expect(rawAttrs(html)).toContain("$\\frac{d^2v}{dt^2}$");
  });

  it("preserves an already-correct single-derivative notation like dx/dt as \\frac{dx}{dt} (BUG-062a, fixed)", () => {
    // "dx/dt" is already properly written derivative notation. Previously
    // the heuristic corrupted it into $\frac{dt}{dd}$ (numerator taken from
    // the LAST letter of the match, denominator hardcoded to the literal
    // string "dd"). It should resolve to $\frac{dx}{dt}$: numerator "x"
    // (immediately after the first "d"), denominator "t" (immediately after
    // the second "d").
    const html = renderContent("dx/dt");
    expect(rawAttrs(html)).toContain("$\\frac{dx}{dt}$");
  });

  it("produces a distinct, variable-correct \\frac for dv/dt vs. dx/dt", () => {
    // Previously both collapsed to the identical (wrong) $\frac{dt}{dd}$,
    // regardless of which variable was actually used. Now each uses its own
    // numerator variable over the same denominator "t".
    const htmlDx = renderContent("dx/dt");
    const htmlDv = renderContent("dv/dt");
    expect(rawAttrs(htmlDx)).toContain("$\\frac{dx}{dt}$");
    expect(rawAttrs(htmlDv)).toContain("$\\frac{dv}{dt}$");
    expect(rawAttrs(htmlDv)).not.toEqual(rawAttrs(htmlDx));
  });

  it("does not touch prose that merely contains the letter d near a slash", () => {
    const html = renderContent("The deadline for drafts/d is tomorrow.");
    // No $...$-wrapped math-node should appear — this is plain prose, not a
    // derivative. Sanity check that the heuristic doesn't fire on arbitrary text.
    expect(html).not.toContain("math-node");
  });
});

describe("parseNakedMath — naked physics-equation heuristic (BUG-062b, fixed 2026-10-15)", () => {
  it("wraps a genuine physics equation that ends in a recognized unit", () => {
    const html = renderContent("Given B = 0,5 T, find the flux.");
    expect(rawAttrs(html)).toContain("$B = 0,5 T$");
  });

  it("no longer wraps ordinary English prose shaped like 'letter = short phrase' when no unit is nearby (BUG-062b, fixed)", () => {
    // Previously the gate was `/[=|]/.test(match) || ...` — and match ALWAYS
    // contains "=" by construction of the outer regex, so the unit check was
    // dead code and every "X = ..." shaped span got wrapped, including plain
    // prose with no physics content whatsoever. The gate now actually
    // requires a recognized unit (m, kg, s, N, J, T, Ω, V, A, mol) to appear
    // as part of the same complete numeric quantity.
    const html = renderContent("Let x = the unknown value in the problem.");
    expect(rawAttrs(html)).not.toContain("$x = the$");
    expect(html).not.toContain("math-node");
  });
});

describe("parseNakedMath — naked chemistry-formula heuristic (BUG-062c, fixed 2026-10-15)", () => {
  it("wraps a single atom with a digit subscript at a word boundary (e.g. standalone H2)", () => {
    const html = renderContent("We measured H2 at STP.");
    expect(rawAttrs(html)).toContain("$\\ce{H2}$");
  });

  it("wraps dash-separated single-letter atoms (e.g. C-H)", () => {
    const html = renderContent("A C-H bond is present.");
    expect(rawAttrs(html)).toContain("$\\ce{C-H}$");
  });

  it("wraps real multi-atom formulas with no internal dash — H2O, CO2, NaCl, Fe2O3 (BUG-062c, fixed)", () => {
    // Previously the regex's non-separator alternatives could only ever
    // match ONE atom+digit group (no repetition), so a plain multi-atom
    // formula like "H2O" never satisfied any alternative as a whole: the
    // 2-atom case "H2" + "O" left "O" unconsumed right after the match,
    // failing the trailing `(?![$\w])` lookahead. A repeated-atom
    // alternative (no separator required) now matches the whole formula.
    for (const formula of ["H2O", "CO2", "NaCl", "Fe2O3"]) {
      const html = renderContent(`The substance is ${formula} in this reaction.`);
      expect(html).toContain("\\ce{");
      expect(rawAttrs(html)).toContain(`$\\ce{${formula}}$`);
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


describe("BUG-062 — complete tokens and conservative recovery", () => {
  it.each([
    ["dy/dx", "$\\frac{dy}{dx}$"],
    ["dY / dX", "$\\frac{dY}{dX}$"],
    ["d2y/dx2", "$\\frac{d^2y}{dx^2}$"],
    ["d^2Y / dX^2", "$\\frac{d^2Y}{dX^2}$"],
    ["dy2/dx2", "$\\frac{d^2y}{dx^2}$"],
    ["dt2d2v", "$\\frac{d^2v}{dt^2}$"],
    ["dtdv", "$\\frac{dv}{dt}$"],
  ])("preserves variables in %s", (input, expected) => {
    expect(rawAttrs(renderContent(input))).toEqual([expected]);
  });

  it.each(["added to drafts", "added two descriptions", "prefixdx/dt", "dx/dtype", "dx/dt2", "d2x/dt2tail", "id_dx/dt", "éddx/dt", "dx/dté", "DX/DT"])(
    "does not parse derivative substrings or prose in %s", (input) => {
      expect(renderContent(input)).not.toContain("math-node");
    },
  );

  it.each(["B = 0,5 T", "B = 0.5 T", "m = 100 g", "R = 50 Ω", "I = -1.2e-3 A", "t = .5 s"])(
    "wraps the whole quantity %s", (input) => {
      expect(rawAttrs(renderContent(`Given ${input}, calculate the result.`))).toEqual([`$${input}$`]);
    },
  );

  it.each(["x = the unknown value in m", "x = a mass of 10 kg", "x = short phrase, m = missing", "B = 0.5 Tesla", "B = 2 molar", "v = 5 m/s"])(
    "does not borrow a unit or truncate %s", (input) => {
      expect(renderContent(input)).not.toContain("math-node");
    },
  );

  it.each(["H2O", "CO2", "NaCl", "Fe2O3", "C12H22O11", "CH3-CH2-OH", "O=C=O", "N≡N", "O2", "HCl"])(
    "recovers the complete formula %s", (formula) => {
      expect(rawAttrs(renderContent(`Given ${formula}, answer.`))).toEqual([`$\\ce{${formula}}$`]);
    },
  );

  it.each(["Chapter", "Chemistry", "No", "On", "NO", "CNN", "NON", "HTML", "CPU", "IB", "AI", "TV", "DC", "AC", "Qq2", "H2Oidentifier", "id_H2O", "éH2O", "H2Oé"])(
    "does not interpret prose, acronyms or identifiers %s as chemistry", (input) => {
      expect(renderContent(input)).not.toContain("math-node");
    },
  );

  it("preserves LaTeX arguments and already delimited math verbatim", () => {
    for (const input of [String.raw`\text{H2O and dx/dt}`, String.raw`\ce{H2O}`, String.raw`$\text{Chapter} + H2O + dx/dt$`, String.raw`$$\frac{dx}{dt} + \ce{H2O}$$`]) {
      const expected = input.startsWith("$") ? input : `$${input}$`;
      expect(rawAttrs(renderContent(input))).toEqual([expected]);
    }
  });

  it("keeps mixed prose, recovered formulas and explicit math separate", () => {
    expect(rawAttrs(renderContent(String.raw`Chapter: dx/dt, H2O, $\ce{CO2}$ and B = 0,5 T.`)))
      .toEqual([String.raw`$\frac{dx}{dt}$`, String.raw`$\ce{H2O}$`, String.raw`$\ce{CO2}$`, "$B = 0,5 T$"]);
  });
});
