import { useCallback, useEffect, useState } from "react";

import type { RequestStatus, Role } from "@/state/types";

export type Route =
  | "welcome"
  | "onboard"
  | "reset"
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
  | "provider-profile"
  | "chat"
  | "products"
  | "provider-orders"
  | "provider-products"
  | "provider-chat"
  | "provider-settings";

const ROUTE_ORDER: Route[] = [
  "welcome",
  "onboard",
  "reset",
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
  "chat",
  "products",
  "provider-orders",
  "provider-products",
  "provider-chat",
  "provider-settings",
];

/** Where a request at a given status should be resumed from. */
export const STATUS_ROUTE: Partial<Record<RequestStatus, Route>> = {
  searching: "agent-task",
  comparing: "agent-activity",
  review: "review",
  confirmed: "confirmed",
};

const ROLE_VALUES: Role[] = ["customer", "provider"];

interface ParsedRoute {
  route: Route;
  /** Optional role segment carried on the onboard route, e.g. #/onboard/provider. */
  onboardRole: Role | null;
}

function parseHash(): ParsedRoute {
  const segments = window.location.hash.replace(/^#\/?/, "").toLowerCase().split("/");
  const [raw, param] = segments;
  const isKnown = raw && ROUTE_ORDER.includes(raw as Route);
  if (!isKnown) return { route: "welcome", onboardRole: null };
  if (raw === "onboard" && param && ROLE_VALUES.includes(param as Role)) {
    return { route: "onboard", onboardRole: param as Role };
  }
  return { route: raw as Route, onboardRole: null };
}

export function useHashRoute(): [Route, (route: Route) => void, Role | null] {
  const [{ route, onboardRole }, setParsed] = useState<ParsedRoute>(parseHash);

  useEffect(() => {
    const onHashChange = () => setParsed(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: Route, role?: Role) => {
    if (parseHash().route === next) return;
    if (next === "onboard" && role) {
      window.location.hash = `/onboard/${role}`;
      return;
    }
    window.location.hash = `/${next}`;
  }, []);

  return [route, navigate, onboardRole];
}
