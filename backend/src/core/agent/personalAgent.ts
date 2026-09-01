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
 * Parsed intent from a natural-language chat message.
 * When `shouldCheckAvailability` is true, the caller should run `compareAvailability`.
 */
export interface ChatIntent {
  item: string;
  quantity: number;
  city: string;
  category: BusinessType;
  neighborhood?: string;
  /** True when the user is requesting a product/availability search. */
  shouldCheckAvailability: boolean;
  /** True when the user is greeting/asking what Taiz can do (no action needed). */
  isGreeting: boolean;
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
  const settled = await Promise.allSettled(pending);
  const replies = settled
    .filter((r): r is PromiseFulfilledResult<AvailabilityReply> => r.status === "fulfilled" && r.value !== null)
    .map(r => r.value);
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

/**
 * Use the LLM to extract a structured intent from a natural-language message,
 * and to produce a friendly conversational reply.
 *
 * Throws if the LLM is unavailable (no API key) so the caller can surface a
 * clear error to the user.
 */
export async function parseChatIntent(
  llm: LLMRouter,
  message: string,
  context: { role: "user" | "assistant"; content: string }[],
  directory: DirectoryStore,
): Promise<{ intent: ChatIntent; reply: string }> {
  const knownCities = directory.listCities();
  const knownCategories = Array.from(directory.listCategories());

  const systemPrompt = `You are Taiz, a personal shopping assistant for bakeries and restaurants.
Your job: read the user's message and previous chat context, extract a structured intent, and write a short friendly reply.

Available categories: ${knownCategories.join(", ")}
Known cities in directory: ${knownCities.join(", ") || "(none — use user's city as given)"}

Return a JSON object with this exact shape:
{
  "intent": {
    "item": string,                  // what the user wants, e.g. "chocolate cake"
    "quantity": number,              // default 1
    "city": string,                  // city to search in (use what user said, or empty string if unclear)
    "category": "bakery" | "restaurant",  // which type of business
    "neighborhood": string | null,   // optional
    "shouldCheckAvailability": boolean,   // true if user is asking to find/order something
    "isGreeting": boolean                // true if user is just saying hi or asking what you can do
  },
  "reply": string                    // 1-2 sentence reply to show the user in chat
}

Rules:
- shouldCheckAvailability is true when user wants to find/order/buy something
- isGreeting is true for "hi", "hello", "what can you do", etc.
- Reply should be conversational, friendly, and short (max 2 sentences)
- If user wants to search but you can't determine item or city, set shouldCheckAvailability=false and ask a clarifying question in "reply"
- Do NOT include any text outside the JSON object`;

  const messages = [
    ...(context.length > 0 ? context : []),
    { role: "user" as const, content: message },
  ];

  let parsed: { intent?: Partial<ChatIntent>; reply?: string };
  try {
    const res = await llm.complete("personal_agent", {
      system: systemPrompt,
      messages,
      temperature: 0.3,
      jsonMode: true,
    });
    parsed = extractJsonObject(res.text) as { intent?: Partial<ChatIntent>; reply?: string };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "llm error";
    return {
      intent: {
        item: "",
        quantity: 1,
        city: "",
        category: "bakery",
        shouldCheckAvailability: false,
        isGreeting: false,
      },
      reply: `Sorry, I'm having trouble reaching the assistant right now. Please try again in a moment. (${detail})`,
    };
  }

  const intent: ChatIntent = normalizeIntent(parsed.intent, knownCategories);
  const reply =
    typeof parsed.reply === "string" && parsed.reply.trim().length > 0
      ? parsed.reply.trim()
      : "I'm here — what would you like me to find for you?";

  return { intent, reply };
}

/**
 * Extract the first balanced JSON object from a string. LLMs sometimes wrap
 * JSON in prose like "Sure! {...}" or add trailing commas; this is a forgiving
 * best-effort extractor. Returns the literal substring, or the original text
 * if nothing looks like JSON.
 */
function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("{")) {
    return tryParseBalanced(trimmed);
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return trimmed;
  return tryParseBalanced(trimmed.slice(first, last + 1));
}

function tryParseBalanced(candidate: string): unknown {
  try {
    return JSON.parse(candidate);
  } catch {
    /* fall through */
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < candidate.length; i++) {
    const ch = candidate[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(0, i + 1));
        } catch {
          /* keep scanning */
        }
      }
    }
  }
  try {
    return JSON.parse(candidate);
  } catch {
    return candidate;
  }
}

function normalizeIntent(raw: Partial<ChatIntent> | undefined, knownCategories: string[]): ChatIntent {
  const allowed: BusinessType =
    knownCategories.includes("bakery") || knownCategories.includes("restaurant")
      ? ((knownCategories.includes("bakery") ? "bakery" : "restaurant") as BusinessType)
      : "bakery";
  const category: BusinessType =
    raw?.category === "bakery" || raw?.category === "restaurant" ? raw.category : allowed;
  const quantity =
    typeof raw?.quantity === "number" && Number.isFinite(raw.quantity) && raw.quantity > 0
      ? Math.floor(raw.quantity)
      : 1;
  const item = typeof raw?.item === "string" ? raw.item.trim() : "";
  const city = typeof raw?.city === "string" ? raw.city.trim() : "";
  const neighborhood = typeof raw?.neighborhood === "string" && raw.neighborhood.trim().length > 0
    ? raw.neighborhood.trim()
    : undefined;
  return {
    item,
    quantity,
    city,
    category,
    neighborhood,
    shouldCheckAvailability: raw?.shouldCheckAvailability === true,
    isGreeting: raw?.isGreeting === true,
  };
}

export type { PersonalAgent };
