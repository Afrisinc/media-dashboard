import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AfrisincLoader } from "@/components/AfrisincLoader";

// Public Pages removed - dashboard only

// Dashboard Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardMedia from "./pages/dashboard/Media";
import DashboardSettings from "./pages/dashboard/Settings";
import DashboardAutomation from "./pages/dashboard/Automation";
import DashboardAgents from "./pages/dashboard/Agents";
import DashboardBrands from "./pages/dashboard/Brands";
import Studio from "./pages/dashboard/Studio";
import DashboardAnalytics from "./pages/dashboard/Analytics";
import SSOCallback from "./pages/SSOCallback";
import OAuthCallback from "./pages/oauth/callback";

import NotFound from "./pages/NotFound";
import TestComponent from "./pages/TestComponent";

const queryClient = new QueryClient();

// Inject GA4 script
function injectGAScript() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const debug = import.meta.env.VITE_GA_DEBUG === "true";
  const isProd = import.meta.env.MODE === "production";

  // Only load GA4 in production or when debug is enabled
  if (!gaId || (!isProd && !debug)) {
    return;
  }

  // Inject dataLayer and gtag function
  const win = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  win.dataLayer = win.dataLayer || [];
  function gtag(...args: unknown[]) {
    win.dataLayer?.push(...args);
  }
  win.gtag = gtag;

  gtag("js", new Date());
  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });
  gtag("config", gaId, {
    page_path: window.location.pathname,
    debug_mode: debug,
    send_page_view: false,
  });

  // Load GA4 script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
}

const AppContent = () => {
  const { loading: authLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setShowContent(false);
    } else {
      // Minimum delay of 600ms for loader animation
      const timer = setTimeout(() => setShowContent(true), 600);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (!showContent) {
    return <AfrisincLoader message="Initializing dashboard..." />;
  }

  return (
    <Routes>
      <Route path="/sso/callback" element={<SSOCallback />} />
      <Route path="/oauth/callback/:platform" element={<OAuthCallback />} />

      {/* Dashboard Routes - at root level */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardMedia />} />
        <Route path="studio" element={<Studio />} />
        {/* Both used to be their own page; keep the links working. */}
        <Route path="post-studio" element={<Navigate to="/studio" replace />} />
        <Route path="ai-content" element={<Navigate to="/studio" replace />} />
        <Route path="media" element={<DashboardMedia />} />
        <Route path="brands" element={<DashboardBrands />} />
        <Route path="automation" element={<DashboardAutomation />} />
        <Route path="agents" element={<DashboardAgents />} />
        <Route path="analytics" element={<DashboardAnalytics />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>

      {/* Test Component Route */}
      <Route path="/testcomponent" element={<TestComponent />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Inject GA4 script on component mount
  useEffect(() => {
    injectGAScript();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsProvider>
                <ScrollToTop />
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </AnalyticsProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
