import { authorizedFetch } from "@/lib/apiFetch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SocialPlatformKey } from "@/config/socialPlatforms";

export interface SocialMediaAccountDTO {
  id: string;
  name: string;
  meta: string | null;
  scopes: string[];
  createdAt: string;
}

/**
 * What creating an account returns. It carries the OAuth state the caller has to
 * hand to the provider, which a plain account row does not.
 */
export interface CreatedSocialMediaAccountDTO extends SocialMediaAccountDTO {
  oauthState?: string;
  /** Older responses named it `state`; both are read at the call site. */
  state?: string;
}

export interface SocialMediaIntegrationDTO {
  platform: SocialPlatformKey;
  appId: string | null;
  callbackUrl?: string | null;
  connected: boolean;
  syncedAt: string | null;
  accounts: SocialMediaAccountDTO[];
}

export interface InstagramBusinessAccount {
  id: string;
  username?: string;
  profilePictureUrl?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  category?: string;
  picture?: {
    data?: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
  /** Instagram only. Null means the Page has no linked professional account. */
  instagramBusinessAccount?: InstagramBusinessAccount | null;
}

export interface OAuthCallbackResponse {
  accountId: string;
  platform: SocialPlatformKey;
  connected: boolean;
  expiresAt: string;
  pages: FacebookPage[];
}

const QUERY_KEY = ["social-media-integrations"];

export const useSocialMediaIntegrations = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const data = await authorizedFetch<{
        data?: { platforms?: SocialMediaIntegrationDTO[] };
      }>("/social-media/integrations");
      return data.data?.platforms ?? [];
    },
    staleTime: 1000 * 30,
  });
};

/** One installed page or account, flattened out of the per-platform integrations. */
export interface InstalledAccount extends SocialMediaAccountDTO {
  platform: SocialPlatformKey;
}

/**
 * Every connected page across every platform as one list — what the group
 * screens assign from, rather than walking the platform tree at each call site.
 */
export const useInstalledAccounts = () => {
  const query = useSocialMediaIntegrations();

  const accounts: InstalledAccount[] = (query.data ?? []).flatMap(
    (integration) =>
      integration.accounts.map((account) => ({
        ...account,
        platform: integration.platform,
      })),
  );

  return { ...query, accounts };
};

export const useSaveIntegrationCredentials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      platform: SocialPlatformKey;
      appId: string;
      appSecret: string;
      // Optional per the content-service schema (required: appId, appSecret).
      // Omitting it leaves any stored callback URL untouched.
      callbackUrl?: string;
    }) => {
      return authorizedFetch(
        `/social-media/integrations/${params.platform}/credentials`,
        {
          method: "POST",
          body: JSON.stringify({
            appId: params.appId,
            appSecret: params.appSecret,
            callbackUrl: params.callbackUrl || undefined,
          }),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't save credentials",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateIntegrationCredentials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      platform: SocialPlatformKey;
      appId: string;
      appSecret?: string;
      callbackUrl?: string;
    }) => {
      return authorizedFetch(
        `/social-media/integrations/${params.platform}/credentials`,
        {
          method: "PATCH",
          body: JSON.stringify({
            appId: params.appId,
            appSecret: params.appSecret || undefined,
            callbackUrl: params.callbackUrl || undefined,
          }),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't update credentials",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddSocialMediaAccount = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      platform: SocialPlatformKey;
      name: string;
      meta?: string;
      scopes: string[];
    }) => {
      const response = await authorizedFetch<{
        data: CreatedSocialMediaAccountDTO;
      }>(`/social-media/integrations/${params.platform}/accounts`, {
        method: "POST",
        body: JSON.stringify({
          name: params.name,
          meta: params.meta,
          scopes: params.scopes,
        }),
      });
      return response.data;
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't create account",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddAccountFromFacebookPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      platform: SocialPlatformKey;
      pageId: string;
      pageName: string;
      scopes: string[];
      accessToken: string;
    }) => {
      return authorizedFetch(
        `/social-media/integrations/${params.platform}/accounts/${params.pageId}/from-facebook`,
        {
          method: "POST",
          body: JSON.stringify({
            pageName: params.pageName,
            scopes: params.scopes,
            accessToken: params.accessToken,
          }),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't connect page",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAvailablePages = (platform?: SocialPlatformKey) => {
  return useQuery({
    // Spread, not nested — invalidateQueries(QUERY_KEY) only prefix-matches a
    // flat key, and this query must refetch when an account is added or removed.
    queryKey: [...QUERY_KEY, "available-pages", platform],
    queryFn: async () => {
      if (!platform) return { available: [], connected: [] };
      const data = await authorizedFetch<{
        data: { available: FacebookPage[]; connected: FacebookPage[] };
      }>(`/social-media/integrations/${platform}/pages`);
      return data.data;
    },
    enabled: !!platform,
    staleTime: 1000 * 60,
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      return authorizedFetch(`/social-media/accounts/${accountId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({
        title: "Account deleted",
        description: "The account has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't delete account",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
