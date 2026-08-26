import type { RequestStatus } from "@/state/types";

export type TimelineStatus = "done" | "active" | "todo";

export interface TimelineStep {
  id: string;
  title: string;
  detail?: string;
  time?: string;
  status: TimelineStatus;
}

/** A single checklist item on the Agent Task screen. */
export interface AgentTaskStep {
  id: string;
  label: string;
}

/** A single line in the agent-to-agent negotiation transcript. */
export interface AgentChatLine {
  id: string;
  /** Which agent is speaking: the user's agent or the provider's agent. */
  from: "yours" | "provider";
  text: string;
  time: string;
  /** Highlights a concrete offer/counter-offer line in the negotiation. */
  offer?: boolean;
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

let seq = 0;
export const nextId = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${++seq}`;

/** The bakery-cake demo story used to wire the agent workflow end-to-end. */
export const DEMO = {
  customer: "Ayesha Khan",
  item: "Red Velvet Cake",
  budget: 2000,
  provider: "Grand Central Bakery",
  providerRating: 4.8,
  initialPrice: 3500,
  finalPrice: 2200,
  pickupLocation: "Grand Central Bakery",
  pickupDay: "Today",
  pickupTime: "2:00 PM",
  geoFence: "Gulberg, Lahore · 5 km radius",
  userPrompt: "I need a red velvet cake for pickup today, my budget is around 2000 PKR",
};

export const buildAgentTaskSteps = (): AgentTaskStep[] =>
  [
    { label: "Understanding your request" },
    { label: `Searching nearby providers in ${DEMO.geoFence}` },
    { label: `Contacting ${DEMO.provider} and 2 others` },
    { label: "Comparing responses" },
  ].map(step => ({ ...step, id: nextId("task") }));

export const buildTimeline = (): TimelineStep[] => [
  {
    id: nextId("step"),
    title: "Found 3 nearby providers",
    detail: "Matched on category, distance, and availability.",
    time: formatTime(new Date(Date.now() - 3 * 60_000)),
    status: "done",
  },
  {
    id: nextId("step"),
    title: `Negotiating with ${DEMO.provider}`,
    detail: `Opening quote: ${DEMO.initialPrice.toLocaleString()} PKR.`,
    time: formatTime(new Date(Date.now() - 60_000)),
    status: "done",
  },
  {
    id: nextId("step"),
    title: "Waiting for counter-offer...",
    detail: "Expected response in ~1 min.",
    status: "active",
  },
];

const MILESTONES: { title: string; detail: string }[] = [
  { title: "Request created", detail: `${DEMO.item} · budget ${DEMO.budget.toLocaleString()} PKR` },
  { title: "Agent searching nearby providers", detail: DEMO.geoFence },
  { title: `Negotiating with ${DEMO.provider}`, detail: `Opening quote ${DEMO.initialPrice.toLocaleString()} PKR` },
  { title: "Best option ready for review", detail: `Negotiated ${DEMO.finalPrice.toLocaleString()} PKR` },
  { title: "Booking confirmed", detail: `Pickup ${DEMO.pickupDay} at ${DEMO.pickupTime}` },
];

const STATUS_INDEX: Record<RequestStatus, number> = {
  searching: 1,
  negotiating: 2,
  review: 3,
  confirmed: 4,
  declined: -1,
};

/** Request-lifecycle milestones shown on the Activity screen. */
export const buildActivitySteps = (status: RequestStatus): TimelineStep[] => {
  if (status === "declined") {
    return [
      ...MILESTONES.slice(0, 2).map((milestone, i) => ({
        id: nextId("act"),
        title: milestone.title,
        detail: milestone.detail,
        time: formatTime(new Date(Date.now() - (6 - i * 2) * 60_000)),
        status: "done" as const,
      })),
      {
        id: nextId("act"),
        title: "Offer declined",
        detail: "The negotiated offer was not accepted.",
        time: "NOW",
        status: "active",
      },
    ];
  }
  const idx = STATUS_INDEX[status];
  return MILESTONES.map((milestone, i) => ({
    id: nextId("act"),
    title: milestone.title,
    detail: milestone.detail,
    time: i < idx ? formatTime(new Date(Date.now() - (idx - i) * 2 * 60_000)) : undefined,
    status: i < idx ? "done" : i === idx ? "active" : "todo",
  }));
};

/** Past customer orders shown on the Activity screen's history. */
export const PAST_ORDERS: { id: string; item: string; provider: string; price: number; day: string; status: "confirmed" | "declined" }[] = [
  { id: "past-1", item: "Vanilla Birthday Cake", provider: "Grand Central Bakery", price: 3200, day: "Yesterday", status: "confirmed" },
  { id: "past-2", item: "Chocolate Truffle Cupcakes", provider: "Sweet Tooth Co.", price: 1450, day: "2 weeks ago", status: "confirmed" },
  { id: "past-3", item: "Apple Crumble Pie", provider: "Honey Crust", price: 1800, day: "Last month", status: "declined" },
];

/** Secondary options shown alongside the top recommendation on the Results screen. */
export const OTHER_OPTIONS: { id: string; provider: string; price: number; time: string }[] = [
  { id: "opt-1", provider: "Sweet Tooth Co.", price: 2800, time: "1:00 PM" },
  { id: "opt-2", provider: "Honey Crust Bakery", price: 3000, time: "3:30 PM" },
];

/** The scripted negotiation transcript between the customer's agent and the provider's agent. */
export const buildAgentChat = (): AgentChatLine[] =>
  (
    [
      {
        from: "yours",
        text: `Hi! My client is looking for a ${DEMO.item}, pickup ${DEMO.pickupDay.toLowerCase()}. Budget is around ${DEMO.budget.toLocaleString()} PKR. Do you have availability?`,
        time: formatTime(new Date(Date.now() - 5 * 60_000)),
      },
      {
        from: "provider",
        text: `Yes — we have a slot ${DEMO.pickupDay.toLowerCase()} at ${DEMO.pickupTime}. Our standard price for a 1kg ${DEMO.item} is ${DEMO.initialPrice.toLocaleString()} PKR.`,
        time: formatTime(new Date(Date.now() - 4 * 60_000)),
        offer: true,
      },
      {
        from: "yours",
        text: `That's above my client's budget. Can you do ${DEMO.budget.toLocaleString()} PKR?`,
        time: formatTime(new Date(Date.now() - 3 * 60_000)),
        offer: true,
      },
      {
        from: "provider",
        text: `${DEMO.budget.toLocaleString()} PKR is below our cost margin. I can offer ${(DEMO.finalPrice + 300).toLocaleString()} PKR.`,
        time: formatTime(new Date(Date.now() - 2 * 60_000)),
        offer: true,
      },
      {
        from: "yours",
        text: `My client authorized a final counter of ${DEMO.finalPrice.toLocaleString()} PKR. Can we close at that?`,
        time: formatTime(new Date(Date.now() - 60_000)),
        offer: true,
      },
      {
        from: "provider",
        text: `Deal. ${DEMO.finalPrice.toLocaleString()} PKR, pickup ${DEMO.pickupDay} at ${DEMO.pickupTime}.`,
        time: "NOW",
        offer: true,
      },
    ] satisfies Omit<AgentChatLine, "id">[]
  ).map(line => ({ ...line, id: nextId("a2a") }));

export interface DiscoverProvider {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  rating: number;
  verified: boolean;
  availability: string;
  priceFrom: number;
}

export const DISCOVER_CATEGORIES = ["Food", "Home", "Auto", "Shopping", "Health", "Services"] as const;

/** Nearby providers shown on the Discover directory (demo data, geography-first). */
export const NEARBY_PROVIDERS: DiscoverProvider[] = [
  { id: "prov-1", name: "Grand Central Bakery", category: "Food", distanceKm: 1.2, rating: 4.8, verified: true, availability: "Available today", priceFrom: 1500 },
  { id: "prov-2", name: "Sweet Tooth Co.", category: "Food", distanceKm: 2.1, rating: 4.6, verified: true, availability: "Available tomorrow", priceFrom: 1200 },
  { id: "prov-3", name: "Ahmed Plumbing", category: "Home", distanceKm: 0.9, rating: 4.7, verified: true, availability: "Available today", priceFrom: 2000 },
  { id: "prov-4", name: "Speedy Auto Care", category: "Auto", distanceKm: 3.4, rating: 4.5, verified: false, availability: "Available tomorrow", priceFrom: 2500 },
  { id: "prov-5", name: "Lahore Home Clinic", category: "Health", distanceKm: 2.8, rating: 4.9, verified: true, availability: "Available today", priceFrom: 1800 },
];

/** Timings (ms) for scripted agent runs. Kept in one place for easy tuning. */
export const TIMINGS = {
  checklistStep: 900,
  checklistHold: 1_400,
  timelineStep: 1_600,
  timelineHold: 1_800,
} as const;
