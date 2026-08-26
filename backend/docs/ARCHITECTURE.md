# Architecture

```
HTTP ──► server/ (Hono)                core/ (pure domain)            config/
        routes/agents.ts    ──────►    agent/personalAgent.ts  ◄───  models.ts
        routes/businesses.ts ─────►    agent/businessAgent.ts
        routes/orders.ts    ──────►    order/orderService.ts
        middleware/*                   catalog/catalogStore.ts
        lib/response.ts                directory/directoryStore.ts
                                       llm/router.ts ──► llm/providers/*
```

**Dependency rule:** `server → core`, never the reverse. `core/` imports nothing
from Hono and touches no network (except LLM providers, which are injected).

## src/core

- **`llm/`** — provider-agnostic LLM access. `types.ts` defines the only request/
  response shapes business logic ever sees. Every vendor implements the one-method
  `Provider` interface in its own file. `router.ts` holds the registry and maps a
  logical use-case (`"personal_agent"`) to a provider+model from `config/models.ts`.
- **`agent/`** — the two sides of a conversation. `businessAgent.ts` answers
  availability questions from its catalog with a closed reply shape
  (available/unavailable + price + ETA — there is structurally no room for a
  counter-offer). `personalAgent.ts` fans one availability request out to N
  businesses in parallel, collects replies, and sorts them available-first /
  cheapest-first. Comparison, not negotiation.
- **`catalog/`** — fixed-price products per business. Presence in the catalog is
  availability; the listed price is the only price.
- **`order/`** — orders as an explicit state machine:
  `pending_approval → approved → confirmed` (+ terminal `rejected`). Illegal
  transitions throw; an order cannot leave pending_approval without a human call.
  In-memory store lives behind an `OrderStore` interface.
- **`directory/`** — business listings and geography; find businesses by city +
  neighborhood + category (bakery | restaurant only).

## src/server

Thin HTTP layer. Each route file: parse + validate (zod) → call one core function →
wrap in `{ ok, data }` / `{ ok, error }`. `app.ts` exports `createApp(deps)` so
tests inject fake providers and in-memory stores. Middleware today: a global error
handler that maps core errors to status codes (409 for illegal transitions), and an
auth pass-through stub.

## src/config

`env.ts` validates environment variables with zod. `models.ts` picks the
provider/model per use-case. `demoData.ts` seeds sample bakeries/restaurants.

## tests

Mirrors `src/` one-to-one using `bun:test`. Core tests are pure units with fake
providers. Server tests hit real routes via Hono's `app.request()`.
`tests/server/fullFlow.test.ts` runs the whole product story end-to-end:
ask → fan-out → comparison → order → approval gate → confirmed.

## Deliberate non-goals

No price negotiation anywhere. No generic "service provider" abstraction —
bakeries and restaurants with fixed catalogs only. No plugin systems — a plain
registry object for providers.
