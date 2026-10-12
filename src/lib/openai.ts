import { z } from "zod";

// Server-side Responses API adapter. Keep the application's existing text/parts
// contract so uploads, progressive exam parsing and route validation stay intact.
export const OPENAI_MODEL_PRIMARY = "gpt-4.1";
export const OPENAI_MODEL_FALLBACK = "gpt-4.1-mini";
export type OpenAIPart = { text: string } | { inlineData: { mimeType: string; data: string } };
type Content = { role: "user" | "model" | "assistant"; parts: OpenAIPart[] };
export type OpenAIRequest = string | (string | OpenAIPart)[] | {
  contents: Content[];
  systemInstruction?: string;
  generationConfig?: { responseMimeType?: string; maxOutputTokens?: number; temperature?: number };
};
export type OpenAIText = { text(): string };

export class OpenAIProviderError extends Error {
  constructor(message: string, public readonly status?: number, public readonly code?: string) {
    super(message);
    this.name = "OpenAIProviderError";
  }
}

const ErrorSchema = z.object({ error: z.object({ message: z.string().optional(), code: z.string().nullable().optional() }).optional() });
const TextSchema = z.object({ type: z.string(), text: z.string().optional() });
const ResponseSchema = z.object({
  status: z.string(),
  output: z.array(z.object({ type: z.string(), content: z.array(TextSchema).optional() })),
});
const EventSchema = z.object({
  type: z.string(), delta: z.string().optional(),
  response: z.object({ status: z.string().optional() }).passthrough().optional(),
  error: z.object({ message: z.string().optional(), code: z.string().nullable().optional() }).optional(),
  message: z.string().optional(), code: z.string().nullable().optional(),
});

function convertPart(part: OpenAIPart, assistant: boolean): Record<string, unknown> {
  if ("text" in part) return { type: assistant ? "output_text" : "input_text", text: part.text };
  if (assistant) throw new OpenAIProviderError("Attachments must be in user messages.");
  const { mimeType, data } = part.inlineData;
  const cleanData = data.replace(/^data:[^;]+;base64,/, "");
  const dataUrl = `data:${mimeType};base64,${cleanData}`;
  if (mimeType.startsWith("image/")) return { type: "input_image", image_url: dataUrl, detail: "auto" };
  const extensions: Record<string, string> = {
    "application/pdf": "pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt", "text/markdown": "md", "application/rtf": "rtf", "application/msword": "doc",
  };
  const extension = extensions[mimeType];
  if (!extension) throw new OpenAIProviderError("Unsupported source document format.", 400);
  return { type: "input_file", filename: `source.${extension}`, file_data: dataUrl };
}

function requestBody(request: OpenAIRequest, model: string, stream: boolean) {
  const normalized = typeof request === "string"
    ? { contents: [{ role: "user" as const, parts: [{ text: request }] }] }
    : Array.isArray(request)
      ? { contents: [{ role: "user" as const, parts: request.map(p => typeof p === "string" ? { text: p } : p) }] }
      : request;
  const config = normalized.generationConfig;
  return {
    model, store: false, stream,
    ...(normalized.systemInstruction ? { instructions: normalized.systemInstruction } : {}),
    input: normalized.contents.map(content => ({
      role: content.role === "model" ? "assistant" : content.role,
      content: content.parts.map(part => convertPart(part, content.role !== "user")),
    })),
    max_output_tokens: config?.maxOutputTokens ?? 16000,
    ...(config?.temperature !== undefined ? { temperature: config.temperature } : {}),
    ...(config?.responseMimeType === "application/json" ? { text: { format: { type: "json_object" } } } : {}),
  };
}

async function requestResponse(request: OpenAIRequest, model: string, stream: boolean, signal: AbortSignal): Promise<Response> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new OpenAIProviderError("OpenAI is not configured.", 503, "missing_api_key");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(requestBody(request, model, stream)),
    signal, cache: "no-store",
  });
  if (!response.ok) {
    const parsed = ErrorSchema.safeParse(await response.json().catch(() => ({})));
    // Do not forward raw provider errors (may contain source content or IDs).
    throw new OpenAIProviderError("OpenAI request failed.", response.status, parsed.success ? parsed.data.error?.code ?? undefined : undefined);
  }
  return response;
}

