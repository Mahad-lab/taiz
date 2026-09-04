import { cn } from "@/lib/utils";

export function TypingDots({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label="Typing">
      {[0, 150, 300].map(delay => (
        <span
          key={delay}
          className={cn("size-1.5 rounded-full animate-bounce", dotClassName ?? "bg-outline")}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}