import { newsArticleTitle } from "@/lib/newsDesk";
import {
  NEWS_STATUS_LABELS,
  NEWS_STATUS_VARIANT,
  type NewsArticle,
} from "@/types/newsDesk";
import {
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
} from "@/types/postAgent";
import {
  STORY_STATUS_LABELS,
  STORY_STATUS_VARIANT,
  type StoryListItem,
} from "@/types/story";

export type MediaKind = "post" | "article" | "story" | "video" | "podcast";

export type LiveMediaKind = Extract<MediaKind, "post" | "article" | "story">;

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface MediaLibraryItem {
  id: string;
  kind: LiveMediaKind;
  title: string;
  image: string | null;
  statusLabel: string;
  statusVariant: BadgeVariant;
  meta: string;
  date: string;
  href: string;
}

export function postToMedia(draft: PostDraft): MediaLibraryItem {
  const frames = draft.slideUrls.length;
  return {
    id: `post-${draft.id}`,
    kind: "post",
    title: draft.topic,
    image: draft.slideUrls[0] ?? null,
    statusLabel: STATUS_LABELS[draft.status],
    statusVariant: STATUS_VARIANT[draft.status],
    meta: `${FORMAT_LABELS[draft.format]} · ${frames} ${frames === 1 ? "frame" : "frames"}`,
    date: draft.updatedAt,
    href: "/studio",
  };
}

export function articleToMedia(article: NewsArticle): MediaLibraryItem {
  const views = article.viewCount;
  return {
    id: `article-${article.id}`,
    kind: "article",
    title: newsArticleTitle(article),
    image: article.mediaPost?.cover_image ?? article.image_url,
    statusLabel: article.stuck ? "Stuck" : NEWS_STATUS_LABELS[article.status],
    statusVariant: article.stuck
      ? "destructive"
      : NEWS_STATUS_VARIANT[article.status],
    meta:
      article.status === "published"
        ? `${views.toLocaleString()} ${views === 1 ? "view" : "views"} · ${article.read_time} min read`
        : (article.creator ?? article.category ?? "News Desk"),
    date: article.mediaPost?.published_at ?? article.updated_at,
    href: "/news",
  };
}

export function storyToMedia(story: StoryListItem): MediaLibraryItem {
  return {
    id: `story-${story.id}`,
    kind: "story",
    title: story.title,
    image: story.coverImageUrl,
    statusLabel: STORY_STATUS_LABELS[story.status],
    statusVariant: STORY_STATUS_VARIANT[story.status],
    meta: `${story.publishedEpisodeCount}/${story.episodeCount} episodes live · ${story.totalReads.toLocaleString()} reads`,
    date: story.updatedAt,
    href: `/stories/${story.id}`,
  };
}

const FINISHED_POST_STATUSES = new Set<PostDraft["status"]>([
  "awaiting_approval",
  "approved",
  "scheduled",
]);

export function isFinishedPost(draft: PostDraft): boolean {
  return FINISHED_POST_STATUSES.has(draft.status);
}

export function isFinishedArticle(article: NewsArticle): boolean {
  return article.status === "published";
}

export function isStartedStory(story: StoryListItem): boolean {
  return story.episodeCount > 0;
}

export function newestFirst(items: MediaLibraryItem[]): MediaLibraryItem[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
