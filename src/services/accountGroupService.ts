import type { BrandAsset } from "@/services/brandAssetService";
import getApiClient from "@/services/apiClient";
import type {
  AccountGroup,
  CreateAccountGroupPayload,
  GroupTarget,
  UpdateAccountGroupPayload,
} from "@/types/accountGroup";

const BASE = "/media/account-groups";

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

export async function listAccountGroups(): Promise<AccountGroup[]> {
  const { data } =
    await getApiClient().get<Envelope<{ groups: AccountGroup[] }>>(BASE);
  return unwrap(data)?.groups ?? [];
}

export async function getAccountGroup(id: string): Promise<AccountGroup> {
  const { data } = await getApiClient().get<Envelope<AccountGroup>>(
    `${BASE}/${id}`,
  );
  return unwrap(data);
}

export async function createAccountGroup(
  payload: CreateAccountGroupPayload,
): Promise<AccountGroup> {
  const { data } = await getApiClient().post<Envelope<AccountGroup>>(
    BASE,
    payload,
  );
  return unwrap(data);
}

export async function updateAccountGroup(
  id: string,
  payload: UpdateAccountGroupPayload,
): Promise<AccountGroup> {
  const { data } = await getApiClient().patch<Envelope<AccountGroup>>(
    `${BASE}/${id}`,
    payload,
  );
  return unwrap(data);
}

export async function deleteAccountGroup(id: string): Promise<void> {
  await getApiClient().delete<Envelope<Record<string, never>>>(`${BASE}/${id}`);
}

export async function addAccountsToGroup(
  id: string,
  accountIds: string[],
): Promise<AccountGroup> {
  const { data } = await getApiClient().post<Envelope<AccountGroup>>(
    `${BASE}/${id}/accounts`,
    {
      accountIds,
    },
  );
  return unwrap(data);
}

export async function removeAccountFromGroup(
  id: string,
  accountId: string,
): Promise<AccountGroup> {
  const { data } = await getApiClient().delete<Envelope<AccountGroup>>(
    `${BASE}/${id}/accounts/${accountId}`,
  );
  return unwrap(data);
}

export async function setGroupAccountActive(
  id: string,
  accountId: string,
  isActive: boolean,
): Promise<AccountGroup> {
  const { data } = await getApiClient().patch<Envelope<AccountGroup>>(
    `${BASE}/${id}/accounts/${accountId}`,
    { isActive },
  );
  return unwrap(data);
}

export async function getGroupTargets(id: string): Promise<GroupTarget[]> {
  const { data } = await getApiClient().get<
    Envelope<{ targets: GroupTarget[] }>
  >(`${BASE}/${id}/targets`);
  return unwrap(data)?.targets ?? [];
}

export async function listGroupAssets(id: string) {
  const { data } = await getApiClient().get<Envelope<{ assets: BrandAsset[] }>>(
    `${BASE}/${id}/assets`,
  );
  return unwrap(data)?.assets ?? [];
}

export async function assignGroupAssets(id: string, assetIds: string[]) {
  const { data } = await getApiClient().post<
    Envelope<{ assets: BrandAsset[] }>
  >(`${BASE}/${id}/assets`, { assetIds });
  return unwrap(data)?.assets ?? [];
}

export async function unassignGroupAsset(id: string, assetId: string) {
  const { data } = await getApiClient().delete<
    Envelope<{ assets: BrandAsset[] }>
  >(`${BASE}/${id}/assets/${assetId}`);
  return unwrap(data)?.assets ?? [];
}

/** The API returns its own message; surface that rather than a generic failure. */
export function describeError(error: unknown): string {
  const body = (
    error as { response?: { data?: { resp_msg?: string; error?: string } } }
  )?.response?.data;
  return body?.resp_msg || body?.error || "Something went wrong. Try again.";
}
