import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/state/types";
import { TypingDots } from "./TypingDots";

interface ChatMessageRowProps {
  message: ChatMessage;
}

export function ChatMessageRow({ message }: ChatMessageRowProps) {
  const isUser = message.from === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <div className="mb-0.5 ml-1 flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <Bot className="size-3.5" />
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant">Taiz Agent</span>
          </div>
        )}
        <div
          className={cn(
            "relative overflow-hidden rounded-lg p-3 text-[15px] leading-6 shadow-sm",
            isUser
              ? "rounded-tr-sm bg-primary-container text-on-primary"
              : "rounded-tl-sm border border-outline-variant/20 bg-surface-container-lowest text-on-surface",
          )}
        >
          {!isUser && <div className="absolute inset-y-0 left-0 w-[2px] bg-secondary-container" />}
          <p className={cn(!isUser && "pl-1")}>{message.text}</p>
        </div>
        <span className={cn("font-mono text-[11px] text-on-surface-variant/70", isUser ? "mr-1" : "ml-1")}>
          {message.time}
        </span>
      </div>
    </div>
  );
}

export function AgentTypingRow() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-[85%] items-end gap-2">
        <span className="mb-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Bot className="size-3.5" />
        </span>
        <div className="rounded-lg rounded-tl-sm border border-outline-variant/20 bg-surface-container-lowest p-3.5 shadow-sm">
          <TypingDots dotClassName="bg-outline" />
        </div>
      </div>
    </div>
  );
}