import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";
import { trackEvent, trackEventAndWait } from "@/lib/analytics";

describe("trackEvent", () => {
  beforeEach(() => localStorage.setItem(ANALYTICS_CONSENT_KEY, "accepted"));
  afterEach(() => {
    localStorage.clear();
    // @ts-expect-error test cleanup of a global test double
    delete window.gtag;
    delete (window as unknown as { imtihanPendingEvents?: unknown })
      .imtihanPendingEvents;
    vi.useRealTimers();
  });

  it("calls window.gtag with the event name and params when gtag is present", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;

    trackEvent("sign_up", { method: "google" });

    expect(gtag).toHaveBeenCalledWith("event", "sign_up", { method: "google" });
  });
  it("does not send or queue events before consent or after rejection", async () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    trackEvent("sign_up");
    await trackEventAndWait("sign_up");
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "rejected");
    trackEvent("exam_generated");
    expect(gtag).not.toHaveBeenCalled();
    expect((window as unknown as { imtihanPendingEvents?: unknown }).imtihanPendingEvents).toBeUndefined();
  });

  it("queues early events and flushes them only after GA configuration", async () => {
    trackEvent("exam_generated", { subject: "physics" });
    const { ANALYTICS_BOOTSTRAP } = await import("@/lib/analytics-bootstrap");
    const target = window as unknown as {
      dataLayer: unknown[][];
      imtihanPendingEvents: unknown[];
    };
    target.dataLayer = [];
    new Function("window", ANALYTICS_BOOTSTRAP)(window);
    expect(Array.from(target.dataLayer[1])).toEqual(["config", "G-7DZ1T3P599"]);
    expect(Array.from(target.dataLayer[2])).toEqual([
      "event",
      "exam_generated",
      { subject: "physics" },
    ]);
    expect(target.imtihanPendingEvents).toHaveLength(0);
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  });
  it("waits for the conversion callback before navigation can continue", async () => {
    vi.useFakeTimers();
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    let finished = false;
    const pending = trackEventAndWait("sign_up", { method: "google" }).then(
      () => {
        finished = true;
      },
    );
    await Promise.resolve();
    expect(finished).toBe(false);
    expect(gtag.mock.calls[0][2]).toMatchObject({
      method: "google",
      transport_type: "beacon",
    });
    gtag.mock.calls[0][2].event_callback();
    await pending;
    expect(finished).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("never blocks navigation indefinitely when analytics is unavailable", async () => {
    vi.useFakeTimers();
    const pending = trackEventAndWait("sign_up");
    await vi.advanceTimersByTimeAsync(1200);
    await pending;
  });

  it("never throws even if gtag itself throws", () => {
    (window as unknown as { gtag: () => void }).gtag = () => {
      throw new Error("blocked by ad blocker");
    };
    expect(() => trackEvent("sign_up")).not.toThrow();
  });
});
