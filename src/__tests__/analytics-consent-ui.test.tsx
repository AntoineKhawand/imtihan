import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("next/script", () => ({
  default: ({ src, id }: { src?: string; id?: string }) => (
    <span data-analytics-script={src ?? id} />
  ),
}));
vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <span data-analytics-script="vercel" />,
}));
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";
let root: Root | undefined;
let container: HTMLDivElement | undefined;
async function mount() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<AnalyticsConsent />));
}
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  container?.remove();
  localStorage.clear();
});
describe("analytics script consent", () => {
  it("renders zero analytics scripts until acceptance", async () => {
    await mount();
    expect(container!.querySelectorAll("[data-analytics-script]").length).toBe(
      0,
    );
    const buttons = [...container!.querySelectorAll("button")];
    expect(buttons.map((b) => b.textContent)).toEqual([
      "Reject analytics",
      "Accept analytics",
    ]);
    await act(async () => buttons[1].click());
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("accepted");
    expect(container!.querySelectorAll("[data-analytics-script]").length).toBe(
      5,
    );
  });
  it("preserves rejection and lets visitors reopen choices", async () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "rejected");
    await mount();
    expect(container!.querySelectorAll("[data-analytics-script]").length).toBe(
      0,
    );
    await act(async () =>
      container!.querySelector<HTMLButtonElement>("button")!.click(),
    );
    expect(container!.textContent).toContain("Reject analytics");
    expect(container!.querySelectorAll("[data-analytics-script]").length).toBe(
      0,
    );
  });
});
