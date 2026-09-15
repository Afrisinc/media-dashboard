import getApiClient from "@/services/apiClient";
import type {
  Story,
  StoryBrief,
  StoryEpisode,
  StoryEpisodePage,
  StoryPage,
  StoryStatus,
} from "@/types/story";

const BASE = "/media/stories";

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

export interface ListStoriesParams {
  status?: StoryStatus;
  page?: number;
  limit?: number;
}

export async function createStory(brief: StoryBrief): Promise<Story> {
  const { data } = await getApiClient().post<Envelope<Story>>(BASE, brief);
  return unwrap(data);
}

export async function listStories(
  params: ListStoriesParams = {},
): Promise<StoryPage> {
  const { data } = await getApiClient().get<Envelope<StoryPage>>(BASE, {
    params,
  });
  return unwrap(data);
}

export async function getStory(id: string): Promise<Story> {
  const { data } = await getApiClient().get<Envelope<Story>>(`${BASE}/${id}`);
  return unwrap(data);
}

export interface GenerateEpisodeOptions {
  instructions?: string;
  /** Reusing the same key on a retried call returns the first episode instead of a second one. */
  idempotencyKey?: string;
}

export async function generateEpisode(
  storyId: string,
  options: GenerateEpisodeOptions = {},
): Promise<StoryEpisode> {
  const { data } = await getApiClient().post<Envelope<StoryEpisode>>(
    `${BASE}/${storyId}/episodes`,
    options,
  );
  return unwrap(data);
}

export async function listStoryEpisodes(
  storyId: string,
  params: { page?: number; limit?: number } = {},
): Promise<StoryEpisodePage> {
  const { data } = await getApiClient().get<Envelope<StoryEpisodePage>>(
    `${BASE}/${storyId}/episodes`,
    { params },
  );
  return unwrap(data);
}

export async function regenerateEpisode(
  storyId: string,
  episodeId: string,
  instructions?: string,
): Promise<StoryEpisode> {
  const { data } = await getApiClient().post<Envelope<StoryEpisode>>(
    `${BASE}/${storyId}/episodes/${episodeId}/regenerate`,
    instructions ? { instructions } : {},
  );
  return unwrap(data);
}

export async function retryEpisodePromotion(
  storyId: string,
  episodeId: string,
): Promise<StoryEpisode> {
  const { data } = await getApiClient().post<Envelope<StoryEpisode>>(
    `${BASE}/${storyId}/episodes/${episodeId}/retry-promotion`,
    {},
  );
  return unwrap(data);
}

export async function approveStoryEpisode(
  storyId: string,
  episodeId: string,
): Promise<StoryEpisode> {
  const { data } = await getApiClient().post<Envelope<StoryEpisode>>(
    `${BASE}/${storyId}/episodes/${episodeId}/approve`,
    {},
  );
  return unwrap(data);
}

export async function publishStoryEpisode(
  storyId: string,
  episodeId: string,
): Promise<StoryEpisode> {
  const { data } = await getApiClient().post<Envelope<StoryEpisode>>(
    `${BASE}/${storyId}/episodes/${episodeId}/publish`,
    {},
  );
  return unwrap(data);
}

/** The API returns its own message; surface that rather than a generic failure. */
export function describeStoryError(error: unknown): string {
  const body = (
    error as { response?: { data?: { resp_msg?: string; error?: string } } }
  )?.response?.data;
  return body?.resp_msg || body?.error || "Something went wrong. Try again.";
}
