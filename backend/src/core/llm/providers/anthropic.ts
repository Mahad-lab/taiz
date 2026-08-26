import type { Provider } from "../provider";
import type { LLMRequest, LLMResponse } from "../types";

// TODO: implement via the Anthropic Messages API
// (https://docs.anthropic.com/en/api/messages) using raw fetch, same shape as
// providers/openai.ts. Normalize the response into LLMResponse here.
export function createAnthropicProvider(_apiKey: string): Provider {
  return {
    name: "anthropic",
    async call(_req: LLMRequest): Promise<LLMResponse> {
      throw new Error("anthropic provider not implemented yet");
    },
  };
}
