export type StoryStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type StoryEpisodeStatus =
  | "DRAFT"
  | "GENERATING"
  | "READY_FOR_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "FAILED";

export interface Story {
  id: string;
  userId: string;
  title: string;
  premise: string;
  genre: string | null;
  language: string;
  audience: string | null;
  tone: string | null;
  coverImageUrl: string | null;
  /** The brand a published episode is advertised through — null means the post agent's default. */
  groupId: string | null;
  autoPromote: boolean;
  autoApprovePromotion: boolean;
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
  episodes?: StoryEpisode[];
}

export interface StoryEpisode {
  id: string;
  storyId: string;
  episodeNumber: number;
  title: string;
  hook: string;
  body: string;
  cliffhanger: string | null;
  themes: string[];
  contentWarnings: string[];
  wordCount: number;
  promotionCaption: string | null;
  promotionHashtags: string[];
  promotionDraftId: string | null;
  promotionStatus: string | null;
  promotionError: string | null;
  llmProvider: string | null;
  llmAttempts: number;
  status: StoryEpisodeStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPage {
  items: Story[];
  total: number;
  page: number;
  limit: number;
}

export interface StoryEpisodePage {
  items: StoryEpisode[];
  total: number;
  page: number;
  limit: number;
}

export interface StoryBrief {
  title: string;
  premise: string;
  genre?: string;
  language?: string;
  audience?: string;
  tone?: string;
  coverImageUrl?: string;
  groupId?: string;
  autoPromote?: boolean;
  autoApprovePromotion?: boolean;
}

export const STORY_STATUS_LABELS: Record<StoryStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const STORY_STATUS_VARIANT: Record<StoryStatus, BadgeVariant> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  COMPLETED: "outline",
  ARCHIVED: "secondary",
};

export const EPISODE_STATUS_LABELS: Record<StoryEpisodeStatus, string> = {
  DRAFT: "Draft",
  GENERATING: "Writing…",
  READY_FOR_REVIEW: "In review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  FAILED: "Failed",
};

export const EPISODE_STATUS_VARIANT: Record<StoryEpisodeStatus, BadgeVariant> =
  {
    DRAFT: "secondary",
    GENERATING: "secondary",
    READY_FOR_REVIEW: "default",
    APPROVED: "default",
    PUBLISHED: "outline",
    FAILED: "destructive",
  };

export const PROVIDER_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  ollama: "Ollama",
};
