import type { AvailabilityStatus, BusinessType } from "../catalog/types";

export type AgentKind = "personal" | "business";

export interface Agent {
  id: string;
  name: string;
  kind: AgentKind;
}

export interface PersonalAgent extends Agent {
  kind: "personal";
}

export interface BusinessAgent extends Agent {
  kind: "business";
  category: BusinessType;
}

/** Inter-agent protocol shapes. */

export interface AvailabilityRequest {
  item: string;
  quantity: number;
}

/**
 * Closed reply shape: a business either has the item at its listed price or
 * it doesn't. There is no field here for a counter-offer — by design.
 */
export interface AvailabilityReply {
  businessId: string;
  status: AvailabilityStatus;
  /** Present when available. */
  product?: { id: string; name: string };
  price?: number;
  currency?: string;
  etaMinutes?: number;
}

export type Intent = "check_availability";
