import { describe, expect, it } from "vitest";
import { ib } from "@/data/curricula/ib";

describe("IB AA HL coverage", () => {
  it("includes every shared SL topic without removing the existing HL chapters", () => {
    const sl = ib.levels.find((level) => level.id === "ib-dp-math-aa-sl")!.chapters.mathematics!;
    const hl = ib.levels.find((level) => level.id === "ib-dp-math-aa-hl")!.chapters.mathematics!;
    const ids = hl.map((chapter) => chapter.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(["ib-aa-hl-algebra", "ib-aa-hl-calculus", "ib-aa-hl-vectors"]));
    for (const chapter of sl) {
      const corresponding = hl.find((item) => item.id === chapter.id.replace("-sl-", "-hl-"));
      expect(corresponding?.objectives).toEqual(expect.arrayContaining(chapter.objectives));
    }
  });
});
