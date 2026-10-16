import { expect, test } from "@playwright/test";

function contrastRatio(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const channels = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map(value => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    if (channels.length !== 3) throw new Error(`Unexpected computed RGB color: ${color}`);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const [a, b] = [luminance(foreground), luminance(background)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Isolated real component tests. The route is disabled in production; its AI
// callback and image response are fixtures, not evidence of provider health.
test.describe("Exam fixes — isolated browser acceptance", () => {
  test.setTimeout(120_000);
  let pageErrors: string[];
  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.route("**/api/image/generate?**", (route) => route.fulfill({
      contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="green"/></svg>',
    }));
    await page.route("**/api/visual/mermaid?**", (route) => route.fulfill({
      contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="blue"/></svg>',
    }));
    await page.goto("/test-exam-regressions");
    await expect(page.getByRole("heading", { name: /Exam QA/ })).toBeVisible();
    const rejectAnalytics = page.getByRole("button", { name: "Reject analytics", exact: true });
    await expect(rejectAnalytics).toBeVisible();
    await Promise.all([page.waitForEvent("load"), rejectAnalytics.click()]);
    await expect(rejectAnalytics).toBeHidden();
    await expect(page.locator("main")).toHaveAttribute("data-qa-ready", "true");
  });
  test.afterEach(() => expect(pageErrors, "uncaught browser exceptions").toEqual([]));

  test("exact reported corrigé renders boxed infinity without raw LaTeX", async ({ page }) => {
    const text = await page.locator("main").innerText();
    expect(text).not.toContain(String.raw`\boxed`);
    expect(text).not.toContain(String.raw`\lim`);
    expect(text).not.toContain("$");
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(await page.locator(".katex").count()).toBeGreaterThan(5);
    await expect(page.getByText("strictement croissante", { exact: false })).toBeVisible();
  });

  test("BUG-062 notation recovery preserves variables, complete quantities and prose", async ({ page }) => {
    const recovered = page.getByTestId("recovered-notation");
    expect(await recovered.locator(".math-node").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-raw"))))
      .toEqual([String.raw`$\frac{dx}{dt}$`, String.raw`$\frac{d^2Y}{dX^2}$`, "$B = 0,5 T$", "$m = 100 g$", String.raw`$\ce{H2O}$`, String.raw`$\ce{Fe2O3}$`, String.raw`$\ce{NaCl}$`]);
    await expect(recovered.locator(".katex")).toHaveCount(7);
    await expect(recovered.locator(".katex-error")).toHaveCount(0);
    const prose = page.getByTestId("preserved-prose");
    await expect(prose).toHaveText("Chapter: let x = the unknown value in m. Chemistry, No, IB, AI and CNN are plain prose.");
    await expect(prose.locator(".math-node")).toHaveCount(0);
    await expect(page.getByTestId("preserved-explicit-math").locator(".math-node")).toHaveAttribute("data-raw", String.raw`$\text{H2O and dx/dt}$`);
    await expect(page.getByTestId("preserved-explicit-math").locator(".katex-error")).toHaveCount(0);
    await page.screenshot({ path: "test-results/bug062-recovered-notation.png", fullPage: true });
  });

  test("variation row labels render injected markup as text without execution", async ({ page }) => {
    const variation = page.getByTestId("escaped-variation-label");
    await expect(variation.locator("table")).toBeVisible();
    await expect(variation.locator("tr").nth(1).locator("td").first()).toHaveText("<img src=x onerror=window.__variationXss=1>");
    await expect(variation.locator("img,script,svg[onload]")).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__variationXss)).toBeUndefined();
  });

  for (const width of [375, 768, 1440]) {
    test(`variation table text contrasts with its surface in both themes at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      const variation = page.getByTestId("escaped-variation-label");
      const surface = variation.locator("[data-raw]");
      const backgrounds: string[] = [];
      for (const theme of ["light", "dark"]) {
        if (theme === "dark") await page.getByRole("button", { name: "Toggle theme" }).click();
        // Let the existing theme transition settle before measuring actual pixels/styles.
        await page.waitForTimeout(400);
        const background = await surface.evaluate(element => getComputedStyle(element).backgroundColor);
        expect(background).not.toBe("rgba(0, 0, 0, 0)");
        backgrounds.push(background);
        const zero = variation.locator("tr").first().locator("td").nth(1);
        await expect(zero).toHaveText("0");
        const colors = await variation.locator("td, td span").evaluateAll(cells => cells.filter(cell => cell.textContent?.trim()).map(cell => getComputedStyle(cell).color));
        const ratios = colors.map(color => contrastRatio(color, background));
        for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
        console.log("Variation contrast", JSON.stringify({ width, theme, background, colors, ratios }));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await variation.screenshot({ path: `test-results/variation-${width}-${theme}.png` });
      }
      expect(backgrounds[1]).not.toBe(backgrounds[0]);
    });
  }

  test("real print composition retains a white variation surface and dark ink under dark app theme", async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => undefined;
      sessionStorage.setItem("imtihan_context", JSON.stringify({ curriculumId: "bac-libanais", levelId: "terminale-gs", subject: "mathematics", chapterIds: [], language: "french", examType: "practice", duration: 30, exerciseCount: 1, totalPoints: 5, pointsPerExercise: [5], difficultyMix: { easy: 0, medium: 0, hard: 1 } }));
      sessionStorage.setItem("imtihan_exercises", JSON.stringify([{ id: "qa-print-variation", number: 1, type: "problem_solving", difficulty: "hard", points: 5, chapterIds: [], estimatedMinutes: 10, statement: "[VARIATION:\nx: 0, 1\nf: +, -\n]", solution: { finalAnswer: "Reviewed practice", methodology: "Read the variation table." } }]));
    });
    await page.goto("/print");
    const table = page.locator('.exam-document [data-raw^="[VARIATION:"]');
    await expect(table).toBeVisible();
    await page.evaluate(() => { document.documentElement.classList.add("dark"); document.documentElement.setAttribute("data-theme", "dark"); });
    await page.emulateMedia({ media: "print" });
    const background = await table.evaluate(element => getComputedStyle(element).backgroundColor);
    const zero = table.locator("tr").first().locator("td").nth(1);
    await expect(zero).toHaveText("0");
    const color = await zero.locator("span").evaluate(element => getComputedStyle(element).color);
    expect(background).toBe("rgb(255, 255, 255)");
    expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(7);
    console.log("Variation print contrast", JSON.stringify({ background, color, ratio: contrastRatio(color, background) }));
    await page.screenshot({ path: "test-results/variation-print-dark-app.png", fullPage: true });
  });

  for (const [label, mode, prompt] of [
    ["Add Math Plot (SVG)", "plot", "x^2"],
    ["Add Diagram (Mermaid)", "visual", "Suite croissante"],
    ["Generate AI Illustration", "image", "Classroom illustration"],
  ] as const) {
    test(`${mode} action passes teacher instruction and renders result`, async ({ page }) => {
      await page.getByRole("button", { name: label, exact: true }).click();
      const input = page.locator('input[type="text"]').last();
      await input.fill(prompt);
      const diagramRequest = mode === "visual" ? page.waitForRequest(request => request.url().includes("/api/visual/mermaid?")) : null;
      await page.getByRole("button", { name: "Add", exact: true }).click();
      await expect(page.getByTestId("transform-request")).toContainText(JSON.stringify({ id: "qa-exam", mode, prompt }));
      if (mode === "plot") await expect(page.locator(".imtihan-mathplot-mount svg")).toBeVisible();
      else if (mode === "visual") {
        const diagram = page.locator('main img[src^="/api/visual/mermaid?"]');
        await expect(diagram).toBeVisible();
        const source = await diagram.getAttribute("src");
        expect(new URL(source!, "http://localhost:3017").searchParams.get("code")).toBe("flowchart TD\nA[Suite] --> B[Strictement croissante]");
        expect(new URL((await diagramRequest!).url()).searchParams.get("code")).toBe("flowchart TD\nA[Suite] --> B[Strictement croissante]");
        await expect.poll(() => diagram.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      } else await expect(page.locator('main img').last()).toBeVisible();
      await expect(page.locator(".katex-error")).toHaveCount(0);
    });
  }

  test("table configuration and automatic chart insertion both work", async ({ page }) => {
    await page.getByRole("button", { name: "Format as Table", exact: true }).click();
    await expect(page.getByRole("button", { name: "Apply Table" })).toBeDisabled();
    await page.getByLabel("Columns", { exact: true }).fill("2");
    await page.getByLabel("Rows (excluding header)", { exact: true }).fill("2");
    await page.getByLabel("Column headers (comma-separated)", { exact: true }).fill("n, u_n");
    await page.getByRole("button", { name: "Apply Table" }).click();
    await expect(page.getByTestId("transform-request")).toContainText('"mode":"table"');
    await expect(page.locator('[data-tutorial="exercise-card"] table')).toBeVisible();
    await page.getByRole("button", { name: "Exercise actions", exact: true }).click();
    await page.getByRole("button", { name: "Insert chart", exact: true }).click();
    await expect(page.getByTestId("transform-request")).toContainText('"mode":"insertPlot"');
    await expect(page.locator(".imtihan-mathplot-mount svg")).toBeVisible();
  });

  for (const width of [375, 768, 1440]) {
    test(`dropdown keyboard, theme and viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      const trigger = page.getByRole("combobox", { name: "Exam language", exact: true });
      await trigger.focus();
      await trigger.press("ArrowDown");
      const menu = page.getByRole("listbox");
      await expect(menu).toBeVisible();
      await page.getByRole("option", { name: "English", exact: true }).click();
      await expect(page.getByTestId("selected-language")).toHaveText("english");
      await trigger.focus();
      await trigger.press("ArrowUp");
      await trigger.press("ArrowUp");
      await trigger.press("Enter");
      await expect(page.getByTestId("selected-language")).toHaveText("french");
      await trigger.click();
      await trigger.press("Escape");
      await expect(menu).toBeHidden();
      await trigger.click();
      const lightBackground = await menu.evaluate((element) => getComputedStyle(element).backgroundColor);
      await page.getByRole("heading", { name: /Exam QA/ }).click();
      await expect(menu).toBeHidden();
      await page.getByRole("button", { name: "Toggle theme" }).click();
      await trigger.click();
      await expect(menu).toBeVisible();
      expect(await menu.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightBackground);
      const box = await menu.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(813);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/exam-dropdown-${width}-dark.png`, fullPage: true });
    });
  }
});
