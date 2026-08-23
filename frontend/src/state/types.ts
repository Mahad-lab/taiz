export type Role = "customer" | "provider";

export type RequestStatus = "searching" | "negotiating" | "review" | "confirmed" | "declined";

export interface TaizRequest {
  id: string;
  item: string;
  budget: number;
  provider: string;
  providerRating: number;
  initialPrice: number;
  finalPrice: number;
  pickupLocation: string;
  pickupDay: string;
  pickupTime: string;
  status: RequestStatus;
  createdAt: string;
}

export interface ProviderJob {
  id: string;
  customer: string;
  item: string;
  day: string;
  time: string;
  price: number;
  location: string;
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