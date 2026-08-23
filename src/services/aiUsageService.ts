import getApiClient from "@/services/apiClient";

const BASE = "/media/ai-usage";

interface Envelope<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

export interface UsageBreakdown {
  key: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  costMicroUsd: string;
  costUsd: number;
}

export interface AiUsageSummary {
  range: { from: string; to: string };
  totals: {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    costMicroUsd: string;
    costUsd: number;
  };
  byModel: UsageBreakdown[];
  byNode: UsageBreakdown[];
  topUsers: UsageBreakdown[];
}

export async function getAiUsageSummary(params: {
  from?: string;
  to?: string;
}): Promise<AiUsageSummary> {
  const { data } = await getApiClient().get<Envelope<AiUsageSummary>>(
    `${BASE}/summary`,
    { params },
  );
  return data?.data;
}
