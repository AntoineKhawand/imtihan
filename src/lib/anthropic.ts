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

export const CLAUDE_MODEL = "claude-3-5-sonnet-latest";
export const MAX_TOKENS = 8192;
