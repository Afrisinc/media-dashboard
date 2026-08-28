import { authorizedFetch } from "@/lib/apiFetch";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// A type alias (not an interface) gets an implicit index signature, which is
// what makes it assignable to DataTable's `T extends Record<string, unknown>`.
export type SocialMediaPost = {
  id: string;
  userId: string;
  platform: string;
  pageId: string;
  postId?: string | null;
  postUrl?: string | null;
  message?: string | null;
  link?: string | null;
  description?: string | null;
  caption?: string | null;
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
  postFormat?: string | null;
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
};

export interface SocialMediaPostsResponse {
  posts: SocialMediaPost[];
  total: number;
  limit: number;
  offset: number;
}

export const useSocialMediaPosts = (filters?: {
  platform?: string;
  status?: string;
  search?: string;
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
      if (filters?.search) params.append("search", filters.search);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await authorizedFetch<{ data: SocialMediaPostsResponse }>(
        `/social-media/posts${query}`,
      );

      return data.data;
    },
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: keepPreviousData,
  });
};

export const useInvalidateSocialMediaPosts = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
  };
};
