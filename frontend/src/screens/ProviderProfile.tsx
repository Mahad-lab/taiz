import { LogOut, MapPin, RotateCcw, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { BottomNav, type NavTabId } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { DEMO } from "@/lib/agent";
import { providerTabRoute } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";
import { useApp } from "@/state/AppContext";

interface ProviderProfileProps {
  navigate: (route: Route) => void;
}

/** Provider identity, stats, and settings (provider Profile tab). */
export function ProviderProfile({ navigate }: ProviderProfileProps) {
  const { jobs, agentActive, toggleAgent, reset, showToast } = useApp();

  const onTab = (tab: NavTabId) => {
    if (tab === "profile") return;
    const target = providerTabRoute(tab);
    if (target) return navigate(target);
    showToast(`${titleCase(tab)} — coming soon`);
  };

  const confirmed = jobs.filter(job => job.status === "confirmed").length;
  const awaiting = jobs.filter(job => job.status === "pending").length;

  return (
    <DeviceFrame>
      <TopAppBar
        title={<h1 className="text-lg font-bold tracking-tight text-primary">Profile</h1>}
        right={
          <span className="flex size-9 items-center justify-center rounded-full border border-deep-slate/10 bg-surface-variant text-[11px] font-semibold text-on-surface-variant">
            GB
          </span>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-4">
        {/* Identity */}
        <section className="flex items-center gap-4 rounded-lg border border-deep-slate/10 bg-white p-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-lg font-bold text-on-secondary-container">
            GB
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-primary">{DEMO.provider}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[12px] text-on-surface-variant">
              <MapPin className="size-3.5" />
              Gulberg, Lahore
            </p>
            <span className="mt-1.5 flex items-center gap-1">
              <Star className="size-3.5 text-secondary" fill="currentColor" />
              <span className="font-mono text-[12px] text-on-surface-variant">
                {DEMO.providerRating} · Member since 2024
              </span>
            </span>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Completed", value: confirmed },
            { label: "Awaiting", value: awaiting },
            { label: "Rating", value: DEMO.providerRating },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-lg border border-deep-slate/10 bg-white py-4"
            >
              <span className="text-xl font-semibold text-primary">{stat.value}</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* AI Agent toggle */}
        <section className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-white p-4">
          <div>
            <p className="text-[15px] font-semibold text-primary">AI Agent</p>
            <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
              {agentActive ? "Auto-negotiating jobs" : "Manual mode active"}
            </p>
          </div>
          <Toggle checked={agentActive} onChange={toggleAgent} label="AI Agent" />
        </section>

        {/* Static info */}
        <section className="flex flex-col rounded-lg border border-deep-slate/10 bg-white">
          {[
            { label: "Service Area", value: "Gulberg · 5 km radius" },
            { label: "Response Time", value: "Under 1 min" },
            { label: "Pricing Model", value: "Auto-negotiated" },
          ].map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3.5 ${
                index > 0 ? "border-t border-deep-slate/10" : ""
              }`}
            >
              <span className="font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">
                {row.label}
              </span>
              <Badge variant="neutral" className="font-mono normal-case">
                {row.value}
              </Badge>
            </div>
          ))}
        </section>

        {/* Sign out */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              reset();
              showToast("Signed out — state reset");
              navigate("welcome");
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-error/30 py-3 text-[15px] font-medium text-error transition-colors hover:bg-error/5"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
          <button
            onClick={() => {
              reset();
              showToast("Demo state reset");
            }}
            className="flex items-center justify-center gap-2 rounded-lg py-2 font-mono text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <RotateCcw className="size-3.5" />
            Reset demo state
          </button>
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="provider" active="profile" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}