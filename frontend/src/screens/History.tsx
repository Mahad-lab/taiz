import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BottomNav, type NavTabId } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { PAST_ORDERS } from "@/lib/agent";
import { customerTabRoute } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";
import { useApp } from "@/state/AppContext";

interface HistoryProps {
  navigate: (route: Route) => void;
}

/** Completed and declined orders (customer History tab). */
export function History({ navigate }: HistoryProps) {
  const { request, showToast } = useApp();
  const current =
    request && (request.status === "confirmed" || request.status === "declined") ? request : null;

  const onTab = (tab: NavTabId) => {
    if (tab === "history") return;
    const target = customerTabRoute(tab, request);
    if (target) return navigate(target);
    showToast(tab === "review" ? "Nothing to review yet" : `${titleCase(tab)} — coming soon`);
  };

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">History</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-4">
        {current && (
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[13px] uppercase tracking-wider text-on-surface-variant">
              Current request
            </h2>
            <OrderCard
              item={current.item}
              provider={current.provider ?? "—"}
              price={current.finalPrice}
              day={current.pickupDay}
              status={current.status === "confirmed" ? "confirmed" : "declined"}
            />
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-on-surface-variant">
            Past orders
          </h2>
          <div className="flex flex-col gap-3">
            {PAST_ORDERS.map(order => (
              <OrderCard key={order.id} {...order} />
            ))}
          </div>
        </section>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="history" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}

function OrderCard({
  item,
  provider,
  price,
  day,
  status,
}: {
  item: string;
  provider: string;
  price: number;
  day: string;
  status: "confirmed" | "declined";
}) {
  const done = status === "confirmed";
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-deep-slate/10 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1.5">
          {done ? (
            <Check className="size-4 text-secondary" strokeWidth={2.5} />
          ) : (
            <X className="size-4 text-error" strokeWidth={2.5} />
          )}
          <span className="truncate text-[15px] font-semibold text-primary">{item}</span>
        </span>
        <span className="truncate font-mono text-[12px] text-on-surface-variant">{provider}</span>
        <span className="font-mono text-[11px] text-on-surface-variant/70">{day}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-[16px] font-semibold text-primary">{price.toLocaleString()} PKR</span>
        <Badge variant={done ? "mint" : "neutral"}>{done ? "Confirmed" : "Declined"}</Badge>
      </div>
    </div>
  );
}