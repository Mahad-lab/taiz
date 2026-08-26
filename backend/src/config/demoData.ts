import type { CatalogStore } from "../core/catalog/catalogStore";
import type { DirectoryStore } from "../core/directory/directoryStore";

/**
 * Sample businesses + catalogs so `bun run dev` has something to talk to.
 * Pure wiring — no business logic.
 */
export function seedDemoData(directory: DirectoryStore, catalog: CatalogStore): void {
  const listings = [
    {
      id: "biz-sunrise",
      name: "Sunrise Bakehouse",
      category: "bakery" as const,
      city: "Karachi",
      neighborhood: "DHA Phase 1",
    },
    {
      id: "biz-oven",
      name: "Neighborhood Oven",
      category: "bakery" as const,
      city: "Karachi",
      neighborhood: "DHA Phase 2",
    },
    {
      id: "biz-olive",
      name: "Olive Table",
      category: "restaurant" as const,
      city: "Karachi",
      neighborhood: "DHA Phase 1",
    },
  ];
  for (const listing of listings) directory.add(listing);

  const products = [
    { id: "p-1", businessId: "biz-sunrise", name: "Croissant", price: 350, currency: "PKR", etaMinutes: 15 },
    { id: "p-2", businessId: "biz-sunrise", name: "Sourdough Loaf", price: 800, currency: "PKR", etaMinutes: 25 },
    { id: "p-3", businessId: "biz-sunrise", name: "Cupcake", price: 400, currency: "PKR", etaMinutes: 10 },
    { id: "p-4", businessId: "biz-oven", name: "Croissant", price: 400, currency: "PKR", etaMinutes: 20 },
    { id: "p-5", businessId: "biz-oven", name: "Cinnamon Roll", price: 550, currency: "PKR", etaMinutes: 15 },
    { id: "p-6", businessId: "biz-olive", name: "Margherita Pizza", price: 2800, currency: "PKR", etaMinutes: 30 },
    { id: "p-7", businessId: "biz-olive", name: "CaePKR Salad", price: 1900, currency: "PKR", etaMinutes: 20 },
  ];
  for (const product of products) catalog.add(product);
}
