import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
});

export interface Env {
  port: number;
  openaiApiKey?: string;
  openaiBaseUrl?: string;
}

/**
 * Load env from a .env file in the backend's own directory, then layer
 * process.env on top. We resolve the .env relative to this file so the
 * backend works regardless of the working directory it was started from
 * (Bun only auto-loads .env from cwd, which may be the monorepo root).
 */
function loadDotEnv(): Record<string, string> {
  const here = dirname(new URL(import.meta.url).pathname);
  const candidates = [resolve(here, "..", "..", ".env"), resolve(here, "..", "..", "..", ".env")];
  for (const path of candidates) {
    if (existsSync(path)) {
      const out: Record<string, string> = {};
      for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        out[key] = value;
      }
      return out;
    }
  }
  return {};
}

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const fileEnv = loadDotEnv();
  const merged: Record<string, string | undefined> = { ...fileEnv, ...source };
  const parsed = envSchema.safeParse(merged);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`invalid environment: ${detail}`);
  }
  return {
    port: parsed.data.PORT,
    openaiApiKey: parsed.data.OPENAI_API_KEY,
    openaiBaseUrl: parsed.data.OPENAI_BASE_URL,
  };
}
