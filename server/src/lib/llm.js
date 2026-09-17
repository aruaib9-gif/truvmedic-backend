import Anthropic from "@anthropic-ai/sdk";
import { env, isConfigured } from "./env.js";

const client = isConfigured.anthropic ? new Anthropic({ apiKey: env.anthropic.apiKey }) : null;

const FALLBACK =
  "I'm not able to answer that right now. Please reach our team directly at info@truvmedic.com and we'll get back to you.";

/**
 * Drop-in replacement for Base44's `integrations.Core.InvokeLLM`.
 * Returns `{ response }` so existing callers keep working unchanged.
 */
export async function invokeLLM({ prompt, system, max_tokens = 800, temperature = 0.4 }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("invokeLLM requires a `prompt` string");
  }

  if (!client) {
    console.warn("[llm] ANTHROPIC_API_KEY not set — returning fallback reply");
    return { response: FALLBACK, configured: false };
  }

  const message = await client.messages.create({
    model: env.anthropic.model,
    max_tokens,
    temperature,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  return { response: text || FALLBACK, configured: true };
}
