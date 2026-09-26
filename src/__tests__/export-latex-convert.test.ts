import { describe, it, expect } from "vitest";
import { cleanLatexForWord, convertBraceCommands } from "@/app/api/export/route";

// Regression tests for BUG-046: real strings QA pulled from a live exported .docx.
describe("cleanLatexForWord — BUG-046", () => {
  const noLeaks = (s: string) => {
    expect(s).not.toMatch(/frac|left|right|begin|end\{|\\|\{,|,\}/);
  };

  it("converts \\frac nested inside \\sqrt with a {,} decimal comma", () => {
    const out = cleanLatexForWord(
      "v_1 = \\sqrt{\\frac{6{,}674 \\times 10^{-11} \\times 5{,}972 \\times 10^{24}}{6{,}771 \\times 10^6}}"
    );
    noLeaks(out);
    expect(out).toContain("6,674");
    expect(out).toContain("√(");
    expect(out.match(/\(/g)?.length).toBe(out.match(/\)/g)?.length);
  });

  it("converts \\dfrac", () => {
    const out = cleanLatexForWord("T_1 = \\dfrac{2\\pi r_1}{v_1}");
    noLeaks(out);
    expect(out).toBe("T_1 = (2π r_1)/v_1");
  });

  it("drops \\left/\\right but keeps the delimiters", () => {
    const out = cleanLatexForWord("r_2 = \\left(\\frac{GM_T T_2^2}{4\\pi^2}\\right)^{1/3}");
    noLeaks(out);
    expect(out).toContain("((GM_T T_2^2)/(4π^2))^{1/3}");
  });

  it("converts \\begin{cases} into a readable grouped list", () => {
    const out = cleanLatexForWord("\\begin{cases} \\ddot{x} = 0 \\\\ \\ddot{y} = -g \\end{cases}");
    noLeaks(out);
    expect(out).toBe("{ ẍ = 0 ; ÿ = -g }");
  });

  it("handles arctan with \\left( \\frac \\right)", () => {
    const out = cleanLatexForWord("\\arctan\\left(\\frac{31{,}36}{17{,}32}\\right)");
    noLeaks(out);
    expect(out).toBe("arctan(31,36/17,32)");
  });

  it("leaves unbalanced input without throwing", () => {
    expect(() => cleanLatexForWord("\\frac{a")).not.toThrow();
  });
});

// Regression for BUG-047: unbalanced \frac{ / \sqrt{ was O(n^2) on an
// unauthenticated route with no size cap.
describe("convertBraceCommands — pathological input (BUG-047)", () => {
  it("finishes quickly on a huge unbalanced input (past the length cap)", () => {
    const input = "\\frac{".repeat(200_000);
    const t0 = Date.now();
    expect(() => convertBraceCommands(input)).not.toThrow();
    expect(Date.now() - t0).toBeLessThan(1000);
  });

  it("finishes quickly on unbalanced input right at the cap", () => {
    const input = "\\sqrt{".repeat(1_666); // ~10,000 chars
    const t0 = Date.now();
    expect(() => cleanLatexForWord(input)).not.toThrow();
    expect(Date.now() - t0).toBeLessThan(2000);
  });
});
