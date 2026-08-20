import getApiClient from "@/services/apiClient";
import type {
  AgentRun,
  AgentRunPage,
  AgentRunStatus,
  AutomationPolicy,
  RunRequestOutcome,
  UpdateAutomationPolicyPayload,
} from "@/types/accountGroup";

const BASE = "/media/automation";

interface Envelope<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

/** content-service wraps every response; the payload always sits under `data`. */
function unwrap<T>(body: Envelope<T>): T {
  return body?.data as T;
}

export interface RunListParams {
  groupId?: string;
  status?: AgentRunStatus;
  page?: number;
  limit?: number;
}

export async function getAutomationPolicy(): Promise<AutomationPolicy> {
  const { data } = await getApiClient().get<Envelope<AutomationPolicy>>(
    `${BASE}/policy`,
  );
  return unwrap(data);
}

export async function updateAutomationPolicy(
  payload: UpdateAutomationPolicyPayload,
): Promise<AutomationPolicy> {
  const { data } = await getApiClient().patch<Envelope<AutomationPolicy>>(
    `${BASE}/policy`,
    payload,
  );
  return unwrap(data);
}

export async function listAgentRuns(
  params: RunListParams = {},
): Promise<AgentRunPage> {
  const { data } = await getApiClient().get<Envelope<AgentRunPage>>(
    `${BASE}/runs`,
    { params },
  );
  return unwrap(data);
}

export async function getAgentRun(id: string): Promise<AgentRun> {
  const { data } = await getApiClient().get<Envelope<AgentRun>>(
    `${BASE}/runs/${id}`,
  );
  return unwrap(data);
}

export async function getAutomationSummary(): Promise<Record<string, number>> {
  const { data } = await getApiClient().get<Envelope<Record<string, number>>>(
    `${BASE}/summary`,
  );
  return unwrap(data) ?? {};
}

/**
 * Starts the agents and returns as soon as the server accepts the work. The pass
 * itself keeps going server-side, so leaving the page does not stop it — follow
 * it through the run log instead.
 */
export async function runAutomationNow(): Promise<RunRequestOutcome> {
  const { data } = await getApiClient().post<Envelope<RunRequestOutcome>>(
    `${BASE}/run`,
    {},
  );
  return unwrap(data);
}

/**
 * Pick a failed run back up from the stage that broke. Stages that already
 * succeeded are reused, so the copy agent is not paid for twice.
 */
export async function resumeAgentRun(id: string): Promise<RunRequestOutcome> {
  const { data } = await getApiClient().post<Envelope<RunRequestOutcome>>(
    `${BASE}/runs/${id}/resume`,
    {},
  );
  return unwrap(data);
}

export interface CancelOutcome {
  cancelled: boolean;
  reason: string;
}

/** Stop a run that is still going and free the workspace's run slot. */
export async function cancelAgentRun(id: string): Promise<CancelOutcome> {
  const { data } = await getApiClient().post<Envelope<CancelOutcome>>(
    `${BASE}/runs/${id}/cancel`,
    {},
  );
  return unwrap(data);
}

/** The run in flight for this workspace, if any — what a reopened page resumes onto. */
export async function getActiveAgentRun(): Promise<AgentRun | null> {
  const { data } = await getApiClient().get<Envelope<{ run: AgentRun | null }>>(
    `${BASE}/active`,
  );
  return unwrap(data)?.run ?? null;
}
