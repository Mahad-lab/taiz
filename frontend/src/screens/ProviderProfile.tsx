import { LogOut, MapPin, RotateCcw, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import * as api from "@/lib/api";
import { providerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ProviderProfileProps {
  navigate: (route: Route) => void;
}

export function ProviderProfile({ navigate }: ProviderProfileProps) {
  const { jobs, businessId, setBusiness, agentActive, toggleAgent, reset, showToast } = useApp();
  const onTab = providerTabHandler(navigate, showToast);
  const [name, setName] = useState("Your Business");
  const [area, setArea] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!businessId) {
        const list = await api.listBusinesses().catch(() => []);
        if (!cancelled && list[0]) setBusiness(list[0].id);
      }
      if (businessId) {
        const res = await api.getCatalog(businessId).catch(() => null);
        if (!cancelled && res) {
          setName(res.business.name);
          setArea(`${res.business.neighborhood}, ${res.business.city}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const confirmed = jobs.filter(job => job.status === "confirmed").length;
  const awaiting = jobs.filter(job => job.status === "pending").length;

  return (
    <DeviceFrame>
      <TopAppBar
        title={<h1 className="text-lg font-bold tracking-tight text-primary">Profile</h1>}
        right={
          <span className="flex size-9 items-center justify-center rounded-full border border-deep-slate/10 bg-surface-variant text-[11px] font-semibold text-on-surface-variant">
            {(businessId?.slice(0, 2) ?? "··").toUpperCase()}
          </span>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-4">
        <section className="flex items-center gap-4 rounded-lg border border-deep-slate/10 bg-white p-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-lg font-bold text-on-secondary-container">
            {(businessId?.slice(0, 2) ?? "··").toUpperCase()}
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-primary">{name}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[12px] text-on-surface-variant">
              <MapPin className="size-3.5" />
              {area || "—"}
            </p>
            <span className="mt-1.5 flex items-center gap-1">
              <Star className="size-3.5 text-secondary" fill="currentColor" />
              <span className="font-mono text-[12px] text-on-surface-variant">Fixed-price listing</span>
            </span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            { label: "Completed", value: confirmed },
            { label: "Awaiting", value: awaiting },
            { label: "Rating", value: "—" },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-lg border border-deep-slate/10 bg-white py-4">
              <span className="text-xl font-semibold text-primary">{stat.value}</span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-white p-4">
          <div>
            <p className="text-[15px] font-semibold text-primary">AI Agent</p>
            <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
              {agentActive ? "Auto-accepting jobs" : "Manual mode active"}
            </p>
          </div>
          <Toggle checked={agentActive} onChange={toggleAgent} label="AI Agent" />
        </section>

        <section className="flex flex-col rounded-lg border border-deep-slate/10 bg-white">
          {[
            { label: "Service Area", value: area || "—" },
            { label: "Response Time", value: "Under 1 min" },
            { label: "Pricing Model", value: "Fixed-price comparison" },
          ].map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3.5 ${index > 0 ? "border-t border-deep-slate/10" : ""}`}
            >
              <span className="font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">{row.label}</span>
              <Badge variant="neutral" className="font-mono normal-case">
                {row.value}
              </Badge>
            </div>
          ))}
        </section>

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
            onClick={() => navigate("reset")}
            className="flex items-center justify-center gap-2 rounded-lg py-2 font-mono text-[12px] text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <RotateCcw className="size-3.5" />
            Reset all data
          </button>
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="provider" active="profile" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
