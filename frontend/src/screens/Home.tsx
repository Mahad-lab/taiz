import { ArrowRight, Inbox, Settings } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentInput } from "@/components/shared/AgentInput";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Logo } from "@/components/shared/Logo";
import { customerTabHandler } from "@/lib/nav";
import { type Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";
import type { RequestStatus } from "@/state/types";

const STATUS_LABEL: Record<RequestStatus, string> = {
  searching: "Searching",
  comparing: "Comparing",
  review: "Ready to review",
  confirmed: "Confirmed",
  declined: "Declined",
};

const ROTATING_PROMPTS = [
  "I need a cupcake",
  "Order me a chocolate cake",
  "Find a birthday cake under Rs 2,000",
  "Get me fresh croissants for breakfast",
  "Book a table for 4 tonight",
];

const QUICK_PROMPTS = ["Order me a chocolate cake", "I need a cupcake", "Book a table for 4 tonight"];

const HOW_IT_WORKS = [
  { title: "Ask", copy: "Tell Taiz what you need" },
  { title: "Compare", copy: "Taiz shortlists the best" },
  { title: "Confirm", copy: "Order in one tap" },
];

function useTypewriter(prompts: string[]) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let promptIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const prompt = prompts[promptIndex] ?? "";
      if (deleting) {
        charIndex -= 2;
        if (charIndex <= 0) {
          charIndex = 0;
          deleting = false;
          promptIndex = (promptIndex + 1) % prompts.length;
          setTyped("");
          timer = setTimeout(tick, 400);
          return;
        }
      } else {
        charIndex += 1;
        if (charIndex === prompt.length) {
          deleting = true;
          setTyped(prompt);
          timer = setTimeout(tick, 1800);
          return;
        }
      }
      setTyped(prompt.slice(0, charIndex));
      timer = setTimeout(tick, deleting ? 24 : 40 + Math.random() * 50);
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [prompts]);
  return typed;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

interface HomeProps {
  navigate: (route: Route) => void;
}

export function Home({ navigate }: HomeProps) {
  const { request, sendChatMessage, showToast } = useApp();
  const [text, setText] = useState("");
  const typedPrompt = useTypewriter(ROTATING_PROMPTS);

  const launch = async (initialText?: string) => {
    const messageText = (initialText ?? text).trim();
    if (!messageText) {
      showToast("Tell Taiz what you're looking for");
      return;
    }
    setText("");
    navigate("chat");
    try {
      await sendChatMessage(messageText);
    } catch {
      // Error surfaced in chat
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void launch();
  };

  const onTab = customerTabHandler(navigate, showToast);
  const activeTask = request && request.status !== "declined" ? request : null;
  return (
    <DeviceFrame>
      <TopAppBar
        left={<Logo markClassName="size-7" className="gap-1.5" />}
        right={
          <button
            onClick={() => showToast("Settings — coming soon")}
            className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </button>
        }
      />

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-24 pt-6">
        <div>
          <p className="font-mono text-[13px] uppercase tracking-wider text-on-surface-variant">{greeting()}</p>
          <h1 className="mt-1 text-[26px] font-semibold leading-8 tracking-tight text-primary">
            What can I take care of for you?
          </h1>
        </div>

        <AgentInput
          value={text}
          onChange={setText}
          onSubmit={onSubmit}
          onVoice={() => showToast("Voice input — coming soon")}
          placeholder={typedPrompt}
        />

        <section className="grid grid-cols-3 gap-3 rounded-lg border border-deep-slate/10 bg-white p-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title}>
              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                <span className="flex size-4 items-center justify-center rounded-full bg-electric-mint/15 text-[9px] text-deep-slate">
                  {i + 1}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">{step.copy}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Try asking</h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(s => (
              <button
                key={s}
                onClick={() => void launch(s)}
                className="rounded-full border border-deep-slate/10 bg-white px-3.5 py-2 text-[13px] text-on-surface transition-colors hover:border-electric-mint"
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Active requests</h2>
          {activeTask ? (
            <button
              onClick={() => navigate("chat")}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-deep-slate/10 bg-white p-4 text-left transition-colors hover:border-electric-mint"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-primary">{activeTask.item}</p>
                <p className="mt-0.5 font-mono text-xs text-on-surface-variant">
                  {activeTask.chosenReply?.businessId ?? activeTask.city}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  variant={
                    activeTask.status === "confirmed" ? "mint" : activeTask.status === "review" ? "warning" : "secondary"
                  }
                >
                  {STATUS_LABEL[activeTask.status]}
                </Badge>
                <ArrowRight className="size-4 text-on-surface-variant/50" />
              </div>
            </button>
          ) : (
            <EmptyState icon={Inbox} title="Nothing in progress" description="What can I take care of?" />
          )}
        </section>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="home" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
