import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ProviderCard } from "@/components/shared/ProviderCard";
import { EmptyState } from "@/components/ui/empty-state";
import { DISCOVER_CATEGORIES } from "@/lib/agent";
import * as api from "@/lib/api";
import type { BusinessListing, BusinessType } from "@/lib/api";
import { customerTabHandler } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface DiscoverProps {
  navigate: (route: Route) => void;
}

/** Geography-first directory of nearby, agent-reachable providers (from the backend). */
export function Discover({ navigate }: DiscoverProps) {
  const { showToast } = useApp();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useMemo(() => {
    let cancelled = false;
    api
      .listBusinesses()
      .then(list => {
        if (!cancelled) {
          setBusinesses(list);
          setLoaded(true);
        }
      })
      .catch(() => cancelled || setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter(p => {
      const matchesCategory = !category || p.category === (category.toLowerCase() as BusinessType);
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, businesses]);

  const onTab = customerTabHandler(navigate, showToast);

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Discover</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-3">
        <p className="text-[15px] text-on-surface-variant">Taiz knows these local businesses.</p>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search providers or categories"
            className="w-full rounded-md border border-deep-slate/10 bg-white py-3 pl-11 pr-4 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-electric-mint"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {DISCOVER_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(prev => (prev === c ? null : c))}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                category === c
                  ? "border-electric-mint bg-electric-mint/10 text-deep-slate"
                  : "border-deep-slate/10 bg-white text-on-surface-variant hover:border-electric-mint/50",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {loaded && results.length > 0 ? (
            results.map(provider => (
              <ProviderCard key={provider.id} provider={provider} onClick={() => showToast(`${provider.name} — profile coming soon`)} />
            ))
          ) : (
            <EmptyState icon={Search} title={loaded ? "No matching providers" : "Loading providers..."} description="Try a different category or search term." />
          )}
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="discover" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
