/**
 * Thin client for the Taiz backend (Hono/Bun).
 *
 * All calls go through `/api` (proxied to the backend by the frontend's Bun
 * dev server — see `src/index.ts`). The backend speaks an envelope
 * `{ ok: true, data }` / `{ ok: false, error: { code, message } }`; `request`
 * unwraps it and throws on failure so callers can `try/catch` and surface a toast.
 */

export const API_BASE = "/api";

export const PERSONAL_AGENT_ID = "agent-user";

export type BusinessType = "bakery" | "restaurant";
export type OrderStatus = "pending_approval" | "approved" | "confirmed" | "rejected";

export interface BusinessListing {
  id: string;
  name: string;
  category: BusinessType;
  city: string;
  neighborhood: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  price: number;
  currency: string;
  etaMinutes?: number;
}

export type AvailabilityStatus = "available" | "unavailable";

export interface AvailabilityReply {
  businessId: string;
  status: AvailabilityStatus;
  product?: { id: string; name: string };
  price?: number;
  currency?: string;
  etaMinutes?: number;
}

export interface AvailabilityComparison {
  item: string;
  quantity: number;
  replies: AvailabilityReply[];
}

export interface OrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
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

export interface ApiError {
  code: string;
  message: string;
}

class ApiRequestError extends Error {
  readonly code: string;
  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  const json = (await res.json()) as
    | { ok: true; data: T }
    | { ok: false; error: ApiError };
  if (!json.ok) throw new ApiRequestError(json.error);
  return json.data;
}

function qs(params: object): string {
  const parts = Object.entries(params as Record<string, unknown>)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export interface ListBusinessesParams {
  city?: string;
  neighborhood?: string;
  category?: BusinessType;
}

export async function listBusinesses(params: ListBusinessesParams = {}): Promise<BusinessListing[]> {
  const data = await request<{ businesses: BusinessListing[] }>(`/businesses${qs(params)}`);
  return data.businesses;
}

export async function getCatalog(
  businessId: string,
): Promise<{ business: BusinessListing; products: Product[] }> {
  return request(`/businesses/${businessId}/catalog`);
}

export interface CompareParams {
  item: string;
  quantity?: number;
  city: string;
  category: BusinessType;
  neighborhood?: string;
}

export async function compare(
  params: CompareParams,
): Promise<{ agentId: string; comparison: AvailabilityComparison; summary?: string }> {
  return request(`/agents/${PERSONAL_AGENT_ID}/message`, {
    method: "POST",
    body: JSON.stringify({
      intent: "check_availability",
      item: params.item,
      quantity: params.quantity ?? 1,
      city: params.city,
      category: params.category,
      neighborhood: params.neighborhood,
    }),
  });
}

export interface CreateOrderInput {
  personalAgentId: string;
  businessId: string;
  items: { productId: string; quantity: number }[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return request(`/orders`, { method: "POST", body: JSON.stringify(input) });
}

export async function getOrder(id: string): Promise<Order> {
  return request(`/orders/${id}`);
}

export async function listOrders(businessId?: string): Promise<Order[]> {
  const data = await request<{ orders: Order[] }>(`/orders${qs({ businessId })}`);
  return data.orders;
}

export async function approveOrder(id: string): Promise<Order> {
  return request(`/orders/${id}/approve`, { method: "POST" });
}

export async function confirmOrder(id: string): Promise<Order> {
  return request(`/orders/${id}/confirm`, { method: "POST" });
}

export async function rejectOrder(id: string): Promise<Order> {
  return request(`/orders/${id}/reject`, { method: "POST" });
}

export { ApiRequestError };
