import { ArrowRight, Inbox, Settings } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AgentInput } from "@/components/shared/AgentInput";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Logo } from "@/components/shared/Logo";
import { customerTabHandler } from "@/lib/nav";
import { STATUS_ROUTE, type Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";
import type { Category, RequestStatus } from "@/state/types";

const STATUS_LABEL: Record<RequestStatus, string> = {
  searching: "Searching",
  comparing: "Comparing",
  review: "Ready to review",
  confirmed: "Confirmed",
  declined: "Declined",
};

const SUGGESTIONS = ["Find a nearby bakery", "Book a home repair", "Find a mechanic", "Compare local providers"];

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
  const { request, startRequest, showToast } = useApp();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("bakery");
  const [city, setCity] = useState("Karachi");

  const launch = () => {
    if (!text.trim()) {
      showToast("Tell Taiz what you're looking for");
      return;
    }
    startRequest({
      item: text.trim(),
      quantity: 1,
      city: city.trim() || "Karachi",
      category,
    });
    navigate("agent-task");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    launch();
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
        />

        <div className="flex flex-col gap-3">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Category</label>
            <div className="mt-1.5 flex gap-2">
              {(["bakery", "restaurant"] as Category[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex-1 rounded-full border px-3.5 py-2 text-[13px] font-medium capitalize transition-colors ${
                    category === c
                      ? "border-electric-mint bg-electric-mint/10 text-deep-slate"
                      : "border-deep-slate/10 bg-white text-on-surface-variant hover:border-electric-mint/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">City</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Karachi"
              className="mt-1.5 w-full rounded-md border border-deep-slate/10 bg-white py-2.5 px-3 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-electric-mint"
            />
          </div>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Try asking</h2>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={launch}
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
              onClick={() => navigate(STATUS_ROUTE[activeTask.status] ?? "agent-task")}
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
