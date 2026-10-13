// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), admin: vi.fn(), collection: vi.fn(), doc: vi.fn(), get: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({ verifyIdToken: mocks.verify, adminDb: { collection: mocks.collection } }));
vi.mock("@/lib/admin", () => ({ isAdmin: mocks.admin }));
vi.mock("@/lib/brevo", () => ({ sendEmail: mocks.send }));
import { GET, POST } from "@/app/api/admin/send-email/route";
const url = "https://example.test/api/admin/send-email";
function post(uids: string[]) { return new NextRequest(url, { method: "POST", body: JSON.stringify({ template: "custom", subject: "Fixture", html: "<p>Fixture</p>", targetUids: uids }) }); }
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("BREVO_API_KEY", "private-brevo-fixture-key");
  vi.stubEnv("MARKETING_POSTAL_ADDRESS", "Private fixture address");
  vi.stubEnv("MARKETING_UNSUBSCRIBE_SECRET", "private-fixture-signing-secret-123456789");
  vi.stubEnv("CRON_SECRET", "");
  mocks.verify.mockResolvedValue("admin"); mocks.admin.mockResolvedValue(true);
  mocks.collection.mockReturnValue({ doc: mocks.doc });
  mocks.doc.mockImplementation((uid: string) => ({ get: () => mocks.get(uid) }));
  mocks.get.mockImplementation(async (uid: string) => ({ exists: true, data: () => ({ email: `${uid}@example.test`, displayName: "Fixture Teacher" }) }));
  mocks.send.mockResolvedValue({ ok: true });
});
afterEach(() => vi.unstubAllEnvs());

