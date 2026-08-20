import { ArrowLeft, Check, Waypoints, X } from "lucide-react";
import { useEffect, useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { DEMO, TIMINGS, sleep } from "@/lib/agent";
import { cn } from "@/lib/utils";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ProviderNegotiationProps {
  navigate: (route: Route) => void;
}

interface ProviderStep {
  id: number;
  title: string;
  note: string;
  status: "done" | "active";
}

const STEPS: ProviderStep[] = [
  { id: 1, title: "Finding incoming requests...", note: "Completed 12s ago", status: "done" },
  { id: 2, title: "Negotiating price with Ayesha's Agent...", note: "Completed 2s ago", status: "done" },
  { id: 3, title: "Finalizing counter-offer...", note: "", status: "active" },
];

/** Provider-side view: their agent working in the background (dark a2a_negotiation_status_2 variant). */
export function ProviderNegotiation({ navigate }: ProviderNegotiationProps) {
  const { agentActive, showToast } = useApp();
  const [step, setStep] = useState(0);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    let disposed = false;
    const run = async () => {
      await sleep(TIMINGS.timelineStep);
      if (disposed) return;
      setStep(1);
      await sleep(TIMINGS.timelineHold);
      if (disposed) return;
      setStep(2);
      await sleep(1_400);
      if (disposed) return;
      setCancelled(true);
    };
    run();
    return () => {
      disposed = true;
    };
  }, []);

  const cancel = () => {
    showToast("Operation cancelled");
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
        {/* Hub with pulsing rings */}
        <div className="relative mb-10 flex size-48 items-center justify-center">
          <div className="ring-expand absolute inset-0 rounded-full border-2 border-electric-mint" />
          <div className="ring-expand absolute inset-0 rounded-full border-2 border-electric-mint" style={{ animationDelay: "-1.2s" }} />
          <div className="relative z-10 flex size-24 items-center justify-center rounded-full border border-electric-mint/30 bg-electric-mint/10 shadow-[0_0_30px_rgba(0,184,148,0.2)]">
            <Waypoints className="size-12 text-electric-mint" fill="currentColor" />
          </div>
          <svg className="pointer-events-none absolute inset-0 h-full w-full text-electric-mint/20" viewBox="0 0 100 100">
            <line stroke="currentColor" strokeWidth="1" x1="50" x2="10" y1="50" y2="20" />
            <line stroke="currentColor" strokeWidth="1" x1="50" x2="90" y1="50" y2="30" />
            <line stroke="currentColor" strokeWidth="1" x1="50" x2="20" y1="50" y2="80" />
            <line stroke="currentColor" strokeWidth="1" x1="50" x2="80" y1="50" y2="90" />
          </svg>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-on-primary">Agent Active</h2>
          <p className="mt-1 font-mono text-[13px] text-on-primary/60">
            {agentActive ? "Auto-negotiating incoming jobs..." : "Manual mode active"}
          </p>
        </div>

        {/* Status card */}
        <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-on-primary/10 bg-on-primary/5 p-5 shadow-lg backdrop-blur-sm">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex flex-col gap-6">
            {STEPS.slice(0, step + 1).map(item => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="mt-1 flex flex-col items-center">
                  {item.status === "done" ? (
                    <span className="flex size-6 items-center justify-center rounded-full border border-electric-mint bg-electric-mint/20">
                      <Check className="size-3.5 text-electric-mint" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-full border-2 border-electric-mint bg-electric-mint shadow-[0_0_10px_rgba(0,184,148,0.5)]">
                      <span className="size-2 animate-pulse rounded-full bg-deep-slate" />
                    </span>
                  )}
                  {item.status === "done" && item.id < STEPS.length && (
                    <div className="my-1 h-8 w-px bg-on-primary/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[15px] leading-6",
                      item.status === "done"
                        ? "text-on-primary/80 line-through"
                        : "font-semibold text-on-primary",
                    )}
                  >
                    {item.title}
                  </p>
                  {item.status === "done" ? (
                    <p className="mt-1 font-mono text-[12px] text-on-primary/50">{item.note}</p>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex gap-1">
                        {[0, 1, 2].map(d => (
                          <span
                            key={d}
                            className="size-1.5 animate-bounce rounded-full bg-electric-mint"
                            style={{ animationDelay: `${d * 150}ms` }}
                          />
                        ))}
                      </span>
                      <p className="font-mono text-[12px] text-electric-mint">In progress</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {step >= STEPS.length - 1 && (
              <div className="flex items-start gap-4">
                <span className="mt-1 flex size-6 items-center justify-center rounded-full border border-electric-mint bg-electric-mint/20">
                  <Check className="size-3.5 text-electric-mint" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-[15px] leading-6 text-on-primary/80">
                    Counter-offer sent to customer's agent — awaiting reply
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-on-primary/50">Completed just now</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={cancel}
          className="mt-8 flex items-center gap-2 rounded-full border border-on-primary/20 px-6 py-2 font-mono text-[13px] text-on-primary/60 transition-colors hover:border-on-primary/40 hover:text-on-primary"
        >
          <X className="size-4" />
          Cancel Operation
        </button>
      </main>
    </DeviceFrame>
  );
}