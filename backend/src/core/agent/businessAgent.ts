import type { CatalogStore } from "../catalog/catalogStore";
import type { AvailabilityReply, AvailabilityRequest, BusinessAgent } from "./types";

/**
 * Pure availability check against a business catalog. Fixed listed prices:
 * has it → price + ETA, doesn't → unavailable. Nothing else can happen.
 */
export function checkAvailability(
  catalog: CatalogStore,
  businessId: string,
  req: AvailabilityRequest,
): AvailabilityReply {
  const product = catalog.findItem(businessId, req.item);
  if (!product) return { businessId, status: "unavailable" };
  return {
    businessId,
    status: "available",
    product: { id: product.id, name: product.name },
    price: product.price,
    currency: product.currency,
    etaMinutes: product.etaMinutes,
  };
}

/**
 * The handle other agents (or, later, HTTP clients) talk to.
 * Async on purpose so an in-process handle and a remote client are interchangeable.
 */
export interface BusinessAgentHandle {
  agent: BusinessAgent;
  checkAvailability(req: AvailabilityRequest): Promise<AvailabilityReply>;
}

export function createBusinessAgentHandle(
  agent: BusinessAgent,
  catalog: CatalogStore,
): BusinessAgentHandle {
  return {
    agent,
    checkAvailability: (req) =>
      Promise.resolve(checkAvailability(catalog, agent.id, req)),
  };
}
