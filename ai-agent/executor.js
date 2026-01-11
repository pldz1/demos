import { ChatTool } from "./tools/chatTool.js";
import { WebSearchTool } from "./tools/webSearchTool.js";
import { ReasoningTool } from "./tools/reasoningTool.js";
import { ImageTool } from "./tools/imageTool.js";

/**
 * Executor: controls orchestration; tools do no decisions.
 * Supports simple planning via multi-intent arrays.
 */
export class Executor {
  constructor({ tools } = {}) {
    this.tools = tools || {
      chat: new ChatTool(),
      web_search: new WebSearchTool(),
      reasoning: new ReasoningTool(),
      image: new ImageTool(),
    };
  }

  /**
   * @param {{ input: string, intents: string[], image?: {data?: string, url?: string, mimeType?: string} }}
   */
  async run({ input, intents, image }) {
    const plan = this.#normalizePlan(intents, { hasImage: Boolean(image) });

    let context = {
      input,
      image,
      web: null,
      outputs: [],
      plan,
    };

    for (const step of plan) {
      if (step === "web_search") {
        const web = await this.tools.web_search.search({ input });
        context.web = web;
        context.outputs.push({ step, web });
        continue;
      }

      if (step === "reasoning") {
        const answer = await this.tools.reasoning.think({
          input,
          context: context.web,
        });
        context.outputs.push({ step, answer });
        continue;
      }

      if (step === "chat") {
        const answer = await this.tools.chat.reply({ input, context: context.web });
        context.outputs.push({ step, answer });
        continue;
      }

      if (step === "image_generate") {
        const result = await this.tools.image.generate({ prompt: input });
        context.outputs.push({ step, result });
        continue;
      }

      if (step === "image_understand") {
        const result = await this.tools.image.understand({
          prompt: input,
          image,
        });
        context.outputs.push({ step, result });
        continue;
      }

      context.outputs.push({ step, error: `Unknown step: ${step}` });
    }

    return context;
  }

  #normalizePlan(intents, { hasImage }) {
    const unique = [];
    for (const intent of intents || []) {
      if (!unique.includes(intent)) unique.push(intent);
    }

    // Default planning rules:
    // - If web_search is requested, follow with a summarizer.
    //   Default summarizer is chat (fast/cheap).
    //   Router can explicitly choose reasoning by returning intents including "reasoning".
    // - If image is present, prefer image_understand.
    if (hasImage && !unique.includes("image_understand")) unique.unshift("image_understand");

    if (unique.includes("web_search")) {
      // If router didn't explicitly choose summarizer, default to chat.
      if (!unique.includes("reasoning") && !unique.includes("chat")) {
        unique.push("chat");
      }
      // Ensure search happens before summarization.
      unique.sort((a, b) => {
        const order = ["web_search", "reasoning", "chat"];
        const ai = order.includes(a) ? order.indexOf(a) : 99;
        const bi = order.includes(b) ? order.indexOf(b) : 99;
        return ai - bi;
      });
    }

    if (!unique.length) unique.push("chat");
    return unique;
  }
}
