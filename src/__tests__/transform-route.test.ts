// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Exercise } from "@/types/exam";
import { parseExerciseTransform } from "@/lib/exerciseTransform";
const mocks = vi.hoisted(() => ({ session: vi.fn(), generate: vi.fn(), claude: vi.fn(), configured: vi.fn() }));
vi.mock("@/lib/firebase-admin", () => ({ verifySession: mocks.session }));
vi.mock("@/lib/openai", () => ({ withRetryAndFallback: (fn: (model: unknown) => unknown) => fn({ generateContent: mocks.generate }) }));
vi.mock("@/lib/anthropic", () => ({ isAnthropicConfigured: mocks.configured, getAnthropicClient: () => ({ messages: { create: mocks.claude } }), GENERATE_MODEL: "fixture" }));
import { POST } from "@/app/api/generate/transform/route";
const exercise: Exercise = { id: "unchanged-id", number: 1, type: "proof", difficulty: "hard", points: 5, estimatedMinutes: 10, statement: "Study the sequence.", solution: { finalAnswer: "infinity", methodology: "original reasoning" }, chapterIds: ["sequences"] };
function request(body: unknown) { return new NextRequest("https://example.test/api/generate/transform", { method: "POST", body: JSON.stringify(body) }); }
function body(type = "table") { return { exercise, type, language: "french" }; }
const table = "Study the sequence.\n| n | u |\n| --- | --- |\n| 0 | 1 |";
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue("teacher"); mocks.configured.mockReturnValue(false); });
describe("exercise transformations preserve academic data", () => {
  it("accepts complete fenced JSON while ignoring attempted answer and marks replacements", () => {
    const parsed = parseExerciseTransform('```json\n'+JSON.stringify({ statement: table, points: 100, solution: { finalAnswer: "wrong" }, id: "wrong" })+'\n```', exercise, "table");
    expect(parsed).toEqual({ ...exercise, statement: table });
  });
  it("rejects truncated JSON and missing requested output", () => {
    expect(() => parseExerciseTransform('{"statement":"partial', exercise, "table")).toThrow();
    for (const type of ["table", "image", "visual", "insertPlot", "plot"] as const) {
      expect(() => parseExerciseTransform(JSON.stringify({ statement: "No output" }), exercise, type)).toThrow();
    }
  });
  it("allows an explicit blank grid without changing the solution", () => {
    expect(parseExerciseTransform(JSON.stringify({ statement: "Draw on the axes.", mathPlots: [""] }), exercise, "plot")).toEqual({ ...exercise, statement: "Draw on the axes.", mathPlots: [""] });
  });
});
describe("transform route uses authenticated, validated providers", () => {
  it("rejects unauthenticated requests before calling providers", async () => {
    mocks.session.mockResolvedValue(null);
    expect((await POST(request(body()))).status).toBe(401); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("rejects malformed requests", async () => {
    expect((await POST(request({ ...body(), type: "unknown" }))).status).toBe(400); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("applies an OpenAI edit while preserving marks and answers", async () => {
    mocks.generate.mockResolvedValue({ response: { text: () => JSON.stringify({ statement: table, points: 0 }) } });
    const response = await POST(request(body()));
    expect(response.status).toBe(200); expect((await response.json()).exercise).toEqual({ ...exercise, statement: table });
    expect(mocks.claude).not.toHaveBeenCalled();
  });
  it.each([
    ["table", { statement: table }],
    ["visual", { statement: "Study the sequence.\n```mermaid\nflowchart TD\nA[Start] --> B[Increasing]\n```" }],
    ["image", { statement: "Study the sequence.\n[IMAGE: A sequence illustration]" }],
    ["plot", { statement: "Study the sequence.", mathPlots: ["x^2"] }],
    ["insertPlot", { statement: "Study the sequence.\n[PLOT: x^2]" }],
  ])("applies %s output through the route without replacing academic fields", async (type, patch) => {
    mocks.generate.mockResolvedValue({ response: { text: () => JSON.stringify({ ...patch, id: "changed", points: 99, solution: { finalAnswer: "wrong", methodology: "wrong" }, chapterIds: ["wrong"] }) } });
    const response = await POST(request(body(type)));
    expect(response.status).toBe(200);
    expect((await response.json()).exercise).toEqual({ ...exercise, ...patch });
    expect(mocks.claude).not.toHaveBeenCalled();
  });
  it("falls back on invalid provider output and rejects truncated fallback output", async () => {
    mocks.generate.mockResolvedValue({ response: { text: () => '{"statement":"truncated' } });
    mocks.configured.mockReturnValue(true);
    mocks.claude.mockResolvedValue({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ statement: table }) }] });
    expect((await POST(request(body()))).status).toBe(200);
    mocks.claude.mockResolvedValue({ stop_reason: "max_tokens", content: [] });
    const failed = await POST(request(body())); expect(failed.status).toBe(502); expect((await failed.json()).error).toContain("kept unchanged");
  });
});
