import { expect, test } from "@playwright/test";

test.describe("Admin email diagnostics — isolated fixtures", () => {
  test.setTimeout(120_000);
  for (const width of [375, 768, 1440]) {
    test(`read-only configuration and recipient report at ${width}px`, async ({ page }) => {
      const requests: string[] = [];
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.setViewportSize({ width, height: 812 });
      await page.route("**/api/admin/send-email", route => {
        requests.push(route.request().method());
        expect(route.request().headers().authorization).toBe("Bearer qa-not-a-real-token");
        return route.fulfill({ json: { ready: false, issues: ["Configure MARKETING_POSTAL_ADDRESS in Vercel Production."] } });
      });
      await page.goto("/test-exam-regressions/admin-email");
      await expect(page.getByRole("heading", { name: /Admin email QA/ })).toBeVisible();
      const reject = page.getByRole("button", { name: "Reject analytics", exact: true });
      await expect(reject).toBeVisible(); await reject.click(); await expect(reject).toBeHidden();
      await expect(page.getByText("Promotional email configuration is incomplete:")).toBeVisible();
      const initialChecks = requests.length;
      expect(initialChecks).toBeGreaterThan(0);
      await page.getByRole("button", { name: "Check configuration" }).click();
      await expect.poll(() => requests.length).toBeGreaterThan(initialChecks);
      expect(requests.every(method => method === "GET")).toBe(true);
      const report = page.getByRole("status", { name: "Email send result" });
      await expect(report).toContainText("1 accepted by email provider · 2 failed · 1 skipped");
      await expect(report).toContainText('<script>alert("fixture")</script>');
      await expect(report.locator("script,img")).toHaveCount(0);
      await expect(report).toContainText("optout@example.test · Skipped");
      await expect(report).toContainText("Check Brevo logs before retrying");
      for (const theme of ["light", "dark"]) {
        if (theme === "dark") await page.getByRole("button", { name: "Toggle theme" }).click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: `test-results/admin-email-${width}-${theme}.png`, fullPage: true });
      }
      await page.getByRole("button", { name: "Dismiss send result" }).click();
      await expect(report).toHaveCount(0);
      expect(requests.every(method => method === "GET")).toBe(true);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("Harvey outreach — reviewed component fixtures", () => {
  test.setTimeout(120_000);
  for (const width of [375, 768, 1440]) {
    test(`draft failure, selection and review reset at ${width}px`, async ({ page }) => {
      const errors: string[] = [];
      const requests: string[] = [];
      let attempts = 0;
      page.on("pageerror", error => errors.push(error.message));
      await page.setViewportSize({ width, height: 812 });
      await page.route("**/api/admin/send-email", route => {
        requests.push(`config:${route.request().method()}`);
        return route.fulfill({ json: { ready: true, issues: [] } });
      });
      await page.route("**/api/admin/outreach-drafts", route => {
        requests.push(`draft:${route.request().method()}`);
        expect(route.request().headers().authorization).toBe("Bearer qa-not-a-real-token");
        expect(route.request().postDataJSON()).toEqual({ audience: "Maths teachers", language: "french", context: "Public curriculum assessment needs." });
        attempts++;
        return attempts === 1 ? route.fulfill({ status: 422, json: { error: '<img src=x onerror="alert(1)"> Draft checks failed.' } }) : route.fulfill({ json: { messages: [
          { subject: "Maths practice", body: "Would editable questions help your next assessment?" },
          { subject: "A useful chapter", body: "Which chapter should an example cover?" },
          { subject: "A final question", body: "Would a sample help?" },
        ] } });
      });
      await page.goto("/test-exam-regressions/admin-email");
      const reject = page.getByRole("button", { name: "Reject analytics", exact: true });
      await expect(reject).toBeVisible(); await reject.click(); await expect(reject).toBeHidden();
      const assistant = page.getByRole("region", { name: "Outreach assistant" });
      const generate = assistant.getByRole("button", { name: "Generate outreach drafts" });
      const reviewed = assistant.getByRole("checkbox");
      await expect(generate).toBeDisabled(); await expect(reviewed).toBeDisabled();
      await assistant.getByLabel("Audience", { exact: true }).fill("Maths teachers");
      await assistant.getByLabel("Public context", { exact: true }).fill("Public curriculum assessment needs.");
      await generate.click();
      await expect(assistant.getByRole("alert")).toContainText('<img src=x onerror="alert(1)">');
      await expect(assistant.locator("img,script")).toHaveCount(0);
      await generate.click();
      await expect(assistant.locator("article")).toHaveCount(3);
      await assistant.getByRole("button", { name: "Review draft 2", exact: true }).click();
      await expect(assistant.getByLabel("Outreach subject", { exact: true })).toHaveValue("A useful chapter");
      await expect(assistant.getByRole("textbox", { name: "Plain-text message", exact: true })).toHaveValue("Which chapter should an example cover?");
      await expect(reviewed).not.toBeChecked(); await reviewed.check();
      await assistant.getByLabel("Outreach subject", { exact: true }).fill("A revised chapter question");
      await expect(reviewed).not.toBeChecked();
      await reviewed.check(); await assistant.getByRole("textbox", { name: "Plain-text message", exact: true }).fill("ACT NOW");
      await expect(reviewed).not.toBeChecked(); await expect(reviewed).toBeDisabled();
      await expect(assistant.getByRole("list", { name: "Content checks" })).toContainText("spam phrases");
      await assistant.getByRole("textbox", { name: "Plain-text message", exact: true }).fill("Would an editable example be useful?");
      await expect(reviewed).toBeEnabled();
      for (const theme of ["light", "dark"]) {
        if (theme === "dark") await page.getByRole("button", { name: "Toggle theme" }).click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: `test-results/outreach-${width}-${theme}.png`, fullPage: true });
      }
      expect(requests.filter(request => request.startsWith("draft:"))).toEqual(["draft:POST", "draft:POST"]);
      expect(requests.filter(request => request.startsWith("config:")).every(request => request === "config:GET")).toBe(true);
      expect(errors).toEqual([]);
    });
  }
});
