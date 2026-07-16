import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CookieBanner } from "@/components/CookieBanner";

// Public Pages removed - dashboard only

// Dashboard Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardMedia from "./pages/dashboard/Media";
import DashboardSettings from "./pages/dashboard/Settings";
import AIContent from "./pages/dashboard/AIContent";

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
                  <Routes>
                    {/* Dashboard Routes - at root level */}
                    <Route path="/" element={<DashboardLayout />}>
                      <Route index element={<AIContent />} />
                      <Route path="ai-content" element={<AIContent />} />
                      <Route path="media" element={<DashboardMedia />} />
                      <Route path="settings" element={<DashboardSettings />} />
                    </Route>

                    {/* Test Component Route */}
                    <Route path="/testcomponent" element={<TestComponent />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <CookieBanner />
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
