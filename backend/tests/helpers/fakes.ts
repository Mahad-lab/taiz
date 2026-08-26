import type { Provider } from "../../src/core/llm/provider";
import type { LLMRequest, LLMResponse } from "../../src/core/llm/types";

/** Deterministic Provider fake — no network, echoes the last user message. */
export function fakeProvider(name = "fake"): Provider {
  return {
    name,
    call: async (req: LLMRequest): Promise<LLMResponse> => ({
      text: `[${name}] ${req.messages[req.messages.length - 1]?.content ?? ""}`,
      provider: name,
      model: req.model ?? `${name}-model`,
    }),
  };
}

export function neverProvider(name = "never"): Provider {
  return {
    name,
    call: async () => {
      throw new Error(`${name} should not have been called`);
    },
  };
}
