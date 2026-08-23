import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import type { NavTabId } from "./BottomNav";

const TABS: { id: NavTabId; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "activity", label: "Activity" },
  { id: "review", label: "Review" },
  { id: "history", label: "History" },
];

interface DesktopHeaderProps {
  active: NavTabId;
  onSelect?: (tab: NavTabId) => void;
  onSettings?: () => void;
  dark?: boolean;
}

/** Full-width product header shown on md+ screens (Tasks / Activity / Review / History). */
export function DesktopHeader({ active, onSelect, onSettings, dark }: DesktopHeaderProps) {
  return (
    <header
      className={cn(
        "hidden w-full items-center justify-between border-b px-10 py-3 md:flex",
        dark ? "border-on-primary/10 bg-primary text-on-primary" : "border-deep-slate/10 bg-surface",
      )}
    >
      <Logo dark={dark} />
      <nav className="flex gap-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelect?.(tab.id)}
            className={cn(
              "rounded px-3 py-1.5 font-mono text-[13px] transition-colors",
              tab.id === active
                ? dark
                  ? "border-b-2 border-secondary-fixed text-secondary-fixed"
                  : "border-b-2 border-electric-mint font-semibold text-primary"
                : cn("border-b-2 border-transparent hover:bg-surface-container-high/50", dark ? "text-on-primary/70" : "text-on-surface-variant"),
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <button
        onClick={() => onSettings?.()}
        aria-label="Settings"
        className={cn("rounded-full p-2 transition-colors", dark ? "text-on-primary hover:bg-on-primary/10" : "text-primary hover:bg-surface-container-high/50")}
      >
        <Settings className="size-5" />
      </button>
    </header>
  );
}