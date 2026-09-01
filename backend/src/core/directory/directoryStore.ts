import type { BusinessType } from "../catalog/types";
import type { AreaQuery, BusinessListing } from "./types";

export interface DirectoryStore {
  findByArea(query: AreaQuery, category?: BusinessType): BusinessListing[];
  getById(id: string): BusinessListing | undefined;
  listAll(): BusinessListing[];
  add(listing: BusinessListing): void;
  listCities(): string[];
  listCategories(): BusinessType[];
}

export function createDirectoryStore(): DirectoryStore {
  const listings = new Map<string, BusinessListing>();

  const listAll = (): BusinessListing[] => [...listings.values()];

  const findByArea = (query: AreaQuery, category?: BusinessType): BusinessListing[] => {
    return listAll().filter((l) => {
      if (l.city.toLowerCase() !== query.city.toLowerCase()) return false;
      if (query.neighborhood && l.neighborhood.toLowerCase() !== query.neighborhood.toLowerCase()) return false;
      if (category !== undefined && l.category !== category) return false;
      if (query.lat !== undefined && query.lng !== undefined && query.radius !== undefined) {
        const R = 6371;
        const dLat = (l.lat - query.lat) * Math.PI / 180;
        const dLng = (l.lng - query.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(query.lat * Math.PI / 180) * Math.cos(l.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (c * R > query.radius) return false;
      }
      return true;
    });
  };

  return {
    findByArea,
    getById: (id) => listings.get(id),
    listAll,
    add: (listing) => void listings.set(listing.id, listing),
    listCities: () => Array.from(new Set(listAll().map(l => l.city))).sort(),
    listCategories: () => Array.from(new Set(listAll().map(l => l.category))) as BusinessType[],
  };
}
