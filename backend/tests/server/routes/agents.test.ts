import { describe, expect, test } from "bun:test";
import { buildTestApp, postJson, readJson } from "../helpers";

describe("POST /agents/:id/message", () => {
  test("personal agent fans out to bakeries and returns a sorted comparison + LLM summary", async () => {
    const { app } = buildTestApp();
    const res = await postJson(app, "/agents/agent-user/message", {
      item: "Croissant",
      quantity: 6,
      city: "Karachi",
      category: "bakery",
    });
    expect(res.status).toBe(200);
    const json: any = await readJson(res);
    expect(json.ok).toBe(true);

    const { comparison, summary } = json.data;
    expect(comparison.replies).toHaveLength(6);
    expect(comparison.replies[0]).toMatchObject({ businessId: "biz-crust", status: "available", price: 300 });
    expect(comparison.replies[1]).toMatchObject({ businessId: "biz-sunrise", status: "available", price: 350 });
    expect(comparison.replies.slice(2).every((r: any) => r.status === "unavailable")).toBe(true);
    // fake provider echoed through the router
    expect(summary).toStartWith("[fake]");
    expect(summary).toContain("biz-sunrise");
  });

  test("business agent answers from its own catalog", async () => {
    const { app } = buildTestApp();
    const res = await postJson(app, "/agents/biz-kitchen/message", {
      item: "Margherita Pizza",
      quantity: 1,
    });
    expect(res.status).toBe(200);
    const json: any = await readJson(res);
    expect(json.data.reply).toMatchObject({
      businessId: "biz-kitchen",
      status: "available",
      price: 2800,
      currency: "PKR",
    });
  });

  test("unknown agent → 404 with the standard error shape", async () => {
    const { app } = buildTestApp();
    const res = await postJson(app, "/agents/ghost/message", { item: "x", quantity: 1 });
    expect(res.status).toBe(404);
    const json: any = await readJson(res);
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("not_found");
  });

  test("invalid body → 400 invalid_request", async () => {
    const { app } = buildTestApp();
    const res = await postJson(app, "/agents/agent-user/message", { quantity: -2 });
    expect(res.status).toBe(400);
    const json: any = await readJson(res);
    expect(json.error.code).toBe("invalid_request");
  });
});
