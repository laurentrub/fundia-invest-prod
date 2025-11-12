import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import PersonalLoan from "./pages/PersonalLoan";
import AutoLoan from "./pages/AutoLoan";
import ApplyPage from "./pages/ApplyPage";
import ProjectFinancing from "./pages/ProjectFinancing";
import AdminDashboard from "./pages/AdminDashboard";
import ResourcesHub from "./pages/resources/ResourcesHub";
import Glossary from "./pages/resources/Glossary";
import FAQ from "./pages/resources/FAQ";
import CreditGuide from "./pages/resources/CreditGuide";
import HomeImprovement from "./pages/HomeImprovement";
import Consolidation from "./pages/Consolidation";
import BusinessLoan from "./pages/BusinessLoan";
import ApplyConfirmation from "./pages/ApplyConfirmation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/personal-loan" element={<PersonalLoan />} />
            <Route path="/auto-loan" element={<AutoLoan />} />
            <Route path="/home-improvement" element={<HomeImprovement />} />
            <Route path="/consolidation" element={<Consolidation />} />
            <Route path="/business-loan" element={<BusinessLoan />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/project-financing" element={<ProjectFinancing />} />
            <Route path="/apply/confirmation" element={<ApplyConfirmation />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resources" element={<ResourcesHub />} />
            <Route path="/resources/glossary" element={<Glossary />} />
            <Route path="/resources/faq" element={<FAQ />} />
            <Route path="/resources/guide" element={<CreditGuide />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
