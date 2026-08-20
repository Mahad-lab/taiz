import { Bot, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { buildAgentChat, sleep, type AgentChatLine } from "@/lib/agent";
import { cn } from "@/lib/utils";
import type { Route } from "@/lib/router";

interface AgentChatLogProps {
  navigate: (route: Route) => void;
}

const REVEAL_MS = 700;

/** Read-only transcript of the agent-to-agent negotiation between the two agents. */
export function AgentChatLog({ navigate }: AgentChatLogProps) {
  const lines = useRef(buildAgentChat()).current;
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
        onBack={() => navigate("negotiation")}
        title={
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-semibold leading-5 text-primary">Agent Chat Log</h1>
            <span className="rounded-sm border border-secondary/30 bg-secondary/10 px-1.5 py-0.5 font-mono text-[10px] text-secondary">
              A2A
            </span>
          </div>
        }
        right={
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
            <Bot className="size-4" fill="currentColor" />
          </span>
        }
      />

      <main
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-soft-sand px-4 py-4"
      >
        <div className="flex justify-center">
          <span className="rounded-sm border border-outline-variant/10 bg-surface-variant/50 px-2 py-1 font-mono text-[11px] text-on-surface-variant">
            Negotiating live — no human input needed
          </span>
        </div>

        {lines.slice(0, visible).map(line => (
          <AgentLine key={line.id} line={line} />
        ))}

        {visible < lines.length && (
          <div className="flex items-center gap-1.5 pl-1 font-mono text-[11px] text-on-surface-variant/70">
            <span className="flex gap-0.5">
              {[0, 1, 2].map(d => (
                <span
                  key={d}
                  className="size-1 animate-bounce rounded-full bg-secondary"
                  style={{ animationDelay: `${d * 160}ms` }}
                />
              ))}
            </span>
            agents negotiating
          </div>
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
        <span className="font-mono text-[11px] text-on-surface-variant">
          {yours ? "Your Agent" : "Bakery Agent"}
        </span>
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-[14px] leading-5 shadow-sm",
          yours
            ? "rounded-tl-sm border-l-2 border-secondary bg-white text-on-surface"
            : "rounded-tr-sm border border-outline-variant/20 bg-surface-container-lowest text-on-surface",
        )}
      >
        <p>{line.text}</p>
      </div>
      <span className="font-mono text-[10px] text-on-surface-variant/70">{line.time}</span>
    </div>
  );
}