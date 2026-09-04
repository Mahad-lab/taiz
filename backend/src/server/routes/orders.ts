import { Hono } from "hono";
import { z } from "zod";
import type { AppDeps } from "../app";
import { fail, ok } from "../lib/response";

const createOrderSchema = z.object({
  personalAgentId: z.string().min(1),
  businessId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1),
});

export function ordersRoutes(deps: AppDeps): Hono {
  const app = new Hono();

  app.get("/", (c) => {
    const businessId = c.req.query("businessId");
    const orders = businessId ? deps.orders.listByBusiness(businessId) : deps.orders.listAll();
    return ok(c, { orders });
  });

  app.post("/", async (c) => {
    const body = createOrderSchema.parse(await c.req.json());
    const listing = deps.directory.getById(body.businessId);
    if (!listing) return fail(c, 404, "not_found", `business "${body.businessId}" not found`);

    // Prices come from the catalog — the fixed listed price. Never from the client.
    const lines = [];
    let currency: string | undefined;
    for (const item of body.items) {
      const product = deps.catalog.getProduct(body.businessId, item.productId);
      if (!product) {
        return fail(c, 404, "not_found", `product "${item.productId}" is not in the catalog of "${body.businessId}"`);
      }
      currency ??= product.currency;
      lines.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        etaMinutes: product.etaMinutes,
      });
    }

    const order = deps.orders.create({
      personalAgentId: body.personalAgentId,
      businessId: body.businessId,
      currency: currency ?? "PKR",
      lines,
    });
    return ok(c, { order }, 201);
  });

  app.get("/:id", (c) => ok(c, { order: deps.orders.get(c.req.param("id")) }));

  // The human-approval gate.
  app.post("/:id/approve", (c) => ok(c, { order: deps.orders.approve(c.req.param("id")) }));
  app.post("/:id/confirm", (c) => ok(c, { order: deps.orders.confirm(c.req.param("id")) }));
  app.post("/:id/reject", (c) => ok(c, { order: deps.orders.reject(c.req.param("id")) }));

  return app;
}
