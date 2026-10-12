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
