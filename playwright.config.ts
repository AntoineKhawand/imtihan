import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // subscription tests mutate Firestore state — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3005",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "subscription",
      testMatch: "subscription.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      testIgnore: "subscription.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
