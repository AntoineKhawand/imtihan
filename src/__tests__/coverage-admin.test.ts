import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  admin: vi.fn(),
  collection: vi.fn(),
  get: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));
vi.mock("@/lib/firebase-admin", () => ({
  verifyIdToken: mocks.verify,
  adminDb: { collection: mocks.collection },
}));
vi.mock("@/lib/admin", () => ({ isAdmin: mocks.admin }));
import { GET } from "@/app/api/admin/chapter-coverage-misses/route";
describe("coverage report boundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    const query = {
      where: mocks.where,
      orderBy: mocks.orderBy,
      limit: mocks.limit,
      get: mocks.get,
    };
    mocks.collection.mockReturnValue(query);
    mocks.where.mockReturnValue(query);
    mocks.orderBy.mockReturnValue(query);
    mocks.limit.mockReturnValue(query);
    mocks.verify.mockResolvedValue("admin");
    mocks.admin.mockResolvedValue(true);
    mocks.get.mockResolvedValue({ docs: [] });
  });
  it("refuses non-admin callers before reading the database", async () => {
    mocks.admin.mockResolvedValue(false);
    expect(
      (
        await GET(
          new NextRequest("http://localhost/api/admin/chapter-coverage-misses"),
        )
      ).status,
    ).toBe(401);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it("bounds the window and does not mix legacy miss-only totals into rates", async () => {
    const response = await GET(
      new NextRequest(
        "http://localhost/api/admin/chapter-coverage-misses?days=7",
      ),
    );
    const report = await response.json();
    expect(response.status).toBe(200);
    expect(mocks.collection).toHaveBeenCalledExactlyOnceWith(
      "chapterCoverageDaily",
    );
    expect(
      (Date.parse(report.endDay) - Date.parse(report.startDay)) / 86400000,
    ).toBe(6);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects arbitrary periods", async () => {
    expect(
      (
        await GET(
          new NextRequest(
            "http://localhost/api/admin/chapter-coverage-misses?days=999",
          ),
        )
      ).status,
    ).toBe(400);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it("returns names, totals and a rate based on selections", async () => {
    mocks.get.mockResolvedValue({
      docs: [
        {
          data: () => ({
            day: "2026-10-10",
            curriculumId: "bac-libanais",
            levelId: "eb9",
            subject: "mathematics",
            chapterId: "eb9-math-algebra",
            selectionCount: 20,
            missCount: 2,
          }),
        },
      ],
    });
    const response = await GET(
      new NextRequest("http://localhost/api/admin/chapter-coverage-misses"),
    );
    expect((await response.json()).misses[0]).toMatchObject({
      selectionCount: 20,
      missCount: 2,
      missRate: 0.1,
      chapterName: "Algebraic computation",
      levelName: "Grade 9 (Brevet)",
    });
  });
  it("returns an error instead of partial rates when the read bound is exceeded", async () => {
    mocks.get.mockResolvedValue({ docs: Array(5001).fill({}) });
    expect(
      (
        await GET(
          new NextRequest("http://localhost/api/admin/chapter-coverage-misses"),
        )
      ).status,
    ).toBe(503);
  });
  it("does not turn database failures into empty success or leak details", async () => {
    mocks.get.mockRejectedValue(new Error("private-provider-details"));
    const response = await GET(
      new NextRequest("http://localhost/api/admin/chapter-coverage-misses"),
    );
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-provider-details");
  });
});
