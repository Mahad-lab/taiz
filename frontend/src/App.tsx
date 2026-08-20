import { ToastViewport } from "@/components/layout/ToastViewport";
import { useHashRoute } from "@/lib/router";
import { Activity } from "@/screens/Activity";
import { AgentChat } from "@/screens/AgentChat";
import { AgentChatLog } from "@/screens/AgentChatLog";
import { History } from "@/screens/History";
import { HumanReview } from "@/screens/HumanReview";
import { MagicView } from "@/screens/MagicView";
import { NegotiationStatus } from "@/screens/NegotiationStatus";
import { OfferApproval } from "@/screens/OfferApproval";
import { OrderConfirmation } from "@/screens/OrderConfirmation";
import { ProviderDashboard } from "@/screens/ProviderDashboard";
import { ProviderExplore } from "@/screens/ProviderExplore";
import { ProviderNegotiation } from "@/screens/ProviderNegotiation";
import { ProviderProfile } from "@/screens/ProviderProfile";
import { RequestDashboard } from "@/screens/RequestDashboard";
import { Welcome } from "@/screens/Welcome";
import { AppProvider } from "@/state/AppContext";

function Router() {
  const [route, navigate] = useHashRoute();

  switch (route) {
    case "dashboard":
      return <RequestDashboard navigate={navigate} />;
    case "chat":
      return <AgentChat navigate={navigate} />;
    case "magic":
      return <MagicView navigate={navigate} />;
    case "negotiation":
      return <NegotiationStatus navigate={navigate} />;
    case "agent-chat-log":
      return <AgentChatLog navigate={navigate} />;
    case "activity":
      return <Activity navigate={navigate} />;
    case "history":
      return <History navigate={navigate} />;
    case "review":
      return <HumanReview navigate={navigate} />;
    case "approval":
      return <OfferApproval navigate={navigate} />;
    case "confirmed":
      return <OrderConfirmation navigate={navigate} />;
    case "provider":
      return <ProviderDashboard navigate={navigate} />;
    case "provider-negotiation":
      return <ProviderNegotiation navigate={navigate} />;
    case "provider-explore":
      return <ProviderExplore navigate={navigate} />;
    case "provider-profile":
      return <ProviderProfile navigate={navigate} />;
    case "welcome":
    default:
      return <Welcome navigate={navigate} />;
  }
}

export function App() {
  return (
    <AppProvider>
      <Router />
      <ToastViewport />
    </AppProvider>
  );
}

export default App;