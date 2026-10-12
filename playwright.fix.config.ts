import { defineConfig, devices } from "@playwright/test";

// Deliberately excludes legacy auth helpers that mint real Firebase tokens.
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["exam-regressions.spec.ts", "wysiwyg.spec.ts"],
  workers: 1,
  retries: 0,
  forbidOnly: true,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3017", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --turbopack -p 3017",
    url: "http://localhost:3017/test-exam-regressions",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyDemoImtihanQaNotARealFirebaseKey",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-imtihan-qa.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-imtihan-qa",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:qa",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
