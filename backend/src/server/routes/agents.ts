import { Hono } from "hono";
import { z } from "zod";
import type { BusinessType } from "../../core/catalog/types";
import { compareAvailability, parseChatIntent, summarizeComparison } from "../../core/agent/personalAgent";
import type { AppDeps } from "../app";
import { chatLogger } from "../lib/chatLogger";
import { fail, ok } from "../lib/response";

const checkAvailabilitySchema = z.object({
  intent: z.literal("check_availability").default("check_availability"),
  item: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
  city: z.string().min(1),
  neighborhood: z.string().min(1).optional(),
  category: z.enum(["bakery", "restaurant"]),
});

const chatMessageSchema = z.object({
  intent: z.literal("chat").default("chat"),
  message: z.string().min(1),
  context: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional()
    .default([]),
});

const businessMessageSchema = z.object({
  item: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
});

const A2A_AGENT_CARD = {
  protocolVersion: "v0.1",
  version: "1.0.0",
  name: "",
  description: "",
  url: "",
  capabilities: {
    text: { outputSchema: {} },
    artifact: { structuralIntegrity: false },
    task: {
      methods: {
        taskPush: { additionalProperties: false },
        taskGet: { additionalProperties: false },
      },
    },
    links: [],
    serviceUrl: "",
  },
};

export function agentsRoutes(deps: AppDeps): Hono {
  const app = new Hono();

  app.get("/:id/.well-known/agent.json", (c) => {
    const id = c.req.param("id");
    const business = deps.businessAgents[id];
    if (!business) return fail(c, 404, "not_found", `agent "${id}" not found`);
    const card = { ...A2A_AGENT_CARD, name: business.agent.name, description: `Bakery agent: ${business.agent.name}`, url: `https://taiz.app/agents/${id}`, capabilities: { ...A2A_AGENT_CARD.capabilities, serviceUrl: `https://taiz.app/agents/${id}/message` } };
    return c.json(card);
  });

  app.post("/:id/message", async (c) => {
    const id = c.req.param("id");
    const rawBody = await c.req.json();
    const intent = (rawBody && typeof rawBody === "object" ? (rawBody as { intent?: string }).intent : undefined) ?? "check_availability";

    const personal = deps.personalAgents[id];

    if (personal) {
      if (intent === "chat") {
        const body = chatMessageSchema.parse(rawBody);
        chatLogger.received(id, body.message.length, body.context.length);
        try {
          const { intent: parsed, reply } = await parseChatIntent(
            deps.llm,
            body.message,
            body.context,
            deps.directory,
          );

          chatLogger.intentExtracted(id, {
            shouldCheckAvailability: parsed.shouldCheckAvailability,
            isGreeting: parsed.isGreeting,
            item: parsed.item,
            city: parsed.city,
            category: parsed.category,
          });

          const knownCategories = ["bakery", "restaurant"] as const;
          const intentOut =
            parsed.shouldCheckAvailability &&
            parsed.item &&
            parsed.city &&
            (knownCategories as readonly string[]).includes(parsed.category)
              ? {
                  item: parsed.item,
                  quantity: parsed.quantity,
                  city: parsed.city,
                  category: parsed.category as BusinessType,
                  neighborhood: parsed.neighborhood,
                }
              : null;

          if (!intentOut) {
            chatLogger.replied(id, false, reply.length);
            return ok(c, { agentId: id, reply, intent: null, comparison: null });
          }

          const comparison = await compareAvailability(deps.directory, (bid) => deps.businessAgents[bid], {
            item: intentOut.item,
            quantity: intentOut.quantity,
            city: intentOut.city,
            neighborhood: intentOut.neighborhood,
            category: intentOut.category,
          });

          const bestMatch = comparison.replies[0]?.product?.name ?? null;
          chatLogger.availabilityChecked(id, comparison.replies.length, bestMatch);
          chatLogger.replied(id, true, reply.length);
          return ok(c, { agentId: id, reply, intent: intentOut, comparison });
        } catch (err) {
          if (err instanceof Error && err.name === "ZodError") {
            const detail = (err as unknown as { issues?: { message: string }[] }).issues?.map(i => i.message).join("; ") ?? err.message;
            chatLogger.failed(id, "bad_request", detail);
            return fail(c, 400, "bad_request", `Invalid chat message: ${detail}`);
          }
          const message = err instanceof Error ? err.message : "chat failed";
          const lower = message.toLowerCase();
          const looksLikeAuth =
            lower.includes("api key") ||
            lower.includes("401") ||
            lower.includes("403") ||
            lower.includes("unauthorized") ||
            lower.includes("forbidden");
          if (looksLikeAuth) {
            chatLogger.failed(id, "llm_unavailable", message);
            return fail(c, 503, "llm_unavailable", "Chat service unavailable — configure OPENAI_API_KEY on the backend");
          }
          chatLogger.failed(id, "chat_failed", message);
          return fail(c, 500, "chat_failed", message);
        }
      }

      const body = checkAvailabilitySchema.parse(rawBody);
      const comparison = await compareAvailability(deps.directory, (bid) => deps.businessAgents[bid], body);
      const summary = await summarizeComparison(deps.llm, comparison).catch(() => undefined);
      return ok(c, { agentId: id, comparison, summary });
    }

    const business = deps.businessAgents[id];
    if (business) {
      const body = businessMessageSchema.parse(rawBody);
      const reply = await business.checkAvailability(body);
      return ok(c, { agentId: id, reply });
    }

    return fail(c, 404, "not_found", `agent "${id}" not found`);
  });

  return app;
}

export function isBusinessType(value: string): value is BusinessType {
  return value === "bakery" || value === "restaurant";
}
