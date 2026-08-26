# Taiz Backend

Federated personal-agent platform: a user's personal agent discovers bakery and
restaurant items across business agents and places orders at **fixed, listed
prices**. There is no price negotiation in Taiz — anywhere.

Built with [Hono](https://hono.dev) on [Bun](https://bun.com).

## Install

```bash
bun install
```

## Environment variables

| Var              | Required | Default | Purpose                                   |
| ---------------- | -------- | ------- | ----------------------------------------- |
| `PORT`           | no       | `3000`  | HTTP port                                 |
| `OPENAI_API_KEY` | no       | —       | Enables LLM summaries; core flow works without it |

Copy `.env.example` (or create `.env`) if you want non-defaults.

## Run

```bash
bun run dev        # http://localhost:3000
```

Seeded demo data includes two bakeries (`biz-sunrise`, `biz-oven`) and one
restaurant (`biz-olive`).

## Try it

```bash
# Compare croissants across all Karachi bakeries via the personal agent
curl -s localhost:3000/agents/agent-user/message \
  -H 'content-type: application/json' \
  -d '{"item":"Croissant","quantity":6,"city":"Karachi","category":"bakery"}'

# Place an order for the cheapest result (human-approval gate applies)
curl -s localhost:3000/orders \
  -H 'content-type: application/json' \
  -d '{"personalAgentId":"agent-user","businessId":"biz-sunrise","items":[{"productId":"p-1","quantity":6}]}'

# Human approves, then confirms (confirming before approval → 409)
curl -s -X POST localhost:3000/orders/<id>/approve
curl -s -X POST localhost:3000/orders/<id>/confirm
```

## Test

```bash
bun test           # unit + integration + full-flow tests
bun run typecheck  # tsc --noEmit
```

## Layout

- `src/core/` — pure domain logic. No HTTP, no framework. Fully testable offline.
- `src/server/` — thin Hono layer: parse request → call a core function → shape response.
- `src/config/` — env validation, model selection, demo seed data.
- `tests/` — mirrors `src/`; uses `bun:test`. See `docs/ARCHITECTURE.md`.
