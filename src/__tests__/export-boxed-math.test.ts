import { describe, it, expect } from "vitest";
import { unwrapBoxed } from "@/app/api/export/route";
import { fixBoxedMath } from "@/lib/renderContent";

// Regression test for BUG-040: the Word export path had its own naive
// \boxed{...} handling (a single-level-nesting regex with no stray-$
// repair), separate from renderContent.ts's more robust fixBoxedMath. The
// AI occasionally nests stray $...$ delimiters inside \boxed{}, or typos a
// $ where a { was meant — both left raw, unrendered LaTeX (backslashes,
// dollar signs, the literal \boxed{ keyword) visible in exported .docx
// files. Founder-reported with these two exact live examples.
describe("export route — \\boxed{} math repair", () => {
  it("repairs a stray-$ nested inside \\boxed{} (real founder-reported example)", () => {
    const input = "\\boxed{$y = h$ + x\\tan\\alpha - \\frac{g}{2v_0^2\\cos^2\\alpha}\\,x^2}";
    const result = unwrapBoxed(fixBoxedMath(input));
    expect(result).toBe("$y = h + x\\tan\\alpha - \\frac{g}{2v_0^2\\cos^2\\alpha}\\,x^2$");
    // Fully unwrapped: no literal \boxed{ keyword or stray $ left inside.
    expect(result).not.toContain("\\boxed");
    expect((result.match(/\$/g) ?? []).length).toBe(2); // exactly the outer pair
  });

  it("repairs a malformed \\sqrt$ typo nested 3 levels deep inside \\boxed{} (real founder-reported example)", () => {
    const input = "\\boxed{$v = \\sqrt${\\frac{GM_T}{r}}}";
    const result = unwrapBoxed(fixBoxedMath(input));
    expect(result).toBe("$v = \\sqrt{\\frac{GM_T}{r}}$");
    expect(result).not.toContain("\\boxed");
    expect((result.match(/\$/g) ?? []).length).toBe(2);
  });

  it("unwrapBoxed handles arbitrarily deep nesting, not just one level", () => {
    // \boxed -> \sqrt -> \frac -> \sqrt is 4 levels deep; a single-level
    // regex (the original bug) would leave this entirely unmatched.
    const input = "\\boxed{\\sqrt{\\frac{\\sqrt{a}}{b}}}";
    expect(unwrapBoxed(input)).toBe("\\sqrt{\\frac{\\sqrt{a}}{b}}");
  });

  it("leaves already-well-formed \\boxed{} content unaffected by fixBoxedMath (no stray $ to repair)", () => {
    const input = "$\\boxed{x = 5}$";
    expect(fixBoxedMath(input)).toBe(input);
    expect(unwrapBoxed(input)).toBe("$x = 5$");
  });

  it("returns the remaining text unchanged (including the literal \\boxed{ keyword) when the brace never closes", () => {
    // Previously-untested branch: the brace-depth scan reaches the end of
    // the string without depth ever returning to 0 (`closed` stays false).
    // Rather than throwing or silently dropping content, unwrapBoxed must
    // bail out and hand back everything from the unclosed \boxed{ onward,
    // verbatim — same fail-soft posture as the rest of this export path.
    const input = "Answer: \\boxed{x = 5";
    expect(unwrapBoxed(input)).toBe(input);
  });
});
