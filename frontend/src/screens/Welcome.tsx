import { ArrowRight, LogIn, Store } from "lucide-react";
import { useEffect } from "react";

import { Logo } from "@/components/shared/Logo";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";
import type { Route } from "@/lib/router";
import type { Role } from "@/state/types";

import robot from "@/assets/robot.svg";

interface WelcomeProps {
  navigate: (route: Route, role?: Role) => void;
}

export function Welcome({ navigate }: WelcomeProps) {
  const { user } = useApp();

  // Already signed in? Skip straight to the relevant dashboard.
  useEffect(() => {
    if (user) {
      navigate(user.role === "provider" ? "provider" : "home");
    }
  }, [user, navigate]);

  const start = (role: Role) => {
    navigate("onboard", role);
  };

  return (
    <DeviceFrame className="relative overflow-hidden">
      <div className="cyber-grid-light pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-4">
        <div className="flex w-full justify-center pt-10">
          <Logo markClassName="size-8" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <img src={robot} alt="Taiz AI assistant" className="mb-6 w-56 max-w-full drop-shadow-sm" />
          <div className="px-4 text-center">
            <h1 className="text-[26px] font-semibold leading-8 tracking-tight text-primary">
              Your Personal AI for Local Services
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-on-surface-variant">
              Precision matching for tasks, trades, and expertise.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3 pb-10">
          <Button
            onClick={() => start("customer")}
            variant="secondary"
            size="pill"
            className="w-full"
          >
            Find food & services
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Button>
          <Button
            onClick={() => start("provider")}
            variant="solid-dark"
            size="pill"
            className="w-full"
          >
            I run a business
            <Store className="size-4" strokeWidth={2.5} />
          </Button>

          <button
            type="button"
            onClick={() => start("customer")}
            className="mt-1 flex items-center justify-center gap-1.5 self-center text-[13px] font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <LogIn className="size-3.5" strokeWidth={2.5} />
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </DeviceFrame>
  );
}
