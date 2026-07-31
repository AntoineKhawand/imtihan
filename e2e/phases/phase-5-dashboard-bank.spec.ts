/**
 * PHASE 5 — Dashboard (/dashboard) & Question Bank (/bank)
 *
 * Dashboard and Bank both read their lists from localStorage (not Firestore),
 * so tests seed `imtihan_saved_exams` / `imtihan_question_bank` directly via
 * page.evaluate before navigating, then assert on the rendered UI.
 */
import { test, expect, type Page } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, TEST_PRO_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";

function exam(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: overrides.id ?? "e2e-exam-1",
    title: overrides.title ?? "Mathematics — eb9",
    context: {
      curriculumId: "bac-libanais",
      levelId: "eb9",
      subject: "mathematics",
      chapterIds: ["eb9-math-algebra"],
      language: "french",
      examType: "midterm",
      duration: 60,
      exerciseCount: 2,
      totalPoints: 10,
      difficultyMix: { easy: 1, medium: 1, hard: 0 },
    },
    exercises: [
      { id: "ex1", number: 1, type: "calculation", difficulty: "easy", points: 4, statement: "a", options: null, subQuestions: null, solution: { finalAnswer: "a", methodology: "a", commonMistakes: [], bareme: [], microBareme: [] }, chapterIds: [], estimatedMinutes: 3 },
      { id: "ex2", number: 2, type: "calculation", difficulty: "medium", points: 6, statement: "b", options: null, subQuestions: null, solution: { finalAnswer: "b", methodology: "b", commonMistakes: [], bareme: [], microBareme: [] }, chapterIds: [], estimatedMinutes: 5 },
    ],
    templateId: "classic",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

async function seedExams(page: Page, exams: unknown[]) {
  await page.evaluate((data) => localStorage.setItem("imtihan_saved_exams", JSON.stringify(data)), exams);
}

async function seedBank(page: Page, entries: unknown[]) {
  await page.evaluate((data) => localStorage.setItem("imtihan_question_bank", JSON.stringify(data)), entries);
}

const PRO_PROFILE = { proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, planType: "monthly", monthlyExamsGenerated: 0 };

// ─── Dashboard ────────────────────────────────────────────────────────────────

test.describe("/dashboard", () => {
  test("empty state shows Create your first exam", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, []);
    await page.goto(BASE_URL + "/dashboard");

    await expect(page.getByText("No exams yet")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Create your first exam/ })).toHaveAttribute("href", "/create");
  });

  test("exam row expands to show actions, Duplicate adds a copy, Delete removes it", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, [exam()]);
    await page.goto(BASE_URL + "/dashboard");

    await expect(page.getByText("Mathematics — eb9")).toBeVisible({ timeout: 20_000 });
    const row = page.locator(".card", { hasText: "Mathematics — eb9" }).first();
    await row.locator("button").last().click(); // chevron toggle

    await expect(page.getByText("Download Word")).toBeVisible();
    await expect(page.getByText("Download PDF")).toBeVisible();

    await page.getByRole("button", { name: /Duplicate/ }).click();
    await expect(page.getByText("Mathematics — eb9 (Copy)")).toBeVisible();
    const examRows = page.locator(".card", { hasText: "Mathematics — eb9" });
    await expect(examRows).toHaveCount(2);

    await page.getByRole("button", { name: /Delete/ }).first().click();
    await expect(examRows).toHaveCount(1);
  });

  test("exam row Download Word triggers a real download", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, [exam()]);
    await page.goto(BASE_URL + "/dashboard");

    await expect(page.getByText("Mathematics — eb9")).toBeVisible({ timeout: 20_000 });
    const row = page.locator(".card", { hasText: "Mathematics — eb9" }).first();
    await row.locator("button").last().click();

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15_000 }),
      page.getByRole("button", { name: /Download Word/ }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.docx$/);
  });

  test("search filters the exam list", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, [
      exam({ id: "e1", title: "Physics — eb9" }),
      exam({ id: "e2", title: "Chemistry — eb9" }),
    ]);
    await page.goto(BASE_URL + "/dashboard");

    const search = page.getByPlaceholder("Search by subject, curriculum, title…");
    await expect(page.getByText("Physics — eb9")).toBeVisible({ timeout: 20_000 });

    await search.fill("chemistry");
    await expect(page.getByText("Chemistry — eb9")).toBeVisible();
    await expect(page.getByText("Physics — eb9")).toBeHidden();

    await search.fill("nonexistent-subject-xyz");
    await expect(page.getByText(/No results for/)).toBeVisible();
  });

  test("free tier at quota limit shows Upgrade CTA and Request in-app", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { examsGenerated: 1, proExpiresAt: null, renewalRequested: false });
    await signInAs(page, TEST_FREE_UID, "/create");
    await seedExams(page, []);
    await page.goto(BASE_URL + "/dashboard");

    await expect(page.getByText(/Free limit reached/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Upgrade to Pro — \$5\.99\/mo/ })).toHaveAttribute("href", "/upgrade");

    await page.getByRole("button", { name: "Request in-app" }).click();
    await expect(page.getByText("REQUEST PENDING")).toBeVisible({ timeout: 10_000 });
  });

  test("pro tier at monthly quota limit can request a Reset Month", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, { ...PRO_PROFILE, monthlyExamsGenerated: 10, resetRequested: false });
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, []);
    await page.goto(BASE_URL + "/dashboard");

    await expect(page.getByText("LIMIT REACHED")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Reset Month" }).click();
    await expect(page.getByText("Reset Pending")).toBeVisible({ timeout: 10_000 });
  });

  test("Buy Extra opens the bundle modal, slider updates price, X closes it", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, []);
    await page.goto(BASE_URL + "/dashboard");

    await expect(page.getByRole("button", { name: /Buy Extra/ })).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /Buy Extra/ }).click();
    await expect(page.getByText("Buy Extra Exams")).toBeVisible();

    const slider = page.locator('input[type="range"]');
    await slider.fill("30");
    await expect(page.getByText("$11.99")).toBeVisible();

    await page.locator("button.absolute.top-4.right-4").click();
    await expect(page.getByText("Buy Extra Exams")).toBeHidden();
  });

  test("Purchase via WHISH opens a WhatsApp deep link", async ({ page, context, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, []);
    await page.goto(BASE_URL + "/dashboard");

    await page.getByRole("button", { name: /Buy Extra/ }).click();
    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: "Purchase via WHISH" }).click(),
    ]);
    expect(popup.url()).toMatch(/wa\.me/);
    await popup.close();
  });

  test("desktop sidebar shows all 6 nav links with correct hrefs", async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExams(page, []);
    await page.goto(BASE_URL + "/dashboard");

    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible({ timeout: 20_000 });
    const expected: Array<[string, string]> = [
      ["Overview", "/dashboard"],
      ["New Exam", "/create"],
      ["Question Bank", "/bank"],
      ["AI Scanner", "/scanner"],
      ["Analytics", "/analytics"],
      ["Community", "/community"],
    ];
    for (const [label, href] of expected) {
      await expect(sidebar.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("href", href);
    }
    // Pro users don't see the sidebar upgrade CTA
    await expect(sidebar.getByRole("link", { name: "Upgrade to Pro" })).toBeHidden();
  });
});

