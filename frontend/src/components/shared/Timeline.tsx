import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineStep } from "@/lib/agent";

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

/** Vertical activity timeline for agent status screens (done / active / todo). */
export function Timeline({ steps, className }: TimelineProps) {
  return (
    <ol className={cn("relative ml-3 space-y-6 border-l border-outline-variant/30 pl-6", className)}>
      {steps.map(step => {
        const done = step.status === "done";
        const active = step.status === "active";
        return (
          <li key={step.id} className="relative">
            {done && (
              <span
                className={cn(
                  "absolute -left-[30px] top-1 flex size-3 items-center justify-center rounded-full bg-secondary-fixed ring-4 ring-surface",
                )}
              />
            )}
            {active && (
              <span className="absolute -left-[32px] top-1 flex size-4 items-center justify-center rounded-full border-2 border-secondary bg-surface ring-4 ring-surface">
                <span className="size-1.5 animate-ping rounded-full bg-secondary" />
              </span>
            )}
            {!done && !active && (
              <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full border border-outline-variant bg-surface" />
            )}
            <div
              className={cn(
                "rounded-lg border p-4 transition-colors",
                active
                  ? "border-secondary/30 bg-surface-container-low shadow-sm"
                  : done
                    ? "border-primary-container/10 bg-surface-container-lowest"
                    : "border-primary-container/10 bg-surface-container-lowest opacity-60",
              )}
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-on-surface-variant">
                  {active ? "NOW" : step.time}
                </span>
                {done && <Check className="size-4 shrink-0 text-secondary" strokeWidth={2.5} />}
                {active && (
                  <span className="flex h-4 items-center gap-1">
                    {[0, 1, 2].map(d => (
                      <span
                        key={d}
                        className="size-1.5 animate-bounce rounded-full bg-secondary"
                        style={{ animationDelay: `${d * 160}ms` }}
                      />
                    ))}
                  </span>
                )}
              </div>
              <p className="font-medium text-primary">{step.title}</p>
              {step.detail && (
                <p className="mt-1 font-mono text-[13px] leading-5 text-on-surface-variant">{step.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}