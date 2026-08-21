import { authorizedFetch, describeApiError } from "@/lib/apiFetch";
import getApiClient from "@/services/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface AIPost {
  id: string;
  post_id: string;
  topic: string;
  topic_name?: string;
  platform: string;
  fb_post_id?: string;
  fb_url?: string;
  fb_content?: string;
  fb_hashtags?: string;
  insta_post_id?: string;
  insta_url?: string;
  insta_content?: string;
  insta_hashtags?: string;
  status: string;
  created_at: string;
  published_at: string | null;
}

const GENERATE_TIMEOUT_MS = 60_000;

export const useAIPosts = (limit: number = 10) => {
  return useQuery({
    queryKey: ["ai-posts", limit],
    queryFn: async () => {
      const data = await authorizedFetch<{ data?: { data?: AIPost[] } }>(
        `/generated-posts?limit=${limit}`,
      );

      return (data.data?.data || []).map((post: AIPost) => ({
        ...post,
        topic_name: post.topic_name || post.topic || "Untitled",
      })) as AIPost[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGenerateAIPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      topic: string;
      keywords?: string;
      link?: string;
      platform: "facebook" | "instagram" | "both";
      formMode?: "test" | "production";
      selectedAssets?: string[];
    }) => {
      try {
        const { data } = await getApiClient().post(
          "/media/content/ai/generate",
          params,
          // Generation is slow; the client's default would give up too early.
          { timeout: GENERATE_TIMEOUT_MS },
        );
        return data;
      } catch (error) {
        if ((error as { code?: string })?.code === "ECONNABORTED") {
          throw new Error(
            "Request timeout - AI generation took too long (max 1 minute)",
          );
        }
        throw new Error(describeApiError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-posts"] });
      toast({
        title: "Post Generated!",
        description: "Your AI content has been created and posted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Generate",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
