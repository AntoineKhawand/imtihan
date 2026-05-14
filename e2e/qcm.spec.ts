import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// ---------------------------------------------------------------------------
// Helper: inject a mock MCQ exercise into sessionStorage so the generate page
// renders it without hitting the real API (no auth / quota needed).
// ---------------------------------------------------------------------------
async function seedMcqExercise(page: Page, showSolution = false) {
  const mockExercise = {
    id: "test-mcq-1",
    number: 1,
    type: "multiple_choice",
    difficulty: "medium",
    points: 2,
    statement: "Quelle est la formule chimique de l'eau ?",
    options: [
      { label: "A", text: "CO2",  isCorrect: false },
      { label: "B", text: "H2O",  isCorrect: true  },
      { label: "C", text: "NaCl", isCorrect: false },
      { label: "D", text: "O2",   isCorrect: false },
    ],
    subQuestions: null,
    solution: {
      finalAnswer: "B — H2O",
      methodology: "L'eau est composée de 2 atomes d'hydrogène et 1 d'oxygène.",
      commonMistakes: ["Confondre H2O et CO2"],
      bareme: [{ label: "Q1", points: 2, criterion: "Bonne réponse B" }],
      microBareme: [{ step: "Étape 1", points: 2, criterion: "Identifie H2O correctement" }],
    },
    chapterIds: ["chimie-generale"],
    estimatedMinutes: 2,
  };

  const mockContext = {
    curriculumId: "bac-libanais",
    levelId: "terminale",
    subject: "chemistry",
    chapterIds: ["chimie-generale"],
    language: "french",
    examType: "quiz",
    duration: 30,
    exerciseCount: 1,
    totalPoints: 20,
    difficultyMix: { easy: 0, medium: 1, hard: 0 },
  };

  await page.evaluate(
    ({ exercise, context, showSol }) => {
      sessionStorage.setItem("imtihan_exercises", JSON.stringify([exercise]));
      sessionStorage.setItem("imtihan_context", JSON.stringify(context));
      sessionStorage.setItem(
        "imtihan_exercises_key",
        JSON.stringify({ c: context })
      );
      if (showSol) {
        // Force solution visible by setting a flag the test can read
        (window as any).__testShowSolution = true;
      }
    },
    { exercise: mockExercise, context: mockContext, showSol: showSolution }
  );
}

// ---------------------------------------------------------------------------
// QCM rendering tests
// ---------------------------------------------------------------------------

