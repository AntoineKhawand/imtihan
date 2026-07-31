/**
 * PHASE 6 — Community Library (/community)
 *
 * The sign-in gate itself is covered in Phase 1; this phase focuses on the
 * authenticated body: the free-tier blur/upsell, HowToShare, search/sort,
 * and the per-card Like/Preview/Download/Remix actions plus the preview
 * modal. Exam data is static (src/data/communityExams.ts), so no seeding
 * is needed beyond signing in.
 */
import { test, expect } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, TEST_PRO_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";
const PRO_PROFILE = { proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, planType: "monthly" };

test.describe("/community — free tier", () => {
  test("content is blurred behind a Pro upsell", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { proExpiresAt: null, examsGenerated: 0 });
    await signInAs(page, TEST_FREE_UID, "/community");

    await expect(page.getByText("Pro feature — Community Library")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Upgrade to Pro — \$5\.99\/mo/ })).toHaveAttribute("href", "/upgrade");
    await expect(page.locator(".opacity-40.blur-sm")).toBeVisible();
  });
});

test.describe("/community — pro tier", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
  });

  test("no blur overlay and no upsell banner", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    await expect(page.getByText("Community Library")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Pro feature — Community Library")).toBeHidden();
    await expect(page.locator(".opacity-40.blur-sm")).toBeHidden();
  });

  test("How sharing works expands and Copy copies the email", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    await page.getByText("Share your exam with the community").click();
    await expect(page.getByText("We review and publish")).toBeVisible();

    await page.getByRole("button", { name: "Copy" }).click();
    await expect(page.getByText("Copied!")).toBeVisible({ timeout: 3_000 });
  });

  test("search filters the exam grid", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    const search = page.getByPlaceholder("Search by subject, curriculum, level…");
    await expect(page.getByText("Physique — Mécanique et Électromagnétisme")).toBeVisible({ timeout: 20_000 });

    await search.fill("chemistry");
    await expect(page.getByText("IB Chemistry HL — Organic & Equilibria")).toBeVisible();
    await expect(page.getByText("Physique — Mécanique et Électromagnétisme")).toBeHidden();

    await search.fill("no-such-exam-xyz");
    await expect(page.getByText(/No exams match/)).toBeVisible();
  });

  test("sort buttons switch the active tab", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    await expect(page.getByRole("button", { name: "popular" })).toBeVisible({ timeout: 20_000 });

    const recentBtn = page.getByRole("button", { name: "recent" });
    await recentBtn.click();
    await expect(recentBtn).toHaveClass(/font-medium/);

    const downloadsBtn = page.getByRole("button", { name: "downloads" });
    await downloadsBtn.click();
    await expect(downloadsBtn).toHaveClass(/font-medium/);
  });

  test("Like toggles the heart and increments the count", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    const card = page.locator(".card", { hasText: "Physique — Mécanique et Électromagnétisme" });
    await expect(card).toBeVisible({ timeout: 20_000 });

    const likeBtn = card.getByTitle("Like this exam");
    const before = await likeBtn.textContent();
    await likeBtn.click();
    await expect(likeBtn).not.toHaveText(before ?? "");
    await likeBtn.click();
    await expect(likeBtn).toHaveText(before ?? "");
  });

  test("Preview opens the modal with exercises, and X closes it", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    const card = page.locator(".card", { hasText: "Physique — Mécanique et Électromagnétisme" });
    await expect(card).toBeVisible({ timeout: 20_000 });

    await card.getByTitle("Preview exam questions").click();
    await expect(page.getByText("Exercise 1")).toBeVisible();
    await expect(page.getByRole("button", { name: "Download Word" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Remix this exam" })).toBeVisible();

    await page.locator(".fixed.inset-0.z-50 button").first().click();
    await expect(page.getByText("Exercise 1")).toBeHidden();
  });

  test("Word download from the card triggers a real file download", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    const card = page.locator(".card", { hasText: "Physique — Mécanique et Électromagnétisme" });
    await expect(card).toBeVisible({ timeout: 20_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }),
      card.getByTitle("Download as Word document (with answer key)").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.docx$/);
  });

  test("Remix seeds sessionStorage and navigates straight to /create/generate", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/community");
    const card = page.locator(".card", { hasText: "Physique — Mécanique et Électromagnétisme" });
    await expect(card).toBeVisible({ timeout: 20_000 });

    await card.getByTitle("Generate a similar exam using this structure").click();
    await page.waitForURL(/\/create\/generate/, { timeout: 20_000 });

    const remixSource = await page.evaluate(() => sessionStorage.getItem("imtihan_remix_source"));
    expect(remixSource).toBe("Physique — Mécanique et Électromagnétisme");
  });
});
