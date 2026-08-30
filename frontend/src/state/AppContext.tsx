import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import * as api from "@/lib/api";
import type { AvailabilityComparison, AvailabilityReply, Order } from "@/lib/api";
import { DEMO, nextId } from "@/lib/agent";
import type { Category, Permissions, ProviderJob, RequestStatus, TaizRequest, Toast, User } from "./types";

export interface StartRequestInput {
  item: string;
  quantity: number;
  city: string;
  category: Category;
  neighborhood?: string;
}

interface AppState {
  user: User | null;
  request: TaizRequest | null;
  jobs: ProviderJob[];
  agentActive: boolean;
  permissions: Permissions;
  businessId: string | null;
  toast: Toast | null;
}

type PersistedState = Pick<AppState, "user" | "request" | "agentActive" | "permissions" | "businessId">;

type Action =
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" }
  | { type: "START_REQUEST"; input: StartRequestInput }
  | { type: "SET_COMPARISON"; comparison: AvailabilityComparison }
  | { type: "CHOOSE_REPLY"; reply: AvailabilityReply }
  | { type: "SET_ORDER"; order: Order }
  | { type: "SET_STATUS"; status: RequestStatus }
  | { type: "SET_BUSINESS"; businessId: string }
  | { type: "SET_PROVIDER_ORDERS"; jobs: ProviderJob[] }
  | { type: "TOGGLE_AGENT" }
  | { type: "SET_AGENT"; value: boolean }
  | { type: "SET_PERMISSION"; permissions: Partial<Permissions> }
  | { type: "HYDRATE"; payload: PersistedState }
  | { type: "RESET" }
  | { type: "SHOW_TOAST"; message: string }
  | { type: "CLEAR_TOAST" };

const INITIAL_PERMISSIONS: Permissions = {
  communicate: true,
  negotiate: true,
  negotiateMax: 5000,
  confirm: false,
  transact: false,
};

const STORAGE_KEY = "taiz:state";

function mapOrderToJob(order: Order, businessName: string): ProviderJob {
  const item = order.lines.map(l => l.name).join(", ");
  const firstEta = order.lines.find(l => l.etaMinutes)?.etaMinutes;
  const d = new Date(order.createdAt);
  return {
    id: order.id,
    customer: order.personalAgentId,
    item,
    price: order.total,
    etaMinutes: firstEta,
    day: d.toLocaleDateString([], { weekday: "short" }),
    time: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    location: businessName,
    businessId: order.businessId,
    status: order.status === "confirmed" ? "confirmed" : "pending",
  };
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, request: null, agentActive: true, permissions: INITIAL_PERMISSIONS, businessId: null };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      user: parsed.user ?? null,
      request: isRequest(parsed.request) ? parsed.request : null,
      agentActive: parsed.agentActive ?? true,
      permissions: { ...INITIAL_PERMISSIONS, ...parsed.permissions },
      businessId: parsed.businessId ?? null,
    };
  } catch {
    return { user: null, request: null, agentActive: true, permissions: INITIAL_PERMISSIONS, businessId: null };
  }
}

function isRequest(value: unknown): value is TaizRequest {
  if (!value || typeof value !== "object") return false;
  const req = value as Partial<TaizRequest>;
  return (
    typeof req.id === "string" &&
    typeof req.item === "string" &&
    typeof req.quantity === "number" &&
    typeof req.city === "string" &&
    typeof req.category === "string" &&
    typeof req.status === "string" &&
    typeof req.createdAt === "string"
  );
}

