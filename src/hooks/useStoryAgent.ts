import { useToast } from "@/components/ui/use-toast";
import {
  approveStoryEpisode,
  createStory,
  describeStoryError,
  generateEpisode,
  getStory,
  listStories,
  listStoryEpisodes,
  publishStoryEpisode,
  regenerateEpisode,
  retryEpisodePromotion,
  type ListStoriesParams,
} from "@/services/storyService";
import type { Story, StoryBrief, StoryEpisode } from "@/types/story";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const storyKeys = {
  all: ["stories"] as const,
  list: (params: ListStoriesParams) => ["stories", "list", params] as const,
  detail: (id: string) => ["stories", "detail", id] as const,
  episodes: (storyId: string) =>
    ["stories", "detail", storyId, "episodes"] as const,
};

export function useStories(params: ListStoriesParams = {}) {
  return useQuery({
    queryKey: storyKeys.list(params),
    queryFn: () => listStories(params),
    refetchInterval: 60_000,
  });
}

export function useStory(id: string | undefined) {
  return useQuery({
    queryKey: storyKeys.detail(id ?? ""),
    queryFn: () => getStory(id as string),
    enabled: Boolean(id),
  });
}

export function useStoryEpisodes(storyId: string | undefined) {
  return useQuery({
    queryKey: storyKeys.episodes(storyId ?? ""),
    queryFn: () => listStoryEpisodes(storyId as string),
    enabled: Boolean(storyId),
  });
}

function useStoryMutation<TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
  successMessage: (result: TResult) => string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: run,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
      toast({ title: successMessage(result) });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeStoryError(error) });
    },
  });
}

export function useCreateStory() {
  return useStoryMutation(
    (brief: StoryBrief) => createStory(brief),
    (story: Story) =>
      `"${story.title}" is live — write its first episode when ready`,
  );
}

export function useGenerateEpisode() {
  return useStoryMutation(
    ({ storyId, instructions }: { storyId: string; instructions?: string }) =>
      generateEpisode(storyId, {
        instructions,
        idempotencyKey: crypto.randomUUID(),
      }),
    (episode: StoryEpisode) =>
      `Episode ${episode.episodeNumber} drafted — ready for review`,
  );
}

export function useRegenerateEpisode() {
  return useStoryMutation(
    ({
      storyId,
      episodeId,
      instructions,
    }: {
      storyId: string;
      episodeId: string;
      instructions?: string;
    }) => regenerateEpisode(storyId, episodeId, instructions),
    (episode: StoryEpisode) =>
      `Episode ${episode.episodeNumber} rewritten — ready for review`,
  );
}

export function useApproveStoryEpisode() {
  return useStoryMutation(
    ({ storyId, episodeId }: { storyId: string; episodeId: string }) =>
      approveStoryEpisode(storyId, episodeId),
    () => "Episode approved",
  );
}

export function useRetryEpisodePromotion() {
  return useStoryMutation(
    ({ storyId, episodeId }: { storyId: string; episodeId: string }) =>
      retryEpisodePromotion(storyId, episodeId),
    () => "Retrying — the promo post will land in Post Studio shortly",
  );
}

export function usePublishStoryEpisode() {
  return useStoryMutation(
    ({ storyId, episodeId }: { storyId: string; episodeId: string }) =>
      publishStoryEpisode(storyId, episodeId),
    (episode: StoryEpisode) =>
      episode.promotionStatus === "failed"
        ? "Published — the promo post could not be queued, see below"
        : "Published",
  );
}
