import { useEffect, useState } from "react";

/**
 * Milliseconds since `startedAt`, ticking while `active`. Returns null when
 * there is nothing to count from, so callers can fall back to a stored duration.
 */
export function useElapsed(
  startedAt: string | null,
  active: boolean,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active || !startedAt) return;

    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active, startedAt]);

  if (!startedAt) return null;
  return Math.max(now - new Date(startedAt).getTime(), 0);
}
