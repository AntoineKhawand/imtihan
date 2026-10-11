import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExamDemo } from "@/components/landing/ExamDemo";
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (window as unknown as { gtag?: unknown }).gtag;
});
describe("homepage demo", () => {
  it("plays four stages in 20 seconds, then stops and replays without generating anything", async () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await act(async () => root.render(<ExamDemo />));
    expect(host.textContent).toContain("does not generate an exam");
    await act(async () => {
      host
        .querySelector<HTMLButtonElement>('[aria-label="Play 20-second demo"]')!
        .click();
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(host.textContent).toContain("Hard (editable)");
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    expect(host.textContent).toContain("Ready for your classroom");
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"),
    ).toBe("20");
    expect(host.querySelector('[aria-label="Replay demo"]')).not.toBeNull();
    expect(
      gtag.mock.calls.filter((call) => call[1] === "demo_complete"),
    ).toHaveLength(1);
    await act(async () => {
      host
        .querySelector<HTMLButtonElement>('[aria-label="Replay demo"]')!
        .click();
    });
    expect(
      host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"),
    ).toBe("0");
    expect(fetch).not.toHaveBeenCalled();
    expect(
      gtag.mock.calls.some((call) =>
        ["sign_up", "exam_generated"].includes(call[1]),
      ),
    ).toBe(false);
  });
  it("supports pause and direct step selection without a timer continuing", async () => {
    await act(async () => root.render(<ExamDemo />));
    await act(async () => {
      host
        .querySelector<HTMLButtonElement>('[aria-label="Play 20-second demo"]')!
        .click();
    });
    await act(async () => {
      host
        .querySelector<HTMLButtonElement>('[aria-label="Pause demo"]')!
        .click();
      vi.advanceTimersByTime(1000);
    });
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => {
      [...host.querySelectorAll("button")]
        .find((button) => button.textContent === "3. Review")!
        .click();
    });
    expect(host.textContent).toContain("stationary points");
    expect(
      host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow"),
    ).toBe("10");
  });
});
