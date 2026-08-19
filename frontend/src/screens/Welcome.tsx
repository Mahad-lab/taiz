import { ArrowRight, Toolbox } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";
import type { Route } from "@/lib/router";

import robot from "@/assets/robot.svg";

interface WelcomeProps {
  navigate: (route: Route) => void;
}

export function Welcome({ navigate }: WelcomeProps) {
  const { setRole, startRequest } = useApp();

  const choose = (role: "customer" | "provider") => {
    setRole(role);
    if (role === "customer") startRequest();
    navigate(role === "customer" ? "dashboard" : "provider");
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
            onClick={() => choose("customer")}
            variant="secondary"
            size="pill"
            className="w-full"
          >
            I need a service
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Button>
          <Button
            onClick={() => choose("provider")}
            variant="solid-dark"
            size="pill"
            className="w-full"
          >
            I want to offer my services
            <Toolbox className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </DeviceFrame>
  );
}