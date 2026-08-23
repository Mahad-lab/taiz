import type { ReactNode } from "react";
import { Toggle } from "@/components/ui/toggle";

interface PermissionRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  locked?: boolean;
  children?: ReactNode;
}

/** One row in the Permissions list — what Taiz can do, and whether the user allows it. */
export function PermissionRow({ title, description, checked, onChange, locked, children }: PermissionRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-deep-slate/10 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-primary">{title}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-on-surface-variant">{description}</p>
        </div>
        {locked ? (
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-on-surface-variant/60">Always on</span>
        ) : (
          <Toggle checked={checked} onChange={onChange ?? (() => {})} label={title} className="shrink-0" />
        )}
      </div>
      {checked && children}
    </div>
  );
}
