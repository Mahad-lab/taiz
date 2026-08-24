import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { DEMO, nextId } from "@/lib/agent";
import type { Permissions, ProviderJob, RequestStatus, Role, TaizRequest, Toast } from "./types";

interface AppState {
  role: Role | null;
  request: TaizRequest | null;
  jobs: ProviderJob[];
  agentActive: boolean;
  permissions: Permissions;
  toast: Toast | null;
}

type PersistedState = Pick<AppState, "role" | "request" | "jobs" | "agentActive" | "permissions">;

type Action =
  | { type: "SET_ROLE"; role: Role }
  | { type: "START_REQUEST" }
  | { type: "SET_STATUS"; status: RequestStatus }
  | { type: "CONFIRM_ORDER" }
  | { type: "DECLINE_ORDER" }
  | { type: "ACCEPT_JOB"; id: string }
  | { type: "TOGGLE_AGENT" }
  | { type: "SET_PERMISSION"; permissions: Partial<Permissions> }
  | { type: "HYDRATE"; payload: PersistedState }
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

const INITIAL_PERMISSIONS: Permissions = {
  communicate: true,
  negotiate: true,
  negotiateMax: 5000,
  confirm: false,
  transact: false,
};

const STORAGE_KEY = "taiz:state";

/** localStorage (not sessionStorage) so the provider side in another tab/window sees cross-tab updates. */
function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { role: null, request: null, jobs: INITIAL_JOBS, agentActive: true, permissions: INITIAL_PERMISSIONS };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      role: parsed.role ?? null,
      request: isRequest(parsed.request) ? parsed.request : null,
      jobs: parsed.jobs?.length ? parsed.jobs : INITIAL_JOBS,
      agentActive: parsed.agentActive ?? true,
      permissions: { ...INITIAL_PERMISSIONS, ...parsed.permissions },
    };
  } catch {
    return { role: null, request: null, jobs: INITIAL_JOBS, agentActive: true, permissions: INITIAL_PERMISSIONS };
  }
}

function isRequest(value: unknown): value is TaizRequest {
  if (!value || typeof value !== "object") return false;
  const req = value as Partial<TaizRequest>;
  return (
    typeof req.id === "string" &&
    typeof req.item === "string" &&
    typeof req.budget === "number" &&
    typeof req.provider === "string" &&
    typeof req.providerRating === "number" &&
    typeof req.initialPrice === "number" &&
    typeof req.finalPrice === "number" &&
    typeof req.pickupLocation === "string" &&
    typeof req.pickupDay === "string" &&
    typeof req.pickupTime === "string" &&
    typeof req.status === "string"
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
    pickupLocation: DEMO.pickupLocation,
    pickupDay: DEMO.pickupDay,
    pickupTime: DEMO.pickupTime,
    status: "searching",
    createdAt: new Date().toISOString(),
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.role };
    case "START_REQUEST":
      return { ...state, request: makeRequest() };
    case "SET_STATUS":
      if (!state.request) return state;
      return { ...state, request: { ...state.request, status: action.status } };
    case "CONFIRM_ORDER": {
      if (!state.request) return state;
      const job: ProviderJob = {
        id: nextId("job"),
        customer: DEMO.customer,
        item: state.request.item,
        day: state.request.pickupDay,
        time: state.request.pickupTime,
        price: state.request.finalPrice,
        location: state.request.pickupLocation,
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
    case "SET_PERMISSION":
      return { ...state, permissions: { ...state.permissions, ...action.permissions } };
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...state, role: null, request: null, jobs: INITIAL_JOBS, agentActive: true, permissions: INITIAL_PERMISSIONS };
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
  setStatus: (status: RequestStatus) => void;
  confirmOrder: () => void;
  declineOrder: () => void;
  acceptJob: (id: string) => void;
  setRole: (role: Role) => void;
  toggleAgent: () => void;
  setPermission: (permissions: Partial<Permissions>) => void;
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
    const { role, request, jobs, agentActive, permissions } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ role, request, jobs, agentActive, permissions }),
    );
  }, [state.role, state.request, state.jobs, state.agentActive, state.permissions]);

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
    startRequest: useCallback(() => dispatch({ type: "START_REQUEST" }), []),
    setStatus: useCallback((status: RequestStatus) => dispatch({ type: "SET_STATUS", status }), []),
    confirmOrder: useCallback(() => dispatch({ type: "CONFIRM_ORDER" }), []),
    declineOrder: useCallback(() => dispatch({ type: "DECLINE_ORDER" }), []),
    acceptJob: useCallback((id: string) => dispatch({ type: "ACCEPT_JOB", id }), []),
    setRole: useCallback((role: Role) => dispatch({ type: "SET_ROLE", role }), []),
    toggleAgent: useCallback(() => dispatch({ type: "TOGGLE_AGENT" }), []),
    setPermission: useCallback((permissions: Permissions) => dispatch({ type: "SET_PERMISSION", permissions }), []),
    reset: useCallback(() => dispatch({ type: "RESET" }), []),
    showToast: useCallback((message: string) => dispatch({ type: "SHOW_TOAST", message }), []),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
