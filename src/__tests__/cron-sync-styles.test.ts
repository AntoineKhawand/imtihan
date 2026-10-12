// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), query: vi.fn(), get: vi.fn(), build: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({ adminDb: { collection: mocks.collection } }));
vi.mock("@/lib/teacherStyle", () => ({ buildStyleFromExams: mocks.build, mergeAndSaveStyle: mocks.save }));
import { GET } from "@/app/api/cron/sync-styles/route";
const url = "https://example.test/api/cron/sync-styles";
const request = (headers = { authorization: "Bearer fixture-cron-secret" }) => new NextRequest(url, { headers });
function snapshot(uids: string[]) {
  return { empty: uids.length === 0, size: uids.length, docs: uids.map(teacherId => ({ data: () => ({ teacherId, context: { curriculumId: "ib", subject: "mathematics" }, exercises: [] }) })) };
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("CRON_SECRET", "fixture-cron-secret");
  const query = { orderBy: mocks.query, limit: mocks.query, get: mocks.get };
  mocks.collection.mockReturnValue(query); mocks.query.mockReturnValue(query);
  mocks.get.mockResolvedValue(snapshot([])); mocks.build.mockReturnValue({ fixture: true }); mocks.save.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());

describe("style scheduler authorization and truthful write accounting", () => {
  it("accepts Vercel Bearer and saves a style profile", async () => {
    mocks.get.mockResolvedValue(snapshot(["teacher-a"]));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ processed: 1, groups: 1, failedGroups: 0 });
    expect(mocks.save).toHaveBeenCalledWith("teacher-a", "ib", "mathematics", { fixture: true });
  });
  it.each([
    ["missing configured secret", "", {}],
    ["missing authorization", "fixture-cron-secret", {}],
    ["wrong Bearer", "fixture-cron-secret", { authorization: "Bearer wrong" }],
    ["raw secret", "fixture-cron-secret", { authorization: "fixture-cron-secret" }],
    ["legacy x-cron-secret alone", "fixture-cron-secret", { "x-cron-secret": "fixture-cron-secret" }],
  ])("rejects %s before any database access", async (_label, configured, headers) => {
    vi.stubEnv("CRON_SECRET", configured);
    const response = await GET(new NextRequest(url, { headers }));
    expect(response.status).toBe(401);
    expect(mocks.collection).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("does not report rejected writes as updated", async () => {
    mocks.get.mockResolvedValue(snapshot(["teacher-a"])); mocks.save.mockRejectedValue(new Error("private storage detail"));
    const response = await GET(request()); const result = await response.json();
    expect(response.status).toBe(500);
    expect(result).toMatchObject({ processed: 1, groups: 0, failedGroups: 1 });
    expect(JSON.stringify(result)).not.toContain("private storage detail");
  });
  it("preserves partial successful counts and reports failed groups", async () => {
    mocks.get.mockResolvedValue(snapshot(["teacher-a", "teacher-b", "teacher-c"]));
    mocks.save.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("private rejection")).mockResolvedValueOnce(undefined);
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ processed: 3, groups: 2, failedGroups: 1 });
    expect(mocks.save).toHaveBeenCalledTimes(3);
  });
  it("returns a truthful empty result without writes", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ processed: 0, groups: 0 });
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
