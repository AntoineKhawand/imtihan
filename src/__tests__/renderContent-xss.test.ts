import { describe, it, expect } from "vitest";
import { renderContent } from "@/lib/renderContent";

// Regression test for a stored-XSS gap found in the `security` team's first
// audit pass: renderContent() is the shared renderer for AI/user-authored
// exercise text, inserted via dangerouslySetInnerHTML in ExerciseCard,
// ExerciseEditor, /bank, /student/practice, /exam/[id], and /print. Any
// signed-in account can freely edit an exercise's statement (ExerciseEditor)
// before sharing it to `schoolBank` (open to any authenticated
// read/write per firestore.rules), so this text is not just Gemini's own
// output — it is directly attacker-reachable. Before the fix, plain text
// outside of **bold**/*italic*/`code` markdown syntax was passed straight
// into the rendered HTML unescaped.
describe("renderContent — stored XSS", () => {
  it("neutralizes a raw <img onerror> payload in exercise statement text", () => {
    const payload = `Solve for x: <img src=x onerror="alert(document.cookie)">`;
    const html = renderContent(payload);
    expect(html).not.toContain("<img src=x onerror");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(document.cookie)&quot;&gt;");
  });

  it("neutralizes a raw <script> payload inside a markdown table cell", () => {
    const payload = "| A | B |\n| - | - |\n| <script>alert(1)</script> | ok |";
    const html = renderContent(payload);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("neutralizes a raw HTML payload inside a 'document' block body", () => {
    const payload =
      "Document n°1\n<img src=x onerror=alert(1)>\nSource: Ministère de l'Éducation, 2024";
    const html = renderContent(payload);
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
  });

  it("still renders legitimate bold/italic/list markdown as real tags", () => {
    const html = renderContent("**Bold text** and *italic text*\n- item one\n- item two");
    expect(html).toContain("<strong");
    expect(html).toContain(">Bold text<");
    expect(html).toContain("<em");
    expect(html).toContain(">italic text<");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
  });

  it("still renders inline and display KaTeX math", () => {
    const html = renderContent("Given $x^2 + 1$ and $$\\frac{a}{b}$$");
    expect(html).toContain("katex");
  });
});