// ─── Bank ─────────────────────────────────────────────────────────────────────

test.describe("/bank", () => {
  test("empty state message shown for My Bank", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedBank(page, []);
    await page.goto(BASE_URL + "/bank");

    await expect(page.getByText("Your bank is empty")).toBeVisible({ timeout: 20_000 });
  });

  test("BankCard: View Corrigé reveals the answer, Remove deletes the entry", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedBank(page, [
      {
        id: "bank-1",
        exercise: {
          id: "ex-bank-1", number: 1, type: "calculation", difficulty: "easy", points: 5,
          statement: "Résoudre $x + 1 = 2$.", options: null, subQuestions: null,
          solution: { finalAnswer: "$x = 1$", methodology: "Isoler x.", commonMistakes: [], bareme: [], microBareme: [] },
          chapterIds: [], estimatedMinutes: 3,
        },
        subject: "mathematics",
        curriculumId: "bac-libanais",
        language: "french",
        savedAt: Date.now(),
        tags: [],
      },
    ]);
    await page.goto(BASE_URL + "/bank");

    await expect(page.getByText("Résoudre")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "View Corrigé" }).click();
    await expect(page.getByText("Isoler x.")).toBeVisible();

    await page.locator('button[title="Remove"]').click();
    await expect(page.getByText("Your bank is empty")).toBeVisible();
  });

  test("search filters personal bank entries", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedBank(page, [
      { id: "b1", exercise: { id: "e1", number: 1, type: "calculation", difficulty: "easy", points: 5, statement: "Physique: loi d'Ohm", options: null, subQuestions: null, solution: { finalAnswer: "x", methodology: "x", commonMistakes: [], bareme: [], microBareme: [] }, chapterIds: [], estimatedMinutes: 3 }, subject: "physics", curriculumId: "bac-libanais", language: "french", savedAt: Date.now(), tags: [] },
      { id: "b2", exercise: { id: "e2", number: 1, type: "calculation", difficulty: "easy", points: 5, statement: "Chimie: réaction acide-base", options: null, subQuestions: null, solution: { finalAnswer: "x", methodology: "x", commonMistakes: [], bareme: [], microBareme: [] }, chapterIds: [], estimatedMinutes: 3 }, subject: "chemistry", curriculumId: "bac-libanais", language: "french", savedAt: Date.now(), tags: [] },
    ]);
    await page.goto(BASE_URL + "/bank");

    const search = page.getByPlaceholder("Search your private questions…");
    await expect(page.getByText("loi d'Ohm")).toBeVisible({ timeout: 20_000 });
    await search.fill("chimie");
    await expect(page.getByText("réaction acide-base")).toBeVisible();
    await expect(page.getByText("loi d'Ohm")).toBeHidden();
  });

  test("My School tab: free tier sees the Pro upsell", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { proExpiresAt: null, examsGenerated: 0 });
    await signInAs(page, TEST_FREE_UID, "/create");
    await seedBank(page, []);
    await page.goto(BASE_URL + "/bank");

    await page.getByRole("button", { name: "My School" }).click();
    await expect(page.getByText("Pro feature")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: /Upgrade to Pro — \$5\.99\/mo/ })).toHaveAttribute("href", "/upgrade");
  });

  test("My School tab: pro tier without a school set sees Go to Settings", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, { ...PRO_PROFILE, school: "" });
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedBank(page, []);
    await page.goto(BASE_URL + "/bank");

    await page.getByRole("button", { name: "My School" }).click();
    await expect(page.getByText("Set your school first")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: "Go to Settings" })).toHaveAttribute("href", "/account");
  });

  test("My School tab: pro tier with a school set can open Invite Colleagues and copy the link", async ({ page, request }) => {
    await setupTestUser(request, TEST_PRO_UID, { ...PRO_PROFILE, school: "E2E Test School" });
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedBank(page, []);
    await page.goto(BASE_URL + "/bank");

    await page.getByRole("button", { name: "My School" }).click();
    await expect(page.getByText("E2E Test School")).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Invite Colleagues" }).click();
    await expect(page.getByText("Invite Colleagues")).toBeVisible();
    await expect(page.getByText(/join\/e2e-test-school/)).toBeVisible();

    await page.locator("button.h-11.w-11.rounded-xl").click();
    await expect(page.getByText("Copied!")).toBeVisible({ timeout: 3_000 });
  });
});
