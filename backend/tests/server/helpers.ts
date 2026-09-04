import type { Hono } from "hono";
import { seedDemoData } from "../../src/config/demoData";
import { createBusinessAgentHandle } from "../../src/core/agent/businessAgent";
import type { PersonalAgent } from "../../src/core/agent/types";
import { createCatalogStore, type CatalogStore } from "../../src/core/catalog/catalogStore";
import { createDirectoryStore, type DirectoryStore } from "../../src/core/directory/directoryStore";
import { createRouter } from "../../src/core/llm/router";
import { createOrderService } from "../../src/core/order/orderService";
import { createInMemoryOrderStore } from "../../src/core/order/orderStore";
import { createApp } from "../../src/server/app";
import { fakeProvider } from "../helpers/fakes";

export function buildTestApp(): {
  app: Hono;
  directory: DirectoryStore;
  catalog: CatalogStore;
} {
  const directory = createDirectoryStore();
  const catalog = createCatalogStore();
  seedDemoData(directory, catalog);

  const llm = createRouter(
    { fake: fakeProvider("fake") },
    {
      personal_agent: { provider: "fake", model: "fake-model" },
      business_agent: { provider: "fake", model: "fake-model" },
    },
  );

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

  return { app, directory, catalog };
}

export function postJson(app: Hono, path: string, body: unknown): Promise<Response> {
  return Promise.resolve(
    app.request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

/** Typed escape hatch for response bodies in assertions. */
export function readJson<T = any>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}
