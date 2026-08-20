# Taiz — A2A Marketplace Frontend

Taiz is a local-services marketplace where **agents negotiate on your behalf**. This frontend is a complete, end-to-end interactive demo: an AI customer agent discovers and negotiates with a provider agent, brings the deal to the human for approval, and books the service.

## Demo Story (Bakery Cake)

- Customer **Ayesha Khan** wants a Red Velvet Cake, budget **2000 PKR**.
- Her agent discovers **Grand Central Bakery** (4.8★) and negotiates — initial quote **3500 PKR** → counter-offer **2200 PKR**.
- The human reviews the agent's summary, approves the counter-offer, and the order is **confirmed** (pickup today 2:00 PM).
- The **provider dashboard** receives the new confirmed job the moment the customer books.

Everything is simulated in the frontend — no backend required. Tune the story/timing in `src/lib/agent.ts`.

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
  index.html            # entry HTML (fonts, favicon)
  index.css             # base styles + shared animations (cyber-grid, pulse-stream, pulse-ring)
  frontend.tsx          # React root (imports index.css)
  App.tsx               # hash router switch + AppProvider + ToastViewport
  lib/
    router.ts           # hash routing (Route type, useHashRoute, STATUS_ROUTE)
    agent.ts            # demo story, terminal/timeline builders, timings
    utils.ts            # cn(), titleCase()
  state/
    types.ts            # Role, RequestStatus, TaizRequest, ProviderJob, Toast, ...
    AppContext.tsx      # global state (reducer + sessionStorage persistence)
  components/
    layout/             # DeviceFrame, TopAppBar, BottomNav, DesktopHeader, ToastViewport
    shared/             # Logo, TypingDots, TerminalLog, Timeline, ChatMessage
    ui/                 # badge, button, toggle
  screens/
    Welcome, RequestDashboard, AgentChat, MagicView, NegotiationStatus,
    HumanReview, OfferApproval, OrderConfirmation, ProviderDashboard
```

## Screens

| Route            | Screen                 |
| ---------------- | ---------------------- |
| `#/welcome`      | Role selection         |
| `#/dashboard`    | Customer task dashboard |
| `#/chat`         | Chat with your agent   |
| `#/magic`        | Agent discovery & negotiation animation (terminal + node graph) |
| `#/negotiation`  | Live negotiation timeline (auto-advances) |
| `#/agent-chat-log` | The agent-to-agent negotiation transcript ("View Chat Log") |
| `#/activity`     | Running log of the active request's lifecycle |
| `#/history`      | Confirmed/declined past orders |
| `#/review`       | Human approval of agent's summary (web layout) |
| `#/approval`     | Final counter-offer approval |
| `#/confirmed`    | Order confirmation     |
| `#/provider`     | Provider jobs dashboard |
| `#/provider-negotiation` | Provider's agent working in the background (dark hub status) |
| `#/provider-explore` | Nearby incoming requests the provider's agent can pick up |
| `#/provider-profile` | Provider identity, stats, AI Agent toggle, sign out |

The customer flow is fully replayable — chips on the dashboard relaunch the demo. State (role, the in-progress request, provider jobs) persists in `localStorage` under `taiz:state`, so the customer and provider sides stay in sync even across tabs/windows, and a mid-flow refresh resumes where you left off.

## Tech

Bun 1.3+, React 19, Tailwind CSS v4 (CSS inlined into the JS bundle via `bun-plugin-tailwind`), lucide-react icons, shadcn-style primitives. Design tokens in `styles/globals.css` (per `../stitch_taiz/taiz/DESIGN.md`).
