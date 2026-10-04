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
// changes; the comment there explicitly says it "mirrors MathPlot.tsx's own
// 'y = '/'f(x) = ' prefix stripping" (src/components/ui/MathPlot.tsx line 21
// has the identical regex pair), so any intentional behavior change should
// be reflected in both places and in this test file.
// ---------------------------------------------------------------------------

function preprocessEquationForMathjs(raw: string): string {
  let eq = raw.replace(/^(y|f\(x\))\s*=\s*/i, "").trim();
  eq = eq.replace(/(\d)([a-zA-Z(])/g, "$1*$2");
  eq = eq.replace(/(\))([a-zA-Z0-9(])/g, "$1*$2");
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

describe("preprocessEquationForMathjs — known gaps (documented, not fixed)", () => {
  // Real, reproducible bug found while writing these tests (not previously
  // documented in BUGS.md): a letter immediately followed by "(" is never
  // given an inserted "*", unlike the symmetric ")"-then-letter case above.
  // mathjs parses "x(x+1)" as a *function call* to a function named "x",
  // not as multiplication — confirmed by actually compiling and evaluating
  // the output with the real `mathjs` package (not just reading the regex):
  // `create(all).compile("2*x(x+1) + 3").evaluate({ x: 2 })` throws
  // "'x' is not a function; its value is: 2". Since `renderMathPlotPng()`
  // (src/app/api/export/route.ts) wraps its whole rendering attempt in a
  // try/catch per its own doc comment, this doesn't crash the export — it
  // silently degrades to the pre-existing text-label-box fallback instead of
  // ever rendering a real graph, for any equation shaped like "y = 2x(x+1)"
  // or "f(x) = x(x-3)" (a plausible, simple factored-form equation a teacher
  // or the AI could easily write). The same regex pair is duplicated in
  // src/components/ui/MathPlot.tsx (line 21) for the on-screen plot, which
  // uses function-plot's own parser rather than mathjs — not verified here
  // whether that parser has the same gap.
  it("leaves a letter directly followed by '(' unmultiplied — reproduces a real mathjs parse failure for 'x(x+1)'-shaped equations", () => {
    expect(preprocessEquationForMathjs("y = 2x(x+1) + 3")).toBe("2*x(x+1) + 3");
    // Not "2*x*(x+1) + 3", which is what a correct factored-form rewrite
    // would need to produce for mathjs to parse it as multiplication.
  });

  // Separately: the prefix-stripping regex is anchored to the very start of
  // the string (`^`), but `.trim()` is only applied AFTER that regex runs —
  // so a raw equation with LEADING whitespace never matches the prefix at
  // all, and the "y = " / "f(x) = " text is left in the output verbatim
  // (silently fed to mathjs as part of the expression, which will fail to
  // compile "y = 2*x" as a plain expression). This exact same ordering bug
  // is independently duplicated in MathPlot.tsx line 21. In practice this
  // looks unreachable via the main AI-generated pipeline — the inline
  // `[PLOT: equation]` tag extraction regex in src/lib/renderContent.ts
  // (`/\[PLOT:\s*([\s\S]*?)\]/gi`) already consumes any whitespace right
  // after "PLOT:" before the equation is captured — but it IS reachable via
  // the legacy, freely-editable `mathPlots` array text input in
  // ExerciseEditor.tsx's `updatePlot()`, where a teacher could easily type
  // or paste a leading space.
  it("does not strip the prefix when the raw string has leading whitespace before it (trim() runs after, not before, the prefix regex)", () => {
    expect(preprocessEquationForMathjs("  y = 2x")).toBe("y = 2*x");
  });
});
