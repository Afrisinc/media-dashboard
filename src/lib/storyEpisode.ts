import type { StoryEpisode } from "@/types/story";

export const episodeNeedsYou = (episode: StoryEpisode) =>
  episode.status === "READY_FOR_REVIEW" ||
  episode.status === "APPROVED" ||
  (episode.status === "PUBLISHED" && episode.promotionStatus === "failed");
