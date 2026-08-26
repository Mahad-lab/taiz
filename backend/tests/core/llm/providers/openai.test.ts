import { afterEach, describe, expect, test } from "bun:test";
import { createOpenAIProvider } from "../../../../src/core/llm/providers/openai";

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response>;

function mockFetch(handler: FetchHandler): void {
  global.fetch = (async (...args: Parameters<typeof fetch>) =>
    handler(String(args[0]), args[1])) as unknown as typeof fetch;
}

describe("openai provider", () => {
  test("maps a normalized request to the OpenAI API and normalizes the response", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;
    mockFetch((url, init) => {
      capturedUrl = url;
      capturedInit = init;
      return new Response(
        JSON.stringify({
          model: "gpt-4o-mini",
          choices: [{ message: { content: "hi there" } }],
          usage: { prompt_tokens: 5, completion_tokens: 7 },
        }),
        { status: 200 },
      );
    });

    const provider = createOpenAIProvider("sk-test");
    const res = await provider.call({
      model: "gpt-4o-mini",
      system: "be brief",
      messages: [{ role: "user", content: "hello" }],
      temperature: 0.2,
      maxTokens: 50,
    });

    expect(capturedUrl).toBe("https://api.openai.com/v1/chat/completions");
    expect(capturedInit?.method).toBe("POST");
    const headers = capturedInit?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer sk-test");
    const body = JSON.parse(String(capturedInit?.body));
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.messages).toEqual([
      { role: "system", content: "be brief" },
      { role: "user", content: "hello" },
    ]);
    expect(body.temperature).toBe(0.2);
    expect(body.max_tokens).toBe(50);

    expect(res.text).toBe("hi there");
    expect(res.provider).toBe("openai");
    expect(res.model).toBe("gpt-4o-mini");
    expect(res.usage).toEqual({ inputTokens: 5, outputTokens: 7 });
  });

  test("throws a readable error on API failure", async () => {
    mockFetch(() =>
      new Response(JSON.stringify({ error: { message: "bad key" } }), { status: 401 }),
    );
    const provider = createOpenAIProvider("sk-bad");
    expect(provider.call({ model: "gpt-4o-mini", messages: [] })).rejects.toThrow(
      "openai api error 401: bad key",
    );
  });

  test("requires a model", async () => {
    const provider = createOpenAIProvider("sk-test");
    expect(provider.call({ messages: [] })).rejects.toThrow("requires req.model");
  });
});
