import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChapterCoverageReport } from "@/components/admin/ChapterCoverageReport";
const navigation = vi.hoisted(() => ({ pathname: "/create/confirm" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
import { GeneratorTutorial } from "@/components/ui/GeneratorTutorial";

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  localStorage.setItem("imtihan_generator_guide_v2", "seen");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const button = (label: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent === label,
  )!;
const click = async (target: HTMLElement) => {
  await act(async () => target.click());
};

describe("coverage UI", () => {
  it("shows a persistent error instead of a false empty report, and retries", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          misses: [],
          startDay: "2026-10-04",
          endDay: "2026-10-10",
          totalChapters: 0,
          firstSampleDay: null,
        }),
      });
    vi.stubGlobal("fetch", fetch);
    await act(async () =>
      root.render(
        <ChapterCoverageReport
          user={{ getIdToken: async () => "test-token" }}
        />,
      ),
    );
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Could not load",
    );
    expect(host.textContent).not.toContain("No tracked chapter selections");
    await click(button("Retry"));
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.textContent).toContain("No tracked chapter selections");
    expect(host.textContent).toContain(
      "does not confirm that recording is working",
    );
  });
  it("renders a rate with its denominator and refetches a changed period", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          startDay: "2026-09-13",
          endDay: "2026-10-10",
          totalChapters: 1,
          firstSampleDay: "2026-10-10",
          misses: [
            {
              id: "chapter",
              chapterName: "Algebra",
              chapterId: "algebra",
              curriculumId: "ib",
              levelName: "AA HL",
              subject: "mathematics",
              selectionCount: 5,
              missCount: 2,
              missRate: 0.4,
              lastMissedAt: null,
            },
          ],
        }),
      });
    vi.stubGlobal("fetch", fetch);
    await act(async () =>
      root.render(
        <ChapterCoverageReport
          user={{ getIdToken: async () => "test-token" }}
        />,
      ),
    );
    expect(host.textContent).toContain("40.0%");
    expect(host.textContent).toContain("Small sample");
    expect(host.textContent).toContain("AA HL");
    const select = host.querySelector("select")!;
    await act(async () => {
      select.value = "7";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(fetch.mock.calls.at(-1)?.[0]).toContain("days=7");
    expect(fetch.mock.calls.at(-1)?.[1]).toMatchObject({
      cache: "no-store",
      headers: { Authorization: "Bearer test-token" },
    });
  });
});

describe("generator guide", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue({
      length: 1,
    } as DOMRectList);
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  it("supports Next, Back, Escape and replay without pressing generation controls", async () => {
    const generate = vi.fn();
    await act(async () =>
      root.render(
        <>
          <div data-guide="context">Settings</div>
          <div data-guide="difficulty">Difficulty</div>
          <button data-guide="generate" onClick={generate}>
            Generate Exam
          </button>
          <GeneratorTutorial />
        </>,
      ),
    );
    const help = host.querySelector<HTMLButtonElement>(
      '[aria-label="Open exam generator tutorial"]',
    )!;
    help.focus();
    await click(help);
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Check the detected settings",
    );
    await click(button("Next"));
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Choose the difficulty",
    );
    await click(button("Back"));
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Check the detected settings",
    );
    await act(async () => {
      host
        .querySelector('[role="dialog"]')!
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
    });
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Open exam generator tutorial",
    );
    await click(
      host.querySelector('[aria-label="Open exam generator tutorial"]')!,
    );
    expect(host.querySelector('[role="dialog"]')).not.toBeNull();
    expect(generate).not.toHaveBeenCalled();
  });
  it("traps keyboard focus and closes on Done, skipping absent controls", async () => {
    await act(async () =>
      root.render(
        <>
          <div data-guide="context">Settings</div>
          <GeneratorTutorial />
        </>,
      ),
    );
    await click(
      host.querySelector('[aria-label="Open exam generator tutorial"]')!,
    );
    expect(host.textContent).toContain("1 of 1");
    const dialog = host.querySelector<HTMLDivElement>('[role="dialog"]')!;
    button("Done").focus();
    await act(async () => {
      dialog.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(document.activeElement?.getAttribute("aria-label")).toBe(
      "Close tutorial",
    );
    await click(button("Done"));
    expect(host.querySelector('[role="dialog"]')).toBeNull();
  });
});
