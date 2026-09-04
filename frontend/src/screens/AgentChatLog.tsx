import { Bot, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { TypingDots } from "@/components/shared/TypingDots";
import { buildComparisonChat, sleep, type AgentChatLine } from "@/lib/agent";
import { cn } from "@/lib/utils";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface AgentChatLogProps {
  navigate: (route: Route) => void;
}

const REVEAL_MS = 700;

/** Human-readable log of the availability comparison (replaces the negotiation transcript). */
export function AgentChatLog({ navigate }: AgentChatLogProps) {
  const { request } = useApp();
  const comparison = request?.comparison;
  const lines = useRef(comparison ? buildComparisonChat(comparison, request?.city ?? "") : []).current;
  const [visible, setVisible] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 1; i <= lines.length; i++) {
        await sleep(REVEAL_MS);
        if (cancelled) return;
        setVisible(i);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [lines.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [visible]);

  return (
    <DeviceFrame>
      <TopAppBar
        onBack={() => navigate("agent-activity")}
        title={
          <div>
            <h1 className="text-[17px] font-semibold leading-5 text-primary">Comparison log</h1>
            <p className="font-mono text-[11px] text-on-surface-variant">Your Agent ↔ Provider Agents</p>
          </div>
        }
      />

      <main ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="flex justify-center">
          <span className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest px-2 py-1 font-mono text-[11px] text-on-surface-variant">
            Comparing fixed prices — no haggling
          </span>
        </div>

        {lines.slice(0, visible).map(line => (
          <AgentLine key={line.id} line={line} />
        ))}

        {visible < lines.length && (
          <div className="flex items-center gap-1.5 pl-1 font-mono text-[11px] text-on-surface-variant/70">
            <TypingDots />
            agents responding
          </div>
        )}

        {lines.length === 0 && (
          <p className="text-center font-mono text-[12px] text-on-surface-variant">No comparison yet.</p>
        )}
      </main>
    </DeviceFrame>
  );
}

function AgentLine({ line }: { line: AgentChatLine }) {
  const yours = line.from === "yours";
  return (
    <div className={cn("flex w-full flex-col gap-1", yours ? "items-start" : "items-end")}>
      <div className="flex items-center gap-1.5">
        {yours ? (
          <Bot className="size-3.5 text-secondary" fill="currentColor" />
        ) : (
          <Store className="size-3.5 text-on-surface-variant" />
        )}
        <span className="font-mono text-[11px] text-on-surface-variant">{yours ? "Your Agent" : "Provider Agent"}</span>
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-[14px] leading-5 shadow-sm",
          line.offer ? "border-l-2 border-electric-mint bg-electric-mint/5" : "border border-outline-variant/20 bg-white",
          yours ? "rounded-tl-sm" : "rounded-tr-sm",
        )}
      >
        <p className="text-on-surface">{line.text}</p>
      </div>
      <span className="font-mono text-[10px] text-on-surface-variant/70">{line.time}</span>
    </div>
  );
}
