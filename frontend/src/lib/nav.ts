import type { NavTabId } from "@/components/layout/BottomNav";
import type { Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";

const CUSTOMER_TAB_ROUTES: Partial<Record<NavTabId, Route>> = {
  home: "home",
  discover: "discover",
  activity: "activity",
  you: "you",
};

/** Resolve a customer bottom-nav tab to a route, or null when there's nothing to show. */
export function customerTabRoute(tab: NavTabId): Route | null {
  return CUSTOMER_TAB_ROUTES[tab] ?? null;
}

const PROVIDER_TAB_ROUTES: Partial<Record<NavTabId, Route>> = {
  jobs: "provider",
  requests: "provider",
  explore: "provider-explore",
  profile: "provider-profile",
};

/** Resolve a provider bottom-nav tab to a route, or null when there's nothing to show. */
export function providerTabRoute(tab: NavTabId): Route | null {
  return PROVIDER_TAB_ROUTES[tab] ?? null;
}

/** Shared bottom-nav tab handler: navigate, or toast when there's nothing to show. */
function tabHandler(resolve: (tab: NavTabId) => Route | null) {
  return (navigate: (route: Route) => void, showToast: (message: string) => void) => (tab: NavTabId) => {
    const target = resolve(tab);
    if (target) return navigate(target);
    showToast(`${titleCase(tab)} — coming soon`);
  };
}

/** Shared bottom-nav tab handler for customer screens. */
export const customerTabHandler = tabHandler(customerTabRoute);

/** Shared bottom-nav tab handler for provider screens. */
export const providerTabHandler = tabHandler(providerTabRoute);
