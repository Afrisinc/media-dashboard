import { getAiUsageSummary } from "@/services/aiUsageService";
import { useQuery } from "@tanstack/react-query";

export const aiUsageKeys = {
  all: ["ai-usage"] as const,
  summary: (params: { from?: string; to?: string }) =>
    ["ai-usage", "summary", params] as const,
};

export function useAiUsageSummary(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: aiUsageKeys.summary(params),
    queryFn: () => getAiUsageSummary(params),
    staleTime: 5 * 60 * 1000,
  });
}
