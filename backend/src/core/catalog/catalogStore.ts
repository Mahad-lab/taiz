import type { Product } from "./types";

export interface CatalogStore {
  listByBusiness(businessId: string): Product[];
  getProduct(businessId: string, productId: string): Product | undefined;
  findItem(businessId: string, itemName: string): Product | undefined;
  add(product: Product): void;
}

export function createCatalogStore(): CatalogStore {
  const byBusiness = new Map<string, Map<string, Product>>();

  const listByBusiness = (businessId: string): Product[] =>
    [...(byBusiness.get(businessId)?.values() ?? [])];

  return {
    listByBusiness,
    getProduct: (businessId, productId) => byBusiness.get(businessId)?.get(productId),
    findItem: (businessId, itemName) => {
      const needle = normalize(itemName);
      return listByBusiness(businessId).find((p) => normalize(p.name) === needle);
    },
    add: (product) => {
      const items = byBusiness.get(product.businessId) ?? new Map<string, Product>();
      items.set(product.id, product);
      byBusiness.set(product.businessId, items);
    },
  };
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}
