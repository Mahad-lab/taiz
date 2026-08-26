import type { ModelSelection } from "../../config/models";
import { createOpenAIProvider } from "./providers/openai";
import type { Provider } from "./provider";
import type { LLMRequest, LLMResponse } from "./types";

export type ProviderRegistry = Record<string, Provider>;

/**
 * The provider registry. Adding a new provider:
 *   1. create providers/<name>.ts exporting a create<Name>Provider(apiKey) factory
 *   2. add one line here
 * No other file changes. See docs/ADDING_A_PROVIDER.md.
 */
export function createProviderRegistry(apiKeys: {
  openai?: string;
  anthropic?: string;
  qwen?: string;
}): ProviderRegistry {
  const registry: ProviderRegistry = {};
  if (apiKeys.openai) registry.openai = createOpenAIProvider(apiKeys.openai);
  // TODO: if (apiKeys.anthropic) registry.anthropic = createAnthropicProvider(apiKeys.anthropic)
  // TODO: if (apiKeys.qwen) registry.qwen = createQwenProvider(apiKeys.qwen)
  return registry;
}

export interface LLMRouter {
  /** Run a completion for a logical use-case (e.g. "personal_agent"). */
  complete(useCase: string, req: Omit<LLMRequest, "model">): Promise<LLMResponse>;
}

/**
 * Picks a provider/model per use-case from config/models.ts and calls it.
 */
export function createRouter(
  registry: ProviderRegistry,
  selections: Record<string, ModelSelection>,
): LLMRouter {
  return {
    async complete(useCase, req) {
      const selection = selections[useCase];
      if (!selection) throw new Error(`no model configured for use-case "${useCase}"`);
      const provider = registry[selection.provider];
      if (!provider) throw new Error(`provider "${selection.provider}" is not registered`);
      return provider.call({ ...req, model: selection.model });
    },
  };
}
