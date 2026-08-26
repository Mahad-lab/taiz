import type { Order } from "./types";
import type { OrderStore } from "./orderService";

export function createInMemoryOrderStore(): OrderStore {
  const orders = new Map<string, Order>();
  return {
    save: (order) => void orders.set(order.id, order),
    get: (orderId) => orders.get(orderId),
  };
}
