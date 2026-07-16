import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function useScrollDepth() {
  useEffect(() => {
    const milestones = new Set<number>();
    const handler = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.body.scrollHeight;
      const pct = Math.floor((scrolled / total) * 100);
      [25, 50, 75, 100].forEach((m) => {
        if (pct >= m && !milestones.has(m)) {
          milestones.add(m);
          trackEvent("scroll_depth", {
            depth_percent: m,
            page_path: window.location.pathname,
          });
        }
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
}
