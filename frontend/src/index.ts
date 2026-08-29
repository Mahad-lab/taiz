import { serve } from "bun";
import index from "./index.html";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const server = serve({
  routes: {
    // Proxy API calls to the Taiz backend (single origin, no CORS).
    "/api/*": async (req) => {
      const url = new URL(req.url);
      const target = `${BACKEND_URL}${url.pathname.replace(/^\/api/, "")}${url.search}`;
      return fetch(target, {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      });
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url} (proxying /api → ${BACKEND_URL})`);
