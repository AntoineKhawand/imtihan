/**
 * PHASE 3 — Generation page, ExerciseCard actions & ExerciseEditor modal
 *
 * Most tests here seed sessionStorage directly with a matching
 * `imtihan_exercises_key` so the page treats the exercises as already
 * generated and skips a live call to /api/generate (same trick as
 * e2e/qcm.spec.ts, but with the `t: templateId` field included so the
 * cache-key comparison in create/generate/page.tsx actually matches).
 *
 * Two tests are deliberately NOT stubbed and do hit the real Claude/Gemini
 * backend: "Regenerate calls the real API..." and the final "golden path"
 * test. Both use exerciseCount 1 to keep the cost/time small. Everything
 * else (action menu, Corrigé, calculators, the editor modal) is pure UI and
 * costs nothing to run daily.
 */
import { test, expect, type Page } from "@playwright/test";
import { signInAs, setupTestUser, TEST_PRO_UID } from "../helpers/auth";

const BASE_URL = "http://localhost:3005";

const CONTEXT = {
  curriculumId: "bac-libanais",
  levelId: "eb9",
  subject: "mathematics",
  chapterIds: ["eb9-math-algebra", "eb9-math-functions"],
  language: "french",
  examType: "midterm",
  duration: 60,
  exerciseCount: 2,
  totalPoints: 20,
  difficultyMix: { easy: 0, medium: 2, hard: 0 },
};

const MCQ_EXERCISE = {
  id: "e2e-mcq-1",
  number: 1,
  type: "multiple_choice",
  difficulty: "medium",
  points: 4,
  statement: "Quelle est la dérivée de $x^2$ ?",
  options: [
    { label: "A", text: "1", isCorrect: false },
    { label: "B", text: "2x", isCorrect: true },
    { label: "C", text: "x", isCorrect: false },
    { label: "D", text: "2", isCorrect: false },
  ],
  subQuestions: null,
  solution: {
    finalAnswer: "B — 2x",
    methodology: "Étape 1: appliquer la règle de puissance. On dérive $x^2$ pour obtenir $2x$.",
    commonMistakes: ["Oublier de multiplier par l'exposant initial."],
    bareme: [{ label: "Q1", points: 4, criterion: "Bonne réponse B" }],
    microBareme: [{ step: "Étape 1", points: 4, criterion: "Identifie 2x" }],
  },
  chapterIds: ["eb9-math-algebra"],
  estimatedMinutes: 3,
};

const CALC_EXERCISE = {
  id: "e2e-calc-1",
  number: 2,
  type: "calculation",
  difficulty: "medium",
  points: 6,
  statement: "Calculer la dérivée de $f(x) = x^2$. **Note**: utiliser la règle de puissance.",
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

async function seedExercises(page: Page, exercises: unknown[], templateId = "classic") {
  await page.evaluate(
    ({ ctx, ex, tmpl }) => {
      sessionStorage.setItem("imtihan_context", JSON.stringify(ctx));
      sessionStorage.setItem("imtihan_exercises", JSON.stringify(ex));
      sessionStorage.setItem("imtihan_exercises_key", JSON.stringify({ c: ctx, t: tmpl }));
    },
    { ctx: CONTEXT, ex: exercises, tmpl: templateId }
  );
}

test.describe("Generate page — exercises, chapter coverage, summary bar", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, {
      proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      planType: "monthly",
    });
  });

  test("renders both seeded exercises without triggering a live generation", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");

    await expect(page.getByText("2 exercises generated.")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("mcq-options")).toBeVisible();
  });

  test("chapter coverage shows the covered chapter with a count and the uncovered one flagged", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");

    await expect(page.getByText("Chapter coverage")).toBeVisible({ timeout: 20_000 });
    const covered = page.getByTitle("2 exercises");
    await expect(covered).toBeVisible();
    const missing = page.getByTitle("No exercise covers this chapter yet");
    await expect(missing).toBeVisible();
    await expect(page.getByText("Some chapters have no exercise")).toBeVisible();
  });

  test("summary bar shows correct total points and difficulty split", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");

    await expect(page.getByText(/10 pts total/)).toBeVisible({ timeout: 20_000 }); // 4 + 6 pts
    await expect(page.getByText("2 medium")).toBeVisible();
  });

  test("Export exam navigates to /create/export", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");

    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Export exam" }).click();
    await page.waitForURL(/\/create\/export/, { timeout: 20_000 });
  });
});