describe("admin read-only email configuration", () => {
  it.each([null, "ordinary-user"])("rejects %s without settings disclosure or sends", async uid => {
    mocks.verify.mockResolvedValue(uid); mocks.admin.mockResolvedValue(false);
    const response = await GET(new NextRequest(url));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.send).not.toHaveBeenCalled(); expect(mocks.collection).not.toHaveBeenCalled();
    if (!uid) expect(mocks.admin).not.toHaveBeenCalled();
  });
  it("reports present settings without exposing any values or contacting sender/storage", async () => {
    const response = await GET(new NextRequest(url)); const text = await response.text();
    expect(JSON.parse(text)).toEqual({ ready: true, issues: [] });
    for (const secret of [process.env.BREVO_API_KEY!, process.env.MARKETING_POSTAL_ADDRESS!, process.env.MARKETING_UNSUBSCRIBE_SECRET!]) expect(text).not.toContain(secret);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.send).not.toHaveBeenCalled(); expect(mocks.collection).not.toHaveBeenCalled();
  });
  it.each(["", "your_brevo_api_key_here"])("flags missing or placeholder Brevo key %s", async key => {
    vi.stubEnv("BREVO_API_KEY", key);
    expect(await (await GET(new NextRequest(url))).json()).toEqual({ ready: false, issues: ["Configure BREVO_API_KEY in Vercel Production."] });
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("reports all missing settings and accepts only configured secret fallback of sufficient length", async () => {
    vi.stubEnv("BREVO_API_KEY", ""); vi.stubEnv("MARKETING_POSTAL_ADDRESS", "   "); vi.stubEnv("MARKETING_UNSUBSCRIBE_SECRET", "");
    expect((await (await GET(new NextRequest(url))).json()).issues).toHaveLength(3);
    vi.stubEnv("CRON_SECRET", "x".repeat(32));
    expect((await (await GET(new NextRequest(url))).json()).issues).toHaveLength(2);
    vi.stubEnv("MARKETING_UNSUBSCRIBE_SECRET", "short");
    expect((await (await GET(new NextRequest(url))).json()).issues).toHaveLength(3);
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
describe("admin batch outcomes", () => {
  it("preserves accepted, opted-out, rejected and unknown transport outcomes without retry", async () => {
    mocks.send.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: true, skipped: true })
      .mockResolvedValueOnce({ ok: false, error: "Brevo 400: sender not approved" })
      .mockRejectedValueOnce(new Error("private transport payload"))
      .mockResolvedValueOnce({ ok: true });
    const response = await POST(post(["first", "optout", "rejected", "unknown", "last"]));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("private, no-store");
    const result = await response.json();
    expect(result).toMatchObject({ success: true, sent: 2, failed: 2, skipped: 1 });
    expect(result.results.map((item: { success: boolean; skipped?: boolean }) => [item.success, !!item.skipped])).toEqual([[true, false], [false, true], [false, false], [false, false], [true, false]]);
    expect(result.results[2].error).toContain("sender not approved");
    expect(result.results[3].error).toContain("Check Brevo logs before retrying");
    expect(JSON.stringify(result)).not.toContain("private transport payload");
    expect(mocks.send).toHaveBeenCalledTimes(5);
    for (const call of mocks.send.mock.calls) expect(call[0].purpose).toBe("marketing");
  });
  it("preserves earlier acceptances when a later recipient lookup fails", async () => {
    mocks.get.mockImplementation(async (uid: string) => {
      if (uid === "lookup-error") throw new Error("private database detail");
      return { exists: true, data: () => ({ email: `${uid}@example.test` }) };
    });
    const response = await POST(post(["first", "lookup-error", "last"]));
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result).toMatchObject({ sent: 2, failed: 1, skipped: 0 });
    expect(result.results).toHaveLength(3);
    expect(JSON.stringify(result)).not.toContain("private database detail");
    expect(mocks.send).toHaveBeenCalledTimes(2);
  });
  it("rejects unauthorized POST without sending", async () => {
    mocks.admin.mockResolvedValue(false);
    expect((await POST(post(["first"]))).status).toBe(401); expect(mocks.send).not.toHaveBeenCalled();
  });
});

describe("reviewed outreach send gate", () => {
  const valid = { template: "outreach", subject: "Maths practice", outreachBody: "Would an editable A & B example help?", reviewed: true, targetUids: ["teacher"] };
  const outreachRequest = (body: unknown) => new NextRequest(url, { method: "POST", body: JSON.stringify(body) });
  it.each([
    { reviewed: false }, { reviewed: "true" }, { targetUids: [] }, { targetUids: ["same", "same"] },
    { targetUids: Array.from({ length: 26 }, (_, i) => `teacher${i}`) }, { targetUids: [""] },
    { subject: "Hello\nBcc: unwanted" }, { outreachBody: "ACT NOW" },
    { outreachBody: "Hello {{name}}" }, { outreachBody: "<script>alert(1)</script>" },
    { outreachBody: "word ".repeat(221) }, { outreachBody: "https://one.test https://two.test" },
  ])("rejects invalid/unreviewed outreach before storage or sends: %j", async patch => {
    expect((await POST(outreachRequest({ ...valid, ...patch }))).status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
  });
  it("sends reviewed plain text only through existing marketing path with escaped conversion", async () => {
    const response = await POST(outreachRequest({ ...valid, html: "<script>ignored HTML</script>" }));
    expect(response.status).toBe(200); expect((await response.json()).sent).toBe(1);
    expect(mocks.send).toHaveBeenCalledOnce();
    expect(mocks.send.mock.calls[0][0]).toMatchObject({ purpose: "marketing", subject: "Maths practice" });
    const html = mocks.send.mock.calls[0][0].html;
    expect(html).toContain("A &amp; B"); expect(html).not.toContain("ignored HTML");
  });
  it("allows exactly25 unique reviewed recipients without scheduling a sequence", async () => {
    const response = await POST(outreachRequest({ ...valid, targetUids: Array.from({ length: 25 }, (_, i) => `teacher${i}`) }));
    expect(response.status).toBe(200); expect((await response.json()).sent).toBe(25); expect(mocks.send).toHaveBeenCalledTimes(25);
  });
});
