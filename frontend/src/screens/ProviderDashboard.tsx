import { Bot, MapPin, Menu, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { BottomNav, type NavTabId } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import type { Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";
import { useApp } from "@/state/AppContext";

interface ProviderDashboardProps {
  navigate: (route: Route) => void;
}

export function ProviderDashboard({ navigate }: ProviderDashboardProps) {
  const { jobs, agentActive, toggleAgent, showToast } = useApp();

  const onTab = (tab: NavTabId) => {
    if (tab === "jobs") return navigate("provider");
    showToast(`${titleCase(tab)} — coming soon`);
  };

  return (
    <DeviceFrame>
      <TopAppBar
        left={
          <button
            onClick={() => showToast("Menu — coming soon")}
            className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
        }
        title={<h1 className="text-lg font-bold tracking-tight text-primary">Taiz</h1>}
        right={
          <span className="flex size-9 items-center justify-center rounded-full border border-deep-slate/10 bg-surface-variant text-[11px] font-semibold text-on-surface-variant">
            GB
          </span>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Provider Dashboard</h1>
          <p className="mt-1 text-[15px] text-on-surface-variant">Manage your active region and availability.</p>
        </div>

        {/* AI Agent toggle */}
        <section className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-white p-4 shadow-sm">
          <div>
            <span className="flex items-center gap-2 text-[18px] font-semibold text-primary">
              <Bot className="size-5 text-secondary" fill="currentColor" />
              AI Agent: {agentActive ? "ON" : "OFF"}
            </span>
            <p className="mt-1.5 font-mono text-[12px] text-on-surface-variant">
              {agentActive ? "Auto-negotiating jobs" : "Manual mode active"}
            </p>
          </div>
          <Toggle checked={agentActive} onChange={toggleAgent} label="AI Agent" />
        </section>

        {/* Upcoming jobs */}
        <section className="flex flex-col gap-3">
          <h2 className="border-b border-deep-slate/10 pb-1 text-[20px] font-semibold text-primary">
            Upcoming Jobs
          </h2>

          {jobs.map(job => (
            <div
              key={job.id}
              className="group flex items-center justify-between gap-3 rounded-lg border border-outline-variant/20 bg-white p-4 transition-colors hover:border-secondary"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <Timer className="size-3.5" />
                  {job.day}, {job.time}
                </span>
                <span className="text-[16px] font-bold text-primary">{job.customer}</span>
                <span className="flex items-center gap-1.5 font-mono text-[12px] text-on-surface-variant">
                  <MapPin className="size-3.5" />
                  <span className="truncate">{job.item} · {job.location}</span>
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[18px] font-semibold text-primary">{job.price.toLocaleString()} PKR</span>
                <Badge variant={job.status === "confirmed" ? "mint" : "neutral"}>
                  {job.status === "confirmed" ? "Confirmed" : "Awaiting Auth"}
                </Badge>
              </div>
            </div>
          ))}

          <button
            onClick={() => showToast("History — coming soon")}
            className="mt-1 rounded-lg border border-outline-variant/10 bg-surface-container-highest py-3 text-center font-mono text-[13px] text-primary transition-colors hover:bg-surface-container-high"
          >
            View All History
          </button>
        </section>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="provider" active="jobs" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}