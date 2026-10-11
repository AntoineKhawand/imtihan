import { describe, expect, it } from "vitest";
import { guideSpot } from "@/lib/guide-geometry";
describe("guide highlight clipping", () => {
  it("keeps a tall section above the mobile sheet and inside the viewport", () => {
    expect(guideSpot({top: -100, left: -10, right: 420, bottom: 900}, 375, 410))
      .toEqual({top: 4, left: 4, width: 367, height: 402});
  });
  it("preserves padding around a visible button", () => {
    expect(guideSpot({top: 80, left: 20, right: 150, bottom: 124}, 375, 410))
      .toEqual({top: 74, left: 14, width: 142, height: 56});
  });
  it("hides a target outside the visible area", () => {
    expect(guideSpot({top: 600, left: 20, right: 150, bottom: 644}, 375, 410)).toBeNull();
  });
});
