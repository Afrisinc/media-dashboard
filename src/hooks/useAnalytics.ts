import {
  getAnalyticsOverview,
  getConnectedAccounts,
  getPostingPlan,
  getAnalyticsSummary,
  getTopPosts,
  suggestPostIdeas,
  type PlanParams,
  type TopBy,
} from "@/services/analyticsService";
import { useMutation, useQuery } from "@tanstack/react-query";

export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: (params: { from?: string; to?: string }) =>
    ["analytics", "summary", params] as const,
  top: (params: { days?: number; limit?: number; by?: TopBy }) =>
    ["analytics", "top", params] as const,
  overview: (params: { from?: string; to?: string }) =>
    ["analytics", "overview", params] as const,
  accounts: (params: { from?: string; to?: string }) =>
    ["analytics", "accounts", params] as const,
  plan: (params: PlanParams) => ["analytics", "plan", params] as const,
};

const FRESH_FOR_MS = 5 * 60 * 1000;

export function useAnalyticsSummary(
  params: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: analyticsKeys.summary(params),
    queryFn: () => getAnalyticsSummary(params),
    // Rolled up daily, so a tighter refresh would only re-fetch the same numbers.
    staleTime: FRESH_FOR_MS,
  });
}

export function useTopPosts(
  params: { days?: number; limit?: number; by?: TopBy } = {},
) {
  return useQuery({
    queryKey: analyticsKeys.top(params),
    queryFn: () => getTopPosts(params),
    staleTime: FRESH_FOR_MS,
  });
}

export function useAnalyticsOverview(
  params: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => getAnalyticsOverview(params),
    staleTime: FRESH_FOR_MS,
  });
}

export function useConnectedAccounts(
  params: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: analyticsKeys.accounts(params),
    queryFn: () => getConnectedAccounts(params),
    staleTime: FRESH_FOR_MS,
  });
}

export function useSuggestPostIdeas() {
  return useMutation({
    mutationFn: (params: PlanParams & { refresh?: boolean }) =>
      suggestPostIdeas(params),
  });
}

export function usePostingPlan(params: PlanParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.plan(params),
    queryFn: () => getPostingPlan(params),
    staleTime: FRESH_FOR_MS,
  });
}
