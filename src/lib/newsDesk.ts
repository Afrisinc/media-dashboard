import { BookCheck, Eye } from "lucide-react";
import type { MetricItem } from "@/components/ui/metric-list";
import type { NewsArticle, NewsArticleDetail } from "@/types/newsDesk";

type AnyNewsArticle = NewsArticle | NewsArticleDetail;

export const newsArticleTitle = (article: AnyNewsArticle) =>
  article.mediaPost?.title ?? article.source_headline ?? "(untitled)";

export const newsArticleCover = (article: AnyNewsArticle) =>
  article.mediaPost?.cover_image ?? article.image_url ?? null;

const AI_REJECTION_PREFIX = "Rejected by the AI editor";

export const isAiRejected = (article: AnyNewsArticle) =>
  article.status === "skipped" &&
  Boolean(article.processing_error?.startsWith(AI_REJECTION_PREFIX));

export { describeCron } from "@/lib/cron";

export const canRequeue = (article: AnyNewsArticle) =>
  article.status === "failed" || article.status === "skipped" || article.stuck;

export const canSkip = (article: AnyNewsArticle) =>
  article.status === "draft" || article.status === "failed";

export const newsReadMetrics = (article: AnyNewsArticle): MetricItem[] => [
  { label: "Views", value: article.viewCount, icon: Eye },
  { label: "Reads", value: article.readCount, icon: BookCheck },
];
