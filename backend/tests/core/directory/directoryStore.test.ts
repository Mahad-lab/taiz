import { describe, expect, test } from "bun:test";
import { createDirectoryStore } from "../../../src/core/directory/directoryStore";

function storeWithSample() {
  const directory = createDirectoryStore();
  directory.add({ id: "biz-sunrise", name: "Sunrise Bakehouse", category: "bakery", city: "Riyadh", neighborhood: "Al Olaya" });
  directory.add({ id: "biz-oven", name: "Neighborhood Oven", category: "bakery", city: "Riyadh", neighborhood: "Al Malqa" });
  directory.add({ id: "biz-olive", name: "Olive Table", category: "restaurant", city: "Riyadh", neighborhood: "Al Olaya" });
  return directory;
}

describe("directoryStore", () => {
  test("filters by city and category", () => {
    const directory = storeWithSample();
    const ids = directory.findByArea({ city: "riyadh" }, "bakery").map((l) => l.id);
    expect(ids).toEqual(["biz-sunrise", "biz-oven"]);
  });

  test("filters by neighborhood too", () => {
    const directory = storeWithSample();
    const ids = directory.findByArea({ city: "Riyadh", neighborhood: "al olaya" }).map((l) => l.id);
    expect(ids).toEqual(["biz-sunrise", "biz-olive"]);
  });

  test("matches nothing for an unknown area", () => {
    const directory = storeWithSample();
    expect(directory.findByArea({ city: "Jeddah" })).toEqual([]);
  });

  test("gets by id and lists all", () => {
    const directory = storeWithSample();
    expect(directory.getById("biz-oven")?.name).toBe("Neighborhood Oven");
    expect(directory.getById("nope")).toBeUndefined();
    expect(directory.listAll()).toHaveLength(3);
  });
});
