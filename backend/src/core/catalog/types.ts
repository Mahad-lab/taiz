/** Taiz is bakeries and restaurants only, selling at fixed listed prices. */
export type BusinessType = "bakery" | "restaurant";

export interface Product {
  id: string;
  businessId: string;
  name: string;
  /** Fixed listed price. There is no negotiation in Taiz. */
  price: number;
  currency: string;
  etaMinutes?: number;
}

/**
 * Availability = the business has the item at its listed price, or it doesn't.
 * No counter-offers, no discounts.
 */
export type AvailabilityStatus = "available" | "unavailable";
