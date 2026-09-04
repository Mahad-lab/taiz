import { describe, expect, test } from "bun:test";
import { buildTestApp, postJson, readJson } from "../helpers";

function createOrder(app: ReturnType<typeof buildTestApp>["app"], items = [{ productId: "p-1", quantity: 6 }]) {
  return postJson(app, "/orders", {
    personalAgentId: "agent-user",
    businessId: "biz-sunrise",
    items,
  });
}

describe("POST /orders", () => {
  test("creates an order at catalog prices, held in pending_approval", async () => {
    const { app } = buildTestApp();
    const res = await createOrder(app);
    expect(res.status).toBe(201);
    const json: any = await readJson(res);
    expect(json.data.order).toMatchObject({
      businessId: "biz-sunrise",
      status: "pending_approval",
      total: 2100, // 6 × 350 — from the catalog, not the client
      currency: "PKR",
    });
  });

  test("unknown product → 404", async () => {
    const { app } = buildTestApp();
    const res = await createOrder(app, [{ productId: "p-6", quantity: 1 }]); // restaurant item, bakery order
    expect(res.status).toBe(404);
  });

  test("invalid body → 400", async () => {
    const { app } = buildTestApp();
    const res = await postJson(app, "/orders", { personalAgentId: "a" });
    expect(res.status).toBe(400);
  });
});

describe("order lifecycle endpoints", () => {
  test("approve then confirm", async () => {
    const { app } = buildTestApp();
    const created = await readJson(await createOrder(app));
    const id = created.data.order.id;

    const approved = await app.request(`/orders/${id}/approve`, { method: "POST" });
    expect((await readJson(approved)).data.order.status).toBe("approved");

    const confirmed = await app.request(`/orders/${id}/confirm`, { method: "POST" });
    expect(confirmed.status).toBe(200);
    expect((await readJson(confirmed)).data.order.status).toBe("confirmed");
  });

  test("confirming while pending_approval → 409 (human gate)", async () => {
    const { app } = buildTestApp();
    const id = (await readJson(await createOrder(app))).data.order.id;
    const res = await app.request(`/orders/${id}/confirm`, { method: "POST" });
    expect(res.status).toBe(409);
    expect((await readJson(res)).error.code).toBe("invalid_transition");
  });

  test("double approve → 409; GET returns the order", async () => {
    const { app } = buildTestApp();
    const id = (await readJson(await createOrder(app))).data.order.id;
    await app.request(`/orders/${id}/approve`, { method: "POST" });
    const again = await app.request(`/orders/${id}/approve`, { method: "POST" });
    expect(again.status).toBe(409);

    const fetched = await app.request(`/orders/${id}`);
    expect(fetched.status).toBe(200);
  });

  test("unknown order → 404", async () => {
    const { app } = buildTestApp();
    const res = await app.request("/orders/ghost");
    expect(res.status).toBe(404);
  });
});

describe("GET /orders", () => {
  test("lists all orders; empty when none created", async () => {
    const { app } = buildTestApp();
    const empty = await app.request("/orders");
    expect(empty.status).toBe(200);
    expect((await readJson(empty)).data.orders).toEqual([]);

    await createOrder(app);
    await postJson(app, "/orders", {
      personalAgentId: "agent-user",
      businessId: "biz-oven",
      items: [{ productId: "p-8", quantity: 2 }],
    });
    const res = await app.request("/orders");
    expect((await readJson(res)).data.orders).toHaveLength(2);
  });

  test("filters by businessId", async () => {
    const { app } = buildTestApp();
    await createOrder(app); // biz-sunrise
    await postJson(app, "/orders", {
      personalAgentId: "agent-user",
      businessId: "biz-oven",
      items: [{ productId: "p-8", quantity: 2 }],
    });

    const sunrise = await app.request("/orders?businessId=biz-sunrise");
    const sunriseOrders = (await readJson(sunrise)).data.orders as any[];
    expect(sunriseOrders).toHaveLength(1);
    expect(sunriseOrders[0].businessId).toBe("biz-sunrise");
    expect(sunriseOrders[0].lines[0].etaMinutes).toBe(15); // from catalog p-1

    const oven = await app.request("/orders?businessId=biz-oven");
    expect((await readJson(oven)).data.orders).toHaveLength(1);

    const none = await app.request("/orders?businessId=biz-olive");
    expect((await readJson(none)).data.orders).toHaveLength(0);
  });
});
