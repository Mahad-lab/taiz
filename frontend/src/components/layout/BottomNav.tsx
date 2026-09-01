import {
  Bot,
  Briefcase,
  Compass,
  MessageCircle,
  Package,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTabId =
  | "home"
  | "discover"
  | "activity"
  | "you"
  | "chat"
  | "products"
  | "jobs"
  | "orders"
  | "profile"
  | "settings";

interface NavTab {
  id: NavTabId;
  label: string;
  icon: LucideIcon;
}

const CUSTOMER_TABS: NavTab[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "products", label: "Products", icon: Package },
];

const PROVIDER_TABS: NavTab[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "orders", label: "Orders", icon: Briefcase },
  { id: "products", label: "Products", icon: Package },
  { id: "settings", label: "Settings", icon: SettingsIcon },
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