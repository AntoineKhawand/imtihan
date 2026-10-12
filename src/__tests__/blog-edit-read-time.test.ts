import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  verify: vi.fn(),
  admin: vi.fn(),
}));
vi.mock("@/lib/firebase-admin", () => ({
  verifyIdToken: mocks.verify,
  adminDb: {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: true }),
        update: mocks.update,
      }),
    }),
  },
}));
vi.mock("@/lib/admin", () => ({ isAdmin: mocks.admin }));
import { PATCH } from "@/app/api/admin/blog/[id]/route";

describe("editing blog content (mocked database)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verify.mockResolvedValue("admin");
    mocks.admin.mockResolvedValue(true);
  });
  const request = (body: object) =>
    new NextRequest("http://localhost/api/admin/blog/test", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  const context = { params: Promise.resolve({ id: "test" }) };
  it("recalculates read time from edited content and preserves publication identity", async () => {
    expect(
      (await PATCH(request({ content: "word ".repeat(500) }), context)).status,
    ).toBe(200);
    const update = mocks.update.mock.calls[0][0];
    expect(update.readTime).toBe("3 min read");
    expect(update.updatedAt).toBeInstanceOf(Date);
    for (const key of ["slug", "createdAt", "published", "author"])
      expect(update).not.toHaveProperty(key);
  });
  it("does not change read time when only metadata is edited", async () => {
    expect(
      (await PATCH(request({ title: "Improved title" }), context)).status,
    ).toBe(200);
    expect(mocks.update.mock.calls[0][0]).not.toHaveProperty("readTime");
  });
  it("rejects an unauthenticated write", async () => {
    mocks.verify.mockResolvedValue(null);
    expect(
      (await PATCH(request({ content: "Updated draft" }), context)).status,
    ).toBe(401);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
