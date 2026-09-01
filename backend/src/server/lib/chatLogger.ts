/**
 * Lightweight structured logger for chat events.
 *
 * Emits one line per event to stdout (or stderr for failures), prefixed with
 * an ISO timestamp and a stable event tag so downstream tooling can grep for
 * them. Intentionally avoids any external logging dependency — this matches
 * the rest of the backend, which uses plain console calls.
 */
type Level = "info" | "warn" | "error";

const TAG = "chat";

function emit(level: Level, event: string, fields: Record<string, unknown>): void {
  const payload = JSON.stringify(fields);
  const line = `[${new Date().toISOString()}] [${TAG}] ${event} ${payload}`;
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const chatLogger = {
  received(agentId: string, messageLength: number, contextLength: number): void {
    emit("info", "received", { agentId, messageLength, contextLength });
  },

  intentExtracted(agentId: string, intent: {
    shouldCheckAvailability: boolean;
    isGreeting: boolean;
    item: string;
    city: string;
    category: string;
  }): void {
    emit("info", "intent_extracted", { agentId, intent });
  },

  intentFailed(agentId: string, detail: string): void {
    emit("warn", "intent_extraction_failed", { agentId, detail });
  },

  availabilityChecked(agentId: string, resultCount: number, bestMatch: string | null): void {
    emit("info", "availability_checked", { agentId, resultCount, bestMatch });
  },

  replied(agentId: string, hasComparison: boolean, replyLength: number): void {
    emit("info", "replied", { agentId, hasComparison, replyLength });
  },

  failed(agentId: string, code: string, message: string): void {
    emit("error", "chat_failed", { agentId, code, message });
  },
};