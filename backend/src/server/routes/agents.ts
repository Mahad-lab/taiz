import { Hono } from "hono";
import { z } from "zod";
import type { BusinessType } from "../../core/catalog/types";
import { compareAvailability, summarizeComparison } from "../../core/agent/personalAgent";
import type { AppDeps } from "../app";
import { fail, ok } from "../lib/response";

const personalMessageSchema = z.object({
  intent: z.literal("check_availability").default("check_availability"),
  item: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
  city: z.string().min(1),
  neighborhood: z.string().min(1).optional(),
  category: z.enum(["bakery", "restaurant"]),
});

const businessMessageSchema = z.object({
  item: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
});

export function agentsRoutes(deps: AppDeps): Hono {
  const app = new Hono();

  app.post("/:id/message", async (c) => {
    const id = c.req.param("id");

    const personal = deps.personalAgents[id];
    if (personal) {
      const body = personalMessageSchema.parse(await c.req.json());
      const comparison = await compareAvailability(deps.directory, (bid) => deps.businessAgents[bid], body);
      const summary = await summarizeComparison(deps.llm, comparison).catch(() => undefined);
      return ok(c, { agentId: id, comparison, summary });
    }

    const business = deps.businessAgents[id];
    if (business) {
      const body = businessMessageSchema.parse(await c.req.json());
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
