import tailwind from "bun-plugin-tailwind";
import { rm } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

const entrypoints = [...new Bun.Glob("src/**/*.html").scanSync()];

const define: Record<string, string> = {
  "process.env.NODE_ENV": JSON.stringify("production"),
  // Default so prod builds (e.g. Cloudflare Pages without .env) never leave a
  // literal process.env reference behind, which would crash in the browser.
  "process.env.BUN_PUBLIC_API_BASE": JSON.stringify(
    process.env.BUN_PUBLIC_API_BASE ?? "http://localhost:4000",
  ),
};
for (const key of Object.keys(process.env)) {
  if (!key.startsWith("BUN_PUBLIC_") && !key.startsWith("VITE_")) continue;
  define[`process.env.${key}`] = JSON.stringify(process.env[key]);
}

const result = await Bun.build({
  entrypoints,
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  define,
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}
