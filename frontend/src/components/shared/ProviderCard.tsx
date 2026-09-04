import { BadgeCheck, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BusinessListing } from "@/lib/api";

interface ProviderCardProps {
  provider: BusinessListing;
  onClick?: () => void;
  className?: string;
}

/** Business directory card — fixed-price comparison backend has no rating/distance/verified. */
export function ProviderCard({ provider, onClick, className }: ProviderCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-lg border border-deep-slate/10 bg-white p-4 text-left transition-colors hover:border-electric-mint",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold text-primary">{provider.name}</p>
          <p className="mt-0.5 font-mono text-[11px] capitalize text-on-surface-variant">{provider.category}</p>
        </div>
        <Badge variant="mint" className="shrink-0">
          <BadgeCheck className="size-3" />
          Listed
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-on-surface-variant">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {provider.neighborhood}, {provider.city}
        </span>
      </div>
    </button>
  );
}
