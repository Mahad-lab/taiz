import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DiscoverProvider } from "@/lib/agent";

interface ProviderCardProps {
  provider: DiscoverProvider;
  onClick?: () => void;
  className?: string;
}

/** Decision-focused provider summary — name, trust signal, distance, availability, price. */
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
          <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">{provider.category}</p>
        </div>
        {provider.verified && (
          <Badge variant="mint" className="shrink-0">
            <BadgeCheck className="size-3" />
            Verified
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-on-surface-variant">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 text-secondary" fill="currentColor" />
          {provider.rating}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {provider.distanceKm} km
        </span>
        <span>{provider.availability}</span>
      </div>

      <p className="text-[13px] text-on-surface-variant">
        From <span className="font-semibold text-primary">{provider.priceFrom.toLocaleString()} PKR</span>
      </p>
    </button>
  );
}
