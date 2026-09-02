import { Hono } from "hono";
import { cors } from "hono/cors";
import type { CatalogStore } from "../core/catalog/catalogStore";
import type { DirectoryStore } from "../core/directory/directoryStore";
import type { LLMRouter } from "../core/llm/router";
import type { OrderService } from "../core/order/orderService";
import type { BusinessAgentHandle } from "../core/agent/businessAgent";
import type { PersonalAgent } from "../core/agent/types";
import { errorHandler } from "./middleware/errorHandler";
import { auth } from "./middleware/auth";
import { requestLogger } from "./middleware/requestLogger";
import { ok } from "./lib/response";
import { agentsRoutes } from "./routes/agents";
import { businessesRoutes } from "./routes/businesses";
import { ordersRoutes } from "./routes/orders";

/**
 * Everything the server needs, injected. Tests pass fakes; index.ts passes real.
 */
export interface AppDeps {
  llm: LLMRouter;
  directory: DirectoryStore;
  catalog: CatalogStore;
  orders: OrderService;
  personalAgents: Record<string, PersonalAgent>;
  businessAgents: Record<string, BusinessAgentHandle>;
}

export function createApp(deps: AppDeps): Hono {
  const app = new Hono();
  app.onError(errorHandler);
  app.use("*", requestLogger);
  app.use("*", auth);
  app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowHeaders: ["Content-Type", "Authorization"] }));

  app.get("/", (c) => ok(c, { name: "taiz-backend", status: "running" }));
  app.route("/agents", agentsRoutes(deps));
  app.route("/businesses", businessesRoutes(deps));
  app.route("/orders", ordersRoutes(deps));

  return app;
}
