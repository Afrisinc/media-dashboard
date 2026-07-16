import { useCallback, useMemo } from "react";
import { trackEvent } from "@/lib/analytics";

export function useTrackClick(
  action: string,
  params: Record<string, unknown> = {},
) {
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  return useCallback(() => {
    trackEvent(action, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, paramsKey]);
}
