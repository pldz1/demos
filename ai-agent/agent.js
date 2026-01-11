import { route } from "./router.js";
import { Executor } from "./executor.js";

export class Agent {
  constructor({ executor } = {}) {
    this.executor = executor || new Executor();
  }

  /**
   * Single-agent entry.
   * @param {{ input: string, image?: {data?: string, url?: string, mimeType?: string} }}
   */
  async handle({ input, image }) {
    const routing = await route({ input, hasImage: Boolean(image) });
    const result = await this.executor.run({
      input,
      intents: routing.intents,
      image,
    });

    return {
      routing,
      ...result,
    };
  }
}
