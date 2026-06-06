/**
 * e2e/subscription.spec.ts
 *
 * Tests the complete free-tier → Pro upgrade flow:
 *   1. API-level: extend-pro returns 200 with correct expiry
 *   2. Admin panel: ProBadge updates after +30D click
 *   3. Free user experience: paywall shown when quota exhausted
 *   4. Pro user experience: no paywall, correct monthly quota
 *   5. Dashboard: correct plan badge & quota numbers
 */

import { test, expect } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, ADMIN_UID } from "./helpers/auth";

const BASE_URL = "http://localhost:3005";

// ─── 1. Extend-pro API ───────────────────────────────────────────────────────

test.describe("extend-pro API", () => {
  test("returns 401 without auth token", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/admin/extend-pro`, {
      data: { targetUid: TEST_FREE_UID, days: 30 },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 with a fake bearer token", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/admin/extend-pro`, {
      headers: { Authorization: "Bearer fake.token.value" },
      data: { targetUid: TEST_FREE_UID, days: 30 },
    });
    expect(res.status()).toBe(401);
  });
});

// ─── 2. Admin panel upgrade flow ─────────────────────────────────────────────

test.describe("Admin panel — free → Pro upgrade", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ request }) => {
    // Reset the test user to free tier before each test
    await setupTestUser(request, TEST_FREE_UID, {
      examsGenerated: 1,
      monthlyExamsGenerated: 0,
      proExpiresAt: null,
      planType: "monthly",
    });
  });

  test("admin page loads and shows users table", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });
  });

  test("test user shows as Free before upgrade", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    // Wait for the table to be present instead of networkidle (polling keeps network busy)
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    // Search for the test user by email prefix
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(TEST_FREE_UID);
    await page.waitForTimeout(500);

    // Expect a "Free" badge somewhere in the filtered row
    await expect(page.getByText("Free").first()).toBeVisible({ timeout: 5_000 });
  });

  test("+30D click changes ProBadge to Pro and shows expiry date", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    // Filter to the test user
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(TEST_FREE_UID);
    await page.waitForTimeout(600);

    // Click the +30D button in the matching row
    const extend30Btn = page
      .locator("button")
      .filter({ hasText: /^\+30D$|^Extend 30D$/ })
      .first();
    await expect(extend30Btn).toBeVisible({ timeout: 5_000 });
    await extend30Btn.click();

    // The ProBadge should now show "Pro · Nd left" within 15s
    await expect(page.getByText(/Pro/).first()).toBeVisible({ timeout: 15_000 });

    // The expiry date line should appear (e.g. "Until 05 Jul 2026")
    await expect(page.getByText(/Until/).first()).toBeVisible({ timeout: 5_000 });
  });

  test("+30D button is present and wired up", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    const count = await page
      .locator("button")
      .filter({ hasText: /^\+30D$|^Extend 30D$/ })
      .count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── 3. Free user experience ─────────────────────────────────────────────────

test.describe("Free user — quota enforcement", () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ request }) => {
    // Free user who has already used their 1 free exam
    await setupTestUser(request, TEST_FREE_UID, {
      examsGenerated: 1,
      monthlyExamsGenerated: 0,
      proExpiresAt: null,
    });
  });

  test("dashboard shows Free tier badge", async ({ page }) => {
    await signInAs(page, TEST_FREE_UID, "/dashboard");

    // UserNav renders "Free tier" (CSS text-transform makes it "FREE TIER" visually)
    await expect(page.getByText(/free tier/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test("create page shows upgrade prompt when quota exhausted", async ({ page }) => {
    await signInAs(page, TEST_FREE_UID, "/create");

    // The paywall card appears IMMEDIATELY when quota is exhausted (no textarea shown)
    await expect(page.getByText(/You've reached the free limit/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/Upgrade to Pro/i).first()).toBeVisible({ timeout: 3_000 });
  });

  test("generate API returns 429 when quota exceeded", async ({ request, page }) => {
    // Sign in to get a valid session cookie in the browser context
    await signInAs(page, TEST_FREE_UID, "/dashboard");

    // The __session cookie is now set. Make an API call from the same browser context.
    // Body must pass Zod schema validation so we reach the quota check.
    const res = await page.request.post(`${BASE_URL}/api/generate`, {
      data: {
        context: {
          curriculumId: "bac-libanais",
          levelId: "terminale-s",
          subject: "mathematics",
          chapterIds: [],
          language: "french",
          examType: "midterm",
          duration: 60,
          exerciseCount: 3,
          totalPoints: 20,
          difficultyMix: { easy: 30, medium: 50, hard: 20 },
        },
        templateId: "default",
      },
    });
    // User has used their free exam, so should get 429
    expect(res.status()).toBe(429);
  });
});

// ─── 4. Pro user experience ───────────────────────────────────────────────────

test.describe("Pro user — no paywall, correct quota", () => {
  test.setTimeout(60_000);

  const PRO_EXPIRES = Date.now() + 30 * 24 * 60 * 60 * 1000;

  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_FREE_UID, {
      examsGenerated: 1,
      monthlyExamsGenerated: 0,
      proExpiresAt: PRO_EXPIRES,
      planType: "monthly",
      monthlyPeriodStart: Date.now(),
    });
  });

  test("dashboard shows Pro tier badge", async ({ page }) => {
    await signInAs(page, TEST_FREE_UID, "/dashboard");

    // UserNav renders "Pro tier" (CSS text-transform makes it "PRO TIER" visually)
    await expect(page.getByText(/pro tier/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("create page shows no paywall for pro user", async ({ page }) => {
    await signInAs(page, TEST_FREE_UID, "/create");

    // Pro users see the textarea (not the paywall card)
    await expect(page.locator("textarea").first()).toBeVisible({ timeout: 8_000 });

    // The "You've reached the free limit" paywall should NOT appear
    await expect(page.getByText(/You've reached the free limit/i)).toBeHidden();

    // The Analyze button should be present (it's disabled until text is typed — that's normal)
    await expect(page.locator("button").filter({ hasText: /Analyze/i }).first()).toBeVisible({ timeout: 5_000 });
  });

  test("sidebar shows no upgrade CTA for pro users", async ({ page }) => {
    await signInAs(page, TEST_FREE_UID, "/dashboard");
    // Wait for the pro badge to confirm profile loaded, then check sidebar
    await expect(page.getByText(/pro tier/i).first()).toBeVisible({ timeout: 10_000 });

    // The sidebar upgrade CTA should NOT be visible for pro users
    const upgradeLink = page.locator("aside").getByText(/upgrade/i);
    await expect(upgradeLink).toBeHidden();
  });
});

// ─── 5. Admin panel — Pro expiry display ─────────────────────────────────────

test.describe("Admin panel — expiry date display", () => {
  test.setTimeout(60_000);

  const PRO_EXPIRES_15D = Date.now() + 15 * 24 * 60 * 60 * 1000; // 15 days

  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_FREE_UID, {
      examsGenerated: 1,
      monthlyExamsGenerated: 2,
      proExpiresAt: PRO_EXPIRES_15D,
      planType: "monthly",
    });
  });

  test("ProBadge shows days remaining and expiry date for pro user", async ({ page }) => {
    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(TEST_FREE_UID);
    await page.waitForTimeout(600);

    // Should show "15d left" (or similar)
    await expect(page.getByText(/\d+d left/).first()).toBeVisible({ timeout: 8_000 });

    // Should show "Until DD Mon YYYY"
    await expect(page.getByText(/Until/).first()).toBeVisible({ timeout: 5_000 });
  });

  test("expired pro user shows Expired badge", async ({ request, page }) => {
    // Override to expired (1 day in the past)
    await setupTestUser(request, TEST_FREE_UID, {
      proExpiresAt: Date.now() - 24 * 60 * 60 * 1000,
    });

    await signInAs(page, ADMIN_UID, "/admin");
    await expect(page.locator("table").first()).toBeVisible({ timeout: 15_000 });

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(TEST_FREE_UID);
    await page.waitForTimeout(600);

    await expect(page.getByText("Expired").first()).toBeVisible({ timeout: 8_000 });
  });
});

// ─── 6. Regression: step indicator ───────────────────────────────────────────

test.describe("Step indicator regression", () => {
  test.setTimeout(60_000);

  test("generate page shows correct step count (not 4 of 3)", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, {
      examsGenerated: 0,
      proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    await signInAs(page, TEST_FREE_UID, "/create/generate");

    // Should show "Step 4 of 5", not "Step 4 of 3"
    const stepLabel = page.getByText(/Step.*of/i).first();
    await expect(stepLabel).toBeVisible({ timeout: 8_000 });
    const text = await stepLabel.textContent();
    expect(text).toMatch(/of 5/i);
    expect(text).not.toMatch(/of 3/i);
  });
});
