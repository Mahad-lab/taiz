import { describe, expect, test } from "bun:test";
import { createRouter } from "../../../src/core/llm/router";
import type { ProviderRegistry } from "../../../src/core/llm/router";
import { fakeProvider, neverProvider } from "../../helpers/fakes";

const selections = {
  personal_agent: { provider: "fake", model: "fake-model" },
  business_agent: { provider: "openai", model: "gpt-4o-mini" },
};

function registry(): ProviderRegistry {
  return { fake: fakeProvider("fake"), openai: neverProvider("openai") };
}

describe("llm router", () => {
  test("routes a use-case to its configured provider and injects the model", async () => {
    const llm = createRouter(registry(), selections);
    const res = await llm.complete("personal_agent", {
      messages: [{ role: "user", content: "hello" }],
    });
    expect(res.provider).toBe("fake");
    expect(res.model).toBe("fake-model");
    expect(res.text).toBe("[fake] hello");
  });

  test("throws for an unknown use-case", async () => {
    const llm = createRouter(registry(), selections);
    expect(llm.complete("nope", { messages: [] })).rejects.toThrow('no model configured for use-case "nope"');
  });

  test("throws when the configured provider is not registered", async () => {
    const llm = createRouter({ fake: fakeProvider() }, selections);
    expect(
      llm.complete("business_agent", { messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow('provider "openai" is not registered');
  });
});
