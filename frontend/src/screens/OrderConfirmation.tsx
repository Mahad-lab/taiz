import { CircleCheckBig, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { DEMO } from "@/lib/agent";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface OrderConfirmationProps {
  navigate: (route: Route) => void;
}

export function OrderConfirmation({ navigate }: OrderConfirmationProps) {
  const { request } = useApp();
  const location = request?.pickupLocation ?? DEMO.pickupLocation;
  const time = request?.pickupTime ?? DEMO.pickupTime;
  const item = request?.item ?? DEMO.item;

  return (
    <DeviceFrame className="items-center justify-center bg-soft-sand px-4">
      <div className="flex w-full max-w-sm flex-col items-center pb-10 pt-6">
        {/* Success icon */}
        <div className="relative mb-6 flex size-24 items-center justify-center rounded-full bg-secondary-fixed/20">
          <div className="absolute -inset-4 animate-ping rounded-full border border-secondary-fixed/30 opacity-75" />
          <CircleCheckBig className="size-14 text-secondary-fixed" fill="currentColor" stroke="#2D3436" strokeWidth={1} />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-primary">Order Confirmed!</h1>
        <p className="mt-1.5 text-center text-[15px] text-on-surface-variant">
          Your {item.toLowerCase()} is being prepared.
        </p>

        {/* Details card */}
        <div className="relative mt-8 w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-white p-5 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-secondary-fixed" />
          <p className="text-center text-[15px] text-on-surface">Show this confirmation at the counter</p>
          <div className="my-4 h-px w-full bg-outline-variant/30" />
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-secondary-fixed" fill="currentColor" stroke="#2D3436" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Pickup Location</p>
                <p className="mt-0.5 text-lg font-semibold text-primary">{location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-secondary-fixed" fill="currentColor" stroke="#2D3436" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Pickup Time</p>
                <p className="mt-0.5 text-lg font-semibold text-primary">{time}</p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate("home")}
          size="lg"
          className="mt-10 w-full shadow-md"
        >
          Back to Home
        </Button>
      </div>
    </DeviceFrame>
  );
}