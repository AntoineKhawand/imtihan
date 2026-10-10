import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  batch: vi.fn(),
  set: vi.fn(),
  commit: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
}));
vi.mock("@/lib/firebase-admin", () => ({
  adminDb: { batch: mocks.batch, collection: mocks.collection },
}));
vi.mock("firebase-admin", () => ({
  firestore: {
    FieldValue: {
      increment: (n: number) => ({ increment: n }),
      serverTimestamp: () => "server-time",
    },
  },
}));
import { recordChapterCoverage } from "@/lib/chapter-coverage-recording";
const context = {
  curriculumId: "bac-libanais" as const,
  levelId: "eb9",
  subject: "mathematics" as const,
  chapterIds: ["eb9-math-algebra", "eb9-math-statistics"],
};
describe("coverage persistence", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.batch.mockReturnValue({ set: mocks.set, commit: mocks.commit });
    mocks.collection.mockReturnValue({ doc: mocks.doc });
    mocks.doc.mockImplementation((id) => id);
    mocks.commit.mockResolvedValue(undefined);
  });
  it("writes denominator increments even for covered chapters and awaits commit", async () => {
    let resolve!: () => void;
    mocks.commit.mockReturnValue(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    let finished = false;
    const pending = recordChapterCoverage(context, [
      { chapterIds: ["eb9-math-algebra"] },
    ]).then(() => {
      finished = true;
    });
    await Promise.resolve();
    expect(finished).toBe(false);
    expect(mocks.collection).toHaveBeenCalledWith("chapterCoverageDaily");
    expect(mocks.doc.mock.calls[0][0]).toMatch(
      /^\d{4}-\d{2}-\d{2}__[a-f0-9]{64}$/,
    );
    expect(mocks.set.mock.calls[0][1]).toMatchObject({
      levelId: "eb9",
      selectionCount: { increment: 1 },
      missCount: { increment: 0 },
    });
    expect(mocks.set.mock.calls[0][1]).not.toHaveProperty("lastMissedAt");
    expect(mocks.set.mock.calls[1][1]).toMatchObject({
      missCount: { increment: 1 },
      lastMissedAt: "server-time",
    });
    resolve();
    await pending;
    expect(finished).toBe(true);
  });
  it("propagates failure so the caller can log a recording gap", async () => {
    mocks.commit.mockRejectedValue(new Error("failed"));
    await expect(recordChapterCoverage(context, [])).rejects.toThrow("failed");
  });
});
