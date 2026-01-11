import { config } from "../config.js";
import { getOpenAIClient } from "./openaiClient.js";

export class ChatTool {
  /**
   * ChatTool: fast, low-cost conversation.
   * No routing/decision logic here.
   * @param {{input: string, context?: any, model?: string}}
   */
  async reply({ input, context, model = config.models.chat }) {
    const client = getOpenAIClient();

    const messages = [{ role: "user", content: input }];
    if (context) {
      messages.unshift({
        role: "system",
        content: `Context (web search results, if any):\n${JSON.stringify(context)}`,
      });
    }

    const completion = await client.chat.completions.create({
      messages,
      model,
    });

    return {
      mocked: false,
      text: completion.choices?.[0]?.message?.content ?? "",
      choice: completion.choices?.[0],
    };
  }
}

