import type { BusinessType } from "../catalog/types";
import type { AreaQuery, BusinessListing } from "./types";

export interface DirectoryStore {
  findByArea(query: AreaQuery, category?: BusinessType): BusinessListing[];
  getById(id: string): BusinessListing | undefined;
  listAll(): BusinessListing[];
  add(listing: BusinessListing): void;
}

export function createDirectoryStore(): DirectoryStore {
  const listings = new Map<string, BusinessListing>();

  const listAll = (): BusinessListing[] => [...listings.values()];

  const findByArea = (query: AreaQuery, category?: BusinessType): BusinessListing[] =>
    listAll().filter(
      (l) =>
        l.city.toLowerCase() === query.city.toLowerCase() &&
        (query.neighborhood === undefined ||
          l.neighborhood.toLowerCase() === query.neighborhood.toLowerCase()) &&
        (category === undefined || l.category === category),
    );

  return {
    findByArea,
    getById: (id) => listings.get(id),
    listAll,
    add: (listing) => void listings.set(listing.id, listing),
  };
}
