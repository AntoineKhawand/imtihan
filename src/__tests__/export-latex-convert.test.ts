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

// Previously-uncovered: cleanLatexForWord's \ce{...} chemistry-formula step
// (step 1, before any of the \frac/\sqrt/\begin{} handling below) had zero
// test coverage — this is the ONLY place in the function that produces
// subscript notation for chemical formulas (e.g. "H2O" -> "H_{2}O"), used
// for Chemistry/physique-chimie exam exports.
describe("cleanLatexForWord — \\ce{} chemistry formula subscripting", () => {
  it("adds a subscript after a single-letter element symbol followed by a count", () => {
    expect(cleanLatexForWord("\\ce{H2O}")).toBe("H_{2}O");
  });

  it("adds a subscript after a two-letter element symbol followed by a count", () => {
    expect(cleanLatexForWord("\\ce{CO2}")).toBe("CO_{2}");
  });

  it("subscripts every element+count pair in a multi-element formula", () => {
    expect(cleanLatexForWord("\\ce{H2SO4}")).toBe("H_{2}SO_{4}");
  });

  it("leaves an element symbol with no trailing count unsubscripted", () => {
    expect(cleanLatexForWord("\\ce{NaCl}")).toBe("NaCl");
  });
});

// Previously-uncovered branches in convertBraceCommands: the \begin{aligned}
// (non-"cases") ternary arm, an unbalanced \begin{cases} with no matching
// \end{cases}, and an accent command (\tilde/\hat/\dot/\ddot/\bar) with no
// following brace group.
describe("convertBraceCommands — \\begin{aligned}, unbalanced \\begin{cases}, and bare accents", () => {
  it("joins \\begin{aligned} rows with ' ; ' but does NOT wrap them in braces (unlike \\begin{cases})", () => {
    const out = convertBraceCommands("\\begin{aligned} x = 1 \\\\ y = 2 \\end{aligned}");
    expect(out).toBe("x = 1 ; y = 2");
    expect(out).not.toContain("{");
  });

  it("leaves a \\begin{cases} block with no matching \\end{cases} entirely unchanged", () => {
    const input = "\\begin{cases} x = 1 \\\\ y = 2";
    expect(convertBraceCommands(input)).toBe(input);
  });

  it("leaves an accent command unchanged when it is not immediately followed by a brace group", () => {
    // "\\tilde" here is followed by a space, not "{" — readBraceGroup bails
    // out immediately, so the command must be left as literal text rather
    // than silently dropped or crashing.
    expect(convertBraceCommands("\\tilde x")).toBe("\\tilde x");
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
