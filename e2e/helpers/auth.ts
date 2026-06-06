import type { Page } from "@playwright/test";

const BASE_URL = "http://localhost:3005";

// UIDs used across all e2e tests
export const TEST_FREE_UID = "pw-test-free-user";
export const TEST_PRO_UID = "pw-test-pro-user";
export const ADMIN_UID = "AvOdX6sZpDOJvvoIVO88QmeM2uA3";

/**
 * Sign into the app as a specific user without Google OAuth.
 * Navigates to the dev-only /test-auth page which exchanges a custom token
 * for a real Firebase session, then waits for the redirect.
 */
export async function signInAs(
  page: Page,
  uid: string,
  redirectTo = "/dashboard"
): Promise<void> {
  await page.goto(
    `${BASE_URL}/test-auth?uid=${encodeURIComponent(uid)}&redirect=${encodeURIComponent(redirectTo)}`
  );
  // Wait until we're redirected away from /test-auth
  await page.waitForURL((url) => !url.pathname.startsWith("/test-auth"), {
    timeout: 45_000,
  });
  // Give the AuthContext onSnapshot listener time to load the profile from Firestore
  await page.waitForTimeout(3000);
}

/**
 * Set up the Firestore document for a test user via the dev API.
 * Call this BEFORE signInAs to put the account in the desired state.
 */
export async function setupTestUser(
  request: import("@playwright/test").APIRequestContext,
  uid: string,
  profile: Record<string, unknown>
): Promise<void> {
  const res = await request.post(`${BASE_URL}/api/test/custom-token`, {
    data: { uid, profile },
  });
  if (!res.ok()) {
    const body = await res.json();
    throw new Error(`setupTestUser failed: ${JSON.stringify(body)}`);
  }
}
