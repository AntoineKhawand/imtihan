import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// `preprocessEquationForMathjs()` (src/app/api/export/route.ts) had zero test
// coverage before this file — it's a private (non-exported) helper used only
// by `renderMathPlotPng()` (BUG-051, "real embedded PNG chart for Word
// export"), which compiles its output with `mathjs` before sampling the
// curve. It is NOT exported from route.ts, so — per this task's instruction
// to extract/inline rather than widen a module's export surface just to make
// a test importable (and per the repo-wide rule to never modify application
// code to make a test pass) — this is a verbatim inlined copy, same
// technique `src/__tests__/qcm.test.ts` already uses for generate/route.ts's
// own private helpers. Keep this in sync with route.ts if that function ever
// changes; a near-identical (but not quite identical — see
// src/__tests__/mathplot-equation.test.ts) fixup lives in
// src/components/ui/MathPlot.tsx for the on-screen plot, so any intentional
// behavior change here should be considered there too.
// ---------------------------------------------------------------------------

import { create, all } from "mathjs";

const mathInstance = create(all);

const KNOWN_FUNCTION_NAMES = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
  "sinh", "cosh", "tanh", "asinh", "acosh", "atanh",
  "sqrt", "cbrt", "abs", "exp", "log", "log2", "log10", "log1p", "ln",
  "pow", "min", "max", "floor", "ceil", "round", "sign", "mod",
]);

