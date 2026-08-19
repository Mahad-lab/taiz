import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopAppBarProps {
  title?: ReactNode;
  /** Left slot — defaults to a back button when `onBack` is provided. */
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  dark?: boolean;
  /** Center the title, balancing left/right slots (status screens). */
  center?: boolean;
  className?: string;
}

export function TopAppBar({ title, left, right, onBack, dark, center, className }: TopAppBarProps) {
  const leftSlot = left ?? (onBack ? (
    <button
      onClick={onBack}
      aria-label="Go back"
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-colors",
        dark ? "text-on-primary hover:bg-on-primary/10" : "text-on-surface hover:bg-surface-variant",
      )}
    >
      <ArrowLeft className="size-5" />
    </button>
  ) : (
    <div className="size-9" aria-hidden="true" />
  ));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b px-4",
        dark ? "border-on-primary/10 bg-primary/80 text-on-primary backdrop-blur-md" : "border-deep-slate/10 bg-surface",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">{leftSlot}</div>
      {title && (
        <div
          className={cn(
            "flex min-w-0 flex-1 justify-start",
            center && "justify-center",
          )}
        >
          {title}
        </div>
      )}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">{right ?? <div className="size-9" aria-hidden="true" />}</div>
    </header>
  );
}