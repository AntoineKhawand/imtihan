import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ router: { replace: vi.fn() }, auth: { user: null, profile: {}, loading: false } }));
vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: any) => <a {...props}>{children}</a> }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/subscription", () => ({ isProActive: () => true, isInGracePeriod: () => false }));
vi.mock("@/lib/storage", () => ({ getSchoolSettings: () => null, saveSchoolSettings: vi.fn(), saveExam: vi.fn(), buildExamTitle: () => "Test exam" }));
vi.mock("@/components/layout/UserNav", () => ({ UserNav: () => null }));
vi.mock("@/components/ui/Logo", () => ({ Logo: () => null }));
vi.mock("@/app/create/page", () => ({ StepIndicator: () => null, StepLabel: () => null }));
import ExportPage from "@/app/create/export/page";
let host: HTMLDivElement, root: Root;
const requests: { url: string; body: any }[] = [];
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  sessionStorage.clear();
  sessionStorage.setItem("imtihan_context", JSON.stringify({ subject: "mathematics", curriculumId: "bac-libanais", levelId: "TS", language: "french", duration: 60, totalPoints: 20, examType: "final" }));
  sessionStorage.setItem("imtihan_exercises", JSON.stringify([{ id: "1", number: 1, points: 20, statement: "Question", solution: { finalAnswer: "SECRET", methodology: "Method" } }]));
  requests.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (url, init) => {
    requests.push({ url, body: JSON.parse(init.body) });
    return { ok: true, blob: async () => new Blob(["mock docx"]), json: async () => ({ success: true }) };
  }));
  vi.spyOn(window, "open").mockImplementation(() => null);
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function click(element: Element | null) { expect(element).not.toBeNull(); await act(async () => (element as HTMLElement).click()); }
function button(text: string) { return [...host.querySelectorAll("button")].find(b => b.textContent?.includes(text))!; }
async function enterEmail() {
  await click(button("Send to my email"));
  const input = host.querySelector('input[type="email"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "teacher@example.com");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it("uses the main corrigé toggle for Word, PDF and email in both states", async () => {
  await act(async () => root.render(<ExportPage />));
  await enterEmail();
  for (const include of [false, true]) {
    await click(host.querySelector('[data-guide="export-options"] button'));
    expect(sessionStorage.getItem("imtihan_include_answer_key")).toBe(String(include));
    expect(host.querySelector('[role="switch"]')?.getAttribute("aria-checked")).toBe(String(include));
    await click(host.querySelector('[data-guide="word"]'));
    expect(requests.at(-1)?.body.includeAnswerKey).toBe(include);
    await click(host.querySelector('[data-guide="pdf"]'));
    expect(JSON.parse(sessionStorage.getItem("imtihan_print_settings")!).includeAnswerKey).toBe(include);
    await click([...host.querySelectorAll("button")].find(b => b.textContent === "Send")!);
    expect(requests.at(-1)?.url).toBe("/api/export/send");
    expect(requests.at(-1)?.body.includeSolution).toBe(include);
  }
});
it("restores Exam only after leaving and returning to export", async () => {
  sessionStorage.setItem("imtihan_include_answer_key", "false");
  await act(async () => root.render(<ExportPage />));
  expect(host.querySelector('[data-guide="export-options"] button')?.getAttribute("aria-checked")).toBe("false");
  await click(host.querySelector('[data-guide="word"]'));
  expect(requests.at(-1)?.body.includeAnswerKey).toBe(false);
});
