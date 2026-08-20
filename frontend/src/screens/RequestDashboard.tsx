import { ArrowRight, Bot, CakeSlice, Coffee, Inbox, Plus, Search, Settings, Shirt, Wrench } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { BottomNav, type NavTabId } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { customerTabRoute } from "@/lib/nav";
import { STATUS_ROUTE, type Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";
import { useApp } from "@/state/AppContext";
import type { RequestStatus } from "@/state/types";

const STATUS_LABEL: Record<RequestStatus, string> = {
  chatting: "Chatting",
  searching: "Searching",
  negotiating: "Negotiating",
  review: "Awaiting review",
  approved: "Ready to book",
  confirmed: "Confirmed",
  declined: "Declined",
};

const SUGGESTIONS = [
  { label: "Bakery & Cakes", hint: "Custom cakes nearby", icon: CakeSlice },
  { label: "Find Coffee", hint: "Top-rated cafés", icon: Coffee },
  { label: "Local Plumbers", hint: "Verified pros", icon: Wrench },
  { label: "Laundry", hint: "Pickup & drop", icon: Shirt },
] as const;

interface RequestDashboardProps {
  navigate: (route: Route) => void;
}

export function RequestDashboard({ navigate }: RequestDashboardProps) {
  const { request, startRequest, showToast } = useApp();
  const [query, setQuery] = useState("");

  const launch = () => {
    startRequest();
    navigate("chat");
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    launch();
  };

  const onTab = (tab: NavTabId) => {
    const target = customerTabRoute(tab, request);
    if (target) return navigate(target);
    showToast(tab === "review" ? "Nothing to review yet" : `${titleCase(tab)} — coming soon`);
  };

  const activeTask = request && request.status !== "declined" ? request : null;

  return (
    <DeviceFrame>
      <TopAppBar
        left={
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <Bot className="size-5" />
          </span>
        }
        title={<h1 className="text-lg font-bold tracking-tight text-primary">Taiz</h1>}
        right={
          <button
            onClick={() => showToast("Settings — coming soon")}
            className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </button>
        }
      />

      <main className="relative flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-3">
        {/* Search */}
        <form onSubmit={onSearch} className="flex flex-col gap-2">
          <label htmlFor="agent-search" className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              id="agent-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for nearby service agents (e.g., 'Bakery')"
              className="w-full rounded-t-[4px] border-b-2 border-transparent bg-[#f4eee6] py-3.5 pl-11 pr-4 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-electric-mint"
            />
          </div>
        </form>

        {/* Active tasks */}
        <section className="rounded-lg border border-deep-slate/10 bg-white p-4">
          <h2 className="text-[20px] font-semibold text-deep-slate">My Active Tasks</h2>
          {activeTask ? (
            <button
              onClick={() => navigate(STATUS_ROUTE[activeTask.status] ?? "chat")}
              className="mt-3 w-full rounded-md border border-dashed border-on-surface/10 bg-surface-container-lowest p-4 text-left transition-colors hover:border-secondary"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-primary">{activeTask.item}</p>
                  <p className="mt-0.5 font-mono text-xs text-on-surface-variant">{activeTask.provider}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={activeTask.status === "confirmed" ? "mint" : "secondary"}>
                    {STATUS_LABEL[activeTask.status]}
                  </Badge>
                  <ArrowRight className="size-4 text-on-surface-variant/50" />
                </div>
              </div>
            </button>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-3 rounded-md border border-dashed border-on-surface/10 bg-surface-container-lowest py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant/50">
                <Inbox className="size-6" />
              </span>
              <p className="font-mono text-[13px] text-on-surface-variant/70">No active requests</p>
            </div>
          )}
        </section>

        {/* Suggestions */}
        <section className="grid grid-cols-2 gap-3">
          {SUGGESTIONS.map(sug => {
            const Icon = sug.icon;
            const isDemo = sug.label === "Bakery & Cakes";
            return (
              <button
                key={sug.label}
                onClick={isDemo ? launch : () => showToast(`${sug.label} — coming soon`)}
                className="group flex flex-col gap-2 rounded-lg border border-deep-slate/10 bg-white p-3.5 text-left transition-colors hover:border-electric-mint"
              >
                <div className="flex items-center justify-between text-deep-slate">
                  <span className="flex size-9 items-center justify-center rounded-[4px] bg-electric-mint/10 text-electric-mint">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div>
                  <p className="text-sm font-medium text-deep-slate">{sug.label}</p>
                  <p className="font-mono text-[11px] text-on-surface-variant">{sug.hint}</p>
                </div>
                {isDemo && (
                  <Badge variant="mint" className="w-fit">
                    demo
                  </Badge>
                )}
              </button>
            );
          })}
        </section>
      </main>

      {/* FAB */}
      <button
        onClick={launch}
        aria-label="New request"
        className="absolute bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-electric-mint text-deep-slate shadow-[0_4px_12px_rgba(45,52,54,0.15)] transition-transform active:scale-95"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="tasks" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}