import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DrawerProvider, useDrawers } from "./contexts/DrawerContext";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import { FinancialDataProvider } from "./contexts/FinancialDataContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sidebar } from "./components/Sidebar";
import { NotificationsDrawer } from "./components/NotificationsDrawer";
import { AdvisorDrawer } from "./components/AdvisorDrawer";
import AdvisorCall from "./pages/AdvisorCall";
import Chat from "./pages/Chat";
import Goals from "./pages/Goals";
import Subscriptions from "./pages/Subscriptions";
import Plan from "./pages/Plan";
import Autopilot from "./pages/Autopilot";
import Emergency from "./pages/Emergency";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Onboarding1 from "./pages/Onboarding1";
import Onboarding2 from "./pages/Onboarding2";
import Onboarding3 from "./pages/Onboarding3";
import VoiceTest from "./pages/VoiceTest";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isOnboardingComplete } = useOnboarding();
  
  if (!isOnboardingComplete) {
    return <Navigate to="/onboarding/1" replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { isNotificationsOpen, isAdvisorOpen, openAdvisor, closeNotifications, closeAdvisor } = useDrawers();
  const { isOnboardingComplete } = useOnboarding();

  return (
    <Routes>
      {/* Onboarding routes - full screen, no sidebar */}
      <Route 
        path="/onboarding/1" 
        element={
          isOnboardingComplete ? <Navigate to="/" replace /> : <Onboarding1 />
        } 
      />
      <Route 
        path="/onboarding/2" 
        element={
          isOnboardingComplete ? <Navigate to="/" replace /> : <Onboarding2 />
        } 
      />
      <Route 
        path="/onboarding/3" 
        element={
          isOnboardingComplete ? <Navigate to="/" replace /> : <Onboarding3 />
        } 
      />
      
      {/* Main app with sidebar - protected */}
      <Route path="*" element={
        <ProtectedRoute>
        <div className="flex min-h-screen w-full">
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:m-2"
          >
            Skip to main content
          </a>
          <Sidebar />
          <main id="main-content" className="flex-1 ml-64 p-8" role="main">
            <Routes>
              <Route path="/" element={<AdvisorCall />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/autopilot" element={<Autopilot />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/voice-test" element={<VoiceTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Floating Action Button for Advisor */}
          <button
            onClick={openAdvisor}
            className="fixed bottom-8 right-8 z-30 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity focus-ring flex items-center justify-center"
            aria-label="Open AI Advisor"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>

          {/* Drawers */}
          <NotificationsDrawer
            isOpen={isNotificationsOpen}
            onClose={closeNotifications}
          />
          <AdvisorDrawer
            isOpen={isAdvisorOpen}
            onClose={closeAdvisor}
          />
        </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingProvider>
            <FinancialDataProvider>
              <DrawerProvider>
                <AppContent />
              </DrawerProvider>
            </FinancialDataProvider>
          </OnboardingProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
