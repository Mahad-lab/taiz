import { Bot, Pause, Play, Square, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TerminalLog } from "@/components/shared/TerminalLog";
import { TIMINGS, buildTerminal, sleep } from "@/lib/agent";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface MagicViewProps {
  navigate: (route: Route) => void;
}

const AGENT_RING = "flex size-24 items-center justify-center rounded-full border-2";

export function MagicView({ navigate }: MagicViewProps) {
  const { declineOrder, setStatus, showToast } = useApp();
  const lines = useRef(buildTerminal()).current;
  const [visible, setVisible] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const cancelled = useRef(false);

  const waitForResume = () =>
    new Promise<void>(resolve => {
      const check = () => (pausedRef.current ? setTimeout(check, 120) : resolve());
      check();
    });

  useEffect(() => {
    cancelled.current = false;
    const run = async () => {
      for (let i = 1; i <= lines.length; i++) {
        await waitForResume();
        if (cancelled.current) return;
        setVisible(i);
        await sleep(TIMINGS.terminalLine);
        if (cancelled.current) return;
      }
      await waitForResume();
      if (cancelled.current) return;
      await sleep(TIMINGS.terminalHold);
      if (cancelled.current) return;
      setStatus("negotiating");
      navigate("negotiation");
    };
    run();
    return () => {
      cancelled.current = true;
    };
  }, [lines, navigate, setStatus]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    showToast(pausedRef.current ? "Search paused" : "Search resumed");
  };

  const abort = () => {
    cancelled.current = true;
    declineOrder();
    showToast("Process aborted");
    navigate("dashboard");
  };

  return (
    <DeviceFrame className="cyber-grid bg-primary text-on-primary">
      {/* Minimal status header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-on-primary/10 px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-on-primary/10 text-secondary-container">
            <Bot className="size-5" fill="currentColor" />
          </span>
          <span className="text-lg font-bold tracking-tight">Agent Status</span>
        </div>
        <button
          onClick={abort}
          className="rounded border border-outline/30 px-3 py-1.5 font-mono text-[13px] text-on-primary transition-colors hover:bg-on-primary/10"
        >
          Abort Process
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6">
        {/* Network visualization */}
        <div className="relative flex w-full max-w-xl items-center justify-between">
          <div className="z-10 flex flex-col items-center gap-2">
            <div className={`${AGENT_RING} border-secondary-container bg-on-primary/10 shadow-[0_0_20px_rgba(109,250,210,0.2)]`}>
              <Bot className="size-10 text-secondary-container" fill="currentColor" />
            </div>
            <div className="rounded border border-outline/20 bg-primary-container/80 px-3 py-1 font-mono text-[13px] text-secondary-container backdrop-blur">
              Your Agent
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-24 top-1/2 flex h-24 -translate-y-1/2 items-center overflow-hidden">
            <svg className="h-full w-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q50,20 100,10" fill="none" stroke="rgba(116,120,121,0.3)" strokeWidth="1" />
              <path d="M0,10 Q50,0 100,10" fill="none" stroke="rgba(116,120,121,0.3)" strokeWidth="1" />
              <line className="pulse-stream" stroke="#6dfad2" strokeDasharray="5 15" strokeWidth="2" x1="0" x2="100" y1="10" y2="10" />
            </svg>
          </div>

          <div className="z-10 flex flex-col items-center gap-2">
            <div className={`${AGENT_RING} border-outline-variant bg-on-primary/10 opacity-80`}>
              <Store className="size-10 text-outline-variant" />
            </div>
            <div className="rounded border border-outline/20 bg-primary-container/80 px-3 py-1 text-center backdrop-blur">
              <span className="block font-mono text-[13px] text-outline-variant">Bakery Agent</span>
              <span className="block font-mono text-[11px] text-on-surface-variant opacity-70">(Discovery Mode)</span>
            </div>
          </div>
        </div>

        <TerminalLog className="w-full max-w-xl" lines={lines.slice(0, visible)} />

        <div className="flex gap-3">
          <button
            onClick={togglePause}
            className="flex items-center gap-2 rounded-lg border border-outline/30 px-5 py-2.5 text-[16px] font-medium text-on-primary transition-all hover:bg-on-primary/10"
          >
            {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
            {paused ? "Resume Search" : "Pause Search"}
          </button>
          <button
            onClick={abort}
            className="flex items-center gap-2 rounded-lg border border-error/40 px-5 py-2.5 text-[16px] font-medium text-error transition-all hover:bg-error/10"
          >
            <Square className="size-4" fill="currentColor" />
            Abort
          </button>
        </div>
      </main>
    </DeviceFrame>
  );
}