import { test, expect } from "@playwright/test";

test("landing page loads without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");

  expect(page.url()).toBe("http://localhost:3000/");
  await expect(page.locator("body")).toBeVisible();
  
  const criticalErrors = errors.filter(e => !e.includes("Warning") && !e.includes("DevTools"));
  expect(criticalErrors).toHaveLength(0);
});

test("landing page displays app name in header", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Imtihan", exact: false })).toBeVisible();
});

test("pricing page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/pricing");
  await expect(page.getByRole("heading", { name: /Simple, transparent pricing/i })).toBeVisible();
});

test("login page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/auth/login");
  await expect(page.locator("body")).toBeVisible();
});

test("terms page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/terms");
  await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
});

test("community page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/community");
  await expect(page.locator("body")).toBeVisible();
});

test("bank page loads", async ({ page }) => {
  await page.goto("http://localhost:3000/bank");
  await expect(page.locator("body")).toBeVisible();
});

test("manifest returns 200", async ({ request }) => {
  const response = await request.get("http://localhost:3000/manifest.webmanifest");
  expect(response.status()).toBe(200);
});

test("icon-192.png exists", async ({ page }) => {
  const response = await page.request.get("http://localhost:3000/icon-192.png");
  expect(response.status()).toBe(200);
});

test("icon-512.png exists", async ({ page }) => {
  const response = await page.request.get("http://localhost:3000/icon-512.png");
  expect(response.status()).toBe(200);
});

test("mobile viewport works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("http://localhost:3000");
  await expect(page.locator("body")).toBeVisible();
});

test("has lang attribute", async ({ page }) => {
  await page.goto("http://localhost:3000");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("lang", /^[a-z]{2}$/);
});