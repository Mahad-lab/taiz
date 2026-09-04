import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import * as api from "@/lib/api";
import { providerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import type { Order } from "@/lib/api";
import { useApp } from "@/state/AppContext";

interface OrdersProps {
  navigate: (route: Route) => void;
}

export function Orders({ navigate }: OrdersProps) {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listOrders()
      .then(allOrders => {
        if (!cancelled) {
          setOrders(allOrders);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const onTab = providerTabHandler(navigate, showToast);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "mint";
      case "approved": return "secondary";
      case "pending_approval": return "warning";
      case "rejected": return "error";
      default: return "neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "approved": return "Approved";
      case "pending_approval": return "Pending";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  if (selectedOrder) {
    return (
      <DeviceFrame>
        <TopAppBar
          title={
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-primary">Order Details</h1>
            </div>
          }
          left={
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
              aria-label="Back"
            >
              ←
            </button>
          }
        />

        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-3">
          <div className="rounded-lg border border-deep-slate/10 bg-white p-4">
            <h2 className="text-[16px] font-semibold text-primary">Order #{selectedOrder.id}</h2>
            <p className="mt-1 text-[14px] text-on-surface-variant">Status: {getStatusLabel(selectedOrder.status)}</p>
            <p className="mt-1 text-[14px] text-on-surface-variant">Total: {selectedOrder.total.toLocaleString()} PKR</p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Items</h2>
            {selectedOrder.lines.map((line, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-deep-slate/10 bg-white p-3">
                <span className="text-[14px] text-on-surface">{line.name}</span>
                <span className="text-[14px] font-medium text-primary">{line.quantity} × {line.unitPrice.toLocaleString()} PKR</span>
              </div>
            ))}
          </div>

          {selectedOrder.status === "pending_approval" && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={async () => {
                  await api.approveOrder(selectedOrder.id);
                  showToast("Order approved");
                  setSelectedOrder(null);
                  setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: "approved" as const } : o));
                }}
                className="flex-1 rounded-full bg-electric-mint py-3 text-[15px] font-medium text-deep-slate transition-colors hover:bg-electric-mint/90"
              >
                Approve
              </button>
              <button
                onClick={async () => {
                  await api.rejectOrder(selectedOrder.id);
                  showToast("Order rejected");
                  setSelectedOrder(null);
                  setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: "rejected" as const } : o));
                }}
                className="flex-1 rounded-full border border-error/30 py-3 text-[15px] font-medium text-error transition-colors hover:bg-error/5"
              >
                Reject
              </button>
            </div>
          )}
        </main>

        <div className="absolute inset-x-0 bottom-0 z-30">
          <BottomNav variant="provider" active="orders" onSelect={onTab} />
        </div>
      </DeviceFrame>
    );
  }

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Orders</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-3">
        {loaded && orders.length === 0 ? (
          <EmptyState icon={Briefcase} title="No orders yet" description="Customer requests will appear here." />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="flex items-center justify-between gap-3 rounded-lg border border-deep-slate/10 bg-white p-4 transition-colors hover:border-electric-mint"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[15px] font-semibold text-primary">Order #{order.id}</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Status: {getStatusLabel(order.status)}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[16px] font-bold text-primary">{order.total.toLocaleString()} PKR</span>
                  <div className="flex shrink-0 items-end gap-1.5">
                    {order.status === "pending_approval" ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : order.status === "confirmed" ? (
                      <Badge variant="mint">Ready</Badge>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="provider" active="orders" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
