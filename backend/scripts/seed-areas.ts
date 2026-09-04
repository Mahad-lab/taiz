/**
 * Seeds the `areas` table for Karachi from the committed source snapshot at
 * seed-data/karachi-areas.source.json (see seed-data/README.md for
 * provenance and how to refresh it).
 *
 * Idempotent: safe to re-run. Relies on the UNIQUE(city_id, name) constraint
 * on `areas` plus INSERT OR IGNORE, so rows already present are silently
 * skipped rather than duplicated or erroring.
 *
 * Usage:
 *   bun run scripts/seed-areas.ts            # seeds the local D1 (dev) database
 *   bun run scripts/seed-areas.ts --remote    # seeds the real remote D1 database
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CITY_NAME = "Karachi";
const DB_NAME = "taiz-directory-db";
const SOURCE_PATH = join(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
  "seed-data",
  "karachi-areas.source.json",
);

type AreaEntry = { name: string };

function loadSourceAreas(): AreaEntry[] {
  const raw = readFileSync(SOURCE_PATH, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Expected ${SOURCE_PATH} to contain a JSON array, got ${typeof data}`);
  }
  return data;
}

function dedupeExact(entries: AreaEntry[]) {
  const seen = new Set<string>();
  const unique: string[] = [];
  const duplicates: string[] = [];
  for (const entry of entries) {
    const name = entry.name;
    if (seen.has(name)) {
      duplicates.push(name);
    } else {
      seen.add(name);
      unique.push(name);
    }
  }
  return { unique, duplicates };
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

const BACKEND_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "..");

// Invoke wrangler's own entry script directly with the current runtime
// (node or bun) rather than shelling out to the `wrangler`/`npx` command --
// on Windows, execFileSync can't launch the installed .cmd shim without a
// shell, and shelling out reintroduces argument-escaping risk for no benefit
// when we already know exactly where the package lives.
const WRANGLER_BIN = join(BACKEND_DIR, "node_modules", "wrangler", "bin", "wrangler.js");

function runWranglerJson(args: string[]): any {
  const output = execFileSync(process.execPath, [WRANGLER_BIN, ...args], {
    encoding: "utf8",
    cwd: BACKEND_DIR,
  });
  return JSON.parse(output);
}

function queryAreaCount(remote: boolean): number {
  const result = runWranglerJson([
    "d1", "execute", DB_NAME,
    remote ? "--remote" : "--local",
    "--command",
    `SELECT COUNT(*) AS c FROM areas WHERE city_id = (SELECT id FROM cities WHERE name = '${escapeSqlString(CITY_NAME)}')`,
    "--json",
  ]);
  return result[0].results[0].c as number;
}

function insertAreas(names: string[], remote: boolean): void {
  if (names.length === 0) return;

  const statements = names.map(
    (name) =>
      `INSERT OR IGNORE INTO areas (city_id, name, zone_id) SELECT id, '${escapeSqlString(name)}', NULL FROM cities WHERE name = '${escapeSqlString(CITY_NAME)}';`,
  );

  const tmpDir = mkdtempSync(join(tmpdir(), "taiz-seed-"));
  const sqlFile = join(tmpDir, "insert-areas.sql");
  try {
    writeFileSync(sqlFile, statements.join("\n"), "utf8");
    runWranglerJson(["d1", "execute", DB_NAME, remote ? "--remote" : "--local", "--file", sqlFile, "--json"]);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

function main() {
  const remote = process.argv.includes("--remote");

  const source = loadSourceAreas();
  const { unique, duplicates } = dedupeExact(source);

  const before = queryAreaCount(remote);
  insertAreas(unique, remote);
  const after = queryAreaCount(remote);
  const actuallyInserted = after - before;

  console.log(`Target: ${remote ? "remote" : "local"} D1 database "${DB_NAME}", city "${CITY_NAME}"`);
  console.log(`Total rows in source file: ${source.length}`);
  console.log(`Unique area names in source: ${unique.length}`);
  console.log(`Duplicate names skipped (appear more than once in source): ${duplicates.length}`);
  if (duplicates.length > 0) {
    for (const name of duplicates) console.log(`  - ${name}`);
  }
  console.log(`Rows actually inserted into the database this run: ${actuallyInserted}`);
  console.log(`Rows already present (no-op, safe to re-run): ${unique.length - actuallyInserted}`);
  console.log(`Total areas now in database for ${CITY_NAME}: ${after}`);
}

main();
