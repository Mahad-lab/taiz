import { describe, expect, test } from "bun:test";
import { createAnthropicProvider } from "../../../../src/core/llm/providers/anthropic";

// Stub until the Anthropic provider is implemented (see TODO in source).
describe("anthropic provider", () => {
  test("is registered as a named stub that rejects", async () => {
    const provider = createAnthropicProvider("key");
    expect(provider.name).toBe("anthropic");
    expect(provider.call({ model: "claude-3-5-sonnet", messages: [] })).rejects.toThrow(
      "not implemented",
    );
  });
});
