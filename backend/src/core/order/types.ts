export type OrderStatus = "pending_approval" | "approved" | "confirmed" | "rejected";

/**
 * The human-approval gate as a real state machine.
 * An order cannot leave pending_approval without an explicit human decision.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending_approval: ["approved", "rejected"],
  approved: ["confirmed"],
  confirmed: [],
  rejected: [],
};

export interface OrderLine {
  productId: string;
  name: string;
  /** Fixed listed price captured at order time. */
  unitPrice: number;
  quantity: number;
  /** Captured from the catalog at order time so confirmation/provider UIs can show ETA. */
  etaMinutes?: number;
}

export interface Order {
  id: string;
  personalAgentId: string;
  businessId: string;
  lines: OrderLine[];
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
