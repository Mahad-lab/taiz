import { loadEnv } from "./src/config/env";
import { seedDemoData } from "./src/config/demoData";
import { MODEL_SELECTION } from "./src/config/models";
import { createBusinessAgentHandle } from "./src/core/agent/businessAgent";
import type { PersonalAgent } from "./src/core/agent/types";
import { createCatalogStore } from "./src/core/catalog/catalogStore";
import { createDirectoryStore } from "./src/core/directory/directoryStore";
import { createProviderRegistry, createRouter } from "./src/core/llm/router";
import { createOrderService } from "./src/core/order/orderService";
import { createInMemoryOrderStore } from "./src/core/order/orderStore";
import { createApp } from "./src/server/app";
import { cors } from "hono/cors";

const directory = createDirectoryStore();
const catalog = createCatalogStore();
seedDemoData(directory, catalog);

const personalAgents: Record<string, PersonalAgent> = {
  "agent-user": { id: "agent-user", name: "Personal Agent", kind: "personal" },
};

export default {
  async fetch(request: Request, env?: { OPENAI_API_KEY?: string; OPENAI_BASE_URL?: string }): Promise<Response> {
    const appEnv = loadEnv({
      PORT: "3000",
      OPENAI_API_KEY: env?.OPENAI_API_KEY,
      OPENAI_BASE_URL: env?.OPENAI_BASE_URL,
    });

    const registry = createProviderRegistry({ openai: appEnv.openaiApiKey, openaiBaseUrl: appEnv.openaiBaseUrl });
    const llm = createRouter(registry, MODEL_SELECTION);

    const businessAgents = Object.fromEntries(
      directory.listAll().map((listing) => [
        listing.id,
        createBusinessAgentHandle(
          { id: listing.id, name: listing.name, kind: "business", category: listing.category },
          catalog,
        ),
      ]),
    );

    const app = createApp({
      llm,
      directory,
      catalog,
      orders: createOrderService(createInMemoryOrderStore()),
      personalAgents,
      businessAgents,
    });

    // Add CORS support for Cloudflare Workers
    app.use("*", cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }));

    return app.fetch(request);
  },
};
