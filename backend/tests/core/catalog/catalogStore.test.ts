import { describe, expect, test } from "bun:test";
import { createCatalogStore } from "../../../src/core/catalog/catalogStore";

function storeWithSample() {
  const catalog = createCatalogStore();
  catalog.add({ id: "p-1", businessId: "biz-a", name: "Croissant", price: 3.5, currency: "PKR", etaMinutes: 15 });
  catalog.add({ id: "p-2", businessId: "biz-a", name: "Sourdough Loaf", price: 8, currency: "PKR" });
  return catalog;
}

describe("catalogStore", () => {
  test("lists products per business only", () => {
    const catalog = storeWithSample();
    catalog.add({ id: "p-9", businessId: "biz-b", name: "Pizza", price: 28, currency: "PKR" });
    expect(catalog.listByBusiness("biz-a").map((p) => p.id)).toEqual(["p-1", "p-2"]);
    expect(catalog.listByBusiness("biz-b").map((p) => p.id)).toEqual(["p-9"]);
  });

  test("gets a product by id", () => {
    const catalog = storeWithSample();
    expect(catalog.getProduct("biz-a", "p-1")?.price).toBe(3.5);
    expect(catalog.getProduct("biz-a", "nope")).toBeUndefined();
    expect(catalog.getProduct("biz-b", "p-1")).toBeUndefined();
  });

  test("finds an item by name, case-insensitively", () => {
    const catalog = storeWithSample();
    expect(catalog.findItem("biz-a", "  croissant ")?.id).toBe("p-1");
    expect(catalog.findItem("biz-a", "CROISSANT")?.id).toBe("p-1");
    expect(catalog.findItem("biz-a", "Bagel")).toBeUndefined();
  });
});
