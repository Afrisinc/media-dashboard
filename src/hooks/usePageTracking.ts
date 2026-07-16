import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const url = location.pathname + (location.search ? location.search : "");
    trackPageView(url);
  }, [location.pathname, location.search]);
}
