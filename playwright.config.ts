import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // subscription tests mutate Firestore state — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  // Each phase file is run against a freshly-booted dev server (webServer
  // below), so the FIRST hit to any given route in a run pays Turbopack's
  // per-route compile cost on top of normal render time. The default 5s
  // expect timeout is too tight for that; 15s gives cold routes room while
  // still failing fast on a genuinely broken assertion.
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: "http://localhost:3005",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Lets an unattended run (daily scheduled task) boot the dev server itself.
  // If a server is already running on 3005 (e.g. you're developing locally),
  // it's reused instead of spawning a second one.
  webServer: {
    command: "npx next dev --turbopack -p 3005",
    url: "http://localhost:3005",
    reuseExistingServer: true,
    timeout: 120_000,
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
