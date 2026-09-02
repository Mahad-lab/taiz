// Bun replaces literal `process.env.BUN_PUBLIC_*` references with their values
// in client code (bunfig.toml [serve.static] env, plus defines in build.ts),
// so no `process` exists in the browser bundle. Do NOT use dynamic access
// like process.env[key] — Bun only inlines literal member expressions.
export const API_BASE = process.env.BUN_PUBLIC_API_BASE || "http://localhost:4000";
