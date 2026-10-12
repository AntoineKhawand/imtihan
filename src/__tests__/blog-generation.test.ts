import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { BLOG_KEYWORD_BRIEFS, buildBlogPrompt, selectBlogBrief } from "@/lib/prompts/blog";
import { GeneratedBlogSchema, blogQualityIssues } from "@/lib/blogQuality";

const mocks = vi.hoisted(() => ({ add: vi.fn(), generate: vi.fn(), get: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({
  adminAuth: { verifyIdToken: vi.fn() },
  adminDb: { collection: () => ({ add: mocks.add, orderBy: () => ({ limit: () => ({ get: mocks.get }) }) }) },
}));
vi.mock("@/lib/admin", () => ({ isAdmin: vi.fn() }));
vi.mock("@/lib/anthropic", () => ({ isAnthropicConfigured: () => true, getAnthropicClient: () => ({ messages: { create: mocks.generate } }), CLAUDE_MODEL: "mock", MAX_TOKENS: 16000 }));
vi.mock("@/lib/gemini", () => ({ withRetryAndFallback: vi.fn(), geminiErrorMessage: () => "Mock failure" }));
import { GET } from "@/app/api/cron/blog-auto-publish/route";

function article() {
  const brief = selectBlogBrief([], Math.floor(Date.now() / 86400000));
  return {
    title: `${brief.keyword}: a practical teacher guide`,
    description: `Use ${brief.keyword} to prepare meaningful classroom assessments with worked examples, clear marking and a teacher review checklist.`,
    category: "Resources" as const,
    content: `${brief.keyword} helps teachers prepare assessments.\n\n## Worked example\n${"Teacher reviews evidence and checks the reasoning before using each question. ".repeat(65)}\n## Steps\n1. Choose chapters.\n2. Review marks.\n## Review checklist\n[Learn more](${brief.link}) and [create an exam](/create).\n## Frequently Asked Questions\n**Q: Who reviews the exam?**\nThe teacher reviews it.\n\n**Q: Can I edit the questions?**\nYes, before exporting.\n\n**Q: Can I export answers?**\nYes, review the corrigé first.`,
  };
}

describe("blog editorial checks", () => {
  it("accepts a structurally complete article and rejects thin content", () => {
    const brief = selectBlogBrief([], Math.floor(Date.now() / 86400000));
    expect(blogQualityIssues(article(), brief.keyword, brief.link, [])).toEqual([]);
    expect(blogQualityIssues({ ...article(), content: "A quick generic promotion." }, brief.keyword, brief.link, []).length).toBeGreaterThan(0);
  });
  it("rejects a recent title even when casing and punctuation change", () => {
    const post = article();
    expect(blogQualityIssues(post, "irrelevant", "/create", [post.title.toUpperCase() + "!"])).toContain("Title is too similar to a recent article.");
  });
  it("rejects missing keyword placement, links and unanswered FAQs", () => {
    const post = article();
    post.content = post.content.replace(/\*\*Q:/g, "Question:").replace(/\]\([^)]*\)/g, "]");
    const issues = blogQualityIssues(post, "missing keyword", "/missing", []);
    expect(issues).toContain("Primary keyword missing from title.");
    expect(issues).toContain("Article needs three complete FAQ questions and answers.");
    expect(issues).toContain("Relevant product and create links required.");
  });
  it("rejects invalid model data before publication", () => {
    expect(GeneratedBlogSchema.safeParse({ ...article(), category: "Fake category" }).success).toBe(false);
    expect(GeneratedBlogSchema.safeParse({ ...article(), content: 42 }).success).toBe(false);
  });
  it("rotates clusters and prefers less-used keywords", () => {
    expect(new Set(BLOG_KEYWORD_BRIEFS.map((_, day) => selectBlogBrief([], day).keyword)).size).toBe(BLOG_KEYWORD_BRIEFS.length);
    expect(selectBlogBrief([{ title: "Recent", primaryKeyword: BLOG_KEYWORD_BRIEFS[0].keyword }], 0).keyword).not.toBe(BLOG_KEYWORD_BRIEFS[0].keyword);
    expect(buildBlogPrompt(BLOG_KEYWORD_BRIEFS[0], [{ title: "Existing guide" }])).toContain("Existing guide");
  });
});

describe("blog publication boundary (mock AI and Firestore only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", "test-secret");
    mocks.get.mockResolvedValue({ docs: [] });
    mocks.add.mockResolvedValue({ id: "test-post" });
  });
  const request = () => new NextRequest("http://localhost/api/cron/blog-auto-publish", { headers: { authorization: "Bearer test-secret" } });
  it("publishes validated content with editorial metadata and calculated read time", async () => {
    mocks.generate.mockResolvedValue({ content: [{ type: "text", text: JSON.stringify(article()) }] });
    expect((await GET(request())).status).toBe(200);
    expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ editorialVersion: 1, primaryKeyword: expect.any(String), readTime: expect.stringMatching(/min read$/), published: true }));
  });
  it("never writes a thin article", async () => {
    mocks.generate.mockResolvedValue({ content: [{ type: "text", text: JSON.stringify({ ...article(), content: "Thin content" }) }] });
    expect((await GET(request())).status).toBe(422);
    expect(mocks.add).not.toHaveBeenCalled();
  });
  it("never writes malformed AI fields or calls AI for an unauthenticated request", async () => {
    mocks.generate.mockResolvedValue({ content: [{ type: "text", text: '{"title":42}' }] });
    expect((await GET(request())).status).toBe(500);
    expect(mocks.add).not.toHaveBeenCalled();
    mocks.generate.mockClear();
    expect((await GET(new NextRequest("http://localhost/api/cron/blog-auto-publish"))).status).toBe(401);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
});
