import type { NavTabId } from "@/components/layout/BottomNav";
import type { Route } from "@/lib/router";
import type { TaizRequest } from "@/state/types";

/** Resolve a customer bottom-nav tab to a route, or null when there's nothing to show. */
export function customerTabRoute(tab: NavTabId, request: TaizRequest | null): Route | null {
  switch (tab) {
    case "tasks":
      return "dashboard";
    case "activity":
      return "activity";
    case "history":
      return "history";
    case "review":
      if (request?.status === "review") return "review";
      if (request?.status === "approved") return "approval";
      return null;
    default:
      return null;
  }
}

const PROVIDER_TAB_ROUTES: Partial<Record<NavTabId, Route>> = {
  jobs: "provider",
  negotiations: "provider-negotiation",
  explore: "provider-explore",
  profile: "provider-profile",
};

/** Resolve a provider bottom-nav tab to a route, or null when there's nothing to show. */
export function providerTabRoute(tab: NavTabId): Route | null {
  return PROVIDER_TAB_ROUTES[tab] ?? null;
}