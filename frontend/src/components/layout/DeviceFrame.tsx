import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  children: ReactNode;
  /** Background for the frame surface (defaults to soft sand). */
  className?: string;
}

/**
 * Mobile-first shell. On desktop it presents the app as a centered device frame;
 * on mobile it fills the viewport edge-to-edge.
 */
export function DeviceFrame({ children, className }: DeviceFrameProps) {
  return (
    <div className="min-h-dvh bg-surface-dim/30 md:flex md:items-center md:justify-center md:py-6">
      <div
        className={cn(
          "relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-soft-sand",
          "md:h-[min(860px,94dvh)] md:rounded-[32px] md:border md:border-deep-slate/10 md:shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}