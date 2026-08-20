import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { DEMO, initialMessages, nextId } from "@/lib/agent";
import type {
  ChatMessage,
  ProviderJob,
  RequestStatus,
  Role,
  TaizRequest,
  Toast,
} from "./types";

interface AppState {
  role: Role | null;
  request: TaizRequest | null;
  jobs: ProviderJob[];
  agentActive: boolean;
  toast: Toast | null;
}

type Action =
  | { type: "SET_ROLE"; role: Role }
  | { type: "START_REQUEST" }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "SET_STATUS"; status: RequestStatus }
  | { type: "SET_PICKUP"; day: string; time: string }
  | { type: "CONFIRM_ORDER" }
  | { type: "DECLINE_ORDER" }
  | { type: "ACCEPT_JOB"; id: string }
  | { type: "TOGGLE_AGENT" }
  | { type: "HYDRATE"; payload: Pick<AppState, "role" | "request" | "jobs" | "agentActive"> }
  | { type: "RESET" }
  | { type: "SHOW_TOAST"; message: string }
  | { type: "CLEAR_TOAST" };

const INITIAL_JOBS: ProviderJob[] = [
  {
    id: "job-sarah",
    customer: "Sarah Jenkins",
    item: "Vanilla Birthday Cake",
    day: "Today",
    time: "2:30 PM",
    price: 3500,
    location: "Gulberg, Lahore",
    status: "confirmed",
  },
  {
    id: "job-marcus",
    customer: "Marcus Thorne",
    item: "Chocolate Truffle",
    day: "Tomorrow",
    time: "9:00 AM",
    price: 2900,
    location: "DHA Phase 5",
    status: "confirmed",
  },
  {
    id: "job-elena",
    customer: "Elena Rodriguez",
    item: "Custom Wedding Cake",
    day: "Thu",
    time: "4:15 PM",
    price: 8500,
    location: "Model Town",
    status: "pending",
  },
];

const STORAGE_KEY = "taiz:state";

/** localStorage (not sessionStorage) so the provider side in another tab/window sees cross-tab updates. */
function loadPersisted(): Pick<AppState, "role" | "request" | "jobs" | "agentActive"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { role: null, request: null, jobs: INITIAL_JOBS, agentActive: true };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      role: parsed.role ?? null,
      request: isRequest(parsed.request) ? parsed.request : null,
      jobs: parsed.jobs?.length ? parsed.jobs : INITIAL_JOBS,
      agentActive: parsed.agentActive ?? true,
    };
  } catch {
    return { role: null, request: null, jobs: INITIAL_JOBS, agentActive: true };
  }
}

function isRequest(value: unknown): value is TaizRequest {
  if (!value || typeof value !== "object") return false;
  const req = value as Partial<TaizRequest>;
  return (
    typeof req.id === "string" &&
    typeof req.item === "string" &&
    typeof req.status === "string" &&
    Array.isArray(req.messages)
  );
}

function makeRequest(): TaizRequest {
  return {
    id: nextId("req"),
    item: DEMO.item,
    budget: DEMO.budget,
    provider: DEMO.provider,
    providerRating: DEMO.providerRating,
    initialPrice: DEMO.initialPrice,
    finalPrice: DEMO.finalPrice,
    counterOffer: true,
    pickupLocation: DEMO.pickupLocation,
    pickupDay: DEMO.pickupDay,
    pickupTime: DEMO.pickupTime,
    status: "chatting",
    messages: initialMessages(),
    createdAt: new Date().toISOString(),
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.role };
    case "START_REQUEST":
      return { ...state, request: makeRequest() };
    case "ADD_MESSAGE":
      if (!state.request) return state;
      return { ...state, request: { ...state.request, messages: [...state.request.messages, action.message] } };
    case "SET_STATUS":
      if (!state.request) return state;
      return { ...state, request: { ...state.request, status: action.status } };
    case "SET_PICKUP":
      if (!state.request) return state;
      return {
        ...state,
        request: { ...state.request, pickupDay: action.day, pickupTime: action.time },
      };
    case "CONFIRM_ORDER": {
      if (!state.request) return state;
      const job: ProviderJob = {
        id: nextId("job"),
        customer: DEMO.customer,
        item: state.request.item,
        day: state.request.pickupDay,
        time: state.request.pickupTime,
        price: state.request.finalPrice,
        location: "Gulberg, Lahore",
        status: "confirmed",
      };
      return {
        ...state,
        request: { ...state.request, status: "confirmed" },
        jobs: [job, ...state.jobs],
      };
    }
    case "DECLINE_ORDER":
      if (!state.request) return state;
      return { ...state, request: { ...state.request, status: "declined" } };
    case "ACCEPT_JOB":
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.id ? { ...job, status: "confirmed" } : job,
        ),
      };
    case "TOGGLE_AGENT":
      return { ...state, agentActive: !state.agentActive };
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...state, role: null, request: null, jobs: INITIAL_JOBS, agentActive: true };
    case "SHOW_TOAST":
      return { ...state, toast: { id: Date.now(), message: action.message } };
    case "CLEAR_TOAST":
      return state.toast ? { ...state, toast: null } : state;
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  startRequest: () => void;
  addMessage: (text: string, from: ChatMessage["from"]) => void;
  setStatus: (status: RequestStatus) => void;
  setPickup: (day: string, time: string) => void;
  confirmOrder: () => void;
  declineOrder: () => void;
  acceptJob: (id: string) => void;
  setRole: (role: Role) => void;
  toggleAgent: () => void;
  reset: () => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(loadPersisted, []);
  const [state, dispatch] = useReducer(reducer, {
    ...persisted,
    toast: null,
  });

  useEffect(() => {
    const { role, request, jobs, agentActive } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ role, request, jobs, agentActive }),
    );
  }, [state.role, state.request, state.jobs, state.agentActive]);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_TOAST" }), 2600);
    return () => clearTimeout(t);
  }, [state.toast]);

  // Live cross-tab sync: apply writes made in other tabs/windows.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: "HYDRATE", payload: loadPersisted() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value: AppContextValue = {
    ...state,
    startRequest: () => dispatch({ type: "START_REQUEST" }),
    addMessage: (text, from) =>
      dispatch({ type: "ADD_MESSAGE", message: { id: nextId("msg"), from, text, time: "Now" } }),
    setStatus: status => dispatch({ type: "SET_STATUS", status }),
    setPickup: (day, time) => dispatch({ type: "SET_PICKUP", day, time }),
    confirmOrder: () => dispatch({ type: "CONFIRM_ORDER" }),
    declineOrder: () => dispatch({ type: "DECLINE_ORDER" }),
    acceptJob: id => dispatch({ type: "ACCEPT_JOB", id }),
    setRole: role => dispatch({ type: "SET_ROLE", role }),
    toggleAgent: () => dispatch({ type: "TOGGLE_AGENT" }),
    reset: () => dispatch({ type: "RESET" }),
    showToast: message => dispatch({ type: "SHOW_TOAST", message }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}