function preprocessEquationForMathjs(raw: string): string {
  let eq = raw.trim().replace(/^(y|f\(x\))\s*=\s*/i, "").trim();
  eq = eq.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
  eq = eq.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");
  eq = eq.replace(/([a-zA-Z]+)(\()/g, (match, name: string) =>
    KNOWN_FUNCTION_NAMES.has(name.toLowerCase()) ? match : `${name}*(`
  );
  return eq;
}

describe("preprocessEquationForMathjs — prefix stripping", () => {
  it("strips a leading 'y = ' prefix", () => {
    expect(preprocessEquationForMathjs("y = 2x")).toBe("2*x");
  });

  it("strips a leading 'f(x) = ' prefix", () => {
    expect(preprocessEquationForMathjs("f(x) = sin(x)")).toBe("sin(x)");
  });

  it("matches the prefix case-insensitively ('Y =', 'F(X) =')", () => {
    expect(preprocessEquationForMathjs("Y = x^2")).toBe("x^2");
    expect(preprocessEquationForMathjs("F(X) = 3x")).toBe("3*x");
  });

  it("strips the prefix with no surrounding whitespace ('f(x)=...')", () => {
    expect(preprocessEquationForMathjs("f(x)=2x^2+3x+1")).toBe("2*x^2+3*x+1");
  });

  it("strips the prefix with extra internal whitespace around '='", () => {
    expect(preprocessEquationForMathjs("y=  3x")).toBe("3*x");
  });

  it("leaves an equation with no y=/f(x)= prefix untouched (aside from implicit multiplication)", () => {
    expect(preprocessEquationForMathjs("sin(x)")).toBe("sin(x)");
  });

  it("trims leading/trailing whitespace around an equation with no prefix", () => {
    expect(preprocessEquationForMathjs("  sin(x)  ")).toBe("sin(x)");
  });
});

describe("preprocessEquationForMathjs — implicit multiplication insertion", () => {
  it("inserts '*' between a digit and a following letter", () => {
    expect(preprocessEquationForMathjs("3x^2 + 2x + 1")).toBe("3*x^2 + 2*x + 1");
  });

  it("inserts '*' between a digit and a following '('", () => {
    expect(preprocessEquationForMathjs("2(x+1)")).toBe("2*(x+1)");
  });

  it("inserts '*' between a closing ')' and a following letter, digit, or '('", () => {
    expect(preprocessEquationForMathjs("sin(x)cos(x)")).toBe("sin(x)*cos(x)");
    expect(preprocessEquationForMathjs("(x+1)2")).toBe("(x+1)*2");
    expect(preprocessEquationForMathjs("(x+1)(x-1)")).toBe("(x+1)*(x-1)");
  });

  it("does NOT insert '*' between two adjacent digits (e.g. a two-digit number)", () => {
    expect(preprocessEquationForMathjs("x + 12")).toBe("x + 12");
  });

  it("does not double up an already-explicit multiplication", () => {
    expect(preprocessEquationForMathjs("2*x")).toBe("2*x");
  });

  it("handles multiple substitutions in one expression", () => {
    expect(preprocessEquationForMathjs("y = 2x + 3(x-1)")).toBe("2*x + 3*(x-1)");
  });
});

describe("preprocessEquationForMathjs — BUG-056 fix: letter directly followed by '(' ", () => {
  // Previously a real, reproducible bug: a letter immediately followed by
  // "(" never got an inserted "*", unlike the symmetric ")"-then-letter case
  // above. mathjs parsed "x(x+1)" as a *function call* to a function named
  // "x", not as multiplication. Now fixed via a known-function-name
  // allow-list (KNOWN_FUNCTION_NAMES) so a bare variable like "x" still gets
  // multiplied, while real function calls (sin, cos, sqrt, ...) are left
  // alone (see the next describe block).
  it("inserts '*' between a letter and a following '(' when the letter isn't a known function name — fixes the 'x(x+1)'-shaped parse failure", () => {
    expect(preprocessEquationForMathjs("y = 2x(x+1) + 3")).toBe("2*x*(x+1) + 3");
    expect(preprocessEquationForMathjs("x(x-3)")).toBe("x*(x-3)");
  });

  it("the fixed-up expression actually compiles and evaluates with the real mathjs package (not just string-matches)", () => {
    const expr = preprocessEquationForMathjs("y = 2x(x+1) + 3");
    expect(mathInstance.compile(expr).evaluate({ x: 2 })).toBe(15);
  });
});

describe("preprocessEquationForMathjs — no regression on genuine function calls", () => {
  // A naive '([a-zA-Z])(\()' -> insert '*' rule would incorrectly rewrite
  // "sin(x)" into "sin*(x)". Confirm the allow-list keeps every function
  // name the generation prompt's MATHEMATICAL PLOTS instruction and
  // isSafePlotExpression()'s own allow-list actually use intact, and that
  // the result still compiles with the real mathjs package.
  it("leaves known function calls unmultiplied", () => {
    const cases: Array<[string, number]> = [
      ["sin(x)", 0], ["cos(x)", 0], ["tan(x)", 0],
      ["sqrt(x)", 4], ["log(x)", 2], ["exp(x)", 1], ["abs(x)", -3],
      ["pow(x,3)", 2],
    ];
    for (const [raw, xval] of cases) {
      const pre = preprocessEquationForMathjs(raw);
      expect(pre).toBe(raw); // untouched — no spurious '*' inserted
      expect(() => mathInstance.compile(pre).evaluate({ x: xval })).not.toThrow();
    }
  });

  it("leaves 'ln(x)' unmultiplied even though mathjs itself has no built-in 'ln' (separate, pre-existing, out-of-scope gap — natural log is 'log' in mathjs)", () => {
    expect(preprocessEquationForMathjs("ln(x)")).toBe("ln(x)");
  });

  it("still inserts '*' between adjacent known function calls (e.g. 'sin(x)cos(x)')", () => {
    expect(preprocessEquationForMathjs("sin(x)cos(x)")).toBe("sin(x)*cos(x)");
  });
});

describe("preprocessEquationForMathjs — BUG-056 fix: trim() before the prefix regex", () => {
  // Previously the prefix-stripping regex was anchored to the very start of
  // the string (`^`), but `.trim()` was only applied AFTER that regex ran —
  // so a raw equation with LEADING whitespace never matched the prefix at
  // all, and the "y = " / "f(x) = " text was left in the output verbatim.
  // In practice this looks unreachable via the main AI-generated pipeline —
  // the inline `[PLOT: equation]` tag extraction regex in
  // src/lib/renderContent.ts (`/\[PLOT:\s*([\s\S]*?)\]/gi`) already consumes
  // any whitespace right after "PLOT:" before the equation is captured —
  // but it IS reachable via the legacy, freely-editable `mathPlots` array
  // text input in ExerciseEditor.tsx's `updatePlot()`, where a teacher could
  // easily type or paste a leading space. Same fix applied to MathPlot.tsx.
  it("strips the prefix even when the raw string has leading whitespace before it", () => {
    expect(preprocessEquationForMathjs("  y = 2x")).toBe("2*x");
  });
});
