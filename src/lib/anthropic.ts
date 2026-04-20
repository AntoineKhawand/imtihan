import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (client) return client;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
  }

  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const CLAUDE_MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 8000;
