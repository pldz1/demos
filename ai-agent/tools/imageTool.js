import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { assertOpenAIConfig, config } from "../config.js";
import { getOpenAIClient } from "./openaiClient.js";

export class ImageTool {
  async #saveResponse(responseData, filenamePrefix) {
    const arr = responseData?.data || [];
    const saved = [];
    for (let i = 0; i < arr.length; i++) {
      const b64 = arr[i]?.b64_json;
      if (!b64) continue;
      const filename = `${filenamePrefix}_${i + 1}.png`;
      fs.writeFileSync(filename, Buffer.from(b64, "base64"));
      saved.push(path.resolve(filename));
    }
    return saved;
  }

  /**
   * Text-to-image via OpenAI images/generations (axios), matching your reference.
   * @param {{prompt: string, size?: string, model?: string}}
   */
  async generate({ prompt, size = "1024x1024", model = config.models.image }) {
    assertOpenAIConfig();

    const generationsPath = `/openai/deployments/${model}/images/generations`;
    const params = `?api-version=${config.openai.apiVersion}`;
    const generationsUrl = `${config.openai.baseURL}${generationsPath}${params}`;

    const generationBody = {
      prompt,
      n: 1,
      size,
      quality: "medium",
      output_format: "png",
    };

    const generationResponse = await axios.post(
      generationsUrl,
      generationBody,
      {
        headers: {
          "Api-Key": config.openai.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const savedFiles = await this.#saveResponse(
      generationResponse.data,
      "generated_image"
    );

    return {
      mocked: false,
      savedFiles,
      data: generationResponse.data,
    };
  }

  /**
   * Image understanding via chat.completions with image_url.
   * @param {{prompt: string, image?: {data?: string, url?: string, mimeType?: string}, model?: string}}
   */
  async understand({ prompt, image, model = config.models.chat }) {
    if (!image) {
      throw new Error("ImageTool.understand requires `image`.");
    }
    assertOpenAIConfig();

    const client = getOpenAIClient();
    const imageUrl = image.url
      ? image.url
      : image.data
      ? `data:${image.mimeType || "image/png"};base64,${image.data}`
      : null;

    if (!imageUrl) {
      throw new Error("ImageTool.understand requires image.url or image.data");
    }

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    return {
      mocked: false,
      text: completion.choices?.[0]?.message?.content ?? "",
      choice: completion.choices?.[0],
    };
  }
}
