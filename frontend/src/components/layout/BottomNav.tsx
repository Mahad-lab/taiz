import {
  ArrowLeftRight,
  Bot,
  Briefcase,
  Compass,
  Handshake,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTabId = "home" | "discover" | "activity" | "you" | "jobs" | "explore" | "negotiations" | "profile";

interface NavTab {
  id: NavTabId;
  label: string;
  icon: LucideIcon;
}

const CUSTOMER_TABS: NavTab[] = [
  { id: "home", label: "Home", icon: Bot },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "activity", label: "Activity", icon: ArrowLeftRight },
  { id: "you", label: "You", icon: UserRound },
];

const PROVIDER_TABS: NavTab[] = [
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "negotiations", label: "Agent", icon: Bot },
  { id: "profile", label: "Profile", icon: UserRound },
];

interface BottomNavProps {
  variant: "customer" | "provider";
  active: NavTabId;
  onSelect?: (tab: NavTabId) => void;
  dark?: boolean;
}

export function BottomNav({ variant, active, onSelect, dark }: BottomNavProps) {
  const tabs = variant === "customer" ? CUSTOMER_TABS : PROVIDER_TABS;

  return (
    <nav
      className={cn(
        "z-40 flex h-16 shrink-0 items-stretch justify-around border-t px-4",
        dark ? "border-on-primary/10 bg-primary text-on-primary" : "border-deep-slate/10 bg-surface-container-lowest",
      )}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect?.(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-1 border-t-2 pt-1 transition-colors active:scale-95",
              isActive
                ? dark
                  ? "border-secondary-fixed text-secondary-fixed"
                  : "border-secondary text-secondary"
                : cn("border-transparent", dark ? "text-on-primary/60" : "text-on-surface-variant"),
            )}
          >
            {/* Removed isActive && "fill-current" below */}
            <Icon className="size-[22px]" strokeWidth={1.8} />
            <span className="font-mono text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}