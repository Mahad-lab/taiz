import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";

interface OnboardingProps {
  navigate: (route: Route) => void;
}

/** Collects basic contact details after a role has been chosen on the Welcome screen. */
export function Onboarding({ navigate }: OnboardingProps) {
  const { role } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const continueOnboarding = () => {
    navigate(role === "provider" ? "provider" : "home");
  };

  return (
    <DeviceFrame className="relative overflow-hidden">
      <TopAppBar onBack={() => navigate("welcome")} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="px-2 pb-6 pt-2">
          <h1 className="text-[26px] font-semibold leading-8 tracking-tight text-primary">
            Tell us about you
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-on-surface-variant">
            A few details so Taiz can connect you with the right people.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="onboarding-name">Your name</Label>
            <Input
              id="onboarding-name"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="onboarding-phone">Phone number</Label>
            <Input
              id="onboarding-phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="onboarding-city">City</Label>
            <Input
              id="onboarding-city"
              placeholder="Enter your city"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 pb-10">
          <Button onClick={continueOnboarding} variant="solid-dark" size="pill" className="w-full">
            Continue
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </DeviceFrame>
  );
}
