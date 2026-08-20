import getApiClient from "@/services/apiClient";
import type { SocialPlatformKey } from "@/config/socialPlatforms";

const BASE = "/media/social-media/integrations";

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

export interface InstalledPage {
  id: string;
  pageId: string;
  name: string;
  scopes: string[];
}

export interface InstallPageParams {
  platform: SocialPlatformKey;
  /** Always the Facebook Page id — the API resolves the Instagram node itself. */
  pageId: string;
  pageName: string;
  scopes: string[];
  accessToken: string;
}

/**
 * Install a page the user owns on the platform as a connected account. Instagram
 * goes through its linked Facebook Page, so the Page id is what gets sent.
 */
export async function installPageFromFacebook(
  params: InstallPageParams,
): Promise<InstalledPage> {
  const { data } = await getApiClient().post<Envelope<InstalledPage>>(
    `${BASE}/${params.platform}/accounts/${params.pageId}/from-facebook`,
    {
      pageName: params.pageName,
      scopes: params.scopes,
      accessToken: params.accessToken,
    },
  );
  return unwrap(data);
}
