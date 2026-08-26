import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

/** Branded switch toggle (Deep Slate / Electric Mint), built on Radix UI Switch. */
export function Toggle({ checked, onChange, className, label, disabled }: ToggleProps) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full border outline-none transition-colors duration-300",
        "data-[state=checked]:border-electric-mint data-[state=checked]:bg-electric-mint",
        "data-[state=unchecked]:border-deep-slate data-[state=unchecked]:bg-deep-slate",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <Switch.Thumb
        className={cn(
          "absolute top-[3px] left-0 block size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
          "translate-x-1 data-[state=checked]:translate-x-7",
        )}
      />
    </Switch.Root>
  );
}
