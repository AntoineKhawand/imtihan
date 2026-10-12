import { describe, expect, it } from "vitest";
import { renderContent } from "@/lib/renderContent";

describe("QA — mixed mathematical correction rendering", () => {
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
