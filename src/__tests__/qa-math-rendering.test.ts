import { describe, expect, it } from "vitest";
import { renderContent } from "@/lib/renderContent";

describe("QA — mixed mathematical correction rendering", () => {
  it("renders the pasted Markdown-escaped braced subscripts as mathematical subscripts", () => {
    const input = String.raw`Pour tout $n \in \mathbb{N}$ : $u\_{n+1} - u_n > 0$. De plus, $\lim\_{n \to +\infty} u_n = $\boxed{+\infty}`;
    const host = document.createElement("div"); host.innerHTML = renderContent(input);
    const normalized = document.createElement("div"); normalized.innerHTML = renderContent(input.replace(/\\_/g, "_"));
    host.querySelectorAll("annotation").forEach(node => node.remove());
    normalized.querySelectorAll("annotation").forEach(node => node.remove());
    expect(Array.from(host.querySelectorAll(".katex-mathml")).map(node => node.innerHTML)).toEqual(Array.from(normalized.querySelectorAll(".katex-mathml")).map(node => node.innerHTML));
    expect(host.querySelector(".katex-error")).toBeNull();
  });
  it.each([
    String.raw`\text{file\_{name}}`,
    String.raw`\text{nested {file\_{name}}}`,
    String.raw`\operatorname{file\_{name}}`,
    String.raw`\mathrm{file\_{name}}`,
    String.raw`\mathsf{file\_{name}}`,
    String.raw`\mathtt{file\_{name}}`,
    String.raw`score\_{raw}`,
  ])("preserves intentional literal underscores in %s", source => {
    const host = document.createElement("div"); host.innerHTML = renderContent(`$${source}$`);
    expect(host.querySelector(".katex-error")).toBeNull();
    expect(host.querySelector("annotation")?.textContent).toBe(source);
    expect(host.querySelector(".katex-mathml")?.textContent).toContain("_");
  });
  it("does not rewrite escaped underscores in prose", () => {
    const host = document.createElement("div"); host.innerHTML = renderContent(String.raw`File u\_{name} is a literal identifier.`);
    expect(host.textContent).toBe(String.raw`File u\_{name} is a literal identifier.`);
  });
  it("keeps proper inline limits, exponents and boxed results when a variation arrow follows", () => {
    const text = String.raw`Comme $2 > 1$, on a $\lim_{n \to +\infty} 2^n = +\infty$.
Or $e^{n \ln 2} = (e^{\ln 2})^n = 2^n$.
| $x$ | $-\infty$ | $+\infty$ |
| --- | --- | --- |
| $f(x)$ | $-3$ | $\nearrow$ |
Ainsi $\boxed{x = 1}$.`;
    const host = document.createElement("div");
    host.innerHTML = renderContent(text);
    // Exclude math annotations: their raw source is intentional for accessibility/editing.
    host.querySelectorAll(".katex").forEach(element => element.remove());
    expect(host.textContent).not.toContain(String.raw`\lim`);
    expect(host.textContent).not.toContain(String.raw`\boxed`);
    expect(host.textContent).not.toContain(String.raw`\nearrow`);
    expect(host.textContent).not.toContain("$");
  });
});
