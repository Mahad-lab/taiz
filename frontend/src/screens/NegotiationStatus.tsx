import { Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Timeline } from "@/components/shared/Timeline";
import { DEMO, TIMINGS, buildTimeline, sleep, type TimelineStep } from "@/lib/agent";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface NegotiationStatusProps {
  navigate: (route: Route) => void;
}

export function NegotiationStatus({ navigate }: NegotiationStatusProps) {
  const { request, setStatus, showToast } = useApp();
  const [steps, setSteps] = useState<TimelineStep[]>(() => buildTimeline());
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    const run = async () => {
      await sleep(TIMINGS.timelineStep);
      if (cancelled.current) return;
      setSteps(prev =>
        prev.map(step =>
          step.status === "active"
            ? {
                ...step,
                status: "done",
                title: "Counter-offer received",
                detail: `${DEMO.finalPrice.toLocaleString()} PKR — within budget.`,
                time: "NOW",
              }
            : step,
        ),
      );
      await sleep(TIMINGS.timelineHold);
      if (cancelled.current) return;
      setStatus("review");
      navigate("review");
    };
    run();
    return () => {
      cancelled.current = true;
    };
  }, [navigate, setStatus]);

  const onTab = customerTabHandler(navigate, request, showToast);

  return (
    <DeviceFrame>
      <TopAppBar
        onBack={() => navigate("magic")}
        center
        title={<span className="text-lg font-bold text-primary">Taiz</span>}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-24 pt-2">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">AI Agent Active</h1>
          <p className="mt-1 text-[15px] text-on-surface-variant">Working on your request...</p>
        </div>

        {/* Pulsing node */}
        <div className="relative mb-6 flex h-40 items-center justify-center">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
            <div className="absolute top-1/2 h-px w-full -rotate-45 origin-center bg-secondary" />
            <div className="absolute top-1/2 h-px w-full rotate-45 origin-center bg-secondary" />
            <div className="absolute left-1/2 h-full w-px bg-secondary" />
          </div>
          <div className="pulse-ring relative flex size-24 items-center justify-center rounded-full bg-secondary/10">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary shadow-lg shadow-secondary/20">
              <Bot className="size-8 text-on-secondary" fill="currentColor" />
            </div>
          </div>
        </div>

        <h2 className="mb-4 font-mono text-[13px] uppercase tracking-wider text-on-surface-variant">Activity Log</h2>
        <Timeline steps={steps} />

        <button
          onClick={() => navigate("agent-chat-log")}
          className="mt-5 w-full rounded bg-primary-container px-4 py-3 font-mono text-[13px] font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          View Chat Log
        </button>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="tasks" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}