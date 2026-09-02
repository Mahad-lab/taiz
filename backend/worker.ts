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

const directory = createDirectoryStore();
const catalog = createCatalogStore();
seedDemoData(directory, catalog);

const personalAgents: Record<string, PersonalAgent> = {
  "agent-user": { id: "agent-user", name: "Personal Agent", kind: "personal" },
};

export default {
  async fetch(request: Request, cfEnv?: { OPENAI_API_KEY?: string; OPENAI_BASE_URL?: string }): Promise<Response> {
    const env = loadEnv({
      PORT: "3000",
      OPENAI_API_KEY: cfEnv?.OPENAI_API_KEY,
      OPENAI_BASE_URL: cfEnv?.OPENAI_BASE_URL,
    });

    const registry = createProviderRegistry({ openai: env.openaiApiKey, openaiBaseUrl: env.openaiBaseUrl });
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

    return app.fetch(request);
  },
};
