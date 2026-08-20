import type { ChatMessage, RequestStatus } from "@/state/types";

export type TerminalKind = "dim" | "info" | "highlight" | "awaiting";

export interface TerminalLine {
  id: string;
  text: string;
  kind: TerminalKind;
}

export type TimelineStatus = "done" | "active" | "todo";

export interface TimelineStep {
  id: string;
  title: string;
  detail?: string;
  time?: string;
  status: TimelineStatus;
}

/** A single line in the agent-to-agent negotiation transcript. */
export interface AgentChatLine {
  id: string;
  /** Which agent is speaking: the user's agent or the provider's agent. */
  from: "yours" | "provider";
  text: string;
  time: string;
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

let seq = 0;
export const nextId = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${++seq}`;

/** The bakery-cake demo story used to wire the A2A flow end-to-end. */
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
  geoFence: "[31.5204° N, 74.3587° E] radius 5 km",
  userPrompt: "I need a red velvet cake for pickup tomorrow, my budget is around 2000 PKR",
  agentAck: "Got it! I'm contacting local bakeries and negotiating for you now...",
};

export const buildTerminal = (): TerminalLine[] =>
  (
    [
      { text: "> Initializing background sequence...", kind: "dim" },
      { text: `> Target acquired: Geo-fence ${DEMO.geoFence}`, kind: "dim" },
      { text: "1. Scanning directory for local bakeries...", kind: "highlight" },
      { text: `2. Contacting '${DEMO.provider}' Agent...`, kind: "highlight" },
      { text: `3. Asking for inventory check (${DEMO.item})...`, kind: "info" },
      { text: "> Awaiting response...", kind: "awaiting" },
    ] satisfies Omit<TerminalLine, "id">[]
  ).map(line => ({ ...line, id: nextId("term") }));

export const buildTimeline = (): TimelineStep[] => [
  {
    id: nextId("step"),
    title: "Finding available bakeries...",
    detail: "Identified 3 potential matches.",
    time: formatTime(new Date(Date.now() - 3 * 60_000)),
    status: "done",
  },
  {
    id: nextId("step"),
    title: `Negotiating price with ${DEMO.provider}'s Agent...`,
    detail: `Initial quote received: ${DEMO.initialPrice.toLocaleString()} PKR.`,
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

export const initialMessages = (): ChatMessage[] => [
  { id: nextId("msg"), from: "user", text: DEMO.userPrompt, time: formatTime(new Date(Date.now() - 60_000)) },
];

const MILESTONES: { title: string; detail: string }[] = [
  { title: "Request created", detail: `${DEMO.item} · budget ${DEMO.budget.toLocaleString()} PKR` },
  { title: "Agent searching nearby providers", detail: `Geo-fence ${DEMO.geoFence}` },
  { title: `Negotiating with ${DEMO.provider}`, detail: `Initial quote ${DEMO.initialPrice.toLocaleString()} PKR` },
  { title: "Offer ready for review", detail: `Counter-offer ${DEMO.finalPrice.toLocaleString()} PKR` },
  { title: "Order booked", detail: `Pickup ${DEMO.pickupDay} at ${DEMO.pickupTime}` },
];

const STATUS_INDEX: Record<RequestStatus, number> = {
  chatting: 0,
  searching: 1,
  negotiating: 2,
  review: 3,
  approved: 4,
  confirmed: 5,
  declined: -1,
};

/** Request-lifecycle milestones shown on the customer Activity screen. */
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

/** Past customer orders shown on the History screen (demo filler). */
export const PAST_ORDERS: { id: string; item: string; provider: string; price: number; day: string; status: "confirmed" | "declined" }[] = [
  { id: "past-1", item: "Vanilla Birthday Cake", provider: "Grand Central Bakery", price: 3200, day: "Last Saturday", status: "confirmed" },
  { id: "past-2", item: "Chocolate Truffle Cupcakes", provider: "Sweet Tooth Co.", price: 1450, day: "2 weeks ago", status: "confirmed" },
  { id: "past-3", item: "Apple Crumble Pie", provider: "Honey Crust", price: 1800, day: "Last month", status: "declined" },
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
      },
      {
        from: "yours",
        text: `That's above my client's budget. Could you come down to ${DEMO.budget.toLocaleString()} PKR?`,
        time: formatTime(new Date(Date.now() - 3 * 60_000)),
      },
      {
        from: "provider",
        text: `${DEMO.budget.toLocaleString()} PKR is below our cost margin. I can offer ${(DEMO.finalPrice + 300).toLocaleString()} PKR.`,
        time: formatTime(new Date(Date.now() - 2 * 60_000)),
      },
      {
        from: "yours",
        text: `My client authorized a final counter of ${DEMO.finalPrice.toLocaleString()} PKR. Can we close at that?`,
        time: formatTime(new Date(Date.now() - 60_000)),
      },
      {
        from: "provider",
        text: `Deal. ${DEMO.finalPrice.toLocaleString()} PKR, pickup ${DEMO.pickupDay} at ${DEMO.pickupTime}. Sending the offer to your client for approval.`,
        time: "NOW",
      },
    ] satisfies Omit<AgentChatLine, "id">[]
  ).map(line => ({ ...line, id: nextId("a2a") }));

/** Timings (ms) for the scripted agent run. Kept in one place for easy tuning. */
export const TIMINGS = {
  typing: 1_200,
  agentReplyHold: 1_400,
  terminalLine: 900,
  terminalHold: 1_800,
  timelineStep: 1_600,
  timelineHold: 1_800,
} as const;