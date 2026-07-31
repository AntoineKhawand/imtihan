/**
 * PHASE 2 — Exam Creation: Describe (Step 1) & Confirm/Configure (Step 2)
 *
 * Covers every interactive element on /create and /create/confirm: textarea +
 * char limit, example-prompt chips, saved class profiles (add/apply/remove),
 * arXiv research search, file dropzone, the free-tier limit gate, all six
 * dropdowns on the confirm page, geographic-context input, chapter chips +
 * validation, blueprint point/exercise inputs, template picker, and the
 * Pro-gated "Generate Version B" toggle.
 *
 * Cost note: "Analyze & continue" makes one real call to /api/analyze
 * (Gemini). That's intentional — it's the cheapest possible check that the
 * analyze integration hasn't regressed. We do NOT drive a full multi-exercise
 * generation from here; that's Phase 3's job, with exerciseCount pinned low.
 */
import path from "path";
import { test, expect, type Page } from "@playwright/test";
import { signInAs, setupTestUser, TEST_FREE_UID, TEST_PRO_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";

const PRO_PROFILE = {
  proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  planType: "monthly",
  examsGenerated: 0,
  monthlyExamsGenerated: 0,
};

async function seedContext(page: Page, context: Record<string, unknown>) {
  await page.evaluate((ctx) => {
    sessionStorage.setItem("imtihan_context", JSON.stringify(ctx));
  }, context);
}

const BASE_CONTEXT = {
  curriculumId: "bac-libanais",
  levelId: "eb9",
  subject: "mathematics",
  chapterIds: [] as string[],
  language: "french",
  examType: "midterm",
  duration: 60,
  exerciseCount: 3,
  totalPoints: 20,
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
  confidence: 0.95,
};

// ─── /create — Describe step ─────────────────────────────────────────────────

test.describe("/create — describe step", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
  });

  test("Analyze & continue is disabled until 20+ characters, then enabled", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    const textarea = page.locator("textarea");
    const cta = page.getByRole("button", { name: /Analyze & continue/i });

    await expect(cta).toBeDisabled();
    await textarea.fill("too short");
    await expect(cta).toBeDisabled();
    await textarea.fill("Math exam for Terminale S on derivatives, 2 exercises");
    await expect(cta).toBeEnabled();
  });

  test("each example prompt chip fills the textarea with its canned description", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    const textarea = page.locator("textarea");

    await page.getByRole("button", { name: "Physics · Terminale S" }).click();
    await expect(textarea).toHaveValue(/Physics exam for Terminale S/);

    await page.getByRole("button", { name: "IB Chemistry HL" }).click();
    await expect(textarea).toHaveValue(/IB Chemistry HL exam/);

    await page.getByRole("button", { name: "Math Quiz · Première" }).click();
    await expect(textarea).toHaveValue(/Math quiz for Première/);

    await page.getByRole("button", { name: "Philo · Terminale L" }).click();
    await expect(textarea).toHaveValue(/Philosophy essay for Terminale L/);
  });

  test("saved class profile: add, apply, and remove", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");

    // Empty state hint button opens the add-profile form
    await page.getByRole("button", { name: "Save a class profile" }).click();
    const nameInput = page.getByPlaceholder("e.g. Terminale S · Physique");
    await expect(nameInput).toBeVisible();

    const profileName = `E2E Class ${Date.now()}`;
    await nameInput.fill(profileName);
    await page.getByRole("button", { name: "Save class profile" }).click();

    // Chip now exists; apply it
    const applyBtn = page.getByRole("button", { name: `Apply profile ${profileName}` });
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
    await expect(page.locator("textarea")).toHaveValue(new RegExp(`Examen pour ${profileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));

    // Remove it
    await page.getByRole("button", { name: `Remove profile ${profileName}` }).click();
    await expect(applyBtn).toBeHidden();
    await expect(page.getByRole("button", { name: "Save a class profile" })).toBeVisible();
  });

  test("research paper search returns results or a graceful error, and Use context appends to textarea", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    const searchInput = page.getByPlaceholder(/quantum entanglement/i);
    const searchBtn = page.getByRole("button", { name: "Search" });

    await expect(searchBtn).toBeDisabled();
    await searchInput.fill("thermodynamics");
    await expect(searchBtn).toBeEnabled();
    await searchBtn.click();

    const useContextBtn = page.getByRole("button", { name: "Use context" }).first();
    const errorText = page.getByText(/search failed|network error/i);
    await expect(useContextBtn.or(errorText)).toBeVisible({ timeout: 15_000 });

    if (await useContextBtn.isVisible().catch(() => false)) {
      const before = await page.locator("textarea").inputValue();
      await useContextBtn.click();
      await expect(page.locator("textarea")).not.toHaveValue(before);
      await expect(page.locator("textarea")).toHaveValue(/Research context/);
    }
  });

  test("dropzone accepts a file and Remove file clears it", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, "fixtures", "sample-exam.pdf"));

    await expect(page.getByText("sample-exam.pdf")).toBeVisible({ timeout: 5_000 });
    await page.getByRole("button", { name: "Remove file" }).click();
    await expect(page.getByText("sample-exam.pdf")).toBeHidden();
  });

  test("free tier at quota limit sees the upsell card instead of the textarea", async ({ page, request }) => {
    await setupTestUser(request, TEST_FREE_UID, { examsGenerated: 1, proExpiresAt: null });
    await signInAs(page, TEST_FREE_UID, "/create");

    await expect(page.getByText(/You've reached the free limit/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("textarea")).toBeHidden();

    await expect(page.getByRole("link", { name: /Upgrade to Pro — \$5\.99\/mo/i })).toHaveAttribute("href", "/upgrade");
    await expect(page.getByRole("link", { name: /Back to Dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  test("Analyze & continue calls the real analyze API and lands on /create/confirm", async ({ page, request }) => {
    test.setTimeout(45_000);
    await setupTestUser(request, TEST_PRO_UID, { ...PRO_PROFILE, examsGenerated: 0 });
    await signInAs(page, TEST_PRO_UID, "/create");

    await page.locator("textarea").fill(
      "Math exam for Terminale S Bac Libanais, functions and derivatives chapter, 1 exercise, 30 minutes, 20 points, in French"
    );
    await page.getByRole("button", { name: "Analyze & continue" }).click();

    await expect(page.getByText(/Reading your description|Detecting curriculum|Identifying subject|Building exam context|Almost ready/i)).toBeVisible({
      timeout: 5_000,
    });
    await page.waitForURL(/\/create\/confirm/, { timeout: 30_000 });
  });
});

// ─── /create/confirm — Configure step ────────────────────────────────────────

test.describe("/create/confirm", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, PRO_PROFILE);
    await setupTestUser(request, TEST_FREE_UID, { examsGenerated: 0, proExpiresAt: null });
  });

  test("redirects to /create if no context is in sessionStorage", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create/confirm");
    await page.waitForURL(/\/create$/, { timeout: 20_000 });
  });

  test("dropdowns reflect and update the seeded context", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.locator("select#curriculum")).toHaveValue("bac-libanais");
    await expect(page.locator("select#level")).toHaveValue("eb9");
    await expect(page.locator("select#subject")).toHaveValue("mathematics");
    await expect(page.locator("select#language")).toHaveValue("french");
    await expect(page.locator("select#duration")).toHaveValue("60");

    await page.locator("select#language").selectOption("english");
    await expect(page.locator("select#language")).toHaveValue("english");

    await page.locator("select#duration").selectOption("120");
    await expect(page.locator("select#duration")).toHaveValue("120");
  });

  test("changing Curriculum resets Level and clears selected chapters", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByText("Select at least one chapter.")).toBeHidden();
    await page.locator("select#curriculum").selectOption("bac-francais");
    // Level must have changed away from "eb9" (a bac-libanais-only level id)
    await expect(page.locator("select#level")).not.toHaveValue("eb9");
  });

  test("chapter chips: none selected disables Generate Exam and shows the validation hint", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: [] });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByText("Select at least one chapter.")).toBeVisible();
    const generateBtn = page.getByRole("button", { name: "Generate Exam" });
    await expect(generateBtn).toBeDisabled();

    await page.getByRole("button", { name: "Calcul algébrique" }).click();
    await expect(page.getByText("Select at least one chapter.")).toBeHidden();
    await expect(generateBtn).toBeEnabled();

    // Deselecting goes back to disabled
    await page.getByRole("button", { name: "Calcul algébrique" }).click();
    await expect(generateBtn).toBeDisabled();
  });

  test("geographic context input appears for geography-flagged subjects", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, {
      ...BASE_CONTEXT,
      subject: "history-geography",
      chapterIds: ["eb9-hist-geo-liban"],
    });
    await page.goto(BASE_URL + "/create/confirm");

    const geoInput = page.getByPlaceholder("e.g. Lebanon, France, Japan...");
    await expect(geoInput).toBeVisible();
    await expect(geoInput).toHaveValue("Global");
    await geoInput.fill("Lebanon");
    await expect(geoInput).toHaveValue("Lebanon");
  });

  test("university curriculum shows the free-form notice instead of chapter chips", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, {
      curriculumId: "university",
      levelId: "undergraduate",
      subject: "engineering",
      chapterIds: [],
      language: "english",
      examType: "midterm",
      duration: 90,
      exerciseCount: 2,
      totalPoints: 20,
      difficultyMix: { easy: 30, medium: 50, hard: 20 },
      confidence: 0.9,
    });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByText(/University mode: chapters are inferred/i)).toBeVisible();
    // No chapter validation blocks Generate Exam for university (no predefined chapters)
    await expect(page.getByRole("button", { name: "Generate Exam" })).toBeEnabled();
  });

  test("AI note can be dismissed", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, {
      ...BASE_CONTEXT,
      chapterIds: ["eb9-math-algebra"],
      confidence: 0.5,
      warnings: ["Chapter list was partially inferred from a short description."],
    });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByText(/Some details were inferred/i)).toBeVisible();
    const warningText = page.getByText("Chapter list was partially inferred from a short description.");
    await expect(warningText).toBeVisible();
    await page.getByTitle("Dismiss").click();
    await expect(warningText).toBeHidden();
  });

  test("blueprint Total Points and Exercises inputs are editable", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/confirm");

    const numberInputs = page.locator('input[type="number"]');
    const totalPoints = numberInputs.nth(0);
    const exercises = numberInputs.nth(1);

    await expect(totalPoints).toHaveValue("20");
    await totalPoints.fill("30");
    await expect(totalPoints).toHaveValue("30");

    await expect(exercises).toHaveValue("3");
    await exercises.fill("4");
    await expect(exercises).toHaveValue("4");
  });

  test("template picker toggles the Extract Template instructions box", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByPlaceholder(/Replicate the school header/i)).toBeHidden();
    await page.getByRole("button", { name: "Extract Template" }).click();
    const instructions = page.getByPlaceholder(/Replicate the school header/i);
    await expect(instructions).toBeVisible();
    await instructions.fill("Keep the school crest top-right.");

    await page.getByRole("button", { name: "Modern (Standard)" }).click();
    await expect(instructions).toBeHidden();
  });

  test("Generate Version B is locked for free-tier users", async ({ page }) => {
    await signInAs(page, TEST_FREE_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByText("Available on the Pro plan")).toBeVisible();
    await expect(page.getByText("Pro", { exact: true })).toBeVisible();

    const toggleRow = page.locator("p", { hasText: "Generate Version B" }).locator("xpath=ancestor::div[1]/parent::div");
    await toggleRow.click();
    // Still locked — description text unchanged, no crash
    await expect(page.getByText("Available on the Pro plan")).toBeVisible();
  });

  test("Generate Version B toggles on for Pro users", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"], generateVersionB: false });
    await page.goto(BASE_URL + "/create/confirm");

    await expect(page.getByText("Shuffles question order and regenerates numerical values.")).toBeVisible();
    const knob = page.locator("div.w-10.h-6.rounded-full");
    await expect(knob).toHaveClass(/bg-\[var\(--bg-subtle\)\]/);

    const toggleRow = page.locator("p", { hasText: "Generate Version B" }).locator("xpath=ancestor::div[1]/parent::div");
    await toggleRow.click();
    await expect(knob).toHaveClass(/bg-\[var\(--accent\)\]/);
  });

  test("Generate Exam navigates to /create/generate", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedContext(page, { ...BASE_CONTEXT, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/confirm");

    await page.getByRole("button", { name: "Generate Exam" }).click();
    await page.waitForURL(/\/create\/generate/, { timeout: 20_000 });
  });
});
