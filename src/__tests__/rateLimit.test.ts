import { describe, it, expect } from "vitest";
import { getClientIp } from "@/lib/rateLimit";

// checkAndIncrementDailyLimit itself needs a real Firestore Admin connection
// (adminDb.runTransaction) — not unit-testable without an emulator, so this
// covers the pure helper only. The route-level behavior (429 on exceeding the
// cap) is exercised by the security/QA teams' live review, same as the other
// Firestore-backed quota checks in this codebase.
describe("getClientIp", () => {
  it("takes the first address from x-forwarded-for", () => {
    const req = new Request("https://x.test", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const req = new Request("https://x.test", { headers: { "x-real-ip": "9.9.9.9" } });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    const req = new Request("https://x.test");
    expect(getClientIp(req)).toBe("unknown");
  });
});
