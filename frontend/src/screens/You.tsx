import { Lock, LogOut, RotateCcw } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { PermissionRow } from "@/components/shared/PermissionRow";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";
import type { ComparisonDisplay } from "@/state/types";

interface YouProps {
  navigate: (route: Route) => void;
}

const PRIVACY_ITEMS = [
  { label: "Location", detail: "Used for nearby discovery" },
  { label: "Messages", detail: "Encrypted between agents" },
  { label: "Agent history", detail: "Stored on this device" },
];

const COMPARISON_OPTIONS: { value: ComparisonDisplay; label: string; description: string }[] = [
  { value: "inline", label: "Inline cards", description: "Options appear as cards in the chat." },
  { value: "sheet", label: "Compact sheet", description: "Options in a scrollable panel." },
  { value: "expandable", label: "Expandable", description: "Tap to reveal the options." },
];

/** Identity, agent permissions, and privacy — "your agent, your terms." */
export function You({ navigate }: YouProps) {
  const { user, permissions, setPermission, chatPreferences, setChatPreferences, reset, showToast } =
    useApp();
  const onTab = customerTabHandler(navigate, showToast);

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">You</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-4">
        <section className="flex items-center gap-4 rounded-lg border border-deep-slate/10 bg-white p-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-lg font-bold text-on-secondary-container">
            {user?.name?.charAt(0) || "U"}
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-primary">{user?.name || "User"}</h2>
            <p className="mt-0.5 font-mono text-[12px] text-on-surface-variant">Select a location</p>
          </div>
        </section>

        <section className="rounded-lg border border-deep-slate/10 bg-white p-4">
          <h2 className="text-[15px] font-semibold text-primary">Your agent</h2>
          <p className="mt-0.5 text-[13px] text-on-surface-variant">What can Taiz do on your behalf?</p>

          <div className="mt-2">
            <PermissionRow title="Discover" description="Find services and check availability." checked locked />
            <PermissionRow
              title="Communicate"
              description="Contact providers on your behalf."
              checked={permissions.communicate}
              onChange={communicate => setPermission({ communicate })}
            />
            <PermissionRow
              title="Negotiate"
              description="Negotiate prices within a limit you set."
              checked={permissions.negotiate}
              onChange={negotiate => setPermission({ negotiate })}
            >
              <label className="flex items-center justify-between gap-3 rounded-md bg-surface-container-low px-3 py-2">
                <span className="font-mono text-[12px] text-on-surface-variant">Maximum</span>
                <span className="flex items-center gap-1 font-mono text-[13px] font-medium text-primary">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={permissions.negotiateMax}
                    onChange={e => setPermission({ negotiateMax: Number(e.target.value) || 0 })}
                    className="w-20 bg-transparent text-right outline-none"
                  />
                  PKR
                </span>
              </label>
            </PermissionRow>
            <PermissionRow
              title="Book"
              description={permissions.confirm ? "Can book without asking." : "Asks you before booking."}
              checked={permissions.confirm}
              onChange={confirm => setPermission({ confirm })}
            />
            <PermissionRow
              title="Pay"
              description={permissions.transact ? "Can pay without asking." : "Always asks before paying."}
              checked={permissions.transact}
              onChange={transact => setPermission({ transact })}
            />
          </div>
        </section>

        <section className="rounded-lg border border-deep-slate/10 bg-white p-4">
          <h2 className="text-[15px] font-semibold text-primary">Chat preferences</h2>
          <p className="mt-0.5 text-[13px] text-on-surface-variant">How would you like comparison results to appear?</p>
          <div className="mt-3 flex flex-col gap-2">
            {COMPARISON_OPTIONS.map(opt => {
              const selected = chatPreferences.comparisonDisplay === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setChatPreferences({ comparisonDisplay: opt.value });
                    showToast(`Comparison view: ${opt.label}`);
                  }}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selected
                      ? "border-secondary bg-secondary/5"
                      : "border-deep-slate/10 bg-white hover:border-electric-mint"
                  }`}
                >
                  <span
                    className={`mt-0.5 size-4 shrink-0 rounded-full border-2 ${
                      selected ? "border-secondary bg-secondary" : "border-deep-slate/30"
                    }`}
                  >
                    {selected && <span className="block size-full scale-50 rounded-full bg-white" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-primary">{opt.label}</p>
                    <p className="mt-0.5 text-[12px] text-on-surface-variant">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-deep-slate/10 bg-white p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-primary">
            <Lock className="size-4 text-electric-mint" />
            Your privacy
          </h2>
          <p className="mt-0.5 text-[13px] text-on-surface-variant">End-to-end encrypted. Your conversations are private.</p>
          <div className="mt-3 flex flex-col">
            {PRIVACY_ITEMS.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-2.5 ${i > 0 ? "border-t border-deep-slate/10" : ""}`}
              >
                <span className="font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">{item.label}</span>
                <span className="text-[13px] text-on-surface">{item.detail}</span>
              </div>
            ))}
          </div>
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
        <BottomNav variant="customer" active="you" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
