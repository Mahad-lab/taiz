import { describe, expect, test } from "bun:test";
import { createBusinessAgentHandle, checkAvailability } from "../../../src/core/agent/businessAgent";
import { createCatalogStore } from "../../../src/core/catalog/catalogStore";

function catalog() {
  const store = createCatalogStore();
  store.add({ id: "p-1", businessId: "biz-a", name: "Croissant", price: 3.5, currency: "PKR", etaMinutes: 15 });
  return store;
}

describe("businessAgent", () => {
  test("available reply carries the fixed listed price and ETA", () => {
    const reply = checkAvailability(catalog(), "biz-a", { item: "croissant", quantity: 12 });
    expect(reply).toEqual({
      businessId: "biz-a",
      status: "available",
      product: { id: "p-1", name: "Croissant" },
      price: 3.5,
      currency: "PKR",
      etaMinutes: 15,
    });
  });

  test("missing item → plain unavailable; no counter-offer exists in the shape", () => {
    const reply = checkAvailability(catalog(), "biz-a", { item: "Bagel", quantity: 1 });
    expect(reply).toEqual({ businessId: "biz-a", status: "unavailable" });
    expect(Object.keys(reply)).not.toContain("counterOffer");
  });

  test("the handle exposes an async checkAvailability with the same result", async () => {
    const handle = createBusinessAgentHandle(
      { id: "biz-a", name: "Sunrise Bakehouse", kind: "business", category: "bakery" },
      catalog(),
    );
    const reply = await handle.checkAvailability({ item: "Croissant", quantity: 1 });
    expect(reply.status).toBe("available");
    expect(reply.price).toBe(3.5);
  });
});
