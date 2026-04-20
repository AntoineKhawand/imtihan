import { GoogleGenerativeAI, type GenerativeModel, type GenerationConfig } from "@google/generative-ai";

let genai: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (genai) return genai;
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not set in environment variables.");
  }
  genai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  return genai;
}

/**
 * Gemini 2.5 Flash emits "thinking" tokens in its stream by default.
 * The current SDK (v0.24.x) cannot parse those chunks and throws
 * "Failed to parse stream". Setting thinkingBudget: 0 suppresses
 * thinking tokens so both streaming and non-streaming work correctly.
 */
const NO_THINKING = { thinkingConfig: { thinkingBudget: 0 } } as unknown as GenerationConfig;

/** Non-streaming model — for /api/analyze */
export function getGeminiModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: NO_THINKING,
  });
}

/** Streaming model — for /api/generate */
export function getGeminiStreamingModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: NO_THINKING,
  });
}

export const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Detect whether a Gemini error is a transient overload / rate-limit.
 * Handles both fetch errors (503, 429) and stream-parse failures.
 */
export function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 503 || e.status === 429) return true;
  if (typeof e.message === "string") {
    const msg = e.message.toLowerCase();
    return (
      msg.includes("503") ||
      msg.includes("429") ||
      msg.includes("overloaded") ||
      msg.includes("high demand") ||
      msg.includes("rate limit") ||
      msg.includes("quota") ||
      msg.includes("failed to parse stream")
    );
  }
  return false;
}

/**
 * User-facing message for a Gemini error.
 */
export function geminiErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Unexpected error. Please try again.";
  const e = err as { status?: number; message?: string };
  if (e.status === 503 || (typeof e.message === "string" && (e.message.includes("503") || e.message.includes("high demand") || e.message.includes("overloaded")))) {
    return "The AI model is currently overloaded. Please wait a few seconds and try again.";
  }
  if (e.status === 429 || (typeof e.message === "string" && (e.message.includes("429") || e.message.includes("rate limit") || e.message.includes("quota")))) {
    return "Rate limit reached. Please wait a moment and try again.";
  }
  return "Unexpected AI error. Please try again.";
}

/** Sleep helper */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry a Gemini call up to `maxAttempts` times on retryable errors,
 * with exponential backoff starting at `baseDelayMs`.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 2000
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableError(err) || attempt === maxAttempts) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s
      console.warn(`[Gemini] Attempt ${attempt} failed (retryable). Retrying in ${delay}ms…`);
      await sleep(delay);
    }
  }
  throw lastErr;
}
