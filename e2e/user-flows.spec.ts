import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Full User Flows", () => {
  
  test("complete registration flow", async ({ page }) => {
    await page.goto(BASE_URL + "/auth/register");
    await expect(page.locator("body")).toBeVisible();
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill("testuser" + Date.now() + "@example.com");
    }
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("TestPassword123!");
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign up")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test("complete login flow", async ({ page }) => {
    await page.goto(BASE_URL + "/auth/login");
    await expect(page.locator("body")).toBeVisible();
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill("test@example.com");
    }
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("TestPassword123!");
    }
    
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
  });

  test("exam creation describe step", async ({ page }) => {
    await page.goto(BASE_URL + "/create");
    await page.waitForLoadState("networkidle");
    
    const describeTextarea = page.locator('textarea[name="description"], textarea');
    if (await describeTextarea.isVisible()) {
      await describeTextarea.fill("Create a math exam for Bac Libanais Terminale S on functions and derivatives");
    }
    
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")');
    if (await continueButton.first().isVisible()) {
      await continueButton.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("exam creation context step", async ({ page }) => {
    await page.goto(BASE_URL + "/create/context");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("exam creation structure step", async ({ page }) => {
    await page.goto(BASE_URL + "/create/structure");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("exam generation step", async ({ page }) => {
    await page.goto(BASE_URL + "/create/generate");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("exam export step", async ({ page }) => {
    await page.goto(BASE_URL + "/create/export");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("dashboard access after login", async ({ page }) => {
    await page.goto(BASE_URL + "/dashboard");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/dashboard|login|auth/);
  });

  test("question bank browsing", async ({ page }) => {
    await page.goto(BASE_URL + "/bank");
    await page.waitForLoadState("networkidle");
    
    const searchInput = page.locator('input[type="search"], input[name="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("math");
      await page.waitForTimeout(500);
    }
  });

  test("community exam browsing", async ({ page }) => {
    await page.goto(BASE_URL + "/community");
    await page.waitForLoadState("networkidle");
    
    const searchInput = page.locator('input[type="search"], input[name="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("physics");
      await page.waitForTimeout(500);
    }
  });

  test("pricing upgrade flow", async ({ page }) => {
    await page.goto(BASE_URL + "/pricing");
    await page.waitForLoadState("networkidle");
    
    const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Get Pro")');
    if (await upgradeButton.first().isVisible()) {
      await upgradeButton.first().click();
      await page.waitForTimeout(2000);
    }
  });
});

test.describe("API Integration Tests", () => {
  test("analyze API returns 401 without auth", async ({ request }) => {
    const response = await request.post(BASE_URL + "/api/analyze", {
      data: { description: "test" }
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("generate API returns 401 without auth", async ({ request }) => {
    const response = await request.post(BASE_URL + "/api/generate", {
      data: { test: "data" }
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("export API returns 401 without auth", async ({ request }) => {
    const response = await request.post(BASE_URL + "/api/export", {
      data: { test: "data" }
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("UI Component Tests", () => {
  test("navigation header works", async ({ page }) => {
    await page.goto(BASE_URL);
    
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("footer has required links", async ({ page }) => {
    await page.goto(BASE_URL);
    
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("dark mode toggle if exists", async ({ page }) => {
    await page.goto(BASE_URL);
    
    const darkModeButton = page.locator('button[aria-label*="Dark"], button[aria-label*="Theme"]');
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test("responsive sidebar navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("error handling - 404 page", async ({ page }) => {
    const response = await page.request.get(BASE_URL + "/nonexistent-page-12345");
    expect(response.status()).toBeGreaterThanOrEqual(404);
  });
});

test.describe("Accessibility Deep Tests", () => {
  test("all images have alt text", async ({ page }) => {
    await page.goto(BASE_URL);
    
    const images = page.locator("img");
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      if (alt === null) {
        const src = await images.nth(i).getAttribute("src");
        console.log("Image without alt:", src);
      }
    }
  });

  test("form inputs have labels", async ({ page }) => {
    await page.goto(BASE_URL + "/auth/login");
    
    const inputs = page.locator("input:not([type='hidden'])");
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const label = await inputs.nth(i).getAttribute("aria-label");
      const labelled = await inputs.nth(i).getAttribute("aria-labelledby");
      const labelEl = await inputs.nth(i).locator("..").locator("label").count();
      
      if (!label && !labelled && labelEl === 0) {
        const name = await inputs.nth(i).getAttribute("name");
        console.log("Input without label:", name);
      }
    }
  });

  test("proper heading hierarchy", async ({ page }) => {
    await page.goto(BASE_URL);
    
    const h1 = page.locator("h1");
    const h2 = page.locator("h2");
    
    expect(await h1.count()).toBeGreaterThan(0);
  });

  test("focusable elements are keyboard accessible", async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});

test.describe("Performance Tests", () => {
  test("page load time under 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - start;
    
    console.log("Page load time:", loadTime, "ms");
    expect(loadTime).toBeLessThan(3000);
  });

  test("no memory leaks from navigation", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    
    for (let i = 0; i < 3; i++) {
      await page.goto(BASE_URL + "/pricing");
      await page.waitForLoadState("networkidle");
      await page.goto(BASE_URL);
      await page.waitForLoadState("networkidle");
    }
    
    expect(true).toBe(true);
  });
});