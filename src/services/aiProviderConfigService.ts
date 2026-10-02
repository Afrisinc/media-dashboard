import getApiClient from "@/services/apiClient";
import type {
  AiProviderConfig,
  SaveAiProviderConfigPayload,
} from "@/types/aiProviderConfig";

const BASE = "/media/ai/provider-configs";

interface Envelope<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

function unwrap<T>(body: Envelope<T>): T {
  return body?.data as T;
}

export async function listAiProviderConfigs(): Promise<AiProviderConfig[]> {
  const { data } =
    await getApiClient().get<Envelope<{ configs: AiProviderConfig[] }>>(BASE);
  return unwrap(data)?.configs ?? [];
}

export async function saveAiProviderConfig({
  provider,
  purpose,
  ...body
}: SaveAiProviderConfigPayload): Promise<AiProviderConfig> {
  const { data } = await getApiClient().put<Envelope<AiProviderConfig>>(
    `${BASE}/${provider}/${purpose}`,
    body,
  );
  return unwrap(data);
}
