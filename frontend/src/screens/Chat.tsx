import { Bot, Check, ChevronDown, ChevronUp, MapPin, Mic, MicOff, RefreshCw, Sparkles, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentInput } from "@/components/shared/AgentInput";
import { TypingDots } from "@/components/shared/TypingDots";
import { BottomNav } from "@/components/layout/BottomNav";
import { DeviceFrame } from "@/components/layout/DeviceFrame";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { bestReply, formatTime } from "@/lib/agent";
import type { AvailabilityComparison, AvailabilityReply } from "@/lib/api";
import { customerTabHandler } from "@/lib/nav";
import type { Route } from "@/lib/router";
import { useApp } from "@/state/AppContext";
import type { ChatMessage, ComparisonDisplay } from "@/state/types";

interface ChatProps {
  navigate: (route: Route) => void;
}

const SUGGESTIONS = [
  "Find a nearby bakery",
  "Compare prices for chocolate cake",
  "Best pizza near me",
  "Quick coffee shop options",
];

const QUICK_REPLIES = ["Find another option", "Show cheaper", "Thanks!"];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Taiz, your personal shopping assistant. Tell me what you're looking for — e.g. \"Find a chocolate cake near me in Karachi\" — and I'll compare prices across local bakeries and restaurants.",
  timestamp: new Date().toISOString(),
  status: "sent",
};

const DISPLAY_CYCLE: ComparisonDisplay[] = ["inline", "sheet", "expandable"];

