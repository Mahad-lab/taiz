import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

/** Agent-to-agent node mark (deep slate square, two connected nodes). */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2D3436" />
      <circle cx="12" cy="16" r="4.5" fill="#FDF9F3" />
      <circle cx="20" cy="16" r="4.5" fill="#00B894" />
      <path d="M15 16h2" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.4" fill="#2D3436" />
      <circle cx="20" cy="16" r="1.4" fill="#2D3436" />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  markClassName?: string;
  dark?: boolean;
}

/** Full Taiz lockup: node mark + lowercase wordmark. */
export function Logo({ className, markClassName, dark }: WordmarkProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className={cn("size-7", markClassName)} />
      <span
        className={cn(
          "text-xl font-bold tracking-[-0.02em]",
          dark ? "text-on-primary" : "text-primary",
        )}
      >
        taiz
      </span>
    </div>
  );
}