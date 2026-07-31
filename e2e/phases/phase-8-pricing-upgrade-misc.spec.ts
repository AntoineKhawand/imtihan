/**
 * PHASE 8 — Pricing/landing CTAs (authenticated), Upgrade, Scanner, Contact
 *
 * SAFETY NOTE: /upgrade's "email" contact path calls the real /api/upgrade
 * endpoint, which notifies the founder of a (fake) purchase request. We
 * verify the form validates and enables correctly but never click submit in
 * that mode. The WhatsApp path is a pure client-side wa.me deep link with no
 * server call, so it's exercised fully.
 *
 * Cost note: the Scanner test makes one real call to /api/scanner (Gemini
 * vision). Since the fixture image has no real exam content, we accept
 * either a rendered result or a graceful "Scanning failed" toast — the goal
 * is to prove the integration path works, not to assert a specific answer.
 */
import path from "path";
import { test, expect } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, TEST_PRO_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";
const PRO_PROFILE = { proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, planType: "monthly" };

// ─── Pricing / landing CTAs while authenticated ──────────────────────────────

test.describe("Pricing CTAs — authenticated", () => {
  test("free tier: /pricing Pro CTA still points to /upgrade", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { proExpiresAt: null, examsGenerated: 0 });
    await signInAs(page, TEST_FREE_UID, "/pricing");
    await expect(page.getByRole("link", { name: /Upgrade to Pro/ })).toHaveAttribute("href", "/upgrade");
  });

  test("pro tier: /pricing shows the Active — Pro plan badge instead of the upgrade CTA", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/pricing");
    await expect(page.getByText("Active — Pro plan")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Upgrade to Pro/ })).toBeHidden();
  });
});

// ─── /upgrade ─────────────────────────────────────────────────────────────────

test.describe("/upgrade", () => {
  test("plan toggle changes the displayed price", async ({ page }) => {
    await page.goto(BASE_URL + "/upgrade");
    await expect(page.getByText("$5.99", { exact: false }).first()).toBeVisible();

    await page.getByRole("button", { name: /Yearly/ }).click();
    await expect(page.getByText("$3.99", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("$47.88", { exact: false }).first()).toBeVisible();

    await page.getByRole("button", { name: "Monthly" }).click();
    await expect(page.getByText("$5.99", { exact: false }).first()).toBeVisible();
  });

  test("payment method radios are selectable", async ({ page }) => {
    await page.goto(BASE_URL + "/upgrade");
    const whish = page.locator('input[type="radio"][value="whish"]');
    const other = page.locator('input[type="radio"][value="other"]');
    await expect(whish).toBeChecked();
    await other.check();
    await expect(other).toBeChecked();
  });

  test("contact preference switches the live preview mockup", async ({ page }) => {
    await page.goto(BASE_URL + "/upgrade");
    await expect(page.getByText("Email preview — what you'll receive")).toBeVisible();
    await page.getByRole("button", { name: "WhatsApp", exact: true }).click();
    await expect(page.getByText("WhatsApp preview")).toBeVisible();
  });

  test("submit is disabled until name and a valid email are entered", async ({ page }) => {
    await page.goto(BASE_URL + "/upgrade");
    const submit = page.getByRole("button", { name: /Send me payment instructions|Continue on WhatsApp/ });
    await expect(submit).toBeDisabled();

    await page.getByPlaceholder("e.g. Jean-Paul Mansour").fill("E2E Tester");
    await expect(submit).toBeDisabled();
    await page.getByPlaceholder("jp.mansour@imtihan.live").fill("e2e@test.imtihan.live");
    await expect(submit).toBeEnabled();
    // Email-path submit is intentionally never clicked — see safety note above.
  });

  test("WhatsApp path opens a wa.me deep link and shows the success screen", async ({ page, context }) => {
    await page.goto(BASE_URL + "/upgrade");
    await page.getByPlaceholder("e.g. Jean-Paul Mansour").fill("E2E Tester");
    await page.getByPlaceholder("jp.mansour@imtihan.live").fill("e2e@test.imtihan.live");
    await page.getByRole("button", { name: "WhatsApp", exact: true }).click();

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: "Continue on WhatsApp" }).click(),
    ]);
    expect(popup.url()).toMatch(/wa\.me/);
    await popup.close();

    await expect(page.getByRole("heading", { name: "WhatsApp is open!" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Homepage/ })).toHaveAttribute("href", "/");
  });
});

// ─── /scanner ─────────────────────────────────────────────────────────────────

test.describe("/scanner", () => {
  test("free tier is blocked by the Pro guard", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { proExpiresAt: null, examsGenerated: 0 });
    await signInAs(page, TEST_FREE_UID, "/scanner");

    await expect(page.getByText(/Unlock AI Exam Scanner/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Get Pro Access/ })).toHaveAttribute("href", "/upgrade");
    await expect(page.getByRole("link", { name: /Back to Dashboard/ })).toHaveAttribute("href", "/dashboard");
  });

  test("pro tier can upload an image and run a real digitization pass", async ({ page, request }) => {
    test.setTimeout(45_000);
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/scanner");

    await expect(page.getByText("AI Exam Scanner")).toBeVisible({ timeout: 20_000 });
    await page.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures", "logo.png"));

    const startBtn = page.getByRole("button", { name: /Start Digitization/ });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    await expect(page.getByText(/Analyzing handwriting/)).toBeVisible({ timeout: 5_000 });

    const resultCard = page.getByText("Digital Extraction Result");
    const failureToast = page.getByText(/Scanning failed/);
    await expect(resultCard.or(failureToast)).toBeVisible({ timeout: 30_000 });
  });
});

// ─── /contact ─────────────────────────────────────────────────────────────────

test.describe("/contact", () => {
  test("submit is disabled until all required fields are valid", async ({ page }) => {
    await page.goto(BASE_URL + "/contact");
    const submit = page.getByRole("button", { name: "Send message" });
    await expect(submit).toBeDisabled();

    await page.getByPlaceholder("Teacher Name").fill("E2E Tester");
    await page.getByPlaceholder("teacher@school.edu.lb").fill("e2e@test.imtihan.live");
    await expect(submit).toBeDisabled();

    await page.getByPlaceholder(/Describe your question/).fill("Short");
    await expect(submit).toBeDisabled();
    await expect(page.getByText("5 chars")).toBeVisible();

    await page.getByPlaceholder(/Describe your question/).fill("This is a long enough test message.");
    await expect(submit).toBeEnabled();
  });

  test("topic dropdown is selectable", async ({ page }) => {
    await page.goto(BASE_URL + "/contact");
    const topic = page.locator("select");
    await topic.selectOption("bug");
    await expect(topic).toHaveValue("bug");
  });

  test("submitting shows the success screen, and Send another message resets the form", async ({ page }) => {
    await page.goto(BASE_URL + "/contact");
    await page.getByPlaceholder("Teacher Name").fill("E2E Tester");
    await page.getByPlaceholder("teacher@school.edu.lb").fill("e2e@test.imtihan.live");
    await page.getByPlaceholder(/Describe your question/).fill("This is a long enough test message for the e2e suite.");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Message sent!")).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: "Send another message" }).click();
    await expect(page.getByPlaceholder("Teacher Name")).toBeVisible();
    await expect(page.getByPlaceholder("Teacher Name")).toHaveValue("");
  });
});
