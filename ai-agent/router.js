import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { getOpenAIClient } from "./tools/openaiClient.js";

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeRoute(route) {
  const allowed = new Set([
    "chat",
    "web_search",
    "reasoning",
    "image_generate",
    "image_understand",
  ]);

  const intents =
    Array.isArray(route?.intents) && route.intents.length
      ? route.intents
      : route?.intent
      ? [route.intent]
      : [];

  const cleaned = intents
    .map((x) => String(x || "").trim())
    .filter((x) => allowed.has(x));

  return cleaned.length ? cleaned : ["chat"];
}

/**
 * Router: only does intent classification.
 * Uses OpenAI via official SDK and returns STRICT JSON.
 * @param {{ input: string, hasImage?: boolean }}
 * @returns {Promise<{intents: string[], raw: any, model: string, mocked: boolean}>}
 */
export async function route({ input, hasImage = false }) {
  // If input includes an image, route to image_understand.
  if (hasImage) {
    return {
      intents: ["image_understand"],
      raw: { intent: "image_understand" },
      model: "heuristic",
      mocked: false,
    };
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const promptPath = path.join(__dirname, "prompts", "routerPrompt.txt");
  const routerPrompt = await fs.readFile(promptPath, "utf8");

  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: config.models.router,
    temperature: 0,
    messages: [
      { role: "system", content: routerPrompt },
      { role: "user", content: input },
    ],
    response_format: { type: "json_object" },
  });

  const text = completion.choices?.[0]?.message?.content ?? "{}";
  const parsed = safeJsonParse(text) || {};
  const intents = normalizeRoute(parsed);

  return {
    intents,
    raw: parsed,
    model: config.models.router,
    mocked: false,
  };
}
