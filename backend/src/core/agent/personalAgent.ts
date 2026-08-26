import type { BusinessType } from "../catalog/types";
import type { DirectoryStore } from "../directory/directoryStore";
import type { LLMRouter } from "../llm/router";
import type { AvailabilityReply, AvailabilityRequest, PersonalAgent } from "./types";

/** What the personal agent needs to reach business agents. */
export type BusinessAgentLookup = (businessId: string) =>
  | { checkAvailability(req: AvailabilityRequest): Promise<AvailabilityReply> }
  | undefined;

export interface ComparisonRequest {
  item: string;
  quantity: number;
  city: string;
  neighborhood?: string;
  category: BusinessType;
}

export interface AvailabilityComparison {
  item: string;
  quantity: number;
  /** Available first, then cheapest. Unavailable replies kept for transparency. */
  replies: AvailabilityReply[];
}

/**
 * Discovery = fan the same availability request out to N businesses in
 * parallel, collect, sort. This is comparison, not negotiation.
 */
export async function compareAvailability(
  directory: DirectoryStore,
  lookup: BusinessAgentLookup,
  req: ComparisonRequest,
): Promise<AvailabilityComparison> {
  const listings = directory.findByArea(
    { city: req.city, neighborhood: req.neighborhood },
    req.category,
  );
  const pending = listings.map((listing) => {
    const client = lookup(listing.id);
    if (!client) return null;
    return client.checkAvailability({ item: req.item, quantity: req.quantity });
  });
  const settled = await Promise.all(pending);
  const replies = settled.filter((r): r is AvailabilityReply => r !== null);
  return { item: req.item, quantity: req.quantity, replies: sortReplies(replies) };
}

export function sortReplies(replies: AvailabilityReply[]): AvailabilityReply[] {
  return [...replies].sort((a, b) => {
    const aOk = a.status === "available" ? 0 : 1;
    const bOk = b.status === "available" ? 0 : 1;
    if (aOk !== bOk) return aOk - bOk;
    if (aOk === 0) return (a.price ?? Infinity) - (b.price ?? Infinity);
    return 0;
  });
}

/** Optional natural-language summary via the LLM router ("personal_agent"). */
export async function summarizeComparison(
  llm: LLMRouter,
  comparison: AvailabilityComparison,
): Promise<string> {
  const res = await llm.complete("personal_agent", {
    system:
      "You summarize product availability comparisons for a user. State prices exactly as given. Never invent discounts.",
    messages: [{ role: "user", content: JSON.stringify(comparison) }],
  });
  return res.text;
}

export type { PersonalAgent };
