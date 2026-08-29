import type { AvailabilityComparison, AvailabilityReply, Order } from "@/lib/api";

export type Role = "customer" | "provider";

/**
 * Customer request lifecycle (fixed-price comparison model):
 * searching → comparing → review → confirmed | declined
 * "comparing" is the transient agent-fan-out step; "review" is the results screen.
 */
export type RequestStatus = "searching" | "comparing" | "review" | "confirmed" | "declined";

export type Category = "bakery" | "restaurant";

export interface TaizRequest {
  id: string;
  item: string;
  quantity: number;
  city: string;
  category: Category;
  neighborhood?: string;
  status: RequestStatus;
  /** Set after the personal agent fans out to business agents. */
  comparison?: AvailabilityComparison;
  /** The option the customer is reviewing / has chosen. */
  chosenReply?: AvailabilityReply;
  /** Backend order id once an order has been created for this request. */
  orderId?: string;
  createdAt: string;
}

export interface ProviderJob {
  id: string;
  customer: string;
  item: string;
  price: number;
  etaMinutes?: number;
  day: string;
  time: string;
  location: string;
  businessId: string;
  status: "confirmed" | "pending";
}

export interface Toast {
  id: number;
  message: string;
}

/** What the user allows their agent to do without asking first. */
export interface Permissions {
  communicate: boolean;
  negotiate: boolean;
  negotiateMax: number;
  confirm: boolean;
  transact: boolean;
}

export type { AvailabilityComparison, AvailabilityReply, Order };
