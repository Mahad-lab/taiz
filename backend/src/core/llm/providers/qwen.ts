import type { Provider } from "../provider";
import type { LLMRequest, LLMResponse } from "../types";

// TODO: implement via Qwen/DashScope OpenAI-compatible endpoint
// (https://dashscope.console.aliyun.com) using raw fetch. If the
// compatible-mode payload matches, this can reuse the openai.ts mapping with a
// different baseUrl and model names.
export function createQwenProvider(_apiKey: string): Provider {
  return {
    name: "qwen",
    async call(_req: LLMRequest): Promise<LLMResponse> {
      throw new Error("qwen provider not implemented yet");
    },
  };
}
