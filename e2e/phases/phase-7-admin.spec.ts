/**
 * PHASE 7 — Admin panel (/admin)
 *
 * SAFETY NOTE: the admin panel operates on the REAL production Firestore
 * `users` collection and can send REAL emails to every real user, and the
 * Blog tab publishes a REAL AI-written post to the live public blog. This
 * suite therefore:
 *   - only ever exercises row actions (+30D/+1Y/+10Q/Reset) on our own test
 *     user, always narrowed first via the search box so no other row can
 *     ever be affected,
 *   - never clicks "Send Emails" (would mass-email real users), and
 *   - never clicks "Generate Article Now" (would publish a real blog post).
 * The non-admin "Access Denied" redirect is covered in Phase 1.
 */
import { test, expect } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, ADMIN_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";

test.describe("/admin", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_FREE_UID, {
      examsGenerated: 0,
      monthlyExamsGenerated: 0,
      proExpiresAt: null,
      planType: "monthly",
      extraExamsQuota: 0,
      renewalRequested: false,
      resetRequested: false,
    });
  });

  test("tab switcher moves between Users, Email and Blog", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "email", exact: true }).click();
    await expect(page.getByText("Choose Template")).toBeVisible();

    await page.getByRole("button", { name: "blog", exact: true }).click();
    await expect(page.getByText("Autonomous Blog Engine")).toBeVisible();

    await page.getByRole("button", { name: "users", exact: true }).click();
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("filter buttons toggle active state", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    const pending = page.getByRole("button", { name: /Pending Requests/ });
    await pending.click();
    await expect(pending).toHaveClass(/bg-amber-500/);
    await pending.click();

    const yearly = page.getByRole("button", { name: /Yearly Only/ });
    await yearly.click();
    await expect(yearly).toHaveClass(/bg-purple-600/);
    await yearly.click();

    await expect(page.getByRole("button", { name: "All Users" })).toHaveClass(/bg-emerald-600/);
  });

  test("+1Y extends the test user and updates the ProBadge", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    await page.locator('input[placeholder="Search email or name..."]').fill(TEST_FREE_UID);
    await page.waitForTimeout(500);

    await expect(page.getByText("Free").first()).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: "+1Y" }).click();
    await expect(page.getByText(/Pro · \d+d left/).first()).toBeVisible({ timeout: 15_000 });
  });

  test("+10Q adds bonus quota to the test user", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    await page.locator('input[placeholder="Search email or name..."]').fill(TEST_FREE_UID);
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "+10Q" }).click();
    await expect(page.getByText("+10", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("Reset clears the test user's trial", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { examsGenerated: 1 });
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    await page.locator('input[placeholder="Search email or name..."]').fill(TEST_FREE_UID);
    await page.waitForTimeout(500);

    await page.getByRole("button", { name: "Reset", exact: true }).click();
    // Toast confirms — the row action button itself has no persistent label change,
    // so we assert on the sonner toast text.
    await expect(page.getByText("Free trial reset")).toBeVisible({ timeout: 10_000 });
  });

  test("select-all checkbox only selects the currently filtered rows", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    await page.locator('input[placeholder="Search email or name..."]').fill(TEST_FREE_UID);
    await page.waitForTimeout(500);

    await page.locator("thead button").first().click();
    await expect(page.getByText("1 user", { exact: false })).toBeVisible({ timeout: 5_000 });
  });

  test("Email tab: template picker, custom HTML fields, and segment counts (never sends)", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "email", exact: true }).click();

    await expect(page.getByText("Newsletter")).toBeVisible();
    await page.getByRole("button", { name: /Custom HTML/ }).click();
    await expect(page.getByPlaceholder("Email subject...")).toBeVisible();
    await expect(page.getByPlaceholder("Email HTML content...")).toBeVisible();

    await expect(page.getByRole("button", { name: /^All \(\d+\)/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^No Exams \(\d+\)/ })).toBeVisible();

    const recipientSearch = page.getByPlaceholder("Filter by email or name...");
    await recipientSearch.fill(TEST_FREE_UID);
    await expect(page.getByText(`${TEST_FREE_UID}@test.imtihan.live`)).toBeVisible({ timeout: 5_000 });

    await page.getByText(`${TEST_FREE_UID}@test.imtihan.live`).click();
    await expect(page.getByText("1 selected")).toBeVisible();

    const sendBtn = page.getByRole("button", { name: "Send Emails" });
    await expect(sendBtn).toBeEnabled();
    // Intentionally never clicked — see safety note at the top of this file.
  });

  test("Blog tab shows the autonomous engine controls without triggering a publish", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "blog", exact: true }).click();

    await expect(page.getByRole("button", { name: "Generate Article Now" })).toBeEnabled();
    await expect(page.getByRole("link", { name: /Go to Blog Index/ })).toHaveAttribute("href", "/blog");
    // Intentionally never clicked — see safety note at the top of this file.
  });
});
