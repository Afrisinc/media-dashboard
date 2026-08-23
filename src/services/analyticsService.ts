import getApiClient from "@/services/apiClient";

const BASE = "/media/analytics";

interface Envelope<T> {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: T;
}

function unwrap<T>(body: Envelope<T>): T {
  return body?.data as T;
}

export type ViewSource =
  | "direct"
  | "search"
  | "social"
  | "newsletter"
  | "referral";

export type SharePlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "other";

export type TopBy = "views" | "shares" | "completion";

export interface TopPost {
  mediaPostId: string;
  views: number;
  uniqueViews: number;
  readCompletions: number;
  shares: number;
  completionRate: number;
  post: {
    id: string;
    title: string;
    slug: string;
    category: string;
    published_at: string | null;
  } | null;
}

export interface AnalyticsSummary {
  from: string;
  to: string;
  views: number;
  uniqueViews: number;
  readCompletions: number;
  readCompletionRate: number;
  articlesPublished: number;
  sources: Record<ViewSource, number>;
  shares: Record<SharePlatform, number>;
  categories: Array<{ category: string; posts: number }>;
  topPosts: TopPost[];
}

export interface TrackEvent {
  mediaPostId?: string;
  slug?: string;
  event: "view" | "read_complete" | "share";
  source?: ViewSource;
  platform?: SharePlatform;
  visitorId?: string;
}

export async function getAnalyticsSummary(params: {
  from?: string;
  to?: string;
}): Promise<AnalyticsSummary> {
  const { data } = await getApiClient().get<Envelope<AnalyticsSummary>>(
    `${BASE}/summary`,
    { params },
  );
  return unwrap(data);
}

export async function getTopPosts(params: {
  days?: number;
  limit?: number;
  by?: TopBy;
}): Promise<TopPost[]> {
  const { data } = await getApiClient().get<Envelope<{ posts: TopPost[] }>>(
    `${BASE}/top`,
    { params },
  );
  return unwrap(data)?.posts ?? [];
}

/**
 * Fire-and-forget: a reader should never wait on measurement, and a failed
 * beacon must never surface as an error in the page they came to read.
 */
export async function trackEvent(event: TrackEvent): Promise<void> {
  await getApiClient()
    .post(`${BASE}/track`, event)
    .catch(() => undefined);
}

export interface SeriesPoint {
  date: string;
  websiteViews: number;
  socialEngagements: number;
}

export interface PlatformTotals {
  platform: string;
  posts: number;
  reach: number;
  impressions: number;
  views: number;
  engagements: number;
  /** Null until a follower snapshot has been taken for that account. */
  followers: number | null;
}

export interface RankedPost {
  id: string;
  platform: string;
  title: string;
  mediaType: string | null;
  postUrl: string | null;
  publishedAt: string | null;
  engagements: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Recommendation {
  kind: "timing" | "format" | "platform" | "volume";
  title: string;
  detail: string;
}

export interface AnalyticsOverview {
  from: string;
  to: string;
  timeZone: string;
  series: SeriesPoint[];
  platforms: PlatformTotals[];
  topMedia: RankedPost[];
  recommendations: Recommendation[];
  postsAnalysed: number;
}

export async function getAnalyticsOverview(params: {
  from?: string;
  to?: string;
}): Promise<AnalyticsOverview> {
  const { data } = await getApiClient().get<Envelope<AnalyticsOverview>>(
    `${BASE}/overview`,
    { params },
  );
  return unwrap(data);
}

export interface ConnectedAccount {
  id: string;
  platform: string;
  pageId: string;
  pageName: string | null;
  pageAvatar: string | null;
  connectedAt: string;
  /** False for a platform the pull job has no adapter for yet. */
  metricsSupported: boolean;
  followers: number | null;
  followerChange: number | null;
  lastSnapshotAt: string | null;
  posts: number;
  reach: number;
  impressions: number;
  views: number;
  engagements: number;
}

export interface ConnectedAccounts {
  from: string;
  to: string;
  lastSyncedAt: string | null;
  accounts: ConnectedAccount[];
}

export async function getConnectedAccounts(params: {
  from?: string;
  to?: string;
}): Promise<ConnectedAccounts> {
  const { data } = await getApiClient().get<Envelope<ConnectedAccounts>>(
    `${BASE}/accounts`,
    { params },
  );
  return unwrap(data);
}

export type PlanConfidence = "none" | "low" | "good";

export interface TopicPerformance {
  topic: string;
  posts: number;
  averageEngagement: number;
}

export interface PlannedSlot {
  when: string;
  platform: string;
  format: string;
  topic: string | null;
  reason: string;
}

export interface PostingPlan {
  from: string;
  to: string;
  timeZone: string;
  confidence: PlanConfidence;
  brand: { id: string; name: string } | null;
  topics: TopicPerformance[];
  recommendations: Recommendation[];
  slots: PlannedSlot[];
  postsAnalysed: number;
}

export async function getPostingPlan(params: {
  from?: string;
  to?: string;
}): Promise<PostingPlan> {
  const { data } = await getApiClient().get<Envelope<PostingPlan>>(
    `${BASE}/plan`,
    { params },
  );
  return unwrap(data);
}
