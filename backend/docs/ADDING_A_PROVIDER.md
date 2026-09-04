# Adding an LLM provider

Three steps. No other file changes.

**Step 1 — create the file** `src/core/llm/providers/mistral.ts`:

```ts
import type { Provider } from "../provider";
import type { LLMRequest, LLMResponse } from "../types";

export function createMistralProvider(apiKey: string): Provider {
  return {
    name: "mistral",
    async call(req: LLMRequest): Promise<LLMResponse> {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: req.model,
          messages: req.system
            ? [{ role: "system", content: req.system }, ...req.messages]
            : req.messages,
          temperature: req.temperature,
          max_tokens: req.maxTokens,
        }),
      });
      if (!res.ok) throw new Error(`mistral api error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      const choice = data.choices[0];
      return {
        text: choice?.message.content ?? "",
        provider: "mistral",
        model: data.model,
        usage: data.usage
          ? {
              inputTokens: data.usage.prompt_tokens,
              outputTokens: data.usage.completion_tokens,
            }
          : undefined,
      };
    },
  };
}
```

**Step 2 — register it**, one line in `src/core/llm/router.ts`:

```ts
if (apiKeys.mistral) registry.mistral = createMistralProvider(apiKeys.mistral)
```

(add `mistral?: string` to the `apiKeys` parameter type on the same function)

**Step 3 — use it**, one line in `src/config/models.ts`:

```ts
personal_agent: { provider: "mistral", model: "mistral-small-latest" },
```

Done. Business logic never changed; it only ever saw `LLMRequest`/`LLMResponse`.
Finally add a test at `tests/core/llm/providers/mistral.test.ts`, mirroring
`openai.test.ts`: mock `global.fetch`, assert request mapping and response
normalization.
