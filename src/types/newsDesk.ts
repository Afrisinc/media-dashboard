export type NewsArticleStatus =
  | "draft"
  | "processing"
  | "published"
  | "skipped"
  | "failed";

export type MediaPostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export interface NewsMediaPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  status: MediaPostStatus;
  published_at: string | null;
}

export interface NewsMediaPostDetail extends NewsMediaPostSummary {
  content: string;
  cover_alt: string | null;
  tags: string[];
  read_time: number;
  word_count: number | null;
  ai_provider: string | null;
  ai_model: string | null;
  source_name: string | null;
  views: number;
  shares: number;
  read_completions: number;
}

interface NewsArticleBase {
  id: string;
  guid: string;
  source_url: string;
  source_headline: string | null;
  source_summary: string | null;
  image_url: string | null;
  pub_date: string | null;
  category: string | null;
  creator: string | null;
  status: NewsArticleStatus;
  processing_error: string | null;
  is_featured: boolean;
  slug: string | null;
  ai_generated: boolean;
  tags: string[];
  read_time: number;
  viewCount: number;
  readCount: number;
  created_at: string;
  updated_at: string;
  stuck: boolean;
}

export interface NewsArticle extends NewsArticleBase {
  mediaPost: NewsMediaPostSummary | null;
  generatedPostCount: number;
}

export interface NewsGeneratedPost {
  id: string;
  platform: string | null;
  status: string;
  error_message: string | null;
  fb_url: string | null;
  insta_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  whatsapp_sent_at: string | null;
  published_at: string | null;
  created_at: string;
}

export interface NewsArticleDetail extends NewsArticleBase {
  mediaPost: NewsMediaPostDetail | null;
  generatedPosts: NewsGeneratedPost[];
}

export interface NewsArticlePage {
  items: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}

export type NewsAgentStage = "ingest" | "enhance";

export interface NewsIngestionResult {
  startedAt: string;
  finishedAt: string;
  sources: number;
  fetched: number;
  created: number;
  duplicates: number;
  failedSources: { name: string; error: string }[];
}

export interface NewsEnhancementResult {
  startedAt: string;
  finishedAt: string;
  claimed: number;
  published: number;
  rejected: number;
  failed: number;
  recovered: number;
}

export interface NewsAgentStageStatus<T> {
  schedule: string;
  running: boolean;
  lastResult: T | null;
  lastError: string | null;
  lastFinishedAt: string | null;
}

export interface NewsAgentStatus {
  /** Runs on its schedule right now: server allows it, switch on, autopilot on. */
  enabled: boolean;
  allowedByServer: boolean;
  sources: number;
  minScore: number;
  batchSize: number;
  ingest: NewsAgentStageStatus<NewsIngestionResult>;
  enhance: NewsAgentStageStatus<NewsEnhancementResult>;
}

export interface NewsDeskSummary {
  total: number;
  byStatus: Record<NewsArticleStatus, number>;
  stuck: number;
  views: number;
  reads: number;
  categories: string[];
  stuckAfterMinutes: number;
  lastIngestedAt: string | null;
  agent: NewsAgentStatus;
}

export const NEWS_STATUS_LABELS: Record<NewsArticleStatus, string> = {
  draft: "Queued",
  processing: "Enhancing",
  published: "Published",
  skipped: "Skipped",
  failed: "Failed",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const NEWS_STATUS_VARIANT: Record<NewsArticleStatus, BadgeVariant> = {
  draft: "secondary",
  processing: "default",
  published: "outline",
  skipped: "secondary",
  failed: "destructive",
};
