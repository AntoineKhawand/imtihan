import { expect, test } from "@playwright/test";

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
    await rejectAnalytics.click();
    await expect(rejectAnalytics).toBeHidden();
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
    await expect(page.locator("main table")).toBeVisible();
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
