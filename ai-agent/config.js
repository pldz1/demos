export const config = {
  // OpenAI configuration (required)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: process.env.OPENAI_BASE_URL || "", // e.g. https://xxx.openai.xxx.com
    apiVersion: process.env.OPENAI_API_VERSION || "2025-04-01-preview",
  },
  models: {
    router: process.env.ROUTER_MODEL || "gpt-4.1",
    chat: process.env.CHAT_MODEL || "gpt-4.1",
    reasoning: process.env.REASONING_MODEL || "gpt-5.1",
    image: process.env.IMAGE_MODEL || "gpt-image-1",
  },
};

export function assertOpenAIConfig() {
  const missing = [];
  if (!config.openai.apiKey) missing.push("OPENAI_API_KEY");
  if (!config.openai.baseURL) missing.push("OPENAI_BASE_URL");
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(", ")}. ` +
        `Expected OPENAI_BASE_URL like https://xxx.openai.xxx.com`
    );
  }
}
