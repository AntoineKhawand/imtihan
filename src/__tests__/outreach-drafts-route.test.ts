// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ verify: vi.fn(), admin: vi.fn(), configured: vi.fn(), collection: vi.fn(), doc: vi.fn(), transaction: vi.fn(), get: vi.fn(), set: vi.fn(), generate: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({ verifyIdToken: mocks.verify, adminDb: { collection: mocks.collection, runTransaction: mocks.transaction } }));
vi.mock("@/lib/admin", () => ({ isAdmin: mocks.admin }));
vi.mock("@/lib/openai", () => ({ isOpenAIConfigured: mocks.configured, openaiErrorMessage: () => "AI service unavailable.", withRetryAndFallback: (fn: (model: unknown) => unknown) => fn({ generateContent: mocks.generate }) }));
vi.mock("@/lib/brevo", () => ({ sendEmail: mocks.send }));
import { POST } from "@/app/api/admin/outreach-drafts/route";
const brief = { audience: "Maths teachers", language: "french", context: "Public maths practice needs." };
const messages = [{ subject: "Practice exam", body: "Would editable questions help?" }, { subject: "A useful example", body: "Which maths chapter would be useful?" }, { subject: "A final question", body: "Would you like an example?" }];
function request(body: unknown = brief) { return new NextRequest("https://example.test/api/admin/outreach-drafts", { method: "POST", body: JSON.stringify(body) }); }
beforeEach(() => {
  vi.resetAllMocks(); mocks.verify.mockResolvedValue("admin-fixture"); mocks.admin.mockResolvedValue(true); mocks.configured.mockReturnValue(true);
  mocks.collection.mockReturnValue({ doc: mocks.doc }); mocks.doc.mockReturnValue({ id: "quota-fixture" });
  mocks.get.mockResolvedValue({ exists: true, data: () => ({ count: 0 }) });
  mocks.transaction.mockImplementation(async (fn: (tx: { get: typeof mocks.get; set: typeof mocks.set }) => unknown) => fn({ get: mocks.get, set: mocks.set }));
  mocks.generate.mockResolvedValue({ response: { text: () => JSON.stringify({ messages }) } });
});
afterEach(() => vi.useRealTimers());
describe("admin-only paid draft generation boundary", () => {
  it.each([null, "ordinary-user"])("rejects %s before quotas, provider or sender", async uid => {
    mocks.verify.mockResolvedValue(uid); mocks.admin.mockResolvedValue(false);
    const response = await POST(request()); expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it.each([null, {}, { ...brief, context: "short" }, { ...brief, audience: "x" }, { ...brief, language: "arabic" }, { ...brief, privateEmail: "private@example.test" }])("rejects invalid brief %j without charging quota", async body => {
    expect((await POST(request(body))).status).toBe(400); expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("rejects missing provider config without any quota/provider/send call", async () => {
    mocks.configured.mockReturnValue(false);
    expect((await POST(request())).status).toBe(503); expect(mocks.transaction).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it("atomically charges one UTC-day admin attempt and returns three drafts without email", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-13T23:59:00Z"));
    mocks.get.mockResolvedValue({ exists: true, data: () => ({ count: 19 }) });
    const response = await POST(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ messages });
    expect(mocks.doc).toHaveBeenCalledWith("outreach:admin-fixture:2026-10-13");
    expect(mocks.set).toHaveBeenCalledWith(expect.anything(), { count: 20, updatedAt: Date.now() }, { merge: true });
    expect(mocks.generate.mock.calls[0][0].generationConfig).toMatchObject({ responseMimeType: "application/json", maxOutputTokens: 1600 });
    expect(mocks.send).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects the twenty-first attempt before provider access", async () => {
    mocks.get.mockResolvedValue({ exists: true, data: () => ({ count: 20 }) });
    expect((await POST(request())).status).toBe(429); expect(mocks.set).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("fails closed when quota storage is unavailable", async () => {
    mocks.transaction.mockRejectedValue(new Error("private database detail"));
    const response = await POST(request()); expect(response.status).toBe(502); expect(await response.text()).not.toContain("private database detail"); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("charges failed paid attempts without leaking provider content or sending", async () => {
    mocks.generate.mockRejectedValue(new Error("private provider source and key"));
    const response = await POST(request()); expect(response.status).toBe(502); expect(await response.text()).not.toContain("private provider");
    expect(mocks.set).toHaveBeenCalledOnce(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it.each([
    ["wrong count", messages.slice(0, 2)],
    ["spam", [{ subject: "ACT NOW", body: "A question?" }, ...messages.slice(1)]],
    ["HTML", [{ subject: "Question", body: "<script>hostile</script>" }, ...messages.slice(1)]],
    ["long introduction", [{ ...messages[0], body: "word ".repeat(76) }, ...messages.slice(1)]],
    ["long final", [...messages.slice(0, 2), { ...messages[2], body: "word ".repeat(41) }]],
  ])("rejects provider %s output after quota but without sending", async (_kind, output) => {
    mocks.generate.mockResolvedValue({ response: { text: () => JSON.stringify({ messages: output }) } });
    const response = await POST(request()); expect(response.status).toBe(422); expect(mocks.set).toHaveBeenCalledOnce(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it("handles malformed JSON safely", async () => {
    mocks.generate.mockResolvedValue({ response: { text: () => '{"messages":[' } });
    const response = await POST(request()); expect(response.status).toBe(502); expect(await response.text()).not.toContain("messages"); expect(mocks.send).not.toHaveBeenCalled();
  });
});
