import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (client) return client;

  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
  }

  client = new Anthropic({ apiKey: key });
  return client;
}

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY?.trim();
}

export const CLAUDE_MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 16000;

// Generation uses the same model as analysis — Sonnet produces better LaTeX,
// JSON compliance, and complex exercise quality than Haiku for this prompt size.
export const GENERATE_MODEL = "claude-sonnet-4-6";
export const GENERATE_MAX_TOKENS = 16000;
