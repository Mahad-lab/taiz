import { Check, Inbox, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Timeline } from "@/components/shared/Timeline";
import { buildActivitySteps } from "@/lib/agent";
import * as api from "@/lib/api";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ActivityProps {
  navigate: (route: Route) => void;
}

interface HistoryRow {
  id: string;
  item: string;
  provider: string;
  price: number;
  day: string;
  status: "confirmed" | "declined";
}

export function Activity({ navigate }: ActivityProps) {
  const { request, showToast } = useApp();
  const [history, setHistory] = useState<HistoryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .listOrders()
      .then(orders => {
        if (cancelled) return;
        setHistory(
          orders
            .filter(o => o.status === "confirmed" || o.status === "rejected")
            .map(o => ({
              id: o.id,
              item: o.lines.map(l => l.name).join(", "),
              provider: o.businessId,
              price: o.total,
              day: new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
              status: o.status === "confirmed" ? "confirmed" : "declined",
            })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [request?.status]);

  const live = request && request.status !== "confirmed" && request.status !== "declined";
  const steps = live && request ? buildActivitySteps(request.status, request.item) : null;
  const currentOrder =
    request && (request.status === "confirmed" || request.status === "declined")
      ? {
          id: request.id,
          item: request.chosenReply?.product?.name ?? request.item,
          provider: request.chosenReply?.businessId ?? "—",
          price: request.chosenReply?.price ?? 0,
          day: request.status === "confirmed" ? "Today" : "Today",
          status: request.status === "confirmed" ? ("confirmed" as const) : ("declined" as const),
        }
      : null;

  const onTab = customerTabHandler(navigate, showToast);
  const hasAnyHistory = currentOrder || history.length > 0;

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
              {currentOrder && <OrderRow {...currentOrder} />}
              {history.map(order => (
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
