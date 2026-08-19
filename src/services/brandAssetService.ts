import getApiClient from "@/services/apiClient";

const BASE = "/media/brand-assets";

export interface BrandAsset {
  id: string;
  url: string;
  reference: string;
  kind: string;
  subjects?: string[];
  hasPerson?: boolean;
  subjectSide?: string;
  brightness?: string;
  approved: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Envelope<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

function unwrap<T>(body: Envelope<T>): T {
  return body?.data as T;
}

export async function listBrandAssets(): Promise<BrandAsset[]> {
  const { data } = await getApiClient().get<Envelope<BrandAsset[]>>(BASE);
  return unwrap(data);
}

export async function createBrandAsset(payload: {
  url: string;
  reference: string;
  kind?: string;
  subjects?: string[];
  hasPerson?: boolean;
  subjectSide?: string;
  brightness?: string;
}): Promise<BrandAsset> {
  const { data } = await getApiClient().post<Envelope<BrandAsset>>(
    BASE,
    payload,
  );
  return unwrap(data);
}

export async function approveBrandAsset(
  id: string,
  approved: boolean,
): Promise<BrandAsset> {
  const { data } = await getApiClient().post<Envelope<BrandAsset>>(
    `${BASE}/${id}/approve`,
    { approved },
  );
  return unwrap(data);
}

export async function deleteBrandAsset(id: string): Promise<void> {
  await getApiClient().delete(`${BASE}/${id}`);
}

export function describeError(error: unknown): string {
  const body = (
    error as { response?: { data?: { resp_msg?: string; error?: string } } }
  )?.response?.data;
  return (
    body?.resp_msg || body?.error || "Failed to manage brand asset. Try again."
  );
}
