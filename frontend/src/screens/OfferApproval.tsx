import { Check, Handshake, Lock, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { DEMO } from "@/lib/agent";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface OfferApprovalProps {
  navigate: (route: Route) => void;
}

export function OfferApproval({ navigate }: OfferApprovalProps) {
  const { request, confirmOrder, declineOrder, showToast } = useApp();
  const provider = request?.provider ?? DEMO.provider;
  const rating = request?.providerRating ?? DEMO.providerRating;
  const price = request?.finalPrice ?? DEMO.finalPrice;
  const day = request?.pickupDay ?? DEMO.pickupDay;
  const time = request?.pickupTime ?? DEMO.pickupTime;

  const approve = () => {
    confirmOrder();
    navigate("confirmed");
  };

  const reject = () => {
    declineOrder();
    showToast("Offer rejected");
    navigate("dashboard");
  };

  return (
    <DeviceFrame className="items-center justify-center bg-soft-sand px-4">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-deep-slate/10 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-surface-container-low text-secondary">
            <Handshake className="size-8" fill="currentColor" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary">Offer Negotiated!</h1>
            <p className="mt-1 text-[15px] text-on-surface-variant">Review the final terms before booking.</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 rounded-lg border border-outline-variant/20 bg-surface-bright p-4">
          <div className="flex items-center justify-between border-b border-outline-variant/10 py-1">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="flex size-8 items-center justify-center rounded-full bg-electric-mint/10 text-electric-mint">
                <span className="font-mono text-[13px] font-bold">GC</span>
              </span>
              <span className="text-[15px]">Provider</span>
            </div>
            <div className="text-right">
              <span className="block text-[16px] font-semibold text-primary">{provider}</span>
              <span className="mt-0.5 flex items-center justify-end gap-1">
                <Star className="size-3.5 text-secondary" fill="currentColor" />
                <span className="font-mono text-[12px] text-on-surface-variant">{rating} Stars</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-outline-variant/10 py-1">
            <span className="flex items-center gap-2 text-[15px] text-on-surface">
              <span className="font-mono text-[13px]">Agreed Time</span>
            </span>
            <span className="rounded bg-surface-container-low px-2 py-1 font-mono text-[13px] font-medium text-primary">
              {day}, {time}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] text-on-surface">
                <span className="font-mono text-[13px]">Final Price</span>
              </span>
              <span className="text-xl font-semibold text-primary">{price.toLocaleString()} PKR</span>
            </div>
            <div className="flex justify-end">
              <Badge variant="mint">Counter-offer accepted</Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex w-full gap-3">
          <Button onClick={reject} variant="outline-danger" className="flex-1 rounded-lg py-3 font-mono text-[13px]">
            <X className="size-4" />
            Reject
          </Button>
          <Button
            onClick={approve}
            variant="secondary"
            className="flex-[2] rounded-lg py-3 font-mono text-[13px] font-bold shadow-sm"
          >
            <Check className="size-4" strokeWidth={3} />
            Approve &amp; Book
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-on-surface-variant opacity-70">
          <Lock className="size-3.5" /> Secure Transaction
        </p>
      </div>
    </DeviceFrame>
  );
}