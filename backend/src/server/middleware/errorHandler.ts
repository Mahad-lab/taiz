import { ZodError } from "zod";
import type { ErrorHandler } from "hono";
import { OrderError } from "../../core/order/orderService";
import { fail } from "../lib/response";

const ORDER_ERROR_STATUS: Record<string, 400 | 404 | 409> = {
  invalid_order: 400,
  not_found: 404,
  invalid_transition: 409,
};

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    const detail = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return fail(c, 400, "invalid_request", detail);
  }
  if (err instanceof OrderError) {
    return fail(c, ORDER_ERROR_STATUS[err.code] ?? 500, err.code, err.message);
  }
  console.error(err);
  return fail(c, 500, "internal_error", "unexpected server error");
};
