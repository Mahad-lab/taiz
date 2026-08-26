import { describe, expect, test } from "bun:test";
import { compareAvailability, sortReplies } from "../../../src/core/agent/personalAgent";
import type { AvailabilityReply } from "../../../src/core/agent/types";
import { createDirectoryStore } from "../../../src/core/directory/directoryStore";
import type { BusinessAgentLookup } from "../../../src/core/agent/personalAgent";

function directory() {
  const store = createDirectoryStore();
  store.add({ id: "biz-a", name: "A Bakery", category: "bakery", city: "Karachi", neighborhood: "DHA Phase 1" });
  store.add({ id: "biz-b", name: "B Bakery", category: "bakery", city: "Karachi", neighborhood: "DHA Phase 2" });
  store.add({ id: "biz-c", name: "C Restaurant", category: "restaurant", city: "Karachi", neighborhood: "DHA Phase 1" });
  return store;
}

function reply(businessId: string, status: "available" | "unavailable", price?: number): AvailabilityReply {
  return status === "available"
    ? { businessId, status, product: { id: `p-${businessId}`, name: "Croissant" }, price, currency: "PKR" }
    : { businessId, status };
}

describe("personalAgent fan-out", () => {
  test("fans the same request out to all matching businesses in parallel", async () => {
    const calls: string[] = [];
    const slow = {
      checkAvailability: async () => {
        calls.push("slow-start");
        await new Promise((r) => setTimeout(r, 20));
        calls.push("slow-end");
        return reply("biz-a", "available", 3.5);
      },
    };
    const fast = {
      checkAvailability: async () => {
        calls.push("fast-start");
        return reply("biz-b", "available", 4);
      },
    };
    const lookup: BusinessAgentLookup = (id) => (id === "biz-a" ? slow : id === "biz-b" ? fast : undefined);

    const comparison = await compareAvailability(directory(), lookup, {
      item: "Croissant",
      quantity: 6,
      city: "Karachi",
      category: "bakery",
    });

    // fast resolved while slow was still pending → they ran concurrently
    expect(calls.indexOf("fast-start")).toBeLessThan(calls.indexOf("slow-end"));
    expect(comparison.replies).toHaveLength(2);
  });

  test("sorts available first, then cheapest; keeps unavailable for transparency", async () => {
    const lookup: BusinessAgentLookup = (id) =>
      id === "biz-c"
        ? undefined
        : {
            checkAvailability: async () =>
              id === "biz-a" ? reply("biz-a", "available", 4) : reply("biz-b", "unavailable"),
          };

    const comparison = await compareAvailability(directory(), lookup, {
      item: "Croissant",
      quantity: 1,
      city: "Karachi",
      category: "bakery",
    });

    expect(comparison.replies.map((r) => r.businessId)).toEqual(["biz-a", "biz-b"]);
    expect(comparison.item).toBe("Croissant");
    expect(comparison.quantity).toBe(1);
  });

  test("skips businesses without a registered agent handle", async () => {
    const lookup: BusinessAgentLookup = () => undefined;
    const comparison = await compareAvailability(directory(), lookup, {
      item: "Croissant",
      quantity: 1,
      city: "Karachi",
      category: "restaurant",
    });
    expect(comparison.replies).toEqual([]);
  });
});

describe("sortReplies", () => {
  test("price ascending within available", () => {
    const sorted = sortReplies([
      reply("x", "available", 9),
      reply("y", "unavailable"),
      reply("z", "available", 2),
    ]);
    expect(sorted.map((r) => r.businessId)).toEqual(["z", "x", "y"]);
  });
});
