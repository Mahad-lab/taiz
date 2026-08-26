import type { BusinessType } from "../catalog/types";

export interface BusinessListing {
  id: string;
  name: string;
  category: BusinessType;
  city: string;
  neighborhood: string;
}

export interface AreaQuery {
  city: string;
  neighborhood?: string;
}
