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

// gemini-2.5-flash is the stable GA model as of 2025+.
// gemini-1.5-flash-latest is the fallback — powerful and widely available.
export const GEMINI_MODEL_PRIMARY  = "gemini-2.5-flash";
export const GEMINI_MODEL_FALLBACK = "gemini-1.5-flash-latest";
/** @deprecated use GEMINI_MODEL_PRIMARY */
export const GEMINI_MODEL = GEMINI_MODEL_PRIMARY;

function getModel(modelId: string): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: modelId,
    generationConfig: NO_THINKING,
  });
}

/** Non-streaming model — for /api/analyze */
export function getGeminiModel(modelId = GEMINI_MODEL_PRIMARY): GenerativeModel {
  return getModel(modelId);
}

/** Streaming model — for /api/generate */
export function getGeminiStreamingModel(modelId = GEMINI_MODEL_PRIMARY): GenerativeModel {
  return getModel(modelId);
}

/**
 * Detect whether a Gemini error is a transient overload / rate-limit.
 * These errors are worth retrying on the SAME model.
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
 * Detect whether an error means "try the next model" rather than bailing.
 * 404 (model not found / deprecated) and 400 (model-level bad request)
 * should fall through to the fallback model, not abort.
 */
function isFallbackError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  if (e.status === 404) return true;
  // 400 can mean the primary model rejected a parameter it doesn't support
  if (e.status === 400) return true;
  if (typeof e.message === "string") {
    const msg = e.message.toLowerCase();
    return msg.includes("404") || msg.includes("not found") || msg.includes("not supported");
  }
  return false;
}

/**
 * User-facing message for a Gemini error.
 * In development, includes the raw error detail so problems are diagnosable.
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
  if (e.status === 403 || e.status === 401) {
    return "API key error. Please check your GOOGLE_AI_API_KEY in .env.local.";
  }

  // Surface full error detail in development so the problem can be diagnosed.
  const statusPart = e.status ? ` [HTTP ${e.status}]` : "";
  const msgPart = typeof e.message === "string" ? ` — ${e.message.slice(0, 300)}` : "";
  const detail = statusPart + msgPart;
  return `Unexpected AI error. Please try again.${process.env.NODE_ENV !== "production" ? detail : ""}`;
}

/** Sleep helper */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry a Gemini call up to `maxAttempts` times on transient errors,
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
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), 8000);
      console.warn(`[Gemini] Attempt ${attempt} failed (retryable). Retrying in ${delay}ms…`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

/**
 * Like withRetry, but automatically falls back to GEMINI_MODEL_FALLBACK when:
 * - The primary model is overloaded after all retry attempts, OR
 * - The primary model returns 404/400 (model not found / bad param for that model)
 */
export async function withRetryAndFallback<T>(
  buildFn: (model: GenerativeModel) => Promise<T>,
  attemptsPerModel = 3,
  baseDelayMs = 2000
): Promise<T> {
  const models = [GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK];
  let lastErr: unknown;

  for (const modelId of models) {
    const model = getModel(modelId);
    if (modelId !== GEMINI_MODEL_PRIMARY) {
      console.warn(`[Gemini] Switching to fallback model: ${modelId}`);
    }

    for (let attempt = 1; attempt <= attemptsPerModel; attempt++) {
      try {
        return await buildFn(model);
      } catch (err) {
        lastErr = err;

        // 401/403 = auth error — bail immediately, fallback won't help
        const e = err as { status?: number };
        if (e.status === 401 || e.status === 403) throw err;

        // 404/400 on this model — skip remaining attempts, try next model
        if (isFallbackError(err)) {
          console.warn(`[Gemini/${modelId}] Model error (${e.status}), trying next model…`);
          break;
        }

        // Non-retryable and not a fallback candidate — bail
        if (!isRetryableError(err)) throw err;

        if (attempt < attemptsPerModel) {
          const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), 8000);
          console.warn(`[Gemini/${modelId}] Attempt ${attempt} failed. Retrying in ${delay}ms…`);
          await sleep(delay);
        }
      }
    }
  }
  throw lastErr;
}
