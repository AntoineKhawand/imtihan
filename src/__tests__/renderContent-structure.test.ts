import { describe, it, expect } from "vitest";
import { renderContent } from "@/lib/renderContent";

// renderContent() is the shared pure renderer for AI/user-authored exercise
// text (statement/solution/methodology) used across ExerciseCard, the
// editor, /bank, /student/practice, /exam/[id] and /print. These tests cover
// two of its largest untested regions: Markdown pipe-table rendering and
// bullet/numbered list rendering, plus a regression test for BUG-038 (KaTeX
// stretchy-symbol SVG corruption).

describe("renderContent — pipe tables", () => {
  it("renders a header row as <th> and data rows as <td>", () => {
    const md = "| x | y |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |";
    const html = renderContent(md);
    expect(html).toContain("<table");
    // Header row: exactly 2 <th> cells, no <td> in that row.
    const theadMatch = html.match(/<tr[^>]*>(.*?)<\/tr>/s);
    expect(theadMatch?.[1]).toContain("<th");
    expect(theadMatch?.[1]).not.toContain("<td");
    expect((html.match(/<th/g) ?? []).length).toBe(2);
    // 2 data rows x 2 columns = 4 <td> cells.
    expect((html.match(/<td/g) ?? []).length).toBe(4);
    expect((html.match(/<tr/g) ?? []).length).toBe(3);
  });

  it("does not render a pipe-delimited block as a table when the separator row is missing", () => {
    // Only rows that look like a pipe table AND contain a genuine
    // |---|---| separator line are treated as a table (renderPipeTable's
    // hasSep gate) — otherwise text that merely contains "|" characters
    // (e.g. a teacher writing "cost | benefit" as prose) would be silently
    // mangled into an empty/broken table.
    const md = "| this is just | prose with pipes |\n| not a table | at all |";
    const html = renderContent(md);
    expect(html).not.toContain("<table");
  });

  it("renders an empty cell as a non-breaking space, not an empty <td>", () => {
    const md = "| a | b |\n| --- | --- |\n| 1 |  |";
    const html = renderContent(md);
    expect(html).toContain("&nbsp;");
  });

  it("applies bold/italic markdown inside a table cell", () => {
    const md = "| label | value |\n| --- | --- |\n| **Total** | *approx* |";
    const html = renderContent(md);
    expect(html).toContain("<strong>Total</strong>");
    expect(html).toContain("<em>approx</em>");
  });

  it("renders inline math inside a table cell via KaTeX", () => {
    const md = "| formula | result |\n| --- | --- |\n| $x^2$ | 4 |";
    const html = renderContent(md);
    expect(html).toContain('class="katex"');
  });

  it("escapes raw HTML inside a table cell instead of injecting it (stored-XSS boundary, BUG-033 area)", () => {
    const md = '| a | b |\n| --- | --- |\n| <img src=x onerror=alert(1)> | safe |';
    const html = renderContent(md);
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img");
  });
});

describe("renderContent — lists", () => {
  it("wraps consecutive '-' bullet lines in a single <ul> with one <li> per item", () => {
    const html = renderContent("Intro line\n- first item\n- second item\n- third item");
    expect((html.match(/<ul/g) ?? []).length).toBe(1);
    expect((html.match(/<li/g) ?? []).length).toBe(3);
    expect(html).toContain(">first item<");
  });

  it("wraps a numbered list ('1.', '2.') the same way as a bulleted one", () => {
    const html = renderContent("1. step one\n2. step two");
    expect((html.match(/<ul/g) ?? []).length).toBe(1);
    expect((html.match(/<li/g) ?? []).length).toBe(2);
  });

  it("closes the list before resuming plain text that follows it", () => {
    const html = renderContent("- item one\n- item two\nBack to prose.");
    const ulCloseIdx = html.indexOf("</ul>");
    const proseIdx = html.indexOf("Back to prose");
    expect(ulCloseIdx).toBeGreaterThan(-1);
    expect(proseIdx).toBeGreaterThan(ulCloseIdx);
  });

  it("closes a trailing list even when the input ends while still inside it", () => {
    // Regression for the inList-flush-at-EOF branch in parseLists(): a list
    // that is the very last thing in the text must still get its closing
    // </ul> (nothing after it to trigger the "line is not a list item" close).
    const html = renderContent("Some notes:\n- only item");
    expect(html).toContain("</ul>");
    expect(html.match(/<ul/g)?.length).toBe(1);
  });

  it("does not treat a lone dash inside a sentence as a list item", () => {
    const html = renderContent("The range is 10-20 km, roughly.");
    expect(html).not.toContain("<ul");
  });
});

