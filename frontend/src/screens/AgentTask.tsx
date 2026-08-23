import { Check, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TypingDots } from "@/components/shared/TypingDots";
import { TIMINGS, buildAgentTaskSteps, sleep } from "@/lib/agent";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface AgentTaskProps {
  navigate: (route: Route) => void;
}

export function AgentTask({ navigate }: AgentTaskProps) {
  const { request, declineOrder, setStatus, permissions, showToast } = useApp();
  const steps = useRef(buildAgentTaskSteps()).current;
  const [visible, setVisible] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const cancelled = useRef(false);

  const waitForResume = () =>
    new Promise<void>(resolve => {
      const check = () => (pausedRef.current && !cancelled.current ? setTimeout(check, 120) : resolve());
      check();
    });

  useEffect(() => {
    cancelled.current = false;
    const run = async () => {
      for (let i = 1; i <= steps.length; i++) {
        await waitForResume();
        if (cancelled.current) return;
        setVisible(i);
        await sleep(TIMINGS.checklistStep);
        if (cancelled.current) return;
      }
      await waitForResume();
      if (cancelled.current) return;
      await sleep(TIMINGS.checklistHold);
      if (cancelled.current) return;
      setStatus("negotiating");
      navigate("agent-activity");
    };
    run();
    return () => {
      cancelled.current = true;
    };
  }, [steps, navigate, setStatus]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    showToast(pausedRef.current ? "Paused" : "Resumed");
  };

  const abort = () => {
    cancelled.current = true;
    declineOrder();
    showToast("Request cancelled — no action was taken");
    navigate("home");
  };

  return (
    <DeviceFrame className="bg-soft-sand">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-deep-slate/10 px-4">
        <span className="text-lg font-bold tracking-tight text-primary">Taiz is working</span>
        <button
          onClick={abort}
          className="rounded px-3 py-1.5 font-mono text-[13px] text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          Cancel
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
        <div className="rounded-lg border border-deep-slate/10 bg-white p-4">
          <h1 className="text-[20px] font-semibold text-primary">Find a {request?.item.toLowerCase() ?? "service"}</h1>
          <dl className="mt-3 flex flex-col gap-1.5 font-mono text-[13px] text-on-surface-variant">
            <div className="flex justify-between gap-3">
              <dt>Location</dt>
              <dd className="text-right text-on-surface">Gulberg, Lahore</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Pickup</dt>
              <dd className="text-right text-on-surface">
                {request?.pickupDay} · {request?.pickupTime}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Budget</dt>
              <dd className="text-right text-on-surface">≤ {request?.budget.toLocaleString()} PKR</dd>
            </div>
          </dl>
          {permissions.negotiate && (
            <p className="mt-3 border-t border-deep-slate/10 pt-3 font-mono text-[11px] text-on-surface-variant">
              Negotiating within your {permissions.negotiateMax.toLocaleString()} PKR limit
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const done = i < visible - 1;
            const active = i === visible - 1;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                    done
                      ? "border-electric-mint bg-electric-mint/15 text-electric-mint"
                      : active
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-outline-variant/40 text-transparent"
                  }`}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : active ? <span className="size-1.5 rounded-full bg-secondary" /> : null}
                </span>
                <span className={`text-[15px] ${done || active ? "text-on-surface" : "text-on-surface-variant/50"}`}>
                  {step.label}
                </span>
                {active && <TypingDots className="ml-1" />}
              </div>
            );
          })}
        </div>
      </main>

      <div className="flex shrink-0 justify-center gap-3 border-t border-deep-slate/10 p-4">
        <button
          onClick={togglePause}
          className="flex items-center gap-2 rounded-lg border border-deep-slate/15 px-5 py-2.5 text-[15px] font-medium text-on-surface transition-colors hover:bg-surface-container-high"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={abort}
          className="flex items-center gap-2 rounded-lg border border-error/30 px-5 py-2.5 text-[15px] font-medium text-error transition-colors hover:bg-error/5"
        >
          <X className="size-4" />
          Cancel
        </button>
      </div>
    </DeviceFrame>
  );
}
