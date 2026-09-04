import { ToastViewport } from "@/components/layout/ToastViewport";
import { useHashRoute } from "@/lib/router";
import { Activity } from "@/screens/Activity";
import { AgentActivity } from "@/screens/AgentActivity";
import { AgentChatLog } from "@/screens/AgentChatLog";
import { AgentTask } from "@/screens/AgentTask";
import { Discover } from "@/screens/Discover";
import { Home } from "@/screens/Home";
import { Onboarding } from "@/screens/Onboarding";
import { OrderConfirmation } from "@/screens/OrderConfirmation";
import { ProviderDashboard } from "@/screens/ProviderDashboard";
import { ProviderExplore } from "@/screens/ProviderExplore";
import { ProviderNegotiation } from "@/screens/ProviderNegotiation";
import { ProviderProfile } from "@/screens/ProviderProfile";
import { Results } from "@/screens/Results";
import { Welcome } from "@/screens/Welcome";
import { You } from "@/screens/You";
import { AppProvider } from "@/state/AppContext";

function Router() {
  const [route, navigate] = useHashRoute();

  switch (route) {
    case "onboarding":
      return <Onboarding navigate={navigate} />;
    case "home":
      return <Home navigate={navigate} />;
    case "discover":
      return <Discover navigate={navigate} />;
    case "you":
      return <You navigate={navigate} />;
    case "agent-task":
      return <AgentTask navigate={navigate} />;
    case "agent-activity":
      return <AgentActivity navigate={navigate} />;
    case "agent-chat-log":
      return <AgentChatLog navigate={navigate} />;
    case "activity":
      return <Activity navigate={navigate} />;
    case "review":
      return <Results navigate={navigate} />;
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
