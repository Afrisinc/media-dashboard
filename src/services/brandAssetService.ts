import getApiClient from "@/services/apiClient";

const BASE = "/media/brand-assets";

/** One photograph inside a set, tagged and framed on its own. */
export interface BrandAssetImage {
  id: string;
  assetId: string;
  url: string;
  reference: string;
  subjects?: string[];
  hasPerson?: boolean;
  subjectSide?: string;
  brightness?: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** A named set of photographs. Brands are assigned whole sets. */
export interface BrandAsset {
  id: string;
  name: string;
  description?: string | null;
  kind: string;
  approved: boolean;
  images: BrandAssetImage[];
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

export interface BulkAddResult {
  added: number;
  asset: BrandAsset;
}

/**
 * Add several photographs at once. A reference is derived from each url server
 * side, and one already in the library is skipped rather than failing the batch.
 */
export async function createBrandAssets(
  assets: Array<{ url: string; subjects?: string[] }>,
  name?: string,
): Promise<BulkAddResult> {
  const { data } = await getApiClient().post<Envelope<BulkAddResult>>(
    `${BASE}/bulk`,
    { assets, name },
  );
  return unwrap(data);
}

export interface UploadResult {
  added: number;
  rejected: string[];
  asset: BrandAsset;
}

/** A browser File as the API takes it: base64, with its name and type. */
async function toUploadPayload(file: File) {
  const content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

  return { filename: file.name, contentType: file.type, content };
}

/**
 * Upload photographs from the machine. They are pushed to the assets service
 * and stored by public url, which is what the render service can reach.
 */
export async function uploadBrandAssets(
  files: File[],
  name?: string,
  subjects?: string[],
): Promise<UploadResult> {
  const payload = await Promise.all(files.map(toUploadPayload));
  const { data } = await getApiClient().post<Envelope<UploadResult>>(
    `${BASE}/upload`,
    { files: payload, name, subjects },
  );
  return unwrap(data);
}

export async function updateBrandAsset(
  id: string,
  payload: { name?: string; description?: string },
): Promise<BrandAsset> {
  const { data } = await getApiClient().patch<Envelope<BrandAsset>>(
    `${BASE}/${id}`,
    payload,
  );
  return unwrap(data);
}

/** Adds photographs to a set that already exists. */
export async function addImagesToAsset(
  id: string,
  images: Array<{ url: string; subjects?: string[] }>,
): Promise<BrandAsset> {
  const { data } = await getApiClient().post<Envelope<BrandAsset>>(
    `${BASE}/${id}/images`,
    { images },
  );
  return unwrap(data);
}

export async function removeImageFromAsset(
  id: string,
  imageId: string,
): Promise<void> {
  await getApiClient().delete(`${BASE}/${id}/images/${imageId}`);
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
