import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(), exists: vi.fn(), download: vi.fn(), save: vi.fn(), file: vi.fn(),
  bucket: vi.fn(), collection: vi.fn(), doc: vi.fn(), transaction: vi.fn(), get: vi.fn(), set: vi.fn(), fetch: vi.fn(),
}));
vi.mock("@/lib/firebase-admin", () => ({
  verifySession: mocks.verify,
  adminStorage: { bucket: mocks.bucket },
  adminDb: { collection: mocks.collection, runTransaction: mocks.transaction },
}));

// Valid tiny PNG fixture. No SDK credentials, real Firebase or provider calls.
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB5kAAAAASUVORK5CYII=", "base64");
const request = (prompt = "A laboratory diagram", seed = "1", headers: Record<string, string> = {}) => new NextRequest(`http://localhost/api/image/generate?prompt=${encodeURIComponent(prompt)}&seed=${seed}`, { headers: { "sec-fetch-site": "same-origin", "sec-fetch-dest": "image", ...headers } });
let GET: typeof import("@/app/api/image/generate/route").GET;

beforeEach(async () => {
  vi.resetModules(); vi.clearAllMocks();
  vi.stubEnv("FIREBASE_STORAGE_BUCKET", "demo-qa-bucket");
  vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "");
  vi.stubEnv("OPENAI_API_KEY", "qa-not-a-real-key");
  vi.stubEnv("OPENAI_IMAGE_MODEL", "qa-configured-image-model");
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.verify.mockResolvedValue("qa-teacher");
  mocks.exists.mockResolvedValue([false]);
  mocks.download.mockResolvedValue([png]); mocks.save.mockResolvedValue(undefined);
  mocks.file.mockReturnValue({ exists: mocks.exists, download: mocks.download, save: mocks.save });
  mocks.bucket.mockReturnValue({ file: mocks.file });
  mocks.doc.mockReturnValue({ id: "qa-quota" }); mocks.collection.mockReturnValue({ doc: mocks.doc });
  mocks.get.mockResolvedValue({ data: () => ({ count: 0 }) });
  mocks.transaction.mockImplementation(async (callback: (tx: { get: typeof mocks.get; set: typeof mocks.set }) => unknown) => callback({ get: mocks.get, set: mocks.set }));
  mocks.fetch.mockImplementation(async () => Response.json({ data: [{ b64_json: png.toString("base64") }] }));
  GET = (await import("@/app/api/image/generate/route")).GET;
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("QA — paid image route boundaries and persisted public assets", () => {
  it("rejects missing/oversized prompts without touching services", async () => {
    expect((await GET(request(""))).status).toBe(400);
    expect((await GET(request("x".repeat(2001)))).status).toBe(413);
    expect(mocks.bucket).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("reports missing storage configuration before spending quota", async () => {
    vi.stubEnv("FIREBASE_STORAGE_BUCKET", "");
    expect((await GET(request())).status).toBe(503);
    expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("denies unauthenticated cache misses without paid generation", async () => {
    mocks.verify.mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("reports missing OpenAI key without consuming quota", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect((await GET(request())).status).toBe(503);
    expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("serves a persisted PNG publicly, with the correct content type and no generation", async () => {
    mocks.exists.mockResolvedValue([true]); mocks.verify.mockResolvedValue(null);
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(Buffer.from(await response.arrayBuffer())).toEqual(png);
    expect(mocks.verify).not.toHaveBeenCalled(); expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("persists successful PNG generation once and excludes random display seeds from the cache key", async () => {
    const response = await GET(request("A laboratory diagram", "random-1"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(mocks.set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ count: 1, route: "exam-images" }), { merge: true });
    expect(mocks.fetch).toHaveBeenCalledWith("https://api.openai.com/v1/images/generations", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse(mocks.fetch.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ model: "qa-configured-image-model", n: 1, output_format: "png" });
    expect(mocks.save).toHaveBeenCalledWith(png, expect.objectContaining({ metadata: expect.objectContaining({ contentType: "image/png" }) }));
    const firstPath = mocks.file.mock.calls[0][0];
    mocks.exists.mockResolvedValue([true]);
    expect((await GET(request("A laboratory diagram", "random-2"))).status).toBe(200);
    expect(mocks.file.mock.calls[1][0]).toBe(firstPath);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });
  it("enforces the transactional daily limit before calling the paid provider", async () => {
    mocks.get.mockResolvedValue({ data: () => ({ count: 20 }) });
    expect((await GET(request())).status).toBe(429);
    expect(mocks.fetch).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("sanitizes provider failures and never persists an error as an image", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ error: "private provider detail" }, { status: 500 }));
    const response = await GET(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private provider detail"); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("rejects fake/non-PNG provider content instead of returning it as PNG", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ data: [{ b64_json: Buffer.from("<html>not an image</html>").toString("base64") }] }));
    expect((await GET(request())).status).toBe(502);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("deduplicates concurrent same-image requests within the server instance", async () => {
    const responses = await Promise.all([GET(request("Same prompt", "1")), GET(request("Same prompt", "2"))]);
    expect(responses.map(response => response.status)).toEqual([200, 200]);
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.fetch).toHaveBeenCalledTimes(1); expect(mocks.save).toHaveBeenCalledTimes(1);
  });
  it.each([
    ["cross-site image", { "sec-fetch-site": "cross-site", "sec-fetch-dest": "image" }],
    ["cross-site navigation", { "sec-fetch-site": "cross-site", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate" }],
    ["foreign origin", { origin: "https://foreign.example" }],
    ["foreign referrer", { referer: "https://foreign.example/article" }],
    ["same-origin navigation", { "sec-fetch-dest": "document", "sec-fetch-mode": "navigate" }],
  ])("blocks paid generation for %s before quota/provider calls", async (_label, headers) => {
    expect((await GET(request("A laboratory diagram", "1", headers))).status).toBe(403);
    expect(mocks.verify).not.toHaveBeenCalled(); expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("keeps cached assets public even for cross-site navigation", async () => {
    mocks.exists.mockResolvedValue([true]);
    expect((await GET(request("A laboratory diagram", "1", { "sec-fetch-site": "cross-site", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate" }))).status).toBe(200);
    expect(mocks.verify).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("blocks headerless paid cache misses without positive same-origin evidence", async () => {
    const response = await GET(new NextRequest("http://localhost/api/image/generate?prompt=Headerless"));
    expect(response.status).toBe(403);
    expect(mocks.verify).not.toHaveBeenCalled(); expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("allows a matching Referer-only legacy same-origin image request", async () => {
    const response = await GET(new NextRequest("http://localhost/api/image/generate?prompt=Legacy", { headers: { referer: "http://localhost/create/generate" } }));
    expect(response.status).toBe(200); expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });
});
