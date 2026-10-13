import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OutreachAssistant } from "@/components/admin/OutreachAssistant";
import type { OutreachMessage } from "@/lib/outreach";
const user = { getIdToken: vi.fn(async () => "fixture-token") };
const fetchMock = vi.fn();
const drafts = [{ subject: "First question", body: "Would editable maths questions help?" }, { subject: "Second question", body: "Which chapter would help?" }, { subject: "Final question", body: "Would an example help?" }];
let root: Root; let host: HTMLDivElement;
function Harness({ signedIn = true, initial = { subject: "A question", body: "Would a practice exam help?" } }: { signedIn?: boolean; initial?: OutreachMessage }) {
  const [message, setMessage] = useState(initial); const [reviewed, setReviewed] = useState(false);
  return <><OutreachAssistant user={signedIn ? user : null} message={message} onChange={setMessage} reviewed={reviewed} onReviewed={setReviewed} /><output data-reviewed>{String(reviewed)}</output></>;
}
beforeEach(() => {
  vi.resetAllMocks(); user.getIdToken.mockResolvedValue("fixture-token");
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ messages: drafts }) });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
async function mount(props = {}) { await act(async () => root.render(<Harness {...props} />)); }
async function fill(label: string, value: string) {
  const element = [...host.querySelectorAll("label")].find(node => node.textContent?.startsWith(label))!.querySelector<HTMLInputElement | HTMLTextAreaElement>("input,textarea")!;
  await act(async () => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")!.set!.call(element, value); element.dispatchEvent(new Event("input", { bubbles: true })); });
}
const generate = () => [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Generate outreach drafts")!;
const checkbox = () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
describe("outreach review UI without real providers or sending", () => {
  it("disables generation until public brief is valid and makes only draft POST", async () => {
    await mount(); expect(generate().disabled).toBe(true);
    await fill("Audience", "Maths teachers"); await fill("Public context", "Public maths assessment needs.");
    expect(generate().disabled).toBe(false);
    await act(async () => generate().click());
    expect(host.querySelectorAll("article")).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]).toEqual(["/api/admin/outreach-drafts", expect.objectContaining({ method: "POST", headers: { Authorization: "Bearer fixture-token", "Content-Type": "application/json" } })]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ audience: "Maths teachers", language: "french", context: "Public maths assessment needs." });
  });
  it("selects drafts and clears review on selection and every content edit", async () => {
    await mount(); await act(async () => checkbox().click()); expect(host.querySelector("output")?.textContent).toBe("true");
    await fill("Outreach subject", "Edited question"); expect(host.querySelector("output")?.textContent).toBe("false");
    await act(async () => checkbox().click()); await fill("Plain-text message", "A different useful question?"); expect(host.querySelector("output")?.textContent).toBe("false");
    await fill("Audience", "Teachers"); await fill("Public context", "Public curriculum needs."); await act(async () => generate().click());
    await act(async () => checkbox().click());
    const select = [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Review draft 2")!;
    await act(async () => select.click()); expect(host.querySelector("output")?.textContent).toBe("false");
    expect(host.querySelector<HTMLInputElement>('label input[maxlength="90"]')?.value).toBe(drafts[1].subject);
  });
  it("renders hostile draft strings as text and blocks review of invalid content", async () => {
    const hostile = { subject: '<img src=x onerror="alert(1)">', body: '<script>alert("fixture")</script>' };
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ messages: [hostile, ...drafts.slice(1)] }) });
    await mount(); await fill("Audience", "Teachers"); await fill("Public context", "Public curriculum needs."); await act(async () => generate().click());
    expect(host.textContent).toContain(hostile.body); expect(host.querySelector("script,img")).toBeNull();
    await act(async () => [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Review draft 1")!.click());
    expect(checkbox().disabled).toBe(true); expect(host.textContent).toContain("Use plain text without HTML markup");
  });
  it.each(["HTTP", "invalid response", "network", "token"])("reports %s failure without sending", async failure => {
    if (failure === "token") user.getIdToken.mockRejectedValue(new Error("Token unavailable"));
    fetchMock.mockImplementation(async () => { if (failure === "network") throw new Error("Connection unavailable"); return { ok: failure !== "HTTP", json: async () => failure === "HTTP" ? { error: "Daily draft limit reached" } : { messages: [] } }; });
    await mount(); await fill("Audience", "Teachers"); await fill("Public context", "Public curriculum needs."); await act(async () => generate().click());
    expect(host.querySelector('[role="alert"]')?.textContent).toBeTruthy(); expect(host.querySelectorAll("article")).toHaveLength(0);
    for (const [url] of fetchMock.mock.calls) expect(url).toBe("/api/admin/outreach-drafts");
    if (failure === "token") expect(fetchMock).not.toHaveBeenCalled();
  });
  it("prevents double-click generation while awaiting provider response", async () => {
    let resolve!: (response: unknown) => void; fetchMock.mockReturnValue(new Promise(done => { resolve = done; }));
    await mount(); await fill("Audience", "Teachers"); await fill("Public context", "Public curriculum needs.");
    await act(async () => generate().click());
    const preparing = [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Preparing drafts…")!;
    expect(preparing.disabled).toBe(true); await act(async () => preparing.click()); expect(fetchMock).toHaveBeenCalledOnce();
    await act(async () => resolve({ ok: true, json: async () => ({ messages: drafts }) })); expect(generate().disabled).toBe(false);
  });
  it("requires signed-in user and valid content for review", async () => {
    await mount({ signedIn: false, initial: { subject: "ACT NOW", body: "A question" } });
    await fill("Audience", "Teachers"); await fill("Public context", "Public curriculum needs.");
    expect(generate().disabled).toBe(true); expect(checkbox().disabled).toBe(true); expect(fetchMock).not.toHaveBeenCalled();
  });
});
