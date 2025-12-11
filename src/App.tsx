import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import RegisterWebsite from "./pages/RegisterWebsite";
import RegisterContent from "./pages/RegisterContent";
import Market from "./pages/Market";
import LicenseDetail from "./pages/LicenseDetail";
import MyLicenses from "./pages/MyLicenses";
import ScraperBot from "./pages/ScraperBot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WalletProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-website" element={<RegisterWebsite />} />
            <Route path="/register-content" element={<RegisterContent />} />
            <Route path="/market" element={<Market />} />
            <Route path="/license/:ipId/:type" element={<LicenseDetail />} />
            <Route path="/my-licenses" element={<MyLicenses />} />
            <Route path="/bot" element={<ScraperBot />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
