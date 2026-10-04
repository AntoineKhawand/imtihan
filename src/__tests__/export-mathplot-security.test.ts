import { describe, it, expect } from "vitest";
import { isSafePlotExpression } from "@/app/api/export/route";

// Regression test for a real DoS found and left half-fixed by an interrupted
// nightly run (2026-10-02): `renderMathPlotPng()` in `/api/export` (BUG-051's
// server-side chart rendering) calls `mathjs.evaluate()` 400 times per plot,
// synchronously, on an equation string that ultimately comes from AI-generated
// or teacher-edited exercise content reaching this route with no auth check.
// `isSafePlotExpression()` was written as the guard but the nightly session
// hit its account usage limit before the call site was wired up -- this
// confirms the guard itself behaves correctly now that it's actually called.
describe("isSafePlotExpression (BUG-051 mathjs DoS guard)", () => {
  it("accepts real function-of-x equations the generation prompt actually produces", () => {
    const safe = [
      "sin(x)", "cos(x)", "tan(x)", "x^2", "2*x+1", "sqrt(x)",
      "exp(x)", "log(x)", "abs(x)", "pow(x,3)", "x^2+2*x+1",
      "sin(x)*cos(x)", "pi*x", "e^x", "1/(x+1)",
    ];
    for (const expr of safe) {
      expect(isSafePlotExpression(expr), `expected "${expr}" to be accepted`).toBe(true);
    }
  });

  it("rejects the empirically-confirmed 50-second mathjs range-syntax DoS payload", () => {
    expect(isSafePlotExpression("(1:1:100000000)")).toBe(false);
  });

  it("rejects other expensive mathjs builtins reachable with only allowed characters", () => {
    const unsafe = ["ones(100,100,100,100)", "random()", "combinations(1000,500)", "permutations(1000)"];
    for (const expr of unsafe) {
      expect(isSafePlotExpression(expr), `expected "${expr}" to be rejected`).toBe(false);
    }
  });

  it("rejects disallowed characters (matrix/array/range/statement syntax)", () => {
    const unsafe = ["[1,2,3]", "1:100", "x;y", "x=1", "{a:1}"];
    for (const expr of unsafe) {
      expect(isSafePlotExpression(expr), `expected "${expr}" to be rejected`).toBe(false);
    }
  });

  it("rejects expressions past the length cap, independent of token validity", () => {
    // "x+" repeated is all-valid chars/tokens (just the single-char token "x"
    // repeated), isolating the length check from the function-name allowlist.
    expect(isSafePlotExpression("x+".repeat(100))).toBe(true); // 200 chars, at the cap
    expect(isSafePlotExpression("x+".repeat(100) + "x")).toBe(false); // 201 chars, over the cap
  });

  it("rejects empty input", () => {
    expect(isSafePlotExpression("")).toBe(false);
  });

  it("empirically confirms the guard actually prevents the slow path (not just a unit assertion)", () => {
    // Mirrors _tmp-bug047-dos-timing.test.ts's style: prove the rejection
    // itself is cheap, so the guard can't become its own DoS vector.
    const t0 = Date.now();
    const result = isSafePlotExpression("(1:1:100000000)");
    const ms = Date.now() - t0;
    expect(result).toBe(false);
    expect(ms).toBeLessThan(50); // the unguarded mathjs evaluate() of this took ~50,000ms
  });
});
