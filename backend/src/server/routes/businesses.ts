import { Hono } from "hono";
import type { AppDeps } from "../app";
import { fail, ok } from "../lib/response";

export function businessesRoutes(deps: AppDeps): Hono {
  const app = new Hono();

  app.get("/", (c) => {
    const city = c.req.query("city");
    const neighborhood = c.req.query("neighborhood");
    const category = c.req.query("category");

    if (!city) return ok(c, { businesses: deps.directory.listAll() });

    if (category !== undefined && category !== "bakery" && category !== "restaurant") {
      return fail(c, 400, "invalid_request", "category must be \"bakery\" or \"restaurant\"");
    }
    const listings = deps.directory.findByArea(
      { city, neighborhood },
      category === undefined ? undefined : (category as "bakery" | "restaurant"),
    );
    return ok(c, { businesses: listings });
  });

  app.get("/:id/catalog", (c) => {
    const id = c.req.param("id");
    const listing = deps.directory.getById(id);
    if (!listing) return fail(c, 404, "not_found", `business "${id}" not found`);
    return ok(c, { business: listing, products: deps.catalog.listByBusiness(id) });
  });

  return app;
}
