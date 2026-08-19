import getApiClient from "@/services/apiClient";
import type {
  PostBrief,
  PostDraft,
  PostDraftPage,
  PostDraftStatus,
  SchedulePayload,
} from "@/types/postAgent";

const BASE = "/media/ai/posts";

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

export interface ListParams {
  status?: PostDraftStatus;
  format?: string;
  page?: number;
  limit?: number;
}

export async function createPostDraft(brief: PostBrief): Promise<PostDraft> {
  const { data } = await getApiClient().post<Envelope<PostDraft>>(BASE, brief);
  return unwrap(data);
}

export async function listPostDrafts(
  params: ListParams = {},
): Promise<PostDraftPage> {
  const { data } = await getApiClient().get<Envelope<PostDraftPage>>(BASE, {
    params,
  });
  return unwrap(data);
}

export async function getPostDraft(id: string): Promise<PostDraft> {
  const { data } = await getApiClient().get<Envelope<PostDraft>>(
    `${BASE}/${id}`,
  );
  return unwrap(data);
}

export async function rerenderPostDraft(id: string): Promise<PostDraft> {
  const { data } = await getApiClient().post<Envelope<PostDraft>>(
    `${BASE}/${id}/render`,
    {},
  );
  return unwrap(data);
}

export async function approvePostDraft(id: string): Promise<PostDraft> {
  const { data } = await getApiClient().post<Envelope<PostDraft>>(
    `${BASE}/${id}/approve`,
    {},
  );
  return unwrap(data);
}

export async function rejectPostDraft(
  id: string,
  reason: string,
): Promise<PostDraft> {
  const { data } = await getApiClient().post<Envelope<PostDraft>>(
    `${BASE}/${id}/reject`,
    {
      reason,
    },
  );
  return unwrap(data);
}

export async function schedulePostDraft(
  id: string,
  payload: SchedulePayload = {},
): Promise<PostDraft> {
  const { data } = await getApiClient().post<Envelope<PostDraft>>(
    `${BASE}/${id}/schedule`,
    payload,
  );
  return unwrap(data);
}

/** The API returns its own message; surface that rather than a generic failure. */
export function describeError(error: unknown): string {
  const body = (
    error as { response?: { data?: { resp_msg?: string; error?: string } } }
  )?.response?.data;
  return body?.resp_msg || body?.error || "Something went wrong. Try again.";
}
