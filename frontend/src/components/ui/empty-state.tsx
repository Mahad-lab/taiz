import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

/** Reusable placeholder for screens/sections with nothing to show yet. */
export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-on-surface/10 bg-surface-container-lowest py-10 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant/50">
        <Icon className="size-6" />
      </span>
      <div className="flex flex-col gap-0.5 px-6">
        <p className="font-mono text-[13px] text-on-surface-variant/70">{title}</p>
        {description && <p className="text-[13px] text-on-surface-variant/60">{description}</p>}
      </div>
    </div>
  );
}
