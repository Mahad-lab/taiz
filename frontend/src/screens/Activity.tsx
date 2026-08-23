import { Inbox } from "lucide-react";

import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Timeline } from "@/components/shared/Timeline";
import { buildActivitySteps } from "@/lib/agent";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface ActivityProps {
  navigate: (route: Route) => void;
}

/** Running log of the active request's lifecycle (customer Activity tab). */
export function Activity({ navigate }: ActivityProps) {
  const { request, showToast } = useApp();
  const steps = request ? buildActivitySteps(request.status) : null;

  const onTab = customerTabHandler(navigate, request, showToast);

  return (
    <DeviceFrame>
      <TopAppBar title={<h1 className="text-lg font-bold tracking-tight text-primary">Activity</h1>} />

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-4">
        <p className="text-[15px] text-on-surface-variant">
          A running log of your request's progress.
        </p>

        {steps ? (
          <Timeline steps={steps} />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-on-surface/10 bg-surface-container-lowest py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant/50">
              <Inbox className="size-6" />
            </span>
            <p className="font-mono text-[13px] text-on-surface-variant/70">No activity yet</p>
          </div>
        )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="activity" onSelect={onTab} />
      </div>
    </DeviceFrame>
  );
}