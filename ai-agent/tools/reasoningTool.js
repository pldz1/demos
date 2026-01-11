import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { getOpenAIClient } from "./openaiClient.js";

export class ReasoningTool {
  /**
   * ReasoningTool: uses stronger model + reasoning_effort.
   * @param {{input: string, context?: any, model?: string}}
   */
  async think({ input, context, model = config.models.reasoning }) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const promptPath = path.join(__dirname, "..", "prompts", "reasoningPrompt.txt");
    const reasoningPrompt = await fs.readFile(promptPath, "utf8");

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: reasoningPrompt },
        {
          role: "user",
          content: `user: ${input}\ncontext: ${context ? JSON.stringify(context) : "null"}`,
        },
      ],
      model,
      reasoning_effort: "medium", // low, medium, high
    });

    return {
      mocked: false,
      text: completion.choices?.[0]?.message?.content ?? "",
      choice: completion.choices?.[0],
    };
  }
}

