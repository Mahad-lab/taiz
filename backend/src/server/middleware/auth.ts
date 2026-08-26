import type { MiddlewareHandler } from "hono";

/**
 * Pass-through for now.
 * TODO: authenticate callers — personal-agent identity tokens, and a shared
 * admin credential for the human-approval endpoints (approve/confirm/reject).
 */
export const auth: MiddlewareHandler = async (_c, next) => {
  await next();
};
