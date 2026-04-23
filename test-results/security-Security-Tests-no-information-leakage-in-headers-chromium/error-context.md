# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.ts >> Security Tests >> no information leakage in headers
- Location: e2e\security.spec.ts:134:7

# Error details

```
Error: expect(received).toBeUndefined()

Received: "Next.js"
```

# Test source

```ts
  39  |       /secret/i,
  40  |       /api[-_]?key/i,
  41  |       /private[-_]?key/i,
  42  |       /database/i,
  43  |     ];
  44  |     
  45  |     for (const pattern of sensitivePatterns) {
  46  |       expect(content).not.toMatch(pattern);
  47  |     }
  48  |   });
  49  | 
  50  |   test("session cookie is secure", async ({ page }) => {
  51  |     await page.goto(BASE_URL + "/auth/login");
  52  |     await page.waitForTimeout(1000);
  53  |     
  54  |     const cookies = await page.context().cookies();
  55  |     
  56  |     const sessionCookie = cookies.find(c => c.name === "__session");
  57  |     if (sessionCookie) {
  58  |       expect(sessionCookie.httpOnly).toBe(true);
  59  |       expect(sessionCookie.sameSite).toBe("Lax");
  60  |     }
  61  |   });
  62  | 
  63  |   test("protected routes redirect unauthenticated users", async ({ page }) => {
  64  |     await page.goto(BASE_URL + "/dashboard");
  65  |     await page.waitForLoadState("networkidle");
  66  |     
  67  |     const currentUrl = page.url();
  68  |     expect(currentUrl).toMatch(/dashboard|login|auth|sign/);
  69  |   });
  70  | 
  71  |   test("API routes require authentication", async ({ request }) => {
  72  |     const response = await request.post(BASE_URL + "/api/analyze", {
  73  |       data: { test: "data" }
  74  |     });
  75  |     
  76  |     expect(response.status()).toBeGreaterThanOrEqual(400);
  77  |     expect(response.status()).toBeLessThan(500);
  78  |   });
  79  | 
  80  |   test("no CORS wildcard", async ({ request }) => {
  81  |     const response = await request.get(BASE_URL, {
  82  |       headers: {
  83  |         Origin: "http://evil.com",
  84  |       }
  85  |     });
  86  |     
  87  |     const acao = response.headers()["access-control-allow-origin"];
  88  |     
  89  |     if (acao) {
  90  |       expect(acao).not.toBe("*");
  91  |     }
  92  |   });
  93  | 
  94  |   test("XSS in community search is blocked", async ({ page }) => {
  95  |     await page.goto(BASE_URL + "/community");
  96  |     await page.waitForLoadState("networkidle");
  97  |     
  98  |     const searchInput = page.locator('input[type="search"], input[name="q"]');
  99  |     if (await searchInput.isVisible()) {
  100 |       await searchInput.fill('<img src=x onerror=alert(1)>');
  101 |       await page.waitForTimeout(500);
  102 |     }
  103 |     
  104 |     const pageContent = await page.content();
  105 |     expect(pageContent).not.toContain('onerror=alert');
  106 |   });
  107 | 
  108 |   test("authentication blocks unauthenticated API access", async ({ request }) => {
  109 |     const endpoints = ["/api/generate", "/api/export"];
  110 |     
  111 |     for (const endpoint of endpoints) {
  112 |       const response = await request.post(BASE_URL + endpoint, {
  113 |         data: { test: "data" },
  114 |       });
  115 |       
  116 |       expect(response.status()).toBeGreaterThanOrEqual(400);
  117 |       expect(response.status()).toBeLessThan(500);
  118 |     }
  119 |   });
  120 | 
  121 |   test("invalid input sanitization", async ({ page }) => {
  122 |     await page.goto(BASE_URL + "/create");
  123 |     
  124 |     const textarea = page.locator("textarea");
  125 |     if (await textarea.isVisible()) {
  126 |       await textarea.fill('../../../etc/passwd');
  127 |       await page.waitForTimeout(300);
  128 |     }
  129 |     
  130 |     const content = await page.content();
  131 |     expect(content).not.toContain("../..");
  132 |   });
  133 | 
  134 |   test("no information leakage in headers", async ({ page }) => {
  135 |     const response = await page.request.get(BASE_URL);
  136 |     const headers = response.headers();
  137 |     
  138 |     expect(headers["server"]).toBeUndefined();
> 139 |     expect(headers["x-powered-by"]).toBeUndefined();
      |                                     ^ Error: expect(received).toBeUndefined()
  140 |   });
  141 | });
```