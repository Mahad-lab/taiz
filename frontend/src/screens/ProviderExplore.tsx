import { Bot, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BottomNav, type NavTabId } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { DEMO } from "@/lib/agent";
import { providerTabRoute } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";
import { useApp } from "@/state/AppContext";

interface ProviderExploreProps {
  navigate: (route: Route) => void;
}

interface IncomingRequest {
  customer: string;
  item: string;
  location: string;
  distance: string;
  state: "negotiating" | "new";
}

const REQUESTS: IncomingRequest[] = [
  {
    customer: DEMO.customer,
    item: DEMO.item,
    location: "Gulberg, Lahore",
    distance: "1.2 km",
    state: "negotiating",
  },
  {
    customer: "Faizan Ahmed",
    item: "Chocolate Truffle",
    location: "DHA Phase 5",
    distance: "2.4 km",
    state: "new",
  },
  {
    customer: "Noor Fatima",
    item: "Custom Wedding Cake",
    location: "Model Town",
    distance: "3.1 km",
    state: "new",
  },
];

/** Nearby incoming requests your agent can pick up (provider Explore tab). */
export function ProviderExplore({ navigate }: ProviderExploreProps) {
  const { agentActive, showToast } = useApp();

  const onTab = (tab: NavTabId) => {
    if (tab === "explore") return;
    const target = providerTabRoute(tab);
    if (target) return navigate(target);
    showToast(`${titleCase(tab)} — coming soon`);
  };

  return (
    <DeviceFrame>
      <TopAppBar
        title={<h1 className="text-lg font-bold tracking-tight text-primary">Explore</h1>}
        right={
          <span className="flex size-9 items-center justify-center rounded-full border border-deep-slate/10 bg-surface-variant text-[11px] font-semibold text-on-surface-variant">
            GB
          </span>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Nearby Requests</h1>
          <p className="mt-1 text-[15px] text-on-surface-variant">
            Auto-matched to your service area and capabilities.
          </p>
        </div>

        {/* Agent status hint */}
        <div className="flex items-center gap-3 rounded-lg border border-secondary/20 bg-secondary/5 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <Bot className="size-5" fill="currentColor" />
          </span>
          <p className="text-[13px] leading-5 text-on-surface-variant">
            {agentActive
              ? "Your AI agent responds to these automatically and negotiates on your behalf."
              : "Your AI agent is off — you'll handle these manually."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {REQUESTS.map(request => {
            const live = request.state === "negotiating";
            return (
              <button
                key={request.customer}
                onClick={() => live && navigate("provider-negotiation")}
                disabled={!live}
                className={`flex flex-col gap-2 rounded-lg border bg-white p-4 text-left ${
                  live
                    ? "cursor-pointer border-secondary/40 transition-colors hover:border-secondary"
                    : "border-deep-slate/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold text-primary">{request.customer}</p>
                    <p className="mt-0.5 truncate text-[14px] text-on-surface-variant">{request.item}</p>
                  </div>
                  <Badge variant={live ? "mint" : "neutral"}>
                    {live ? "Agent negotiating" : "New"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 font-mono text-[12px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {request.location}
                  </span>
                  <span className="rounded-sm bg-surface-container-low px-1.5 py-0.5">{request.distance}</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="provider" active="explore" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}