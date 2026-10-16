import { describe, it, expect } from "vitest";
import { renderContent } from "@/lib/renderContent";

// Exercise the existing catch with real KaTeX, not a mocked success path.
// throwOnError:false only suppresses KaTeX ParseError; excessive recursive
// brace nesting still throws a native RangeError. The fallback must preserve
// editable source as escaped text, while the rest of the exercise survives.
function deepBraceNest(content: string, depth = 10000): string {
  return "{".repeat(depth) + content + "}".repeat(depth);
}

describe("renderContent — real KaTeX exception fallback", () => {
  it.each([
    { name: "inline", delimiter: "$", tag: "CODE" },
    { name: "display", delimiter: "$$", tag: "SPAN" },
  ])("preserves and escapes $name source after a real parser failure", ({ delimiter, tag }) => {
    const payload = `<img src=x onerror="alert(1)"> & 'quoted'`;
    const source = deepBraceNest(payload);
    const raw = `${delimiter}${source}${delimiter}`;
    let html = "";
    expect(() => { html = renderContent(`Before ${raw} after.`); }).not.toThrow();

    const container = document.createElement("div");
    container.innerHTML = html;
    const fallback = container.querySelector("[data-raw]");
    // This selector plus the absence of KaTeX distinguishes the actual catch
    // branch from the normal renderer (the interrupted test used depth 50).
    expect(fallback?.tagName).toBe(tag);
    expect(fallback?.classList.contains("font-mono")).toBe(true);
    expect(fallback?.getAttribute("data-raw")).toBe(raw);
    expect(fallback?.getAttribute("contenteditable")).toBe("false");
    expect(fallback?.textContent).toBe(source);
    expect(container.querySelector(".math-node, .katex, img, script, [onerror]")).toBeNull();
    expect(container.textContent).toBe(`Before ${source} after.`);
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#039;quoted&#039;");
  });

  it.each(["$", "$$"])("keeps ordinary shallow %s math on the KaTeX success path", (delimiter) => {
    const source = deepBraceNest("x", 5);
    const raw = `${delimiter}${source}${delimiter}`;
    const container = document.createElement("div");
    container.innerHTML = renderContent(`Before ${raw} after.`);
    const math = container.querySelector(".math-node");
    expect(math?.getAttribute("data-raw")).toBe(raw);
    expect(math?.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector("code.font-mono, span.block.font-mono")).toBeNull();
    expect(container.textContent).toContain("Before ");
    expect(container.textContent).toContain(" after.");
  });
});
