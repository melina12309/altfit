import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import Index from "./pages/Index";
import OutfitDetail from "./pages/OutfitDetail";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Stylist from "./pages/Stylist";
import Explore from "./pages/Explore";
import MomentDetail from "./pages/MomentDetail";
import OutfitBuilder from "./pages/OutfitBuilder";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/outfit/:id" element={<OutfitDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/stylist" element={<Stylist />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/explore/:momentId" element={<MomentDetail />} />
              <Route path="/builder" element={<OutfitBuilder />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </OnboardingWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;