import { z } from "zod";
import type { Provider } from "../provider";
import type { LLMRequest, LLMResponse } from "../types";

const API_URL = "https://api.openai.com/v1/chat/completions";

const responseSchema = z.object({
  model: z.string(),
  choices: z
    .array(z.object({ message: z.object({ content: z.string().nullable() }) }))
    .min(1),
  usage: z
    .object({ prompt_tokens: z.number(), completion_tokens: z.number() })
    .optional(),
});

interface OpenAIErrorBody {
  error?: { message?: string };
}

export function createOpenAIProvider(apiKey: string, baseUrl: string = API_URL): Provider {
  return {
    name: "openai",
    async call(req: LLMRequest): Promise<LLMResponse> {
      if (!req.model) throw new Error("openai provider requires req.model");
      const messages = req.system
        ? [{ role: "system" as const, content: req.system }, ...req.messages]
        : req.messages;

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: req.model,
          messages,
          temperature: req.temperature,
          max_tokens: req.maxTokens,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as OpenAIErrorBody;
        const detail = body.error?.message ?? res.statusText;
        throw new Error(`openai api error ${res.status}: ${detail}`);
      }

      const data = responseSchema.parse(await res.json());
      const choice = data.choices[0];
      return {
        text: choice?.message.content ?? "",
        provider: "openai",
        model: data.model,
        usage: data.usage
          ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens }
          : undefined,
      };
    },
  };
}
