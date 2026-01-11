import { config } from "../config.js";
import { getOpenAIClient } from "./openaiClient.js";

// WebSearchTool: uses Responses API with web_search_preview.
export class WebSearchTool {
  /**
   * @param {{model?: string, input: string}}
   */
  async search({ model = config.models.chat, input }) {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model,
      tools: [{ type: "web_search_preview" }],
      input,
    });

    return {
      mocked: false,
      query: input,
      output_text: response.output_text,
      response,
      fetchedAt: new Date().toISOString(),
    };
  }
}

