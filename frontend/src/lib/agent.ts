import type { ChatMessage } from "@/state/types";

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

/** Timings (ms) for the scripted agent run. Kept in one place for easy tuning. */
export const TIMINGS = {
  typing: 1_200,
  agentReplyHold: 1_400,
  terminalLine: 900,
  terminalHold: 1_800,
  timelineStep: 1_600,
  timelineHold: 1_800,
} as const;