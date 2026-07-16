import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

/**
 * ScrollToTopButton Component
 * Shows a floating button to scroll to top when:
 * 1. User is near bottom of page (within 300px from bottom)
 * 2. User is scrolling upward
 * 3. Only on public pages (not dashboard/platform)
 *
 * Usage: Place in root layout or page wrapper
 */
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    // Check if current route is dashboard or platform (non-public)
    const isNonPublic =
      window.location.pathname.startsWith("/dashboard") ||
      window.location.pathname.startsWith("/platform") ||
      window.location.pathname === "/testcomponent";
    setIsDashboard(isNonPublic);
  }, []);

  useEffect(() => {
    if (isDashboard) return; // Don't show on dashboard/platform pages

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const distanceFromBottom = pageHeight - (currentScrollY + viewportHeight);

      // Show button when:
      // 1. User is within 300px from bottom (trying to scroll down or already at bottom area)
      // 2. User is scrolling UP (currentScrollY < lastScrollY)
      // 3. Scrolled more than 300px from top (not on hero)
      const shouldShow =
        distanceFromBottom < 300 &&
        currentScrollY < lastScrollY &&
        currentScrollY > 300;

      setIsVisible(shouldShow);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isDashboard]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible || isDashboard) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-40 group rounded-full bg-primary p-3 text-primary-foreground shadow-primary hover:shadow-lg transition-all duration-300 hover:scale-110 animate-fade-in"
    >
      <ChevronUp className="w-6 h-6 transition-transform group-hover:-translate-y-1" />
    </button>
  );
};
