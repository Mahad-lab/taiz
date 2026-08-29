import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

/** Branded switch toggle (Deep Slate / Electric Mint).
 *  Implemented as a controlled `role="switch"` button so a single tap/click
 *  produces exactly one `onChange`, working consistently on touch and mouse. */
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
        "relative h-8 w-14 shrink-0 rounded-full border outline-none transition-colors duration-300",
        checked
          ? "border-electric-mint bg-electric-mint"
          : "border-deep-slate bg-deep-slate",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-0 block size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
          checked ? "translate-x-7" : "translate-x-1",
        )}
      />
    </button>
  );
}
