// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOpenAIModel, isOpenAIConfigured, isRetryableError, openaiErrorMessage, withRetryAndFallback } from "@/lib/openai";

const fetchMock = vi.fn();
function successful(text = '{"success":true}') {
  return Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text }] }] });
}
function event(type: string, extra: Record<string, unknown> = {}) {
  return `event: ${type}\r\ndata: ${JSON.stringify({ type, ...extra })}\r\n\r\n`;
}
function streaming(frames: string, chunkSize = 13) {
  const bytes = new TextEncoder().encode(frames);
  return new Response(new ReadableStream({ start(controller) {
    for (let i = 0; i < bytes.length; i += chunkSize) controller.enqueue(bytes.slice(i, i + chunkSize));
    controller.close();
  } }));
}
beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "test-server-secret");
  vi.stubEnv("OPENAI_MODEL", "");
  vi.stubEnv("OPENAI_FALLBACK_MODEL", "");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("OpenAI Responses provider protocol", () => {
  it("sends server auth, instructions, JSON format and output budget without storing source documents", async () => {
    fetchMock.mockResolvedValue(successful());
    const result = await getOpenAIModel().generateContent({
      systemInstruction: "Return JSON only.", contents: [{ role: "user", parts: [{ text: "Make an exam." }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 12000 },
    });
    expect(result.response.text()).toBe('{"success":true}');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(options.headers.Authorization).toBe("Bearer test-server-secret");
    expect(JSON.parse(options.body)).toMatchObject({
      model: "gpt-4.1", store: false, stream: false, instructions: "Return JSON only.", max_output_tokens: 12000,
      text: { format: { type: "json_object" } }, input: [{ role: "user", content: [{ type: "input_text", text: "Make an exam." }] }],
    });
  });

  it.each([
    ["application/pdf", "source.pdf"],
    ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "source.docx"],
  ])("preserves %s document bytes as native file input", async (mimeType, filename) => {
    fetchMock.mockResolvedValue(successful());
    await getOpenAIModel().generateContent(["Analyze this file.", { inlineData: { mimeType, data: `data:${mimeType};base64,YWJj` } }]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.input[0].content[1]).toEqual({ type: "input_file", filename, file_data: `data:${mimeType};base64,YWJj` });
  });

  it("sends image uploads as vision inputs and keeps message roles", async () => {
    fetchMock.mockResolvedValue(successful());
    await getOpenAIModel().generateContent({ contents: [
      { role: "model", parts: [{ text: "Previous answer" }] },
      { role: "user", parts: [{ inlineData: { mimeType: "image/png", data: "YWJj" } }] },
    ] });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).input).toEqual([
      { role: "assistant", content: [{ type: "output_text", text: "Previous answer" }] },
      { role: "user", content: [{ type: "input_image", image_url: "data:image/png;base64,YWJj", detail: "auto" }] },
    ]);
  });

  it("streams UTF-8 deltas across fragmented CRLF SSE frames", async () => {
    fetchMock.mockResolvedValue(streaming(event("response.created") + event("response.output_text.delta", { delta: '{"title":"Étape ' }) + event("response.output_text.delta", { delta: '6"}' }) + event("response.completed"), 1));
    const { stream } = await getOpenAIModel().generateContentStream("Return an exam JSON object.");
    const chunks: string[] = [];
    for await (const chunk of stream) chunks.push(chunk.text());
    expect(chunks).toEqual(['{"title":"Étape ', '6"}']);
  });

  it.each(["response.failed", "response.incomplete", "error", "response.refusal.delta"])("rejects %s instead of reporting a successful generation", async type => {
    fetchMock.mockResolvedValue(streaming(event(type)));
    await expect(getOpenAIModel().generateContentStream("Exam")).rejects.toThrow();
  });

  it("rejects a stream disconnected after partial content", async () => {
    fetchMock.mockResolvedValue(streaming(event("response.output_text.delta", { delta: '{"exercises":[' })));
    const { stream } = await getOpenAIModel().generateContentStream("Exam");
    await expect((async () => { for await (const _ of stream) { /* consume */ } })()).rejects.toThrow("interrupted");
  });

  it.each(["incomplete", "failed"])("rejects non-streaming %s output", async status => {
    fetchMock.mockResolvedValue(Response.json({ status, output: [] }));
    await expect(getOpenAIModel().generateContent("Exam")).rejects.toThrow("did not complete");
  });

  it("falls back when the configured model is unavailable and retries transient HTTP errors", async () => {
    vi.stubEnv("OPENAI_MODEL", "private-model");
    fetchMock.mockResolvedValueOnce(Response.json({ error: { code: "model_not_found" } }, { status: 404 }))
      .mockResolvedValueOnce(Response.json({ error: { code: "server_error" } }, { status: 503 }))
      .mockResolvedValueOnce(successful("fallback"));
    const result = await withRetryAndFallback(model => model.generateContent("Exam"), 2, 0);
    expect(result.response.text()).toBe("fallback");
    expect(fetchMock.mock.calls.map(call => JSON.parse(call[1].body).model)).toEqual(["private-model", "gpt-4.1-mini", "gpt-4.1-mini"]);
  });

  it.each([[401, "invalid_api_key"], [429, "insufficient_quota"], [400, "invalid_request_error"]])("does not retry HTTP %s %s or leak provider messages", async (status, code) => {
    fetchMock.mockResolvedValue(Response.json({ error: { code, message: "Sensitive document content and secret" } }, { status }));
    try { await withRetryAndFallback(model => model.generateContent("Exam"), 2, 0); expect.fail("Should fail"); }
    catch (error) { expect(openaiErrorMessage(error)).not.toContain("Sensitive"); expect(String(error)).not.toContain("Sensitive"); }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails closed for missing keys without any external request", async () => {
    vi.stubEnv("OPENAI_API_KEY", " ");
    expect(isOpenAIConfigured()).toBe(false);
    await expect(withRetryAndFallback(model => model.generateContent("Exam"))).rejects.toMatchObject({ code: "missing_api_key" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isRetryableError({ status: 503, code: "missing_api_key" })).toBe(false);
  });

  it("shares one deadline across retries and aborts instead of exceeding the route budget", async () => {
    fetchMock.mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      const signal = options.signal!;
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    }));
    await expect(withRetryAndFallback(model => model.generateContent("Exam"), 3, 0, 15)).rejects.toMatchObject({ name: "TimeoutError" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reuses the same deadline signal on fallback rather than refreshing the timeout", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: { code: "model_not_found" } }, { status: 404 }))
      .mockResolvedValueOnce(successful());
    await withRetryAndFallback(model => model.generateContent("Exam"), 1, 0, 1000);
    expect(fetchMock.mock.calls[0][1].signal).toBe(fetchMock.mock.calls[1][1].signal);
  });
});
