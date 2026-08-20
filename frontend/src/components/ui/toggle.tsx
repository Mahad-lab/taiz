import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

/** Branded switch toggle (Deep Slate / Electric Mint), per the provider dashboard design. */
export function Toggle({ checked, onChange, className, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-electric-mint" : "bg-deep-slate",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          // Added `left-0` to explicitly anchor the absolute positioning
          "absolute top-1 left-0 size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
          // Changed [1.9rem] to 7 for perfect symmetrical 4px padding
          checked ? "translate-x-7" : "translate-x-1",
        )}
      />
    </button>
  );
}