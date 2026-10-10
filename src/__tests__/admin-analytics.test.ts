import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), admin: vi.fn(), report: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({ verifyIdToken: mocks.verify }));
vi.mock("@/lib/admin", () => ({ isAdmin: mocks.admin }));
vi.mock("@/lib/analytics-reporting", () => ({ getAnalyticsSummary: mocks.report }));
import { GET } from "@/app/api/admin/analytics/route";

describe("admin analytics boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.verify.mockResolvedValue("admin-uid");
    mocks.admin.mockResolvedValue(true);
    mocks.report.mockResolvedValue({ configured: false, reason: "Missing configuration" });
  });

  it.each([null, "ordinary-user"])("does not query GA4 for an unauthorized caller (%s)", async (uid) => {
    mocks.verify.mockResolvedValue(uid);
    mocks.admin.mockResolvedValue(false);
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics"));
    expect(response.status).toBe(401);
    expect(mocks.report).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("bounds date ranges and rejects arbitrary provider queries", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics?days=999999"));
    expect(response.status).toBe(400);
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it.each(["7", "28"])("queries %s completed days and preserves not-configured state", async (days) => {
    const response = await GET(new NextRequest(`http://localhost/api/admin/analytics?days=${days}`));
    expect(response.status).toBe(200);
    expect(mocks.report).toHaveBeenCalledWith(`${days}daysAgo`, "yesterday");
    expect(await response.json()).toEqual({ configured: false, reason: "Missing configuration" });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns real provider totals without inventing numbers", async () => {
    const result = { configured: true, startDate: "28daysAgo", endDate: "yesterday", totalSessions: 42, totalUsers: 30, sessionsByChannel: [{ channel: "Organic Search", sessions: 12 }], conversionEvents: [{ eventName: "sign_up", count: 3 }, { eventName: "exam_generated", count: 2 }] };
    mocks.report.mockResolvedValue(result);
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics"));
    expect(await response.json()).toEqual(result);
  });

  it("does not expose provider exceptions or credentials", async () => {
    mocks.report.mockRejectedValue(new Error("private-key-and-provider-payload"));
    const response = await GET(new NextRequest("http://localhost/api/admin/analytics"));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-key-and-provider-payload");
  });
});
