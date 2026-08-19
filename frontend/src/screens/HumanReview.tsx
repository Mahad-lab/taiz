import { CircleCheck, ThumbsUp, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav, type NavTabId } from "@/components/layout/BottomNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { DEMO } from "@/lib/agent";
import type { Route } from "@/lib/router";
import { titleCase } from "@/lib/utils";
import { useApp } from "@/state/AppContext";

import cake from "@/assets/cake.svg";

interface HumanReviewProps {
  navigate: (route: Route) => void;
}

export function HumanReview({ navigate }: HumanReviewProps) {
  const { request, setStatus, declineOrder, showToast } = useApp();
  const item = request?.item ?? DEMO.item;
  const provider = request?.provider ?? DEMO.provider;
  const price = request?.initialPrice ?? DEMO.initialPrice;
  const pickupDay = request?.pickupDay ?? DEMO.pickupDay;
  const pickupTime = request?.pickupTime ?? DEMO.pickupTime;

  const approve = () => {
    setStatus("approved");
    navigate("approval");
  };

  const decline = () => {
    declineOrder();
    showToast("Offer declined");
    navigate("dashboard");
  };

  const onTab = (tab: NavTabId) => {
    if (tab === "tasks") return navigate("dashboard");
    if (tab === "review") return;
    showToast(`${titleCase(tab)} — coming soon`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-soft-sand">
      <DesktopHeader active="review" onSelect={onTab} />

      <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center px-4 py-8">
        <article className="overflow-hidden rounded-lg border border-deep-slate/10 bg-white">
          {/* Header */}
          <div className="border-b border-deep-slate/10 bg-surface-container-lowest p-4 md:p-6">
            <h1 className="text-[20px] font-semibold leading-7 text-deep-slate">
              Agent Status Update: {provider}
            </h1>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
              Review Required
            </p>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-5 p-4 md:p-6">
            <div className="relative h-48 overflow-hidden rounded-[4px] border border-deep-slate/10 bg-surface-dim md:h-60">
              <img src={cake} alt={item} className="h-full w-full object-cover" />
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-deep-slate/10 bg-white/90 px-3 py-1.5 backdrop-blur">
                <CircleCheck className="size-4 text-electric-mint" fill="currentColor" stroke="white" />
                <span className="font-mono text-[11px] font-medium text-deep-slate">Confirmed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-l-2 border-electric-mint pl-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Availability</span>
                <p className="mt-0.5 text-lg font-semibold text-deep-slate">1 {item} (Confirmed!)</p>
              </div>
              <div className="border-l-2 border-deep-slate/20 pl-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Price</span>
                <p className="mt-0.5 text-lg font-semibold text-deep-slate">{price.toLocaleString()} PKR</p>
              </div>
              <div className="border-l-2 border-deep-slate/20 pl-3 sm:col-span-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Pickup Time</span>
                <p className="mt-0.5 text-lg font-semibold text-deep-slate">
                  Ready from {pickupTime} {pickupDay}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-deep-slate/10 bg-surface-container-low p-4 md:p-6">
            <Button onClick={approve} variant="secondary" size="lg" className="w-full">
              <ThumbsUp className="size-5" fill="currentColor" />
              Approve &amp; Reserve
            </Button>
            <Button onClick={decline} variant="outline-danger" size="lg" className="w-full">
              <XCircle className="size-5" />
              Decline Offer
            </Button>
          </div>
        </article>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <BottomNav variant="customer" active="review" onSelect={onTab} />
      </nav>
    </div>
  );
}