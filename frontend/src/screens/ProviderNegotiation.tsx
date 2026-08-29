import { ArrowLeft, Check, Waypoints } from "lucide-react";
import { useEffect, useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TIMINGS, sleep } from "@/lib/agent";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ProviderNegotiationProps {
  navigate: (route: Route) => void;
}

const STEPS = [
  { id: 1, title: "Listening for incoming requests...", note: "Always on", status: "done" as const },
  { id: 2, title: "Replying with fixed catalog prices...", note: "No negotiation", status: "done" as const },
  { id: 3, title: "Awaiting customer confirmation", note: "", status: "active" as const },
];

/** Provider-side view: their agent working in the background (fixed-price comparison). */
export function ProviderNegotiation({ navigate }: ProviderNegotiationProps) {
  const { agentActive, showToast } = useApp();
  const [step, setStep] = useState(STEPS.length - 1);

  useEffect(() => {
    let disposed = false;
    const run = async () => {
      await sleep(TIMINGS.timelineStep);
      if (disposed) return;
      setStep(1);
      await sleep(TIMINGS.timelineHold);
      if (disposed) return;
      setStep(2);
    };
    run();
    return () => {
      disposed = true;
    };
  }, []);

  const cancel = () => {
    showToast("Back to dashboard");
    navigate("provider");
  };

  return (
    <DeviceFrame className="bg-deep-slate text-on-primary">
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <button
          onClick={() => navigate("provider")}
          aria-label="Go back"
          className="flex size-9 items-center justify-center rounded-full text-on-primary transition-colors hover:bg-on-primary/10"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-on-primary">Taiz</h1>
        <div className="size-9" aria-hidden="true" />
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8">
        <div className="relative mb-10 flex size-48 items-center justify-center">
          <div className="ring-expand absolute inset-0 rounded-full border-2 border-electric-mint" />
          <div className="ring-expand absolute inset-0 rounded-full border-2 border-electric-mint" style={{ animationDelay: "-1.2s" }} />
          <div className="relative z-10 flex size-24 items-center justify-center rounded-full border border-electric-mint/30 bg-electric-mint/10 shadow-[0_0_30px_rgba(0,184,148,0.2)]">
            <Waypoints className="size-12 text-electric-mint" fill="currentColor" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-on-primary">Agent Active</h2>
          <p className="mt-1 font-mono text-[13px] text-on-primary/60">
            {agentActive ? "Replying with fixed prices..." : "Manual mode active"}
          </p>
        </div>

        <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-on-primary/10 bg-on-primary/5 p-5 shadow-lg backdrop-blur-sm">
          <div className="relative flex flex-col gap-6">
            {STEPS.slice(0, step + 1).map(item => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="mt-1 flex flex-col items-center">
                  <span className="flex size-6 items-center justify-center rounded-full border border-electric-mint bg-electric-mint/20">
                    <Check className="size-3.5 text-electric-mint" strokeWidth={3} />
                  </span>
                  {item.status === "done" && item.id < STEPS.length && (
                    <div className="my-1 h-8 w-px bg-on-primary/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] leading-6 text-on-primary/80">{item.title}</p>
                  {item.note && <p className="mt-1 font-mono text-[12px] text-on-primary/50">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={cancel}
          className="mt-8 flex items-center gap-2 rounded-full border border-on-primary/20 px-6 py-2 font-mono text-[13px] text-on-primary/60 transition-colors hover:border-on-primary/40 hover:text-on-primary"
        >
          Back to dashboard
        </button>
      </main>
    </DeviceFrame>
  );
}
