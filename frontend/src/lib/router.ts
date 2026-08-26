import { useCallback, useEffect, useState } from "react";

import type { RequestStatus } from "@/state/types";

export type Route =
  | "welcome"
  | "home"
  | "discover"
  | "you"
  | "agent-task"
  | "agent-activity"
  | "agent-chat-log"
  | "activity"
  | "review"
  | "confirmed"
  | "provider"
  | "provider-negotiation"
  | "provider-explore"
  | "provider-profile";

const ROUTE_ORDER: Route[] = [
  "welcome",
  "home",
  "discover",
  "you",
  "agent-task",
  "agent-activity",
  "agent-chat-log",
  "activity",
  "review",
  "confirmed",
  "provider",
  "provider-negotiation",
  "provider-explore",
  "provider-profile",
];

/** Where a request at a given status should be resumed from. */
export const STATUS_ROUTE: Partial<Record<RequestStatus, Route>> = {
  searching: "agent-task",
  negotiating: "agent-activity",
  review: "review",
  confirmed: "confirmed",
};

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "").toLowerCase() as Route;
  return ROUTE_ORDER.includes(raw) ? raw : "welcome";
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    if (parseHash() === next) return;
    window.location.hash = `/${next}`;
  }, []);

  return [route, navigate];
}