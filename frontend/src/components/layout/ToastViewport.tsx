import { useApp } from "@/state/AppContext";

/** Transient toast notifications driven by app state. */
export function ToastViewport() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8">
      <div
        key={toast.id}
        className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border border-deep-slate/10 bg-deep-slate px-4 py-2.5 text-sm text-white shadow-xl duration-200"
      >
        {toast.message}
      </div>
    </div>
  );
}