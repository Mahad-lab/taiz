import { Check, Inbox, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Timeline } from "@/components/shared/Timeline";
import { buildActivitySteps, PAST_ORDERS } from "@/lib/agent";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ActivityProps {
  navigate: (route: Route) => void;
}

/** Transparent record of everything the agent has done — live and past. */
export function Activity({ navigate }: ActivityProps) {
  const { request, showToast } = useApp();
  const live = request && request.status !== "confirmed" && request.status !== "declined";
  const steps = live ? buildActivitySteps(request.status) : null;
  const currentOrder = request && (request.status === "confirmed" || request.status === "declined") ? request : null;

  const onTab = customerTabHandler(navigate, showToast);
  const hasAnyHistory = currentOrder || PAST_ORDERS.length > 0;

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Activity</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-24 pt-4">
        {steps && (
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Today</h2>
            <Timeline steps={steps} />
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">History</h2>
          {hasAnyHistory ? (
            <div className="flex flex-col gap-3">
              {currentOrder && (
                <OrderRow
                  item={currentOrder.item}
                  provider={currentOrder.provider}
                  price={currentOrder.finalPrice}
                  day={currentOrder.status === "confirmed" ? currentOrder.pickupDay : "Today"}
                  status={currentOrder.status === "confirmed" ? "confirmed" : "declined"}
                />
              )}
              {PAST_ORDERS.map(order => (
                <OrderRow key={order.id} {...order} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Inbox} title="Your agent hasn't done anything yet" description="Tell Taiz what you need." />
          )}
        </section>

        {!steps && !hasAnyHistory && (
          <EmptyState icon={Inbox} title="No activity yet" description="What can I take care of?" />
        )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="activity" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}

function OrderRow({
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
