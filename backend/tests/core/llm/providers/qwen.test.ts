import { describe, expect, test } from "bun:test";
import { createQwenProvider } from "../../../../src/core/llm/providers/qwen";

// Stub until the Qwen provider is implemented (see TODO in source).
describe("qwen provider", () => {
  test("is registered as a named stub that rejects", async () => {
    const provider = createQwenProvider("key");
    expect(provider.name).toBe("qwen");
    expect(provider.call({ model: "qwen-max", messages: [] })).rejects.toThrow(
      "not implemented",
    );
  });
});
