import { describe, it, expect, vi, afterEach } from "vitest";
import { trackEvent } from "@/lib/analytics";

describe("trackEvent", () => {
  afterEach(() => {
    // @ts-expect-error test cleanup of a global test double
    delete window.gtag;
  });

  it("calls window.gtag with the event name and params when gtag is present", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;

    trackEvent("sign_up", { method: "google" });

    expect(gtag).toHaveBeenCalledWith("event", "sign_up", { method: "google" });
  });

  it("does nothing (never throws) when gtag is not loaded", () => {
    expect(() => trackEvent("exam_generated", { subject: "physics" })).not.toThrow();
  });

  it("never throws even if gtag itself throws", () => {
    (window as unknown as { gtag: () => void }).gtag = () => {
      throw new Error("blocked by ad blocker");
    };
    expect(() => trackEvent("sign_up")).not.toThrow();
  });
});
