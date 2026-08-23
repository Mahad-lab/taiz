import { Check, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { DEMO, OTHER_OPTIONS } from "@/lib/agent";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

import cake from "@/assets/cake.svg";

interface ResultsProps {
  navigate: (route: Route) => void;
}

const CHECKS = ["Availability confirmed", "Price negotiated", "Provider matched"];

export function Results({ navigate }: ResultsProps) {
  const { request, confirmOrder, declineOrder, showToast } = useApp();
  const item = request?.item ?? DEMO.item;
  const provider = request?.provider ?? DEMO.provider;
  const rating = request?.providerRating ?? DEMO.providerRating;
  const price = request?.finalPrice ?? DEMO.finalPrice;
  const day = request?.pickupDay ?? DEMO.pickupDay;
  const time = request?.pickupTime ?? DEMO.pickupTime;

  const confirm = () => {
    confirmOrder();
    navigate("confirmed");
  };

  const decline = () => {
    declineOrder();
    showToast("Offer declined");
    navigate("home");
  };

  const onTab = customerTabHandler(navigate, showToast);

  return (
    <div className="flex min-h-dvh flex-col bg-soft-sand">
      <DesktopHeader active="activity" onSelect={onTab} onSettings={() => showToast("Settings — coming soon")} />

      <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center px-4 pb-24 pt-8 md:pb-8">
        <p className="mb-3 text-[15px] text-on-surface-variant">I found the best option.</p>

        <article className="overflow-hidden rounded-lg border border-deep-slate/10 bg-white">
          <div className="relative h-40 overflow-hidden border-b border-deep-slate/10 bg-surface-dim md:h-48">
            <img src={cake} alt={item} className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-[20px] font-semibold text-primary">{provider}</h1>
                <span className="mt-1 flex items-center gap-1">
                  <Star className="size-3.5 text-secondary" fill="currentColor" />
                  <span className="font-mono text-[12px] text-on-surface-variant">{rating} rating</span>
                </span>
              </div>
              <span className="text-right text-xl font-semibold text-primary">{price.toLocaleString()} PKR</span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-surface-container-low px-3 py-2">
              <span className="font-mono text-[12px] text-on-surface-variant">Pickup</span>
              <span className="font-mono text-[13px] font-medium text-primary">
                {day} · {time}
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

          <div className="flex flex-col gap-3 border-t border-deep-slate/10 bg-surface-container-low p-4 md:p-6">
            <Button onClick={confirm} variant="secondary" size="lg" className="w-full">
              <Check className="size-5" strokeWidth={3} />
              Confirm booking
            </Button>
            <Button onClick={decline} variant="outline-danger" className="w-full">
              <X className="size-4" />
              Decline
            </Button>
          </div>
        </article>

        <section className="mt-6 flex flex-col gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Other options</h2>
          {OTHER_OPTIONS.map(option => (
            <div
              key={option.id}
              className="flex items-center justify-between rounded-lg border border-deep-slate/10 bg-white p-3.5"
            >
              <span className="text-[14px] font-medium text-primary">{option.provider}</span>
              <div className="flex items-center gap-2">
                <Badge variant="neutral" className="font-mono normal-case">
                  {option.time}
                </Badge>
                <span className="font-mono text-[13px] text-on-surface-variant">{option.price.toLocaleString()} PKR</span>
              </div>
            </div>
          ))}
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <BottomNav variant="customer" active="home" onSelect={onTab} />
      </nav>
    </div>
  );
}
