import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmailSendReport } from "@/components/admin/EmailSendReport";
import { EmailConfiguration } from "@/components/admin/EmailConfiguration";
let root: Root;
let container: HTMLDivElement;
const fetchMock = vi.fn();
const user = { getIdToken: vi.fn(async () => "fixture-token") };
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("fetch", fetchMock); container = document.createElement("div"); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
async function render(node: ReactNode) { await act(async () => root.render(node)); }
describe("email send result UI", () => {
  it("shows failures and opt-outs separately, escapes hostile content and dismisses", async () => {
    const dismiss = vi.fn();
    await render(<EmailSendReport onDismiss={dismiss} result={{ sent: 1, failed: 1, skipped: 1, results: [
      { uid: "accepted", email: "accepted@example.test", success: true },
      { uid: "failed", email: '<img src=x onerror="alert(1)">', success: false, error: '<script>alert("error")</script>' },
      { uid: "skipped", email: "optout@example.test", success: false, skipped: true, error: "Recipient opted out." },
    ] }} />);
    expect(container.textContent).toContain("1 accepted by email provider · 1 failed · 1 skipped");
    expect(container.textContent).toContain("does not confirm inbox delivery");
    expect(container.textContent).toContain('<script>alert("error")</script>');
    expect(container.querySelector("script,img")).toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.textContent).not.toContain("accepted@example.test");
    expect(container.textContent).toContain("optout@example.test · Skipped");
    await act(async () => container.querySelector<HTMLButtonElement>("button")!.click()); expect(dismiss).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("provides useful fallbacks for absent recipient/reason", async () => {
    await render(<EmailSendReport onDismiss={() => undefined} result={{ sent: 0, failed: 1, skipped: 0, results: [{ uid: "missing", email: "", success: false }] }} />);
    expect(container.textContent).toContain("Recipient account · Failed");
    expect(container.textContent).toContain("Check the email provider logs before retrying");
  });
});
describe("read-only configuration UI", () => {
  it("issues only authenticated GET checks, displays escaped issues and refreshes", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ready: false, issues: ["Missing MARKETING_POSTAL_ADDRESS", "<img src=x onerror=alert(1)>"] }) });
    await render(<EmailConfiguration user={user} />);
    expect(container.textContent).toContain("configuration is incomplete");
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>"); expect(container.querySelector("img")).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/send-email", { cache: "no-store", headers: { Authorization: "Bearer fixture-token" } });
    await act(async () => container.querySelector<HTMLButtonElement>("button")!.click());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [, options] of fetchMock.mock.calls) { expect(options.method ?? "GET").toBe("GET"); expect(options.body).toBeUndefined(); }
  });
  it("describes present settings without promising provider validity or delivery", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ready: true, issues: [] }) });
    await render(<EmailConfiguration user={user} />);
    expect(container.textContent).toContain("does not verify Brevo credentials, sender approval or delivery");
    expect(container.textContent).toContain("No email was sent");
  });
  it.each(["HTTP", "network", "invalid-data", "token"])("handles %s failure without exposing internals or sending", async failure => {
    fetchMock.mockImplementation(async () => {
      if (failure === "network") throw new Error("private network detail");
      return { ok: failure !== "HTTP", json: async () => ({ issues: [42] }) };
    });
    const failedUser = failure === "token" ? { getIdToken: async () => { throw new Error("private token"); } } : user;
    await render(<EmailConfiguration user={failedUser} />);
    expect(container.textContent).toContain("Configuration check unavailable. No email was sent");
    expect(container.textContent).not.toContain("private");
    if (failure === "token") expect(fetchMock).not.toHaveBeenCalled();
  });
  it("does not query without a signed-in user", async () => {
    await render(<EmailConfiguration user={null} />); expect(fetchMock).not.toHaveBeenCalled();
  });
});
