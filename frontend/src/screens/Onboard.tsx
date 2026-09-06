import { ArrowLeft, LogIn, Store, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import * as api from "@/lib/api";
import { Logo } from "@/components/shared/Logo";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { Button } from "@/components/ui/button";
import { useApp } from "@/state/AppContext";
import type { Route } from "@/lib/router";
import type { Role } from "@/state/types";

interface OnboardProps {
  navigate: (route: Route, role?: Role) => void;
  /** Role chosen on the Welcome screen; drives which fields show by default. */
  initialRole: Role;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-deep-slate/10 bg-white px-4 py-3 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-electric-mint";

const ROLE_OPTIONS: { value: Role; label: string; icon: typeof UserRound }[] = [
  { value: "customer", label: "I'm a customer", icon: UserRound },
  { value: "provider", label: "I run a business", icon: Store },
];

export function Onboard({ navigate, initialRole }: OnboardProps) {
  const { login, user } = useApp();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");

  // Already signed in? Take the user where they belong.
  useEffect(() => {
    if (user) {
      navigate(user.role === "provider" ? "provider" : "home");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (role !== "provider") return;
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listBusinesses().catch(() => null);
        if (!cancelled && list) setBusinesses(list);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const canLogin =
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    (role === "customer" || (role === "provider" && businessId));

  const handleLogin = () => {
    setError("");
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (!phone.trim()) {
      setError("Enter your phone number");
      return;
    }
    if (role === "provider" && !businessId) {
      setError("Select a bakery");
      return;
    }
    login({
      name: name.trim(),
      phone: phone.trim(),
      role,
      businessId: role === "provider" ? businessId : undefined,
    });
    navigate(role === "customer" ? "home" : "provider");
  };

  return (
    <DeviceFrame className="relative overflow-hidden">
      <div className="cyber-grid-light pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4">
        <div className="flex w-full items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => navigate("welcome")}
            aria-label="Back"
            className="rounded-full border border-deep-slate/10 bg-white p-2.5 text-on-surface-variant transition-colors hover:border-electric-mint hover:text-primary"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} />
          </button>
          <Logo markClassName="size-7" />
          {/* Spacer to keep the logo centered */}
          <div className="w-9" />
        </div>

        {/* Form content pushed to the lower half, thumb-reachable on mobile */}
        <div className="flex min-h-0 flex-1 flex-col justify-end pb-6">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-[22px] font-semibold leading-7 tracking-tight text-primary">
              Let&apos;s set you up
            </h1>
            <p className="mt-1 text-[14px] leading-5 text-on-surface-variant">
              Just a couple details to get started.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {/* Role switch — segmented control, switchable inline */}
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const active = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRole(value);
                        setBusinessId("");
                        setError("");
                      }}
                      aria-pressed={active}
                      className={`flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                        active
                          ? "border-electric-mint bg-electric-mint/10 text-deep-slate"
                          : "border-deep-slate/10 bg-white text-on-surface-variant hover:border-electric-mint"
                      }`}
                    >
                      <Icon className="size-3.5" strokeWidth={2.5} />
                      {label}
                    </button>
                  );
                })}
              </div>

              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className={INPUT_CLASS}
              />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
                inputMode="tel"
                autoComplete="tel"
                className={INPUT_CLASS}
              />

              {role === "provider" && (
                <select
                  value={businessId}
                  onChange={e => setBusinessId(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Select your bakery</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}

              {error && <p className="text-center text-[13px] text-error">{error}</p>}

              <Button
                onClick={handleLogin}
                variant="secondary"
                size="pill"
                className="w-full"
                disabled={!canLogin}
              >
                {"Get started"}
                <LogIn className="size-4" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DeviceFrame>
  );
}
