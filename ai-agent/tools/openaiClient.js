import OpenAI from "openai";
import { assertOpenAIConfig, config } from "../config.js";

export function getOpenAIClient() {
  assertOpenAIConfig();

  return new OpenAI({
    apiKey: config.openai.apiKey,
    baseURL: `${config.openai.baseURL}/openai/v1/`,
  });
}
