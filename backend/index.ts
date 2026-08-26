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

const env = loadEnv();

const directory = createDirectoryStore();
const catalog = createCatalogStore();
seedDemoData(directory, catalog);

const registry = createProviderRegistry({ openai: env.openaiApiKey });
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

const personalAgents: Record<string, PersonalAgent> = {
  "agent-user": { id: "agent-user", name: "Personal Agent", kind: "personal" },
};

const app = createApp({
  llm,
  directory,
  catalog,
  orders: createOrderService(createInMemoryOrderStore()),
  personalAgents,
  businessAgents,
});

Bun.serve({ port: env.port, fetch: app.fetch });
console.log(`taiz backend listening on http://localhost:${env.port}`);
if (!env.openaiApiKey) {
  console.log("note: OPENAI_API_KEY not set — LLM summaries are skipped, core flow still works");
}
