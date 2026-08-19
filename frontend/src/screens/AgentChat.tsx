import { Plus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AgentTypingRow, ChatMessageRow } from "@/components/shared/ChatMessage";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { DEMO, TIMINGS, sleep } from "@/lib/agent";
import { STATUS_ROUTE, type Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface AgentChatProps {
  navigate: (route: Route) => void;
}

export function AgentChat({ navigate }: AgentChatProps) {
  const { request, startRequest, addMessage, setStatus, showToast } = useApp();
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const started = useRef(false);
  const mounted = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!request && !started.current) {
      started.current = true;
      startRequest();
    }
  }, [request, startRequest]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [request?.messages.length, typing]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || typing) return;
    setText("");
    addMessage(value, "user");

    setTyping(true);
    await sleep(TIMINGS.typing);
    if (!mounted.current) return;
    setTyping(false);
    addMessage(DEMO.agentAck, "agent");

    await sleep(TIMINGS.agentReplyHold);
    if (!mounted.current) return;
    setStatus("searching");
    navigate("magic");
  };

  return (
    <DeviceFrame>
      <TopAppBar
        onBack={() => navigate(STATUS_ROUTE[request?.status ?? "chatting"] ?? "dashboard")}
        title={
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <span className="font-mono text-[11px] font-bold">AI</span>
            </span>
            <div>
              <h1 className="text-[17px] font-semibold leading-5 text-primary">Your Taiz Agent</h1>
              <p className="font-mono text-[10px] text-on-surface-variant">online · auto-negotiating</p>
            </div>
          </div>
        }
        right={
          <span className="flex size-8 items-center justify-center rounded-full bg-surface-variant text-[11px] font-semibold text-on-surface-variant">
            AK
          </span>
        }
      />

      <main ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-soft-sand px-4 py-4">
        <div className="flex justify-center">
          <span className="rounded-sm border border-outline-variant/10 bg-surface-variant/50 px-2 py-1 font-mono text-[11px] text-on-surface-variant">
            Today
          </span>
        </div>

        {request?.messages.map(message => (
          <ChatMessageRow key={message.id} message={message} />
        ))}

        {typing && <AgentTypingRow />}
      </main>

      <form
        onSubmit={send}
        className="z-40 flex shrink-0 items-center gap-2 border-t border-deep-slate/10 bg-surface p-3"
      >
        <button
          type="button"
          onClick={() => showToast("Attach files — coming soon")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
          aria-label="Attach"
        >
          <Plus className="size-5" />
        </button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message your agent..."
          className="h-10 min-w-0 flex-1 rounded-full border border-outline-variant/30 bg-surface-container px-4 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-electric-mint"
        />
        <button
          type="submit"
          aria-label="Send"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-electric-mint text-deep-slate shadow-sm transition-transform active:scale-95"
        >
          <span className="text-base font-bold">↵</span>
        </button>
      </form>
    </DeviceFrame>
  );
}