import { describe, expect, test } from "bun:test";
import { createOrderService, OrderError } from "../../../src/core/order/orderService";
import { createInMemoryOrderStore } from "../../../src/core/order/orderStore";

function lines() {
  return [
    { productId: "p-1", name: "Croissant", unitPrice: 3.5, quantity: 6 },
    { productId: "p-2", name: "Sourdough Loaf", unitPrice: 8, quantity: 1 },
  ];
}

function service() {
  return createOrderService(createInMemoryOrderStore(), {
    generateId: (() => {
      let n = 0;
      return () => `order-${++n}`;
    })(),
    now: () => new Date("2026-01-01T00:00:00Z"),
  });
}

describe("orderService", () => {
  test("creates an order in pending_approval with the computed total", () => {
    const orders = service();
    const order = orders.create({
      personalAgentId: "agent-user",
      businessId: "biz-sunrise",
      currency: "PKR",
      lines: lines(),
    });
    expect(order.status).toBe("pending_approval");
    expect(order.total).toBe(29);
    expect(order.id).toBe("order-1");
  });

  test("rejects empty or invalid orders", () => {
    const orders = service();
    const base = { personalAgentId: "a", businessId: "b", currency: "PKR" };
    expect(() => orders.create({ ...base, lines: [] })).toThrow(/at least one line/);
    let code = "";
    try {
      orders.create({ ...base, lines: [{ productId: "x", name: "X", unitPrice: 1, quantity: 0 }] });
    } catch (e) {
      code = (e as OrderError).code;
    }
    expect(code).toBe("invalid_order");
  });

  test("walks pending_approval → approved → confirmed", () => {
    const orders = service();
    const order = orders.create({ personalAgentId: "a", businessId: "b", currency: "PKR", lines: lines() });
    expect(orders.approve(order.id).status).toBe("approved");
    expect(orders.confirm(order.id).status).toBe("confirmed");
  });

  test("blocks confirmation while still pending approval (the human gate)", () => {
    const orders = service();
    const order = orders.create({ personalAgentId: "a", businessId: "b", currency: "PKR", lines: lines() });
    try {
      orders.confirm(order.id);
      expect.unreachable();
    } catch (e) {
      expect((e as OrderError).code).toBe("invalid_transition");
    }
  });

  test("reject is terminal", () => {
    const orders = service();
    const order = orders.create({ personalAgentId: "a", businessId: "b", currency: "PKR", lines: lines() });
    expect(orders.reject(order.id).status).toBe("rejected");
    expect(() => orders.approve(order.id)).toThrow(/cannot move order from "rejected"/);
  });

  test("get throws not_found for unknown ids", () => {
    const orders = service();
    try {
      orders.get("nope");
      expect.unreachable();
    } catch (e) {
      expect((e as OrderError).code).toBe("not_found");
    }
  });
});
