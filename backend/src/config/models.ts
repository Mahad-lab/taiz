export interface ModelSelection {
  provider: string;
  model: string;
}

/**
 * Which provider/model to use per use-case.
 * Use-cases are logical names core code refers to (e.g. "personal_agent").
 */
export const MODEL_SELECTION: Record<string, ModelSelection> = {
  personal_agent: { provider: "openai", model: "gpt-4o-mini" },
  business_agent: { provider: "openai", model: "gpt-4o-mini" },
};
