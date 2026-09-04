import type { MiddlewareHandler } from "hono";

/**
 * Logs every incoming request: method, path, status and how long the
 * response cycle took to complete.
 */
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = performance.now();
  const { method } = c.req;
  const path = c.req.path;

  await next();

  const durationMs = performance.now() - start;
  const status = c.res.status;
  console.log(
    `[${new Date().toISOString()}] ${method} ${path} -> ${status} (${durationMs.toFixed(2)}ms)`,
  );
};
