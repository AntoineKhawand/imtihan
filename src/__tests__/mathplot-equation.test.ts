import { describe, it, expect } from "vitest";
import evalExp from "built-in-math-eval";
// Ambient type declaration for the untyped `built-in-math-eval` package
// lives in ./built-in-math-eval.d.ts (same directory, picked up automatically).

// ---------------------------------------------------------------------------
// `preprocessEquationForPlot()` (src/components/ui/MathPlot.tsx) is a
// private (non-exported) helper feeding function-plot's "builtIn" sampler
// (built-in-math-eval under the hood) for the on-screen plot. Not exported,
// so — per the repo-wide rule to never modify application code to make a
// test pass, and matching the inlined-copy technique already used in
// src/__tests__/export-plot-equation.test.ts for route.ts's sibling
// function — this is a verbatim inlined copy. Keep this in sync with
// MathPlot.tsx if that function ever changes.
//
// Unlike route.ts's preprocessEquationForMathjs(), this function does NOT
// insert '*' for digit-letter/digit-paren/paren-letter adjacency (e.g.
// "2x", "2(x+1)", "(x+1)(x-1)") — confirmed by direct testing against the
// installed `built-in-math-eval` package that function-plot's own parser
// already handles all of those natively. The ONE gap it does NOT handle on
// its own is a letter directly followed by "(" (e.g. "x(x+1)" is parsed as
// a call to a function named "x", throwing `symbol "x" must be a function`)
// — that's BUG-056, and the only fixup this function performs.
// ---------------------------------------------------------------------------

const KNOWN_FUNCTION_NAMES = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
  "sinh", "cosh", "tanh", "asinh", "acosh", "atanh",
  "sqrt", "cbrt", "abs", "exp", "log", "log2", "log10", "log1p", "ln",
  "pow", "min", "max", "floor", "ceil", "round", "sign", "mod",
]);

function preprocessEquationForPlot(raw: string): string {
  const stripped = raw.trim().replace(/^(y|f\(x\))\s*=\s*/i, "").trim();
  return stripped.replace(/([a-zA-Z]+)(\()/g, (match, name: string) =>
    KNOWN_FUNCTION_NAMES.has(name.toLowerCase()) ? match : `${name}*(`
  );
}

function evalAt(expr: string, x: number): number {
  return evalExp(expr, { x }).eval({ x }) as number;
}

describe("preprocessEquationForPlot — prefix stripping", () => {
  it("strips a leading 'y = ' prefix", () => {
    expect(preprocessEquationForPlot("y = 2x")).toBe("2x");
  });

  it("strips a leading 'f(x) = ' prefix", () => {
    expect(preprocessEquationForPlot("f(x) = sin(x)")).toBe("sin(x)");
  });

  it("matches the prefix case-insensitively ('Y =', 'F(X) =')", () => {
    expect(preprocessEquationForPlot("Y = x^2")).toBe("x^2");
  });

  it("strips the prefix even when the raw string has leading whitespace before it (BUG-056)", () => {
    expect(preprocessEquationForPlot("  y = 2x")).toBe("2x");
  });
});

describe("preprocessEquationForPlot — BUG-056 fix: letter directly followed by '('", () => {
  it("inserts '*' between a bare variable and a following '(' — fixes the 'x(x+1)'-shaped parse failure", () => {
    expect(preprocessEquationForPlot("y = 2x(x+1) + 3")).toBe("2x*(x+1) + 3");
    expect(preprocessEquationForPlot("x(x-3)")).toBe("x*(x-3)");
  });

  it("the fixed-up expression actually compiles and evaluates with the real built-in-math-eval package (not just string-matches)", () => {
    expect(evalAt(preprocessEquationForPlot("y = 2x(x+1) + 3"), 2)).toBe(15);
    expect(evalAt(preprocessEquationForPlot("x(x-3)"), 2)).toBe(-2);
  });

  it("confirms the real package throws on the UNFIXED expression (proves the fix is load-bearing, not a no-op)", () => {
    expect(() => evalAt("x(x+1)", 2)).toThrow();
  });
});

describe("preprocessEquationForPlot — no regression on genuine function calls or on adjacency function-plot already handles natively", () => {
  it("leaves known function calls unmultiplied and still evaluates correctly", () => {
    const cases: Array<[string, number, number]> = [
      ["sin(x)", 0, 0], ["cos(x)", 0, 1], ["sqrt(x)", 4, 2],
      ["log(x)", Math.E, 1], ["exp(x)", 0, 1], ["abs(x)", -3, 3],
    ];
    for (const [raw, xval, expected] of cases) {
      const pre = preprocessEquationForPlot(raw);
      expect(pre).toBe(raw);
      expect(evalAt(pre, xval)).toBeCloseTo(expected, 5);
    }
  });

  it("leaves 'ln(x)' unmultiplied (does not mangle it, regardless of whether the underlying parser implements it)", () => {
    expect(preprocessEquationForPlot("ln(x)")).toBe("ln(x)");
  });

  it("does not disturb digit-letter / digit-paren / paren-paren adjacency function-plot already parses natively", () => {
    expect(preprocessEquationForPlot("2x")).toBe("2x");
    expect(preprocessEquationForPlot("2(x+1)")).toBe("2(x+1)");
    expect(preprocessEquationForPlot("(x+1)(x-1)")).toBe("(x+1)(x-1)");
    expect(evalAt("2x", 3)).toBe(6);
    expect(evalAt("2(x+1)", 3)).toBe(8);
    expect(evalAt("(x+1)(x-1)", 3)).toBe(8);
  });
});
