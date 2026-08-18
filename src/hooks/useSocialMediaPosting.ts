import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getRuntimeConfig } from "@/lib/config";
import { getToken } from "@/lib/authUtils";
import type { SocialPlatformKey } from "@/config/socialPlatforms";

export interface SocialMediaContent {
  message?: string;
  link?: string;
  description?: string;
  picture?: string;
  name?: string;
  caption?: string;
  tags?: string[];
}

export interface SocialMediaPostPayload {
  platform: SocialPlatformKey;
  pageId: string;
  content: SocialMediaContent;
  media?: {
    type?: "image" | "video" | "carousel";
    url?: string;
    urls?: string[];
    alt_text?: string;
  };
  scheduling?: {
    scheduled_publish_time?: number;
    publish_immediately?: boolean;
  };
  metadata?: {
    aiGenerated?: boolean;
    generatedBy?: string;
    generationPrompt?: string;
    timestamp?: string;
  };
}

export interface BatchPostPayload {
  platform: SocialPlatformKey;
  pageId: string;
  content: SocialMediaContent[];
  media?: {
    type?: "image" | "video" | "carousel";
    urls?: string[];
    alt_text?: string;
  };
  metadata?: {
    aiGenerated?: boolean;
    generatedBy?: string;
    timestamp?: string;
  };
}

export interface PostResponse {
  success: boolean;
  message: string;
  data?: {
    platform: string;
    postId: string;
    status: "success" | "pending" | "failed";
    publishedAt?: string;
  };
  error?: string;
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

export const usePostToSocialMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SocialMediaPostPayload) => {
      return authorizedFetch("/social-media/post", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as Promise<PostResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
      toast({
        title: "Success!",
        description: data.message || "Post created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Post Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBatchPostToSocialMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payloads: Record<string, unknown>) => {
      return authorizedFetch("/social-media/batch", {
        method: "POST",
        body: JSON.stringify(payloads),
      }) as Promise<PostResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
      toast({
        title: "Batch Posted!",
        description: data.message || "All posts created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Batch Post Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useValidateSocialMediaPayload = () => {
  return useMutation({
    mutationFn: async (payload: SocialMediaPostPayload) => {
      return authorizedFetch("/social-media/validate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
};

export const useDeleteSocialMediaPost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return authorizedFetch(`/social-media/posts/${postId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
      toast({
        title: "Post Deleted",
        description: "Post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSocialMediaPost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      payload,
    }: {
      postId: string;
      payload: Partial<SocialMediaPostPayload>;
    }) => {
      return authorizedFetch(`/social-media/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
      toast({
        title: "Post Updated",
        description: "Post has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePublishScheduledPost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return authorizedFetch(`/social-media/posts/${postId}/publish`, {
        method: "GET",
      });
    },
    onSuccess: (data: PostResponse) => {
      queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
      if (data.data?.status === "success") {
        toast({
          title: "Success!",
          description: data.message || "Post published successfully.",
        });
      } else {
        toast({
          title: "Publish Failed",
          description: data.message || "Failed to publish post.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Publish Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Reset loading state after completion
      queryClient.invalidateQueries({ queryKey: ["social-media-posts"] });
    },
  });
};
