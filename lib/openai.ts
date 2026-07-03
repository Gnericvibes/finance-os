import OpenAI from "openai";

// AI provider. DeepSeek is OpenAI-API-compatible, cheaper, and gives strong
// responses - so it is the default. The same client also works with OpenAI:
// set OPENAI_API_KEY (and no DEEPSEEK_API_KEY) to use OpenAI instead, or set
// AI_BASE_URL / AI_MODEL to point at any other OpenAI-compatible provider.
const useDeepSeek = Boolean(process.env.DEEPSEEK_API_KEY);

const baseURL =
  process.env.AI_BASE_URL ??
  (useDeepSeek ? "https://api.deepseek.com" : undefined);

const apiKey = process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY;

// The chat model. Defaults to deepseek-chat when using DeepSeek, otherwise
// an OpenAI model. Override with AI_MODEL for any provider.
export const AI_MODEL =
  process.env.AI_MODEL ?? (useDeepSeek ? "deepseek-chat" : "gpt-4.1-mini");

export const openai = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});
