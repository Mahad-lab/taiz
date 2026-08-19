export type Role = "customer" | "provider";

export type RequestStatus =
  | "chatting"
  | "searching"
  | "negotiating"
  | "review"
  | "approved"
  | "confirmed"
  | "declined";

export interface ChatMessage {
  id: string;
  from: "user" | "agent";
  text: string;
  time: string;
}

export interface TaizRequest {
  id: string;
  item: string;
  budget: number;
  provider: string;
  providerRating: number;
  initialPrice: number;
  finalPrice: number;
  counterOffer: boolean;
  pickupLocation: string;
  pickupDay: string;
  pickupTime: string;
  status: RequestStatus;
  messages: ChatMessage[];
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