test.describe("ExerciseCard — action menu", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, {
      proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      planType: "monthly",
    });
  });

  test("action menu opens and lists Regenerate / Make easier / Make harder / Edit / Save to bank / Remove", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    const card = page.locator('[data-tutorial="exercise-card"]').first();
    await card.locator('[data-tutorial="exercise-actions"] button').click();

    await expect(card.getByRole("button", { name: "Regenerate" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Make easier" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Make harder" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Save to bank" })).toBeVisible();
    await expect(card.getByRole("button", { name: "Remove" })).toBeVisible();
  });

  test("Save to bank disables itself and shows the bottom confirmation toast", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    const card = page.locator('[data-tutorial="exercise-card"]').first();
    await card.locator('[data-tutorial="exercise-actions"] button').click();
    await card.getByRole("button", { name: "Save to bank" }).click();

    await expect(page.getByText("Exercise 1 saved to your bank")).toBeVisible({ timeout: 3_000 });
    await card.locator('[data-tutorial="exercise-actions"] button').click();
    await expect(card.getByRole("button", { name: "Saved to bank" })).toBeDisabled();
  });

  test("Remove deletes the exercise from the list", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    const cards = page.locator('[data-tutorial="exercise-card"]');
    await expect(cards).toHaveCount(2);
    await cards.nth(1).locator('[data-tutorial="exercise-actions"] button').click();
    await cards.nth(1).getByRole("button", { name: "Remove" }).click();

    await expect(cards).toHaveCount(1);
  });

  test("Regenerate all re-triggers generation and shows the generating banner", async ({ page }) => {
    test.setTimeout(45_000);
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Regenerate all" }).click();
    await expect(page.getByText("Generating your exam…")).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("ExerciseCard — Corrigé panel & calculators", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, {
      proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      planType: "monthly",
    });
  });

  test("Corrigé reveals barème, answer, methodology, micro-barème and common mistakes", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Corrigé" }).click();
    await expect(page.getByText("Barème de correction")).toBeVisible();
    await expect(page.getByText("B — 2x")).toBeVisible();
    await expect(page.getByText(/Étape 1: appliquer la règle/)).toBeVisible();
    await expect(page.getByText("Mark Scheme").or(page.getByText("Micro-barème"))).toBeVisible();
    await expect(page.getByText("Common mistakes")).toBeVisible();
    await expect(page.getByText("Oublier de multiplier par l'exposant initial.")).toBeVisible();
  });

  test("Check answer reveals the 4 calculator tabs and Expression tab computes a result", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Corrigé" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    for (const tab of ["Expression", "Statistics", "Chemistry", "Constants"]) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible();
    }

    await page.getByPlaceholder("e.g. x^3-6x^2+9x").fill("x^2");
    await page.getByRole("button", { name: "→" }).first().click();
    await expect(page.getByText("Result")).toBeVisible({ timeout: 20_000 });
  });

  test("Chemistry tab computes molar mass for H2O", async ({ page }) => {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: "Corrigé" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Chemistry" }).click();

    await page.getByPlaceholder(/H2O, NaCl/).fill("H2O");
    await page.getByRole("button", { name: "→" }).first().click();
    await expect(page.getByText("Molar mass")).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("ExerciseEditor modal", () => {
  test.beforeEach(async ({ request }) => {
    await setupTestUser(request, TEST_PRO_UID, {
      proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      planType: "monthly",
    });
  });

  async function openEditor(page: Page) {
    await signInAs(page, TEST_PRO_UID, "/create");
    await seedExercises(page, [MCQ_EXERCISE, CALC_EXERCISE]);
    await page.goto(BASE_URL + "/create/generate");
    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 20_000 });

    const card = page.locator('[data-tutorial="exercise-card"]').first();
    await card.locator('[data-tutorial="exercise-actions"] button').click();
    await card.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByText("Edit exercise 1")).toBeVisible();
  }

  test("view-mode tabs switch between Edit / Split / Visual Preview", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: "Visual Preview" }).click();
    await expect(page.getByText("Live Visual Preview")).toBeVisible();

    await page.getByRole("button", { name: "Edit", exact: true }).click();
    await expect(page.getByText("Live Visual Preview")).toBeHidden();

    await page.getByRole("button", { name: "Split" }).click();
    await expect(page.getByText("Live Visual Preview")).toBeVisible();
  });

  test("difficulty picker and points input update", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: "hard", exact: true }).click();
    await expect(page.getByRole("button", { name: "hard", exact: true })).toHaveClass(/border-red-400/);

    const pointsInput = page.locator('input[type="number"]').first();
    await pointsInput.fill("10");
    await expect(page.getByText("(10 pts)")).toBeVisible();
  });

  test("double-clicking the math node in the statement reveals raw LaTeX for editing", async ({ page }) => {
    await openEditor(page);
    const statementField = page.locator("[contenteditable]").first();
    const mathSpan = statementField.locator("span.math-node").first();
    await expect(mathSpan).toBeVisible();
    await mathSpan.dblclick();
    await expect(statementField).toContainText("$x^2$");
  });

  test("MCQ radio changes the correct option, and Save persists it to the card", async ({ page }) => {
    await openEditor(page);
    // Mark option A ("1") as correct instead of B
    await page.getByTitle("Mark as correct").first().click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Edit exercise 1")).toBeHidden();

    await expect(page.getByTestId("mcq-option-A")).toHaveAttribute("data-correct", "true");
    await expect(page.getByTestId("mcq-option-B")).toHaveAttribute("data-correct", "false");
  });

  test("Add Sub-question adds an editable row", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: "Add Sub-question" }).click();
    await expect(page.locator('input[value="a)"]')).toBeVisible();
  });

  test("Add Plot adds a graph input row", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: "Add Plot" }).click();
    await expect(page.getByPlaceholder("e.g. sin(x) or x^2")).toBeVisible();
  });

  test("Cancel discards changes", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("button", { name: "hard", exact: true }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Edit exercise 1")).toBeHidden();

    // Re-open and confirm difficulty badge on the card is unchanged (still "Medium")
    const card = page.locator('[data-tutorial="exercise-card"]').first();
    await expect(card.getByText("Medium")).toBeVisible();
  });
});

test.describe("Golden path — one real generation call end to end", () => {
  test("a fresh 1-exercise request actually streams from /api/generate to a rendered card", async ({ page, request }) => {
    test.setTimeout(60_000);
    await setupTestUser(request, TEST_PRO_UID, {
      proExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      planType: "monthly",
    });
    await signInAs(page, TEST_PRO_UID, "/create");
    await page.evaluate((ctx) => {
      sessionStorage.setItem("imtihan_context", JSON.stringify(ctx));
      sessionStorage.removeItem("imtihan_exercises");
      sessionStorage.removeItem("imtihan_exercises_key");
    }, { ...CONTEXT, exerciseCount: 1, chapterIds: ["eb9-math-algebra"] });
    await page.goto(BASE_URL + "/create/generate");

    await expect(page.getByText("Generating your exam…")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: "Export exam" })).toBeVisible({ timeout: 45_000 });
    await expect(page.locator('[data-tutorial="exercise-card"]')).toHaveCount(1);
  });
});
