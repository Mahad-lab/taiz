import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[0.25rem] border px-2 py-0.5 text-xs font-medium font-mono transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        mint: "border-electric-mint/30 bg-electric-mint/10 text-deep-slate",
        secondary: "border-transparent bg-secondary/10 text-secondary",
        outline: "border-deep-slate/15 text-on-surface-variant",
        neutral: "border-outline-variant/40 bg-surface-variant/40 text-on-surface-variant",
        error: "border-error/30 bg-error/10 text-error",
        solid: "border-transparent bg-electric-mint text-deep-slate",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };