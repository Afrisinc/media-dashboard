import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRuntimeConfig } from "@/lib/config";
import { getToken } from "@/lib/authUtils";

export interface SocialMediaPost {
  id: string;
  userId: string;
  platform: string;
  pageId: string;
  postId?: string | null;
  postUrl?: string | null;
  message?: string | null;
  link?: string | null;
  tags: string[];
  status: string;
  aiGenerated: boolean;
  aiProvider?: string | null;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  mediaUrls?: string[] | null;
  mediaType?: string | null;
  altText?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export interface SocialMediaPostsResponse {
  posts: SocialMediaPost[];
  total: number;
  limit: number;
  offset: number;
}

async function authorizedFetch(path: string, init?: RequestInit) {
  const config = getRuntimeConfig();
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${config.serverUrl}/media${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.resp_msg ||
        body?.error ||
        body?.message ||
        `Request failed: ${response.status}`,
    );
  }

  return response.json();
}

export const useSocialMediaPosts = (filters?: {
  platform?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryKey = ["social-media-posts", filters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.platform) params.append("platform", filters.platform);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await authorizedFetch(`/social-media/posts${query}`);

      return data.data as SocialMediaPostsResponse;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useInvalidateSocialMediaPosts = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
  };
};