describe("renderContent — BUG-038 regression (KaTeX stretchy SVG corruption)", () => {
  // KaTeX emits stretchy delimiters (e.g. \sqrt{}) as an inline <svg><path
  // d="..."> whose `d` attribute itself contains literal newline characters
  // (confirmed directly against the installed katex version — the path data
  // for \sqrt{982} spans multiple physical lines). renderContent()'s
  // newline -> <br /> pass used to split on every newline including ones
  // inside that SVG path data, splicing a literal "<br />" into the middle
  // of the path and breaking the SVG (`<path> attribute d: Expected path
  // command`). The fix tracks an `insideSvg` flag so <br /> is never
  // inserted while inside an <svg>...</svg> block.
  it("never splices <br /> into an SVG path's d attribute for a simple \\sqrt{}", () => {
    const html = renderContent("The result is $\\sqrt{982}$ meters.");
    const pathAttrs = [...html.matchAll(/<path\s+d="([^"]*)"/g)].map((m) => m[1]);
    expect(pathAttrs.length).toBeGreaterThan(0);
    for (const d of pathAttrs) {
      expect(d).not.toContain("<br");
    }
  });

  it("never splices <br /> into an SVG path's d attribute for multiple \\sqrt{} expressions surrounded by prose", () => {
    const html = renderContent(
      "Étape 1: compute $\\sqrt{v_x^2+v_y^2}$.\nÉtape 2: then $\\sqrt{982}$ again.\nFinal answer below."
    );
    const pathAttrs = [...html.matchAll(/<path\s+d="([^"]*)"/g)].map((m) => m[1]);
    expect(pathAttrs.length).toBeGreaterThan(0);
    for (const d of pathAttrs) {
      expect(d).not.toContain("<br");
    }
    // The prose around the math should still get its line breaks.
    expect(html).toContain("<br />");
  });

  it("still inserts a normal <br /> between two plain text lines with no math involved", () => {
    const html = renderContent("First line.\nSecond line.");
    expect(html).toContain("First line.<br />Second line.");
  });

  // Residual finding from QA's 2026-09-27 live verification of the BUG-038
  // fix above: the original fix (suppressing <br /> inside an svg block)
  // fully closed the "Expected path command" error, but left a subtler one
  // ("Expected number" in a path's d attribute, no visible defect) — KaTeX's
  // own \vec path template spans multiple lines, same as \sqrt's, so
  // suppressing <br /> without putting anything back glues the number
  // before the line break directly onto the number after it, corrupting the
  // path's argument count. A single space is safe SVG path whitespace and
  // fixes the concatenation without reintroducing <br />.
  it("never concatenates two numbers together inside a \\vec SVG path's d attribute", () => {
    const html = renderContent(
      "Étape 1: on applique la relation vectorielle $\\vec{F} = m\\vec{a}$.\nÉtape 2: donc $\\vec{v} = \\vec{v_0} + \\vec{a}t$.\nRésultat final ci-dessous."
    );
    const pathAttrs = [...html.matchAll(/<path\s+d="([^"]*)"/g)].map((m) => m[1]);
    expect(pathAttrs.length).toBeGreaterThan(0);
    for (const d of pathAttrs) {
      expect(d).not.toContain("<br");
    }
    // The prose around the math should still get its line breaks.
    expect(html).toContain("<br />");
  });
});
