import { describe, expect, test } from "bun:test";
import { buildTestApp, postJson, readJson } from "./helpers";

/**
 * The demo-safety net: the whole Taiz flow in one pass.
 *
 * personal agent asks → fans out to 2 business agents → sorted comparison →
 * order created → BLOCKED on human approval → approved → confirmed.
 */
describe("full flow", () => {
  test("ask → compare → order → approval gate → confirmed", async () => {
    const { app } = buildTestApp();

    // 1. Personal agent asks for croissants across Riyadh bakeries
    const asked = await postJson(app, "/agents/agent-user/message", {
      intent: "check_availability",
      item: "Croissant",
      quantity: 6,
      city: "Riyadh",
      category: "bakery",
    });
    expect(asked.status).toBe(200);
    const askedBody: any = await readJson(asked);
    const { comparison, summary } = askedBody.data;

    // 2. Fanned out to exactly 2 bakery agents; cheapest listed price first
    expect(comparison.replies).toHaveLength(2);
    const best = comparison.replies[0];
    expect(best).toMatchObject({
      businessId: "biz-sunrise",
      status: "available",
      price: 350,
      product: { id: "p-1", name: "Croissant" },
    });
    expect(summary).toStartWith("[fake]");

    // 3. Order created at the fixed listed price — lands on the human gate
    const ordered = await postJson(app, "/orders", {
      personalAgentId: "agent-user",
      businessId: best.businessId,
      items: [{ productId: best.product.id, quantity: comparison.quantity }],
    });
    expect(ordered.status).toBe(201);
    const orderBody: any = await readJson(ordered);
    const order = orderBody.data.order;
    expect(order.status).toBe("pending_approval");
    expect(order.total).toBe(2100);

    // 4. Blocked: cannot confirm without human approval
    const earlyConfirm = await app.request(`/orders/${order.id}/confirm`, { method: "POST" });
    expect(earlyConfirm.status).toBe(409);

    // 5. Human approves…
    const approved = await app.request(`/orders/${order.id}/approve`, { method: "POST" });
    expect((await readJson<any>(approved)).data.order.status).toBe("approved");

    // 6. …and the order confirms
    const confirmed = await app.request(`/orders/${order.id}/confirm`, { method: "POST" });
    expect(confirmed.status).toBe(200);
    expect((await readJson<any>(confirmed)).data.order.status).toBe("confirmed");
  });
});
