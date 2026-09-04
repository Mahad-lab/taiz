import type { AvailabilityComparison, AvailabilityReply } from "@/lib/api";
import type { RequestStatus } from "@/state/types";

export type TimelineStatus = "done" | "active" | "todo";

export interface TimelineStep {
  id: string;
  title: string;
  detail?: string;
  time?: string;
  status: TimelineStatus;
}

/** A single line in the agent comparison log (replaces the old negotiation transcript). */
export interface AgentChatLine {
  id: string;
  from: "yours" | "provider";
  text: string;
  time: string;
  offer?: boolean;
}

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

let seq = 0;
export const nextId = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${++seq}`;

/** Demo defaults aligned to the backend seed (Karachi, bakery, real catalog item). */
export const DEMO = {
  customer: "Ayesha Khan",
  item: "Croissant",
  quantity: 1,
  city: "Karachi",
  category: "bakery" as const,
  neighborhood: "DHA Phase 1",
};

export const DISCOVER_CATEGORIES = ["Bakery", "Restaurant"] as const;

/** Checklist shown on AgentTask while the personal agent fans out to business agents. */
export const buildAgentTaskSteps = (item: string, city: string): TimelineStep[] =>
  [
    { title: "Understanding your request" },
    { title: `Searching providers in ${city}` },
    { title: `Contacting bakeries & restaurants` },
    { title: "Comparing fixed prices" },
  ].map(step => ({ ...step, id: nextId("task"), status: "todo" as const }));

/** The agent-comparing timeline on AgentActivity (no negotiation). */
export const buildComparisonTimeline = (comparison: AvailabilityComparison): TimelineStep[] => {
  const total = comparison.replies.length;
  const available = comparison.replies.filter(r => r.status === "available").length;
  return [
    {
      id: nextId("step"),
      title: `Found ${total} provider${total === 1 ? "" : "s"}`,
      detail: available > 0 ? `${available} with availability` : "None with availability",
      time: formatTime(new Date(Date.now() - 2 * 60_000)),
      status: "done",
    },
    {
      id: nextId("step"),
      title: "Comparing fixed prices",
      detail: "Sorted by availability, then cheapest.",
      status: "active",
    },
  ];
};

const STATUS_INDEX: Record<RequestStatus, number> = {
  searching: 0,
  comparing: 1,
  review: 2,
  confirmed: 3,
  declined: -1,
};

/** Request-lifecycle milestones shown on the Activity screen. */
export const buildActivitySteps = (status: RequestStatus, item: string): TimelineStep[] => {
  if (status === "declined") {
    return [
      {
        id: nextId("act"),
        title: "Request created",
        detail: item,
        time: formatTime(new Date(Date.now() - 6 * 60_000)),
        status: "done",
      },
      {
        id: nextId("act"),
        title: "No option chosen",
        detail: "You declined the available options.",
        time: "NOW",
        status: "active",
      },
    ];
  }
  const milestones: { title: string; detail: string }[] = [
    { title: "Request created", detail: item },
    { title: "Agent comparing providers", detail: "Availability + fixed prices" },
    { title: "Options ready for review", detail: "Cheapest available shown first" },
    { title: "Order confirmed", detail: "Pickup on the way" },
  ];
  const idx = STATUS_INDEX[status];
  return milestones.map((milestone, i) => ({
    id: nextId("act"),
    title: milestone.title,
    detail: milestone.detail,
    time: i < idx ? formatTime(new Date(Date.now() - (idx - i) * 2 * 60_000)) : undefined,
    status: i < idx ? ("done" as const) : i === idx ? ("active" as const) : ("todo" as const),
  }));
};

/** Comparison log: the availability query + each business's fixed-price reply. */
export const buildComparisonChat = (comparison: AvailabilityComparison, city: string): AgentChatLine[] => {
  const lines: Omit<AgentChatLine, "id">[] = [
    {
      from: "yours",
      text: `Hi! My client is looking for ${comparison.quantity}× ${comparison.item} near ${city}. Do you have availability?`,
      time: formatTime(new Date(Date.now() - 4 * 60_000)),
    },
  ];
  for (const reply of comparison.replies) {
    lines.push({
      from: "provider",
      text:
        reply.status === "available" && reply.product
          ? `Yes — ${reply.product.name} at ${reply.price?.toLocaleString()} ${reply.currency ?? "PKR"}, ready in ${reply.etaMinutes ?? "?"} min.`
          : `Sorry, ${comparison.item} is unavailable right now.`,
      time: formatTime(new Date(Date.now() - 3 * 60_000)),
      offer: reply.status === "available",
    });
  }
  return lines.map(line => ({ ...line, id: nextId("a2a") }));
};

/** Timings (ms) for scripted agent runs. Kept in one place for easy tuning. */
export const TIMINGS = {
  checklistStep: 900,
  checklistHold: 1_400,
  timelineStep: 1_600,
  timelineHold: 1_800,
} as const;

/** Pick the best option: first available reply (already availability-first, then cheapest). */
export const bestReply = (comparison: AvailabilityComparison): AvailabilityReply | undefined =>
  comparison.replies.find(r => r.status === "available");