async function* readTextStream(response: Response): AsyncGenerator<OpenAIText> {
  if (!response.body) throw new OpenAIProviderError("OpenAI returned no stream.", 502);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let separator: RegExpExecArray | null;
      while ((separator = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, separator.index);
        buffer = buffer.slice(separator.index + separator[0].length);
        const data = frame.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
        if (!data || data === "[DONE]") continue;
        const event = EventSchema.parse(JSON.parse(data));
        if (event.type === "response.output_text.delta" && event.delta) {
          const text = event.delta;
          yield { text: () => text };
        } else if (event.type === "response.completed") {
          completed = true;
        } else if (["error", "response.failed", "response.incomplete"].includes(event.type)) {
          throw new OpenAIProviderError("OpenAI generation did not complete.", 502, event.code ?? event.error?.code ?? undefined);
        } else if (event.type === "response.refusal.delta") {
          throw new OpenAIProviderError("OpenAI could not generate this content.", 422);
        }
      }
      if (done) break;
    }
    if (!completed) throw new OpenAIProviderError("OpenAI stream was interrupted.", 502);
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export function getOpenAIModel(modelId = process.env.OPENAI_MODEL?.trim() || OPENAI_MODEL_PRIMARY, signal?: AbortSignal) {
  return {
    async generateContent(request: OpenAIRequest): Promise<{ response: OpenAIText }> {
      const response = await requestResponse(request, modelId, false, signal ?? AbortSignal.timeout(45000));
      const parsed = ResponseSchema.parse(await response.json());
      if (parsed.status !== "completed") throw new OpenAIProviderError("OpenAI generation did not complete.", 502);
      const text = parsed.output.flatMap(item => item.content ?? []).filter(item => item.type === "output_text").map(item => item.text ?? "").join("");
      if (!text.trim()) throw new OpenAIProviderError("OpenAI returned no text.", 502);
      return { response: { text: () => text } };
    },
    async generateContentStream(request: OpenAIRequest): Promise<{ stream: AsyncIterable<OpenAIText> }> {
      const response = await requestResponse(request, modelId, true, signal ?? AbortSignal.timeout(45000));
      const iterator = readTextStream(response);
      // Prime the iterator before returning: an immediate provider failure can
      // be retried/fall back without emitting duplicate partial exam content.
      const first = await iterator.next();
      return { stream: (async function* () {
        try {
          if (!first.done) yield first.value;
          yield* iterator;
        } finally { await iterator.return(undefined); }
      })() };
    },
  };
}

export const getOpenAIStreamingModel = getOpenAIModel;

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) return true; // fetch network failure
  if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) return true;
  if (!error || typeof error !== "object") return false;
  const { status, code } = error as { status?: number; code?: string };
  if (["missing_api_key", "insufficient_quota"].includes(code ?? "")) return false;
  return status === 408 || status === 409 || status === 429 || (status !== undefined && status >= 500);
}

export function openaiErrorMessage(error: unknown): string {
  const { status, code } = error && typeof error === "object" ? error as { status?: number; code?: string } : {};
  if (code === "missing_api_key" || status === 401 || status === 403) return "AI service configuration needs attention. Please contact support.";
  if (code === "insufficient_quota") return "AI service is temporarily unavailable. Please try again later.";
  if (status === 429) return "AI service is busy. Please wait a moment and try again.";
  return "AI generation failed. Please try again.";
}

export async function withRetryAndFallback<T>(
  buildFn: (model: ReturnType<typeof getOpenAIModel>) => Promise<T>, attemptsPerModel = 2, baseDelayMs = 1000, budgetMs = 45000,
): Promise<T> {
  // One deadline for the entire fallback chain, not a fresh timeout per
  // attempt. Streaming keeps this signal through completion of the body.
  const deadline = Date.now() + Math.max(1, budgetMs);
  const signal = AbortSignal.timeout(Math.max(1, Math.floor(budgetMs)));
  const models = [...new Set([process.env.OPENAI_MODEL?.trim() || OPENAI_MODEL_PRIMARY, process.env.OPENAI_FALLBACK_MODEL?.trim() || OPENAI_MODEL_FALLBACK])];
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 1; attempt <= attemptsPerModel; attempt++) {
      try {
        signal.throwIfAborted();
        return await buildFn(getOpenAIModel(model, signal));
      }
      catch (error) {
        lastError = error;
        if (signal.aborted || Date.now() >= deadline) throw error;
        const { status, code } = error && typeof error === "object" ? error as { status?: number; code?: string } : {};
        if (status === 401 || status === 403 || code === "missing_api_key" || code === "insufficient_quota") throw error;
        if (status === 404) break;
        if (!isRetryableError(error)) throw error;
        if (attempt < attemptsPerModel) await new Promise(resolve => setTimeout(resolve, Math.max(0, Math.min(baseDelayMs * 2 ** (attempt - 1), 8000, deadline - Date.now()))));
      }
    }
  }
  throw lastError;
}