function makeRequest(input: StartRequestInput): TaizRequest {
  return {
    id: nextId("req"),
    item: input.item,
    quantity: input.quantity,
    city: input.city,
    category: input.category,
    neighborhood: input.neighborhood,
    status: "searching",
    createdAt: new Date().toISOString(),
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload.user, businessId: action.payload.user.businessId ?? null };
    case "LOGOUT":
      return { ...state, user: null, businessId: null, request: null, jobs: [] };
    case "START_REQUEST":
      return { ...state, request: makeRequest(action.input) };
    case "SET_COMPARISON":
      return {
        ...state,
        request: state.request ? { ...state.request, comparison: action.comparison, status: "comparing" } : null,
      };
    case "CHOOSE_REPLY":
      return {
        ...state,
        request: state.request ? { ...state.request, chosenReply: action.reply } : null,
      };
    case "SET_ORDER":
      return {
        ...state,
        request: state.request
          ? {
              ...state.request,
              orderId: action.order.id,
              status:
                action.order.status === "confirmed"
                  ? "confirmed"
                  : action.order.status === "rejected"
                    ? "declined"
                    : state.request.status,
            }
          : null,
      };
    case "SET_STATUS":
      return { ...state, request: state.request ? { ...state.request, status: action.status } : null };
    case "SET_BUSINESS":
      return { ...state, businessId: action.businessId, jobs: [] };
    case "SET_PROVIDER_ORDERS":
      return { ...state, jobs: action.jobs };
    case "TOGGLE_AGENT":
      return { ...state, agentActive: !state.agentActive };
    case "SET_AGENT":
      return state.agentActive === action.value ? state : { ...state, agentActive: action.value };
    case "SET_PERMISSION":
      return { ...state, permissions: { ...state.permissions, ...action.permissions } };
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "RESET":
      return { user: null, request: null, jobs: [], agentActive: true, permissions: INITIAL_PERMISSIONS, businessId: null };
    case "SHOW_TOAST":
      return { ...state, toast: { id: Date.now(), message: action.message } };
    case "CLEAR_TOAST":
      return state.toast ? { ...state, toast: null } : state;
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  startRequest: (input: StartRequestInput) => void;
  setComparison: (comparison: AvailabilityComparison) => void;
  chooseReply: (reply: AvailabilityReply) => void;
  setStatus: (status: RequestStatus) => void;
  createOrderForReview: (reply: AvailabilityReply, quantity: number) => Promise<void>;
  confirmOrder: () => Promise<void>;
  declineOrder: () => Promise<void>;
  setBusiness: (businessId: string) => void;
  refreshProviderOrders: () => Promise<void>;
  acceptJob: (id: string) => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  toggleAgent: (value: boolean) => void;
  setPermission: (permissions: Partial<Permissions>) => void;
  reset: () => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = useMemo(loadPersisted, []);
  const [state, dispatch] = useReducer(reducer, {
    ...persisted,
    jobs: [],
    toast: null,
  });

  useEffect(() => {
    const { user, request, agentActive, permissions, businessId } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, request, agentActive, permissions, businessId }));
  }, [state.user, state.request, state.agentActive, state.permissions, state.businessId]);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_TOAST" }), 2600);
    return () => clearTimeout(t);
  }, [state.toast]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: "HYDRATE", payload: loadPersisted() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const startRequest = useCallback((input: StartRequestInput) => dispatch({ type: "START_REQUEST", input }), []);
  const setComparison = useCallback((comparison: AvailabilityComparison) => dispatch({ type: "SET_COMPARISON", comparison }), []);
  const chooseReply = useCallback((reply: AvailabilityReply) => dispatch({ type: "CHOOSE_REPLY", reply }), []);
  const setStatus = useCallback((status: RequestStatus) => dispatch({ type: "SET_STATUS", status }), []);
  const setBusiness = useCallback((businessId: string) => dispatch({ type: "SET_BUSINESS", businessId }), []);
  const toggleAgent = useCallback((value: boolean) => dispatch({ type: "SET_AGENT", value }), []);
  const setPermission = useCallback((permissions: Partial<Permissions>) => dispatch({ type: "SET_PERMISSION", permissions }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const showToast = useCallback((message: string) => dispatch({ type: "SHOW_TOAST", message }), []);

  const login = useCallback((user: User) => dispatch({ type: "LOGIN", payload: { user } }), []);
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);

  const createOrderForReview = useCallback(async (reply: AvailabilityReply, quantity: number) => {
    if (!reply.product) return;
    const order = await api.createOrder({
      personalAgentId: api.PERSONAL_AGENT_ID,
      businessId: reply.businessId,
      items: [{ productId: reply.product.id, quantity }],
    });
    dispatch({ type: "SET_ORDER", order });
  }, []);

  const confirmOrder = useCallback(async () => {
    const id = state.request?.orderId;
    if (!id) return;
    const approved = await api.approveOrder(id);
    const confirmed = await api.confirmOrder(approved.id);
    dispatch({ type: "SET_ORDER", order: confirmed });
  }, [state.request]);

  const declineOrder = useCallback(async () => {
    const id = state.request?.orderId;
    if (!id) return;
    const rejected = await api.rejectOrder(id);
    dispatch({ type: "SET_ORDER", order: rejected });
  }, [state.request]);

  const refreshProviderOrders = useCallback(async () => {
    if (!state.businessId) return;
    try {
      const [orders, businesses] = await Promise.all([
        api.listOrders(state.businessId),
        api.listBusinesses(),
      ]);
      const nameById = new Map(businesses.map(b => [b.id, b.name]));
      dispatch({
        type: "SET_PROVIDER_ORDERS",
        jobs: orders.map(o => mapOrderToJob(o, nameById.get(o.businessId) ?? o.businessId)),
      });
    } catch {
      /* leave existing jobs */
    }
  }, [state.businessId]);

  const acceptJob = useCallback(
    async (id: string) => {
      const approved = await api.approveOrder(id);
      const confirmed = await api.confirmOrder(approved.id);
      dispatch({ type: "SET_PROVIDER_ORDERS", jobs: state.jobs.map(j => (j.id === id ? { ...j, status: "confirmed" } : j)) });
      void confirmed;
    },
    [state.jobs],
  );

  const value: AppContextValue = {
    ...state,
    startRequest,
    setComparison,
    chooseReply,
    setStatus,
    createOrderForReview,
    confirmOrder,
    declineOrder,
    setBusiness,
    refreshProviderOrders,
    acceptJob,
    login,
    logout,
    toggleAgent,
    setPermission,
    reset,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be within AppProvider");
  return ctx;
}