import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getRuntimeConfig } from "@/lib/config";

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

export const useAIPosts = (limit: number = 10) => {
  return useQuery({
    queryKey: ["ai-posts", limit],
    queryFn: async () => {
      const config = getRuntimeConfig();
      const token = localStorage.getItem("token");

      if (!token) throw new Error("Not authenticated");

      const url = `${config.serverUrl}/generated-posts?limit=${limit}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch generated posts: ${response.status}`);
      }

      const data = await response.json();

      // Map the API response to AIPost format, ensuring topic_name is set
      return (data.data?.data || []).map((post: AIPost) => ({
        ...post,
        topic_name: post.topic_name || post.topic || "Untitled",
      })) as AIPost[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    }) => {
      // Get token from localStorage (set during login)
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const { getRuntimeConfig } = await import("@/lib/config");
      const config = getRuntimeConfig();

      // Create an AbortController with 1 minute (60000ms) timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const response = await fetch(
          `${config.serverUrl}/content/ai/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(params),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            error.resp_msg || error.error || "Failed to generate post",
          );
        }

        return response.json();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(
            "Request timeout - AI generation took too long (max 1 minute)",
          );
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
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
