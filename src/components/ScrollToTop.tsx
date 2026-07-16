import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * Automatically scrolls the page to the top whenever the route changes.
 * Place this component inside BrowserRouter but outside Routes.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior for professional feel
    window.scrollTo({
      top: 0,
      behavior: "auto", // Instant scroll for navigation (not smooth)
    });
  }, [pathname]);

  return null;
};
