import OpenAI from "openai";

// AI provider. All three speak the OpenAI API, so switching is config-only.
//   - DeepSeek     (default): cheap, strong responses
//   - OpenRouter   : one key, any model, and account/key spend caps set on
//                    their dashboard (openrouter.ai/settings/keys)
//   - OpenAI       : fallback
// Provider is chosen by AI_PROVIDER, else by whichever key is present.
type Provider = "deepseek" | "openrouter" | "openai";

function resolveProvider(): Provider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "deepseek" || explicit === "openrouter" || explicit === "openai") {
    return explicit;
  }
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  return "openai";
}

const PROVIDERS: Record<
  Provider,
  { baseURL?: string; apiKey?: string; defaultModel: string }
> = {
  deepseek: {
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
    defaultModel: "deepseek-chat",
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: "deepseek/deepseek-chat",
  },
  openai: {
    baseURL: undefined,
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: "gpt-4.1-mini",
  },
};

const provider = resolveProvider();
const config = PROVIDERS[provider];

export const AI_PROVIDER = provider;
export const AI_MODEL = process.env.AI_MODEL ?? config.defaultModel;

// --- Cost safeguards --------------------------------------------------------
// Hard caps on every AI call so a single request can never run away on cost.
// Account-level spend limits are additionally set on the provider dashboard
// (OpenRouter supports per-key credit limits).
export const AI_MAX_OUTPUT_TOKENS = Number(
  process.env.AI_MAX_OUTPUT_TOKENS ?? 800
);
export const AI_MAX_INPUT_CHARS = Number(
  process.env.AI_MAX_INPUT_CHARS ?? 2000
);
export const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? 0.7);

// OpenRouter recommends identifying the app via these headers.
const defaultHeaders =
  provider === "openrouter"
    ? {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Finance OS",
      }
    : undefined;

export const openai = new OpenAI({
  apiKey: config.apiKey,
  ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  ...(defaultHeaders ? { defaultHeaders } : {}),
});
