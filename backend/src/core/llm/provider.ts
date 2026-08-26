import type { LLMRequest, LLMResponse } from "./types";

/**
 * The contract every LLM provider implements.
 * One file per provider under providers/, one factory per file.
 */
export interface Provider {
  name: string;
  call(req: LLMRequest): Promise<LLMResponse>;
}
