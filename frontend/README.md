# Taiz — Your Personal AI for Local Services

Taiz is a personal AI agent that coordinates your city for you: tell it what you need, and it discovers nearby providers, negotiates agent-to-agent within limits you set, and brings you the result to approve. This frontend is a complete, end-to-end interactive demo of that flow — no backend required.

## Demo Story (Bakery Cake)

- Customer **Ayesha Khan** asks Taiz for a Red Velvet Cake, budget **2000 PKR**.
- Her agent finds **Grand Central Bakery** (4.8★) and negotiates agent-to-agent — opening quote **3500 PKR** → negotiated **2200 PKR**.
- Taiz presents the best option; the human confirms the booking (pickup today 2:00 PM).
- The **provider dashboard** receives the new confirmed job the moment the customer books.

Everything is simulated in the frontend — deterministic, no backend, no randomness. Tune the story/timing in `src/lib/agent.ts`.

## Getting Started

```bash
bun install
bun dev      # dev server at http://localhost:3000
bun run build
bun start    # run the production build
bunx tsc --noEmit   # typecheck
```

## App Structure

```
src/
  index.html            # entry HTML (fonts, favicon, manifest)
  index.css             # base styles + shared animations (pulse-ring, ring-expand)
  manifest.json         # PWA manifest
  frontend.tsx          # React root (imports index.css)
  App.tsx               # hash router switch + AppProvider + ToastViewport
  lib/
    router.ts           # hash routing (Route type, useHashRoute, STATUS_ROUTE)
    nav.ts              # bottom-nav tab -> route resolution (customer + provider)
    agent.ts            # demo story, checklist/timeline builders, discover data, timings
    utils.ts            # cn(), titleCase()
  state/
    types.ts            # Role, RequestStatus, TaizRequest, ProviderJob, Permissions, ...
    AppContext.tsx       # global state (reducer + localStorage persistence)
  components/
    layout/              # DeviceFrame, TopAppBar, BottomNav, DesktopHeader, ToastViewport
    shared/               # Logo, AgentInput, ProviderCard, PermissionRow, Timeline, TypingDots
    ui/                   # badge, button, toggle, empty-state, ...
  screens/
    Welcome, Home, Discover, You, AgentTask, AgentActivity, AgentChatLog,
    Results, OrderConfirmation, Activity, ProviderDashboard, ...
```

## Screens

| Route | Screen |
| --- | --- |
| `#/welcome` | Role selection |
| `#/home` | Home — the agent input ("What can I take care of for you?") |
| `#/discover` | Geography-first directory of nearby providers |
| `#/you` | Identity, agent permissions, privacy, sign out/reset |
| `#/agent-task` | Structured request summary + "Taiz is working" checklist |
| `#/agent-activity` | Live negotiation timeline (auto-advances) |
| `#/agent-chat-log` | Human-readable agent-to-agent negotiation transcript |
| `#/activity` | Full activity log — live request + past orders |
| `#/review` | Results — best option, checks, confirm/decline (web layout) |
| `#/confirmed` | Order confirmation |
| `#/provider` | Provider jobs dashboard |
| `#/provider-negotiation` | Provider's agent working in the background |
| `#/provider-explore` | Nearby incoming requests the provider's agent can pick up |
| `#/provider-profile` | Provider identity, stats, AI Agent toggle, sign out |

The customer flow is fully replayable from Home. State (role, the in-progress request, provider jobs, agent permissions) persists in `localStorage` under `taiz:state`, so the customer and provider sides stay in sync even across tabs/windows, and a mid-flow refresh resumes where you left off.

## Tech

Bun 1.3+, React 19, Tailwind CSS v4 (CSS inlined into the JS bundle via `bun-plugin-tailwind`), lucide-react icons, shadcn-style primitives. Design tokens (Deep Slate / Electric Mint / Soft Sand) in `styles/globals.css`.
