import { ArrowUp, Mic } from "lucide-react";
import type { FormEvent } from "react";

interface AgentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onVoice?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** The hero "what can I take care of for you?" input — the dominant element on Home. */
export function AgentInput({ value, onChange, onSubmit, onVoice, placeholder, autoFocus }: AgentInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-end gap-2 rounded-2xl border border-deep-slate/10 bg-white p-2.5 shadow-sm transition-colors focus-within:border-electric-mint"
    >
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "Find a best chocolate cake near me"}
        rows={1}
        autoFocus={autoFocus}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
        className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-on-surface outline-none placeholder:text-on-surface-variant/60"
      />
      <button
        type="button"
        onClick={onVoice}
        aria-label="Voice input"
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
      >
        <Mic className="size-5" />
      </button>
      <button
        type="submit"
        aria-label="Ask Taiz"
        disabled={!value.trim()}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-electric-mint text-deep-slate shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp className="size-5" strokeWidth={2.5} />
      </button>
    </form>
  );
}
