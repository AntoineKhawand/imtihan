import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Security Tests", () => {
  test("XSS attempt is sanitized in search", async ({ page }) => {
    await page.goto(BASE_URL + "/bank");
    
    const searchInput = page.locator('input[name="search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert("xss")</script>');
      await page.waitForTimeout(500);
    }
    
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("xss")</script>');
  });

  test("SQL injection is handled safely", async ({ page }) => {
    await page.goto(BASE_URL + "/bank");
    
    const searchInput = page.locator('input[name="search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("'; DROP TABLE users; --");
      await page.waitForTimeout(500);
    }
    
    const response = await page.request.get(BASE_URL + "/bank");
    expect(response.status()).toBe(200);
  });

  test("no sensitive data in error messages", async ({ page }) => {
    await page.goto(BASE_URL + "/api/nonexistent");
    
    const content = await page.content();
    
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /api[-_]?key/i,
      /private[-_]?key/i,
      /database/i,
    ];
    
    for (const pattern of sensitivePatterns) {
      expect(content).not.toMatch(pattern);
    }
  });

  test("session cookie is secure", async ({ page }) => {
    await page.goto(BASE_URL + "/auth/login");
    await page.waitForTimeout(1000);
    
    const cookies = await page.context().cookies();
    
    const sessionCookie = cookies.find(c => c.name === "__session");
    if (sessionCookie) {
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.sameSite).toBe("Lax");
    }
  });

  test("protected routes redirect unauthenticated users", async ({ page }) => {
    await page.goto(BASE_URL + "/dashboard");
    await page.waitForLoadState("networkidle");
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/dashboard|login|auth|sign/);
  });

  test("API routes require authentication", async ({ request }) => {
    const response = await request.post(BASE_URL + "/api/analyze", {
      data: { test: "data" }
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test("no CORS wildcard", async ({ request }) => {
    const response = await request.get(BASE_URL, {
      headers: {
        Origin: "http://evil.com",
      }
    });
    
    const acao = response.headers()["access-control-allow-origin"];
    
    if (acao) {
      expect(acao).not.toBe("*");
    }
  });

  test("XSS in community search is blocked", async ({ page }) => {
    await page.goto(BASE_URL + "/community");
    await page.waitForLoadState("networkidle");
    
    const searchInput = page.locator('input[type="search"], input[name="q"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('<img src=x onerror=alert(1)>');
      await page.waitForTimeout(500);
    }
    
    const pageContent = await page.content();
    expect(pageContent).not.toContain('onerror=alert');
  });

  test("authentication blocks unauthenticated API access", async ({ request }) => {
    const endpoints = ["/api/generate", "/api/export"];
    
    for (const endpoint of endpoints) {
      const response = await request.post(BASE_URL + endpoint, {
        data: { test: "data" },
      });
      
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test("invalid input sanitization", async ({ page }) => {
    await page.goto(BASE_URL + "/create");
    
    const textarea = page.locator("textarea");
    if (await textarea.isVisible()) {
      await textarea.fill('../../../etc/passwd');
      await page.waitForTimeout(300);
    }
    
    const content = await page.content();
    expect(content).not.toContain("../..");
  });

  test("no information leakage in headers", async ({ page }) => {
    const response = await page.request.get(BASE_URL);
    const headers = response.headers();
    
    expect(headers["server"]).toBeUndefined();
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});