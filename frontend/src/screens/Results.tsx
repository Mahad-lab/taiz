import { Check, Star, X } from "lucide-react";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { bestReply } from "@/lib/agent";
import type { AvailabilityReply } from "@/lib/api";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ResultsProps {
  navigate: (route: Route) => void;
}

const CHECKS = ["Availability confirmed", "Fixed price", "Provider matched"];

export function Results({ navigate }: ResultsProps) {
  const { request, chooseReply, createOrderForReview, confirmOrder, declineOrder, showToast } = useApp();
  const comparison = request?.comparison;
  const onTab = customerTabHandler(navigate, showToast);

  const available = comparison?.replies.filter(r => r.status === "available") ?? [];
  const unavailable = comparison?.replies.filter(r => r.status !== "available") ?? [];
  const chosen = request?.chosenReply ?? (comparison ? bestReply(comparison) : undefined);

  // Create the backend order once, keyed to the best available option, so the
  // provider dashboard can see it as an incoming request.
  useEffect(() => {
    if (!request || request.orderId || !request.comparison) return;
    const best = bestReply(request.comparison);
    if (!best?.product) return;
    void createOrderForReview(best, request.quantity);
    chooseReply(best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  if (!comparison) {
    return (
      <DeviceFrame>
        <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Review</h1>} />
        <main className="flex flex-1 items-center justify-center px-4">
          <p className="text-center text-on-surface-variant">No comparison available.</p>
        </main>
        <div className="absolute inset-x-0 bottom-0 z-30">
          <BottomNav variant="customer" active="activity" onSelect={onTab} />
        </div>
      </DeviceFrame>
    );
  }

  const onConfirm = async () => {
    if (!request || !comparison) return;
    const pick = request.chosenReply ?? bestReply(comparison);
    if (!pick || pick.status !== "available" || !pick.product) {
      showToast("No available option to confirm");
      return;
    }
    if (!request.orderId) await createOrderForReview(pick, request.quantity);
    await confirmOrder();
    navigate("confirmed");
  };

  const onDecline = async () => {
    if (!request || !comparison) return;
    const pick = request.chosenReply ?? bestReply(comparison);
    if (pick && pick.product && !request.orderId) await createOrderForReview(pick, request.quantity);
    await declineOrder();
    showToast("Options declined");
    navigate("home");
  };

  return (
    <DeviceFrame className="bg-soft-sand">
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Review</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-24 pt-4">
        <p className="text-[15px] text-on-surface-variant">I compared fixed prices for you.</p>

        {available.length === 0 ? (
          <div className="rounded-lg border border-deep-slate/10 bg-white p-4 text-[15px] text-on-surface-variant">
            No providers have <span className="font-semibold text-primary">{comparison.item}</span> available right now.
          </div>
        ) : (
          <article className="overflow-hidden rounded-lg border border-deep-slate/10 bg-white">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-[20px] font-semibold text-primary">
                    {chosen?.product?.name ?? comparison.item}
                  </h1>
                  <span className="mt-1 flex items-center gap-1">
                    <Star className="size-3.5 text-secondary" fill="currentColor" />
                    <span className="font-mono text-[12px] text-on-surface-variant">
                      {chosen?.businessId}
                    </span>
                  </span>
                </div>
                <span className="text-right text-xl font-semibold text-primary">
                  {chosen?.price?.toLocaleString()} {chosen?.currency ?? "PKR"}
                </span>
              </div>

              <div className="-mx-4 flex items-center justify-between border-l-4 border-secondary bg-secondary/5 px-4 py-2.5">
                <span className="font-mono text-[12px] text-on-surface-variant">ETA</span>
                <span className="font-mono text-[13px] font-medium text-primary">
                  {chosen?.etaMinutes ? `${chosen.etaMinutes} min` : "—"}
                </span>
              </div>

              <ul className="flex flex-col gap-1.5">
                {CHECKS.map(check => (
                  <li key={check} className="flex items-center gap-2 text-[14px] text-on-surface">
                    <Check className="size-4 shrink-0 text-electric-mint" strokeWidth={2.5} />
                    {check}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-deep-slate/10 bg-surface-container-low p-4">
              <Button onClick={onConfirm} variant="secondary" size="lg" className="w-full">
                <Check className="size-5" strokeWidth={3} />
                Confirm booking
              </Button>
              <Button onClick={onDecline} variant="outline-danger" className="w-full">
                <X className="size-4" />
                Decline
              </Button>
            </div>
          </article>
        )}

        {available.length > 1 && (
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Other options</h2>
            {available.map(reply => (
              <button
                key={reply.businessId}
                onClick={() => chooseReply(reply)}
                className={`flex items-center justify-between rounded-lg border bg-white p-4 text-left ${
                  chosen?.businessId === reply.businessId
                    ? "border-secondary"
                    : "border-deep-slate/10"
                }`}
              >
                <span className="text-[15px] font-medium text-primary">{reply.businessId}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="font-mono normal-case">
                    {reply.etaMinutes ? `${reply.etaMinutes} min` : "—"}
                  </Badge>
                  <span className="font-mono text-[13px] text-on-surface-variant">
                    {reply.price?.toLocaleString()} {reply.currency ?? "PKR"}
                  </span>
                </div>
              </button>
            ))}
          </section>
        )}

        {unavailable.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Unavailable</h2>
            {unavailable.map(reply => (
              <div key={reply.businessId} className="flex items-center justify-between rounded-lg border border-deep-slate/10 bg-white/60 p-4">
                <span className="text-[15px] font-medium text-on-surface-variant/70">{reply.businessId}</span>
                <Badge variant="neutral" className="font-mono normal-case">Unavailable</Badge>
              </div>
            ))}
          </section>
        )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="activity" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}
