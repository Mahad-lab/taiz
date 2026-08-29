import { Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Timeline } from "@/components/shared/Timeline";
import { buildComparisonTimeline, sleep, TIMINGS, type TimelineStep } from "@/lib/agent";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface AgentActivityProps {
  navigate: (route: Route) => void;
}

export function AgentActivity({ navigate }: AgentActivityProps) {
  const { request, setStatus, showToast } = useApp();
  const comparison = request?.comparison;
  const [steps, setSteps] = useState<TimelineStep[]>(() =>
    comparison ? buildComparisonTimeline(comparison) : [],
  );
  const cancelled = useRef(false);

  useEffect(() => {
    if (!comparison) {
      navigate("agent-task");
      return;
    }
    cancelled.current = false;
    const run = async () => {
      await sleep(TIMINGS.timelineStep);
      if (cancelled.current) return;
      setSteps(prev =>
        prev.map(step =>
          step.status === "active"
            ? { ...step, status: "done", detail: "Cheapest available shown first.", time: "NOW" }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTab = customerTabHandler(navigate, showToast);

  return (
    <DeviceFrame>
      <TopAppBar onBack={() => navigate("home")} center title={<span className="text-lg font-bold text-primary">Taiz</span>} />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-24 pt-2">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Agent activity</h1>
          <p className="mt-1 text-[15px] text-on-surface-variant">Comparing fixed prices...</p>
        </div>

        <div className="relative mb-6 flex h-32 items-center justify-center">
          <div className="pulse-ring relative flex size-20 items-center justify-center rounded-full bg-secondary/10">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary shadow-sm">
              <Bot className="size-7 text-on-secondary" fill="currentColor" />
            </div>
          </div>
        </div>

        <h2 className="mb-4 font-mono text-[13px] uppercase tracking-wider text-on-surface-variant">What Taiz is doing</h2>
        <Timeline steps={steps} />

        <button
          onClick={() => navigate("agent-chat-log")}
          className="mt-5 w-full rounded-lg bg-primary-container px-4 py-3 font-mono text-[13px] font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          View comparison log
        </button>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="home" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
