import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";
import type { Route } from "@/lib/router";

interface ResetProps {
  navigate: (route: Route) => void;
}

/** Wipe all in-memory + persisted state and land back on the Welcome screen. */
export function Reset({ navigate }: ResetProps) {
  const { reset } = useApp();
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    reset();
    // Nuke any persisted keys so nothing is hydrated back on next load.
    localStorage.removeItem("taiz:state");
    sessionStorage.clear();
    navigate("welcome");
  };

  const cancel = () => {
    setConfirming(false);
    navigate("welcome");
  };

  return (
    <DeviceFrame className="relative overflow-hidden">
      <div className="cyber-grid-light pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="flex w-full items-center justify-between pt-6">
          <button
            type="button"
            onClick={cancel}
            aria-label="Back"
            className="rounded-full border border-deep-slate/10 bg-white p-2.5 text-on-surface-variant transition-colors hover:border-electric-mint hover:text-primary"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
          </button>
          <Logo markClassName="size-7" />
          <div className="w-9" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-6">
          <span className="flex size-14 items-center justify-center rounded-full bg-error/10">
            <AlertTriangle className="size-6 text-error" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-center text-[22px] font-semibold leading-7 tracking-tight text-primary">
            Reset everything?
          </h1>
          <p className="mt-2 max-w-[280px] text-center text-[14px] leading-5 text-on-surface-variant">
            This clears your profile, chats, requests, and permissions from this
            device. This can&apos;t be undone.
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm pb-6">
          <div className="flex flex-col gap-3">
            {confirming && (
              <p className="text-center text-[13px] font-medium text-error">
                Are you sure? This permanently wipes all local data.
              </p>
            )}
            <Button
              onClick={handleReset}
              variant={confirming ? "destructive" : "outline-danger"}
              size="pill"
              className="w-full"
            >
              <RotateCcw className="size-4" strokeWidth={2.5} />
              {confirming ? "Yes, reset everything" : "Reset all data"}
            </Button>
            <button
              type="button"
              onClick={cancel}
              className="flex items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DeviceFrame>
  );
}
