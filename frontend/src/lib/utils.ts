import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "tasks" -> "Tasks" (safe under noUncheckedIndexedAccess). */
export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
