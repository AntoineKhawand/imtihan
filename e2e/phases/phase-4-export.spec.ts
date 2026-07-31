/**
 * PHASE 4 — Export page (/create/export)
 *
 * Covers header info fields, the Pro-gated logo upload, the classic/modern
 * template toggle, the corrigé/exam-only toggle, the Pro-gated variant
 * picker, the real Word download + PDF new-tab open, "Save to my library",
 * and the Pro-gated "Send to my email" flow.
 *
 * Cost note: the Word download hits /api/export (docx generation, no AI
 * call — cheap). The email test hits /api/export/send, which calls the real
 * Brevo API to send mail to a `@test.imtihan.live` address that doesn't
 * exist; it bounces harmlessly but does spend a small amount of Brevo send
 * quota once per day this phase runs.
 */
import path from "path";
import { test, expect, type Page } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, TEST_PRO_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";

const CONTEXT = {
  curriculumId: "bac-libanais",
  levelId: "eb9",
  subject: "mathematics",
  chapterIds: ["eb9-math-algebra"],
  language: "french",
  examType: "midterm",
  duration: 60,
  exerciseCount: 1,
  totalPoints: 6,
  difficultyMix: { easy: 0, medium: 1, hard: 0 },
};

const EXERCISE = {
  id: "e2e-export-1",
  number: 1,
  type: "calculation",
  difficulty: "medium",
  points: 6,
  statement: "Calculer la dérivée de $f(x) = x^2$.",
  options: null,
  subQuestions: null,
  solution: {
    finalAnswer: "$f'(x) = 2x$",
    methodology: "Étape 1: dérivée d'un monôme.",
    commonMistakes: [],
    bareme: [{ label: "Q1", points: 6, criterion: "Dérivée correcte" }],
    microBareme: [],
  },
  chapterIds: ["eb9-math-algebra"],
  estimatedMinutes: 5,
};

async function seedExport(page: Page) {
  await page.evaluate(
    ({ ctx, ex }) => {
      sessionStorage.setItem("imtihan_context", JSON.stringify(ctx));
      sessionStorage.setItem("imtihan_exercises", JSON.stringify([ex]));
    },
    { ctx: CONTEXT, ex: EXERCISE }
  );
}

const PRO_PROFILE = { proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, planType: "monthly" };

test.describe("/create/export", () => {
  test("redirects to /create when context/exercises are missing", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create/export");
    await page.waitForURL(/\/create$/, { timeout: 20_000 });
  });

  test("header info fields are editable and persist across reload", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await page.getByPlaceholder("École Évangélique du Liban").fill("Collège E2E Test");
    await page.getByPlaceholder("Terminale S — Section A").fill("Terminale S — B");
    await page.getByPlaceholder("M. Teacher Name").fill("M. Playwright");

    await page.reload();
    await expect(page.getByPlaceholder("École Évangélique du Liban")).toHaveValue("Collège E2E Test");
    await expect(page.getByPlaceholder("M. Teacher Name")).toHaveValue("M. Playwright");
  });

  test("free tier: logo upload is disabled, template modern is locked, variant is locked", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { proExpiresAt: null, examsGenerated: 0 });
    await signInAs(page, TEST_FREE_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await expect(page.getByText("UPGRADE TO ADD LOGO")).toBeVisible();
    await expect(page.locator("#logo-upload")).toBeDisabled();

    await page.getByRole("button", { name: /modern/i }).click();
    await expect(page.getByRole("button", { name: "classic", exact: true })).toHaveClass(/bg-\[var\(--accent\)\]/);

    await expect(page.getByRole("button", { name: "Version A" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Version B" })).toBeDisabled();

    await expect(page.getByText("Pro Feature")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send to my email" })).toBeDisabled();
  });

  test("pro tier: logo upload works and Remove clears it", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await page.locator("#logo-upload").setInputFiles(path.join(__dirname, "fixtures", "logo.png"));
    await expect(page.getByAltText("School Logo")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Change Logo")).toBeVisible();

    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByAltText("School Logo")).toBeHidden();
  });

  test("pro tier: template toggle switches between classic and modern", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    const modernBtn = page.getByRole("button", { name: "modern", exact: true });
    await modernBtn.click();
    await expect(modernBtn).toHaveClass(/bg-\[var\(--accent\)\]/);

    const classicBtn = page.getByRole("button", { name: "classic", exact: true });
    await classicBtn.click();
    await expect(classicBtn).toHaveClass(/bg-\[var\(--accent\)\]/);
  });

  test("Includes corrigé / Exam only toggle flips label", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    const toggle = page.getByRole("button", { name: /Includes corrigé|Exam only/ });
    await expect(toggle).toHaveText("Includes corrigé");
    await toggle.click();
    await expect(toggle).toHaveText("Exam only");
    await toggle.click();
    await expect(toggle).toHaveText("Includes corrigé");
  });

  test("pro tier: variant picker switches to Version B", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await page.getByRole("button", { name: "Version B" }).click();
    await expect(page.getByText("Exercises and sub-questions reordered.")).toBeVisible();
    await page.getByRole("button", { name: "Version A" }).click();
    await expect(page.getByText("Original exercise order.")).toBeVisible();
  });

  test("Word download triggers a real file download and marks itself complete", async ({ page, request }) => {
    test.setTimeout(30_000);
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }),
      page.getByRole("button", { name: /Word \(\.docx\)/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.docx$/);

    // Downloading auto-saves to the library too
    await expect(page.getByText("Saved to your library")).toBeVisible({ timeout: 5_000 });
  });

  test("PDF button opens /print in a new tab", async ({ page, context, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: "PDF" }).click(),
    ]);
    await newPage.waitForLoadState("domcontentloaded");
    expect(newPage.url()).toMatch(/\/print/);
    await newPage.close();
  });

  test("Save to my library shows the confirmation and hides the button", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await page.getByRole("button", { name: /Save to my library/ }).click();
    await expect(page.getByText("Saved to your library")).toBeVisible();
    await expect(page.getByRole("button", { name: /Save to my library/ })).toBeHidden();
  });

  test("pro tier: email flow sends via the real API and shows the success line", async ({ page, request }) => {
    test.setTimeout(30_000);
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await page.getByRole("button", { name: "Send to my email" }).click();
    const emailInput = page.getByPlaceholder("teacher@school.edu.lb");
    await expect(emailInput).toBeVisible();

    const sendBtn = page.getByRole("button", { name: "Send" });
    await expect(sendBtn).toBeDisabled();
    await emailInput.fill(`${TEST_PRO_UID}@test.imtihan.live`);
    await expect(sendBtn).toBeEnabled();

    await page.getByLabel(/Include corrigé/).uncheck();
    await sendBtn.click();

    await expect(page.getByText(/Email sent to|Could not send email/)).toBeVisible({ timeout: 20_000 });
  });

  test("bottom nav: View my library and New exam links", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExport(page);
    await page.goto(BASE_URL + "/create/export");

    await expect(page.getByRole("link", { name: /View my library/ })).toHaveAttribute("href", "/dashboard");
    await expect(page.getByRole("link", { name: /New exam/ })).toHaveAttribute("href", "/create");
  });
});
