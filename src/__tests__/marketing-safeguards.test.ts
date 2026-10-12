import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
const db = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
}));
vi.mock("@/lib/firebase-admin", () => ({
  adminDb: { collection: db.collection },
}));
import {
  createUnsubscribeToken,
  verifyUnsubscribeToken,
  marketingPreferenceId,
} from "@/lib/marketingEmail";
import { sendEmail } from "@/lib/brevo";
import { GET, POST } from "@/app/unsubscribe/route";

describe("marketing safeguards (mocked database and delivery)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BREVO_API_KEY", "fake-test-key");
    vi.stubEnv(
      "MARKETING_UNSUBSCRIBE_SECRET",
      "test-only-secret-with-at-least-32-characters",
    );
    vi.stubEnv("MARKETING_POSTAL_ADDRESS", "Test business mailbox <example>");
    db.collection.mockReturnValue({ doc: db.doc });
    db.doc.mockReturnValue({ get: db.get, set: db.set });
    db.get.mockResolvedValue({ data: () => undefined });
    db.set.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  it("normalizes recipients and rejects modified or malformed signed links", () => {
    const token = createUnsubscribeToken(" Teacher@Example.com ");
    expect(verifyUnsubscribeToken(token)).toBe(
      marketingPreferenceId("teacher@example.com"),
    );
    expect(token).not.toContain("teacher");
    expect(
      verifyUnsubscribeToken(
        token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"),
      ),
    ).toBeNull();
    expect(verifyUnsubscribeToken("bad")).toBeNull();
  });
  it("blocks promotional sends when the postal address is missing", async () => {
    vi.stubEnv("MARKETING_POSTAL_ADDRESS", "");
    expect(
      (
        await sendEmail({
          to: "teacher@example.com",
          subject: "Newsletter",
          html: "Hi",
          purpose: "marketing",
        })
      ).ok,
    ).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("honors suppression across marketing senders", async () => {
    db.get.mockResolvedValue({ data: () => ({ unsubscribed: true }) });
    expect(
      await sendEmail({
        to: "teacher@example.com",
        subject: "Welcome",
        html: "Hi",
        purpose: "marketing",
      }),
    ).toEqual({ ok: true, skipped: true });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not send when the preference store fails", async () => {
    db.get.mockRejectedValue(new Error("offline"));
    expect(
      (
        await sendEmail({
          to: "teacher@example.com",
          subject: "Newsletter",
          html: "Hi",
          purpose: "marketing",
        })
      ).ok,
    ).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("adds an escaped address and signed one-click headers before the closing body", async () => {
    await sendEmail({
      to: "teacher@example.com",
      subject: "Newsletter",
      html: "<body>Hello</body>",
      purpose: "marketing",
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.htmlContent).toContain("Test business mailbox &lt;example&gt;");
    expect(body.htmlContent).toMatch(/Unsubscribe[\s\S]*<\/body>$/);
    expect(body.headers["List-Unsubscribe-Post"]).toBe(
      "List-Unsubscribe=One-Click",
    );
    expect(body.headers["List-Unsubscribe"]).not.toContain(
      "teacher@example.com",
    );
  });
  it("keeps requested transactional delivery independent of marketing configuration", async () => {
    vi.stubEnv("MARKETING_POSTAL_ADDRESS", "");
    expect(
      (
        await sendEmail({
          to: "teacher@example.com",
          subject: "Requested exam",
          html: "Exam",
          purpose: "transactional",
        })
      ).ok,
    ).toBe(true);
    expect(db.get).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("GET is scanner safe; POST saves suppression without signing in", async () => {
    const url = `https://imtihan.live/unsubscribe?token=${createUnsubscribeToken("teacher@example.com")}`;
    expect((await GET(new Request(url))).status).toBe(200);
    expect(db.set).not.toHaveBeenCalled();
    const response = await POST(new Request(url, { method: "POST" }));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("You’re unsubscribed");
    expect(db.set).toHaveBeenCalledWith(
      { unsubscribed: true, updatedAt: expect.any(Number) },
      { merge: true },
    );
  });
  it("invalid links cannot change preferences", async () => {
    expect(
      (
        await POST(
          new Request("https://imtihan.live/unsubscribe?token=bad", {
            method: "POST",
          }),
        )
      ).status,
    ).toBe(400);
    expect(db.set).not.toHaveBeenCalled();
  });
});
