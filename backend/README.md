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

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Directory data (D1)

Schema and seed data for the Karachi-only directory (`cities`, `zones`, `areas`)
live in `migrations/` and `seed-data/`. This is data-layer only -- no API
endpoints exist yet.

Apply the schema to a local D1 database (no Cloudflare account needed):

```bash
bun run db:migrate
```

Seed the `areas` table for Karachi from the committed source snapshot
(re-runnable; duplicates are skipped, not re-inserted):

```bash
bun run db:seed
```

Both commands default to `--local`. Append `:remote` (`db:migrate:remote`,
`db:seed:remote`) to target the real D1 database once `wrangler.toml`'s
placeholder `database_id` has been replaced with a real one from
`wrangler d1 create taiz-directory-db`.
