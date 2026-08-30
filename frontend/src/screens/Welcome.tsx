import { ArrowRight, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

import * as api from "@/lib/api";
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
  const { login, user } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [businessId, setBusinessId] = useState("");
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLogin = name.trim().length > 0 && (role === "customer" || (role === "provider" && businessId));

  const handleLogin = async () => {
    setError("");
    if (!name.trim()) { setError("Enter your name"); return; }
    if (role === "provider" && !businessId) { setError("Select a bakery"); return; }
    const u = { name: name.trim(), role, businessId: role === "provider" ? businessId : undefined };
    login(u);
    navigate(u.role === "customer" ? "home" : "provider");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listBusinesses().catch(() => null);
        if (!cancelled && list) setBusinesses(list);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

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
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-deep-slate/10 bg-white px-4 py-3 text-[15px] text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-electric-mint"
          />
          <div className="flex gap-2">
            {(["customer", "provider"] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setBusinessId(""); }}
                className={`flex-1 rounded-full border px-3.5 py-2.5 text-[13px] font-medium capitalize transition-colors ${
                  role === r
                    ? r === "customer"
                      ? "border-electric-mint bg-electric-mint/10 text-deep-slate"
                      : "border-electric-mint bg-electric-mint/10 text-deep-slate"
                    : "border-deep-slate/10 bg-white text-on-surface-variant hover:border-electric-mint"
                }`}
              >
                {r === "customer" ? "I need a service" : "I run a bakery"}
              </button>
            ))}
          </div>

          {role === "provider" && (
            <select
              value={businessId}
              onChange={e => setBusinessId(e.target.value)}
              className="w-full rounded-lg border border-deep-slate/10 bg-white px-4 py-3 text-[15px] text-on-surface outline-none transition-colors focus:border-electric-mint"
            >
              <option value="">Select your bakery</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          {error && <p className="text-center text-[13px] text-error">{error}</p>}

          <Button onClick={handleLogin} variant="secondary" size="pill" className="w-full" disabled={!canLogin || loading}>
            {loading ? "Signing in…" : "Get started" }
            <LogIn className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </DeviceFrame>
  );
}