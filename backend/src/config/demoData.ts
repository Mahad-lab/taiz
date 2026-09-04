import type { CatalogStore } from "../core/catalog/catalogStore";
import type { DirectoryStore } from "../core/directory/directoryStore";

export function seedDemoData(directory: DirectoryStore, catalog: CatalogStore): void {
  const listings = [
    { id: "biz-sunrise", name: "Sunrise Bakehouse", category: "bakery" as const, city: "Karachi", neighborhood: "DHA Phase 1", lat: 24.8607, lng: 67.0011 },
    { id: "biz-olive", name: "Olive Table", category: "bakery" as const, city: "Karachi", neighborhood: "Clifton", lat: 24.7895, lng: 67.0326 },
    { id: "biz-crust", name: "The Crust Bakery", category: "bakery" as const, city: "Karachi", neighborhood: "Gulistan-e-Jauhar", lat: 24.8449, lng: 67.0724 },
    { id: "biz-oven", name: "Neighborhood Oven", category: "bakery" as const, city: "Karachi", neighborhood: "North Nazimabad", lat: 24.9025, lng: 67.0578 },
    { id: "biz-dough", name: "Dough & Co.", category: "bakery" as const, city: "Karachi", neighborhood: "Bahdurabad", lat: 24.8624, lng: 67.0206 },
    { id: "biz-herb", name: "Herb & Wheat", category: "bakery" as const, city: "Karachi", neighborhood: "Sadat Colony", lat: 24.8722, lng: 67.0555 },
    { id: "biz-kitchen", name: "Kitchen Stories", category: "restaurant" as const, city: "Karachi", neighborhood: "DHA Phase 2", lat: 24.8471, lng: 67.0439 },
    { id: "biz-plate", name: "The Green Plate", category: "restaurant" as const, city: "Karachi", neighborhood: "Clifton", lat: 24.7912, lng: 67.0287 },
  ];
  for (const listing of listings) directory.add(listing);

  const products = [
    { id: "p-1", businessId: "biz-sunrise", name: "Croissant", price: 350, currency: "PKR", etaMinutes: 15 },
    { id: "p-2", businessId: "biz-sunrise", name: "Sourdough Loaf", price: 800, currency: "PKR", etaMinutes: 25 },
    { id: "p-3", businessId: "biz-sunrise", name: "Cupcake", price: 400, currency: "PKR", etaMinutes: 10 },
    { id: "p-4", businessId: "biz-olive", name: "Chocolate Fudge Cake", price: 1200, currency: "PKR", etaMinutes: 45 },
    { id: "p-5", businessId: "biz-olive", name: "Macaron Box", price: 650, currency: "PKR", etaMinutes: 20 },
    { id: "p-6", businessId: "biz-crust", name: "Croissant", price: 300, currency: "PKR", etaMinutes: 10 },
    { id: "p-7", businessId: "biz-crust", name: "Rye Bread", price: 550, currency: "PKR", etaMinutes: 30 },
    { id: "p-8", businessId: "biz-oven", name: "Cinnamon Roll", price: 550, currency: "PKR", etaMinutes: 15 },
    { id: "p-9", businessId: "biz-oven", name: "Banana Bread", price: 450, currency: "PKR", etaMinutes: 20 },
    { id: "p-10", businessId: "biz-dough", name: "Truffle Cake", price: 1500, currency: "PKR", etaMinutes: 60 },
    { id: "p-11", businessId: "biz-dough", name: "CaePKR Salad", price: 1900, currency: "PKR", etaMinutes: 20 },
    { id: "p-12", businessId: "biz-herb", name: "Lemon Tart", price: 500, currency: "PKR", etaMinutes: 25 },
    { id: "p-13", businessId: "biz-herb", name: "Cheese Danish", price: 450, currency: "PKR", etaMinutes: 15 },
    { id: "p-14", businessId: "biz-kitchen", name: "Margherita Pizza", price: 2800, currency: "PKR", etaMinutes: 30 },
    { id: "p-15", businessId: "biz-plate", name: "Pasta Carbonara", price: 1800, currency: "PKR", etaMinutes: 25 },
  ];
  for (const product of products) catalog.add(product);
}