export function Chat({ navigate }: ChatProps) {
  const {
    messages,
    chatPreferences,
    sendChatMessage,
    resendLastMessage,
    clearMessages,
    createOrderForReview,
    confirmOrderById,
    chooseReply,
    setComparison,
    setChatPreferences,
    showToast,
  } = useApp();
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState<Record<string, boolean>>({});
  const [confirmedOrderIds, setConfirmedOrderIds] = useState<Set<string>>(new Set());
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onTab = customerTabHandler(navigate, showToast);

  const allMessages = useMemo(() => {
    if (messages.length === 0) return [WELCOME_MESSAGE];
    return messages;
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 200) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [allMessages, isSending]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    const trimmed = text.trim();
    if (!trimmed) {
      showToast("Please type a message");
      return;
    }
    setText("");
    setIsSending(true);
    try {
      await sendChatMessage(trimmed);
    } catch {
      // Error already surfaced via toast and message status in AppContext
    } finally {
      setIsSending(false);
    }
  };

  const onRetry = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      await resendLastMessage();
    } catch {
      /* surfaced in chat */
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirm = async (messageId: string, reply: AvailabilityReply, comparison: AvailabilityComparison) => {
    if (pendingConfirmId) return;
    if (!reply.product) {
      showToast("This option can't be ordered");
      return;
    }
    setPendingConfirmId(messageId);
    try {
      const quantity = comparison.quantity || 1;
      setComparison(comparison);
      chooseReply(reply);
      const order = await createOrderForReview(reply, quantity);
      await confirmOrderById(order.id);
      setConfirmedOrderIds(prev => new Set(prev).add(messageId));
      showToast(`Order confirmed with ${reply.businessId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't confirm order";
      showToast(message);
    } finally {
      setPendingConfirmId(null);
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setShowUnavailable({});
    setConfirmedOrderIds(new Set());
    showToast("Started a new chat");
  };

  const cycleDisplay = () => {
    const idx = DISPLAY_CYCLE.indexOf(chatPreferences.comparisonDisplay);
    const next = DISPLAY_CYCLE[(idx + 1) % DISPLAY_CYCLE.length];
    setChatPreferences({ comparisonDisplay: next });
    showToast(`View: ${next}`);
  };

  return (
    <DeviceFrame>
      <TopAppBar
        title={
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary/20">
              <Bot className="size-5 text-secondary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-primary">Chat with Taiz</h1>
          </div>
        }
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={cycleDisplay}
              className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label={`Comparison view: ${chatPreferences.comparisonDisplay}`}
              title={`Comparison view: ${chatPreferences.comparisonDisplay}`}
            >
              <Sparkles className="size-5" />
            </button>
            <button
              onClick={handleNewChat}
              className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="New chat"
              title="New chat"
            >
              <X className="size-5" />
            </button>
            {/* <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex size-9 items-center justify-center rounded-full transition-colors ${
                isRecording ? "bg-red-500 text-white" : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
              aria-label="Voice input"
            >
              {isRecording ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button> */}
          </div>
        }
      />

      <main ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-32 pt-3">
        {isRecording && (
          <div className="mx-auto flex items-center gap-2 rounded-full bg-red-50 px-4 py-2">
            <div className="size-2 animate-pulse rounded-full bg-red-500" />
            <span className="font-mono text-xs text-red-600">Recording...</span>
          </div>
        )}

        {allMessages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const showSuggestions = !isUser && idx === 0 && allMessages.length === 1;
          const isLast = idx === allMessages.length - 1;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              displayMode={chatPreferences.comparisonDisplay}
              confirmedOrderIds={confirmedOrderIds}
              pendingConfirmId={pendingConfirmId}
              showUnavailable={!!showUnavailable[msg.id]}
              onToggleUnavailable={() =>
                setShowUnavailable(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))
              }
              onConfirm={handleConfirm}
              onRetry={isLast && !isUser && msg.status === "error" ? onRetry : undefined}
            >
              {showSuggestions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setText(s)}
                      className="rounded-full border border-deep-slate/10 bg-white px-3 py-1.5 text-[12px] text-on-surface transition-colors hover:border-electric-mint"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </MessageBubble>
          );
        })}

        {!isSending &&
          allMessages.length > 1 &&
          allMessages[allMessages.length - 1]?.role === "assistant" &&
          allMessages[allMessages.length - 1]?.status !== "error" && (
            <div className="flex flex-wrap gap-2 pl-9">
              {QUICK_REPLIES.map(reply => (
                <button
                  key={reply}
                  onClick={() => setText(reply)}
                  className="rounded-full border border-deep-slate/10 bg-white px-3 py-1.5 text-[12px] text-on-surface transition-colors hover:border-electric-mint"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
      </main>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <BottomNav variant="customer" active="chat" onSelect={onTab} />
      </div>

      <div className="absolute inset-x-4 bottom-20 z-40">
        <AgentInput
          value={text}
          onChange={setText}
          onSubmit={onSubmit}
          onVoice={() => setIsRecording(!isRecording)}
          placeholder="Ask Taiz about products, prices, or services..."
        />
      </div>
    </DeviceFrame>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  displayMode: ComparisonDisplay;
  confirmedOrderIds: Set<string>;
  pendingConfirmId: string | null;
  showUnavailable: boolean;
  onToggleUnavailable: () => void;
  onConfirm: (messageId: string, reply: AvailabilityReply, comparison: AvailabilityComparison) => void;
  onRetry?: () => void;
  children?: React.ReactNode;
}

function MessageBubble({
  message,
  displayMode,
  confirmedOrderIds,
  pendingConfirmId,
  showUnavailable,
  onToggleUnavailable,
  onConfirm,
  onRetry,
  children,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isSending = message.status === "sending";
  const comparison = message.metadata?.comparison;
  const isConfirmed = confirmedOrderIds.has(message.id);

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/20">
          <Bot className="size-4 text-secondary" />
        </div>
      )}
      <div className={`flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isUser
              ? isError
                ? "rounded-tr-sm bg-error/10 text-error"
                : "rounded-tr-sm bg-secondary text-on-secondary"
              : isError
                ? "rounded-tl-sm border border-error/20 bg-error/5 text-error"
                : "rounded-tl-sm bg-white text-on-surface"
          }`}
        >
          {isSending && !message.content ? (
            <TypingDots />
          ) : (
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{message.content}</p>
          )}
        </div>

        {comparison && !isUser && (
          <ComparisonView
            messageId={message.id}
            comparison={comparison}
            displayMode={displayMode}
            isConfirmed={isConfirmed}
            isPending={pendingConfirmId === message.id}
            showUnavailable={showUnavailable}
            onToggleUnavailable={onToggleUnavailable}
            onConfirm={onConfirm}
          />
        )}

        <span className="mt-1 px-1 font-mono text-[10px] text-on-surface-variant/60">
          {formatTime(new Date(message.timestamp))}
        </span>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 flex items-center gap-1 rounded-full border border-error/30 bg-white px-2.5 py-1 font-mono text-[10px] text-error transition-colors hover:bg-error/5"
            aria-label="Retry last message"
          >
            <RefreshCw className="size-3" /> Retry
          </button>
        )}

        {children}
      </div>
    </div>
  );
}

interface ComparisonViewProps {
  messageId: string;
  comparison: AvailabilityComparison;
  displayMode: ComparisonDisplay;
  isConfirmed: boolean;
  isPending: boolean;
  showUnavailable: boolean;
  onToggleUnavailable: () => void;
  onConfirm: (messageId: string, reply: AvailabilityReply, comparison: AvailabilityComparison) => void;
}

function ComparisonView({
  messageId,
  comparison,
  displayMode,
  isConfirmed,
  isPending,
  showUnavailable,
  onToggleUnavailable,
  onConfirm,
}: ComparisonViewProps) {
  const available = comparison.replies.filter(r => r.status === "available");
  const unavailable = comparison.replies.filter(r => r.status !== "available");
  const best = bestReply(comparison);

  if (displayMode === "inline") {
    return (
      <div className="mt-2 w-full max-w-sm space-y-2">
        {available.map(reply => (
          <OptionCard
            key={reply.businessId}
            reply={reply}
            isBest={best?.businessId === reply.businessId}
            isConfirmed={isConfirmed}
            isPending={isPending}
            onConfirm={() => onConfirm(messageId, reply, comparison)}
          />
        ))}
        {unavailable.length > 0 && (
          <UnavailableSection
            unavailable={unavailable}
            showUnavailable={showUnavailable}
            onToggle={onToggleUnavailable}
          />
        )}
      </div>
    );
  }

  if (displayMode === "sheet") {
    return (
      <div className="mt-2 w-full max-w-sm overflow-hidden rounded-xl border border-deep-slate/10 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-secondary/5 px-3 py-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
            {available.length} option{available.length === 1 ? "" : "s"} available
          </span>
          {best && (
            <Badge variant="mint" className="text-[10px]">
              Best: {best.price?.toLocaleString()} {best.currency ?? "PKR"}
            </Badge>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {available.map(reply => (
            <OptionRow
              key={reply.businessId}
              reply={reply}
              isBest={best?.businessId === reply.businessId}
              isConfirmed={isConfirmed}
              isPending={isPending}
              onConfirm={() => onConfirm(messageId, reply, comparison)}
            />
          ))}
        </div>
        {unavailable.length > 0 && (
          <UnavailableSection
            unavailable={unavailable}
            showUnavailable={showUnavailable}
            onToggle={onToggleUnavailable}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <div className="mt-2 w-full max-w-sm">
      <button
        onClick={onToggleUnavailable}
        className="flex w-full items-center justify-between rounded-lg border border-deep-slate/10 bg-white px-3 py-2 text-left shadow-sm transition-colors hover:border-electric-mint"
      >
        <span className="text-[13px] font-medium text-on-surface">
          {available.length} option{available.length === 1 ? "" : "s"} • from{" "}
          {best?.price?.toLocaleString() ?? "—"} {best?.currency ?? "PKR"}
        </span>
        {showUnavailable ? (
          <ChevronUp className="size-4 text-on-surface-variant" />
        ) : (
          <ChevronDown className="size-4 text-on-surface-variant" />
        )}
      </button>
      {showUnavailable && (
        <div className="mt-2 space-y-2">
          {available.map(reply => (
            <OptionCard
              key={reply.businessId}
              reply={reply}
              isBest={best?.businessId === reply.businessId}
              isConfirmed={isConfirmed}
              isPending={isPending}
              onConfirm={() => onConfirm(messageId, reply, comparison)}
            />
          ))}
          {unavailable.length > 0 && (
            <UnavailableSection unavailable={unavailable} showUnavailable onToggle={onToggleUnavailable} />
          )}
        </div>
      )}
    </div>
  );
}

function OptionCard({
  reply,
  isBest,
  isConfirmed,
  isPending,
  onConfirm,
}: {
  reply: AvailabilityReply;
  isBest: boolean;
  isConfirmed: boolean;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-deep-slate/10 bg-white shadow-sm">
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[14px] font-semibold text-primary">
                {reply.product?.name ?? reply.businessId}
              </p>
              {isBest && <Star className="size-3.5 shrink-0 text-secondary" fill="currentColor" />}
            </div>
            <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-on-surface-variant">
              <MapPin className="size-3" />
              {reply.businessId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold text-primary">
              {reply.price?.toLocaleString() ?? "—"}
            </p>
            <p className="font-mono text-[10px] text-on-surface-variant">{reply.currency ?? "PKR"}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="neutral" className="font-mono text-[10px]">
            {reply.etaMinutes ? `${reply.etaMinutes} min` : "—"}
          </Badge>
          {isConfirmed ? (
            <Badge variant="mint" className="text-[10px]">
              <Check className="size-3" /> Confirmed
            </Badge>
          ) : (
            <Button
              onClick={onConfirm}
              disabled={isPending || !reply.product}
              size="sm"
              variant="secondary"
              className="h-8 px-3 text-[12px]"
            >
              {isPending ? "..." : "Confirm"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionRow({
  reply,
  isBest,
  isConfirmed,
  isPending,
  onConfirm,
}: {
  reply: AvailabilityReply;
  isBest: boolean;
  isConfirmed: boolean;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-deep-slate/5 px-3 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-medium text-primary">
            {reply.product?.name ?? reply.businessId}
          </p>
          {isBest && <Star className="size-3 shrink-0 text-secondary" fill="currentColor" />}
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant">
          {reply.businessId} • {reply.etaMinutes ?? "?"} min
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[12px] font-semibold text-primary">
          {reply.price?.toLocaleString() ?? "—"}
        </span>
        {isConfirmed ? (
          <Check className="size-4 text-electric-mint" />
        ) : (
          <Button
            onClick={onConfirm}
            disabled={isPending || !reply.product}
            size="sm"
            variant="secondary"
            className="h-7 px-2 text-[11px]"
          >
            {isPending ? "..." : "Confirm"}
          </Button>
        )}
      </div>
    </div>
  );
}

function UnavailableSection({
  unavailable,
  showUnavailable,
  onToggle,
  compact,
}: {
  unavailable: AvailabilityReply[];
  showUnavailable: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  if (unavailable.length === 0) return null;
  return (
    <div className={compact ? "border-t border-deep-slate/10 bg-surface-container-lowest px-3 py-2" : ""}>
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/60">
          {unavailable.length} unavailable
        </span>
        {showUnavailable ? (
          <ChevronUp className="size-3 text-on-surface-variant/60" />
        ) : (
          <ChevronDown className="size-3 text-on-surface-variant/60" />
        )}
      </button>
      {showUnavailable && (
        <div className={compact ? "mt-1 space-y-1" : "mt-2 space-y-1"}>
          {unavailable.map(reply => (
            <div
              key={reply.businessId}
              className="flex items-center justify-between text-[12px] text-on-surface-variant/70"
            >
              <span>{reply.businessId}</span>
              <Badge variant="neutral" className="text-[10px]">
                Unavailable
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
