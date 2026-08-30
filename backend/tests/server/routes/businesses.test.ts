import { describe, expect, test } from "bun:test";
import { buildTestApp, readJson } from "../helpers";

describe("GET /businesses", () => {
  test("lists all businesses", async () => {
    const { app } = buildTestApp();
    const res = await app.request("/businesses");
    expect(res.status).toBe(200);
    const json: any = await readJson(res);
    expect(json.data.businesses).toHaveLength(8);
  });

  test("filters by city + category", async () => {
    const { app } = buildTestApp();
    const res = await app.request("/businesses?city=Karachi&category=bakery");
    const json: any = await readJson(res);
    expect(json.data.businesses.map((b: { id: string }) => b.id).sort()).toEqual(["biz-crust", "biz-dough", "biz-herb", "biz-olive", "biz-oven", "biz-sunrise"]);
  });

  test("rejects an unknown category", async () => {
    const { app } = buildTestApp();
    const res = await app.request("/businesses?city=Karachi&category=plumber");
    expect(res.status).toBe(400);
  });
});

describe("GET /businesses/:id/catalog", () => {
  test("returns the listing and its fixed-price products", async () => {
    const { app } = buildTestApp();
    const res = await app.request("/businesses/biz-sunrise/catalog");
    expect(res.status).toBe(200);
    const json: any = await readJson(res);
    expect(json.data.business.name).toBe("Sunrise Bakehouse");
    const croissant = json.data.products.find((p: { name: string }) => p.name === "Croissant");
    expect(croissant).toMatchObject({ price: 350, currency: "PKR" });
  });

  test("unknown business → 404", async () => {
    const { app } = buildTestApp();
    const res = await app.request("/businesses/ghost/catalog");
    expect(res.status).toBe(404);
  });
});
