import { cn } from "@/lib/utils";
import type { TerminalLine } from "@/lib/agent";

interface TerminalLogProps {
  lines: TerminalLine[];
  className?: string;
}

const KIND_CLASS: Record<TerminalLine["kind"], string> = {
  dim: "opacity-40",
  info: "opacity-90 text-secondary-fixed",
  highlight: "text-secondary-fixed",
  awaiting: "animate-pulse",
};

/** Mono terminal log card used on the A2A "magic" status screen. */
export function TerminalLog({ lines, className }: TerminalLogProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-outline/20 bg-primary-container/50 p-4 font-mono text-[13px] leading-5 text-secondary-container shadow-lg backdrop-blur-sm",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-primary-container/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-secondary-container/50" />
      <div className="flex max-h-48 flex-col gap-1.5 overflow-hidden pl-3">
        {lines.map(line => (
          <div key={line.id} className={cn(KIND_CLASS[line.kind])}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-primary-container/80 to-transparent" />
    </div>
  );
}