import { ALLOWED_TRANSITIONS, type Order, type OrderLine, type OrderStatus } from "./types";

export interface OrderStore {
  save(order: Order): void;
  get(orderId: string): Order | undefined;
}

export type OrderErrorCode = "invalid_order" | "not_found" | "invalid_transition";

export class OrderError extends Error {
  readonly code: OrderErrorCode;

  constructor(code: OrderErrorCode, message: string) {
    super(message);
    this.name = "OrderError";
    this.code = code;
  }
}

export interface CreateOrderInput {
  personalAgentId: string;
  businessId: string;
  currency: string;
  lines: OrderLine[];
}

export interface OrderService {
  create(input: CreateOrderInput): Order;
  get(orderId: string): Order;
  approve(orderId: string): Order;
  confirm(orderId: string): Order;
  reject(orderId: string): Order;
}

export function createOrderService(
  store: OrderStore,
  opts: { generateId?: () => string; now?: () => Date } = {},
): OrderService {
  const generateId = opts.generateId ?? (() => crypto.randomUUID());
  const now = opts.now ?? (() => new Date());

  const transition = (orderId: string, target: OrderStatus): Order => {
    const order = store.get(orderId);
    if (!order) throw new OrderError("not_found", `order "${orderId}" not found`);
    if (!ALLOWED_TRANSITIONS[order.status].includes(target)) {
      throw new OrderError(
        "invalid_transition",
        `cannot move order from "${order.status}" to "${target}"`,
      );
    }
    const updated: Order = { ...order, status: target, updatedAt: now().toISOString() };
    store.save(updated);
    return updated;
  };

  return {
    create(input) {
      if (input.lines.length === 0) {
        throw new OrderError("invalid_order", "order must contain at least one line");
      }
      for (const line of input.lines) {
        if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
          throw new OrderError("invalid_order", `invalid quantity for "${line.name}"`);
        }
      }
      const total = input.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      const ts = now().toISOString();
      const order: Order = {
        id: generateId(),
        personalAgentId: input.personalAgentId,
        businessId: input.businessId,
        lines: input.lines,
        total,
        currency: input.currency,
        status: "pending_approval",
        createdAt: ts,
        updatedAt: ts,
      };
      store.save(order);
      return order;
    },

    get(orderId) {
      const order = store.get(orderId);
      if (!order) throw new OrderError("not_found", `order "${orderId}" not found`);
      return order;
    },

    approve: (orderId) => transition(orderId, "approved"),
    confirm: (orderId) => transition(orderId, "confirmed"),
    reject: (orderId) => transition(orderId, "rejected"),
  };
}
