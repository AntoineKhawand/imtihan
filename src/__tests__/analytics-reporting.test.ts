import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAnalyticsSummary } from "@/lib/analytics-reporting";

/**
 * There is no real GA4 service account yet (see docs/GA4_SETUP.md), so the
 * actual API-calling path cannot be exercised here, and this suite
 * deliberately does not mock the whole `@google-analytics/data` client to
 * fake a success response. What IS covered: the "not configured" path never
 * throws and returns a clear, catchable result, and malformed input is
 * rejected before any network call would be attempted.
 */
describe("getAnalyticsSummary — not-configured path", () => {
  const ENV_KEYS = [
    "GA4_PROPERTY_ID",
    "GA4_SERVICE_ACCOUNT_EMAIL",
    "GA4_SERVICE_ACCOUNT_PRIVATE_KEY",
  ] as const;
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = {};
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("returns { configured: false, reason } rather than throwing when all 3 env vars are unset", async () => {
    const result = await getAnalyticsSummary("2026-09-01", "2026-09-30");
    expect(result.configured).toBe(false);
    if (!result.configured) {
      expect(result.reason).toContain("GA4_PROPERTY_ID");
      expect(result.reason).toContain("GA4_SERVICE_ACCOUNT_EMAIL");
      expect(result.reason).toContain("GA4_SERVICE_ACCOUNT_PRIVATE_KEY");
      expect(result.reason).toContain("docs/GA4_SETUP.md");
    }
  });

  it("returns not-configured (not a crash) when only some env vars are set", async () => {
    process.env.GA4_PROPERTY_ID = "properties/123456789";

    const result = await getAnalyticsSummary("7daysAgo", "today");

    expect(result.configured).toBe(false);
    if (!result.configured) {
      expect(result.reason).not.toContain("GA4_PROPERTY_ID");
      expect(result.reason).toContain("GA4_SERVICE_ACCOUNT_EMAIL");
      expect(result.reason).toContain("GA4_SERVICE_ACCOUNT_PRIVATE_KEY");
    }
  });

  it("never throws for the not-configured case, for both ISO and relative date inputs", async () => {
    await expect(getAnalyticsSummary("2026-01-01", "2026-01-31")).resolves.toMatchObject({
      configured: false,
    });
    await expect(getAnalyticsSummary("yesterday", "today")).resolves.toMatchObject({
      configured: false,
    });
  });

  it("rejects malformed date input before any config/network check", async () => {
    await expect(getAnalyticsSummary("not-a-date", "2026-09-30")).rejects.toThrow();
    await expect(getAnalyticsSummary("2026-09-01", "last tuesday")).rejects.toThrow();
  });

  it("is an async function returning a Promise", () => {
    const result = getAnalyticsSummary("2026-09-01", "2026-09-30");
    expect(result).toBeInstanceOf(Promise);
    // Avoid an unhandled-rejection warning regardless of which path it resolves/rejects through.
    return result.catch(() => undefined);
  });
});
