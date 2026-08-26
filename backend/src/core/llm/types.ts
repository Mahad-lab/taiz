/**
 * Provider-agnostic LLM request/response shapes.
 * Business logic only ever sees these — never a provider-specific format.
 */

export type ChatRole = "system" | "user" | "assistant";

export interface LLMMessage {
  role: ChatRole;
  content: string;
}

export interface LLMRequest {
  /** Required: which model to call (router fills this from config/models.ts). */
  model?: string;
  /** Optional system prompt, prepended by the provider. */
  system?: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  usage?: LLMUsage;
}
