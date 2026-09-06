import type { AvailabilityComparison, AvailabilityReply, Order } from "@/lib/api";

export type Role = "customer" | "provider";

export interface User {
  name: string;
  phone?: string;
  role: Role;
  businessId?: string;
}

/** Customer request lifecycle (fixed-price comparison model): */
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
  comparison?: AvailabilityComparison;
  chosenReply?: AvailabilityReply;
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

/** How comparison results are rendered inside the chat thread. */
export type ComparisonDisplay = "inline" | "sheet" | "expandable";

export interface ChatPreferences {
  comparisonDisplay: ComparisonDisplay;
}

/** A single message in the chat thread. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status: "sending" | "sent" | "error";
  metadata?: {
    comparison?: AvailabilityComparison;
    orderId?: string;
    reply?: AvailabilityReply;
    pendingConfirmation?: boolean;
  };
}

export type { AvailabilityComparison, AvailabilityReply, Order };