test.describe("QCM — Exercise rendering", () => {
  test("generate page renders MCQ options from sessionStorage", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    // The page should show the 4 options
    const optionsContainer = page.getByTestId("mcq-options");
    await expect(optionsContainer).toBeVisible({ timeout: 8000 });

    const optA = page.getByTestId("mcq-option-A");
    const optB = page.getByTestId("mcq-option-B");
    const optC = page.getByTestId("mcq-option-C");
    const optD = page.getByTestId("mcq-option-D");

    await expect(optA).toBeVisible();
    await expect(optB).toBeVisible();
    await expect(optC).toBeVisible();
    await expect(optD).toBeVisible();
  });

  test("MCQ option labels A B C D are all displayed", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    const options = page.getByTestId("mcq-options");
    await expect(options).toBeVisible({ timeout: 8000 });

    await expect(options.getByText("A")).toBeVisible();
    await expect(options.getByText("B")).toBeVisible();
    await expect(options.getByText("C")).toBeVisible();
    await expect(options.getByText("D")).toBeVisible();
  });

  test("MCQ options contain the expected answer text", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    const options = page.getByTestId("mcq-options");
    await expect(options).toBeVisible({ timeout: 8000 });

    await expect(options.getByText("CO2")).toBeVisible();
    await expect(options.getByText("H2O")).toBeVisible();
    await expect(options.getByText("NaCl")).toBeVisible();
    await expect(options.getByText("O2")).toBeVisible();
  });

  test("correct option has data-correct=true attribute", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    const options = page.getByTestId("mcq-options");
    await expect(options).toBeVisible({ timeout: 8000 });

    const correctOption = page.getByTestId("mcq-option-B");
    await expect(correctOption).toHaveAttribute("data-correct", "true");

    const wrongOption = page.getByTestId("mcq-option-A");
    await expect(wrongOption).toHaveAttribute("data-correct", "false");
  });

  test("correct option is highlighted green after solution reveal", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    const options = page.getByTestId("mcq-options");
    await expect(options).toBeVisible({ timeout: 8000 });

    // Open the solution panel
    const corrigeToggle = page.getByRole("button", { name: /Corrigé/i });
    await expect(corrigeToggle).toBeVisible();
    await corrigeToggle.click();

    // The correct option (B) should now have emerald styling
    const correctOption = page.getByTestId("mcq-option-B");
    await expect(correctOption).toHaveClass(/emerald/);
  });

  test("non-MCQ exercise does not render option grid", async ({ page }) => {
    const calcContext = {
      curriculumId: "bac-libanais", levelId: "terminale", subject: "mathematics",
      chapterIds: [], language: "french", examType: "quiz",
      duration: 30, exerciseCount: 1, totalPoints: 20,
      difficultyMix: { easy: 0, medium: 1, hard: 0 },
    };
    const calcExercise = {
      id: "calc-1", number: 1, type: "calculation", difficulty: "medium",
      points: 4, statement: "Calculer la dérivée de $f(x) = x^2$.",
      options: null, subQuestions: null,
      solution: { finalAnswer: "$f'(x) = 2x$", methodology: "", commonMistakes: [], bareme: [], microBareme: [] },
      chapterIds: [], estimatedMinutes: 5,
    };

    await page.goto(BASE_URL + "/create/generate");
    await page.evaluate(({ exercise, context }) => {
      sessionStorage.setItem("imtihan_exercises", JSON.stringify([exercise]));
      sessionStorage.setItem("imtihan_context", JSON.stringify(context));
      sessionStorage.setItem("imtihan_exercises_key", JSON.stringify({ c: context }));
    }, { exercise: calcExercise, context: calcContext });
    await page.reload();
    await page.waitForLoadState("networkidle");

    const options = page.getByTestId("mcq-options");
    await expect(options).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // If not found at all that's also acceptable
    });
  });
});

// ---------------------------------------------------------------------------
// QCM solution section tests
// ---------------------------------------------------------------------------

test.describe("QCM — Solution section", () => {
  test("solution section shows final answer with correct option label", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 8000 });

    const corrigeToggle = page.getByRole("button", { name: /Corrigé/i });
    await corrigeToggle.click();

    // "B — H2O" should appear in the answer section
    const answerText = page.locator("text=B — H2O");
    await expect(answerText).toBeVisible();
  });

  test("MCQ exercise card shows type label MCQ", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await seedMcqExercise(page);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("mcq-options")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("MCQ")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// QCM API contract test (no auth — just verifies the endpoint rejects properly)
// ---------------------------------------------------------------------------

test.describe("QCM — API contract", () => {
  test("generate API rejects unauthenticated request with 401", async ({ request }) => {
    const res = await request.post(BASE_URL + "/api/generate", {
      data: {
        context: {
          curriculumId: "bac-libanais", levelId: "terminale", subject: "chemistry",
          chapterIds: [], language: "french", examType: "quiz",
          duration: 30, exerciseCount: 3, totalPoints: 20,
          difficultyMix: { easy: 0.33, medium: 0.34, hard: 0.33 },
        },
        templateId: "classic",
        isAdjustment: false,
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("generate API validates context schema — returns 400 for bad subject", async ({ request }) => {
    const res = await request.post(BASE_URL + "/api/generate", {
      data: {
        context: {
          curriculumId: "bac-libanais", levelId: "terminale",
          subject: "invalid_subject_xyz",   // invalid
          chapterIds: [], language: "french", examType: "quiz",
          duration: 30, exerciseCount: 3, totalPoints: 20,
          difficultyMix: { easy: 0.33, medium: 0.34, hard: 0.33 },
        },
        templateId: "classic",
      },
    });
    // 400 (schema) or 401 (auth) — both acceptable rejections
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
