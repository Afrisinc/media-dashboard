import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Newspaper,
  Search,
  SearchX,
  ServerCrash,
  Star,
  X,
} from "lucide-react";
import { LayoutToggle } from "@/components/dashboard/LayoutToggle";
import { NewsAgentPanel } from "@/components/dashboard/NewsAgentPanel";
import { NewsArticleDialog } from "@/components/dashboard/NewsArticleDialog";
import { PostMediaPreview } from "@/components/dashboard/PostMediaPreview";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import {
  MEDIA_CARD_GRID,
  MediaCard,
  MediaCardGridSkeleton,
  MediaCardOverlayChip,
} from "@/components/ui/media-card";
import { MetricList } from "@/components/ui/metric-list";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayoutParam } from "@/hooks/useLayoutParam";
import { useNewsArticles, useNewsDeskSummary } from "@/hooks/useNewsDesk";
import { formatDateShort } from "@/lib/dateFormat";
import {
  isAiRejected,
  newsArticleCover,
  newsArticleTitle,
  newsReadMetrics,
} from "@/lib/newsDesk";
import { compactNumber } from "@/lib/numberFormat";
import { cn } from "@/lib/utils";
import { describeNewsError } from "@/services/newsDeskService";
import {
  NEWS_STATUS_LABELS,
  NEWS_STATUS_VARIANT,
  type NewsArticle,
  type NewsArticleStatus,
} from "@/types/newsDesk";

const PAGE_SIZE = 12;
const ALL_CATEGORIES = "all";

type StatusFilter = NewsArticleStatus | "all";

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "published",
  "draft",
  "processing",
  "failed",
  "skipped",
];

const articleCover = (article: NewsArticle) => {
  const cover = newsArticleCover(article);
  return {
    mediaUrls: cover ? [cover] : [],
    mediaType: "image",
    altText: newsArticleTitle(article),
    message: newsArticleTitle(article),
  };
};

const articleWhen = (article: NewsArticle) => {
  if (article.status === "published" && article.mediaPost?.published_at) {
    return `Published ${formatDateShort(article.mediaPost.published_at)}`;
  }
  if (article.pub_date) {
    return `Source published ${formatDateShort(article.pub_date)}`;
  }
  return `Fetched ${formatDateShort(article.created_at)}`;
};

function StatusBadge({
  article,
  overlay = false,
}: Readonly<{ article: NewsArticle; overlay?: boolean }>) {
  if (article.stuck) {
    return (
      <Badge variant="destructive" className={cn(overlay && "shadow-sm")}>
        Stuck
      </Badge>
    );
  }

  if (isAiRejected(article)) {
    return (
      <Badge variant="secondary" className={cn(overlay && "shadow-sm")}>
        Rejected
      </Badge>
    );
  }

  const variant = NEWS_STATUS_VARIANT[article.status];
  return (
    <Badge
      variant={variant}
      className={cn(
        overlay && "shadow-sm",
        overlay && variant === "outline" && "bg-background/85 backdrop-blur",
      )}
    >
      {NEWS_STATUS_LABELS[article.status]}
    </Badge>
  );
}

interface ArticleViewProps {
  article: NewsArticle;
  onOpen: () => void;
}

function ArticleCard({ article, onOpen }: Readonly<ArticleViewProps>) {
  return (
    <MediaCard
      media={
        <PostMediaPreview
          post={articleCover(article)}
          emptyLabel="No cover yet"
        />
      }
      mediaLabel={`Open ${newsArticleTitle(article)}`}
      onMediaClick={onOpen}
      topLeft={<StatusBadge article={article} overlay />}
      topRight={
        article.is_featured && (
          <MediaCardOverlayChip className="h-7 w-7 text-gold">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="sr-only">Featured</span>
          </MediaCardOverlayChip>
        )
      }
      title={newsArticleTitle(article)}
      onTitleClick={onOpen}
      meta={
        <>
          {article.category && (
            <Badge variant="outline" className="font-medium capitalize">
              {article.category}
            </Badge>
          )}
          {article.creator && (
            <span className="text-xs text-muted-foreground">
              via {article.creator}
            </span>
          )}
        </>
      }
      caption={
        <>
          {!article.mediaPost && article.source_summary && (
            <span className="mb-1 line-clamp-2 text-foreground/80">
              {article.source_summary}
            </span>
          )}
          <span className="block">
            {article.status === "draft"
              ? `Waiting for the AI editor · ${articleWhen(article)}`
              : `${articleWhen(article)} · ${article.read_time} min read`}
          </span>
          {article.processing_error && (
            <span
              className={cn(
                "mt-1 line-clamp-2",
                isAiRejected(article)
                  ? "text-muted-foreground"
                  : "text-destructive",
              )}
            >
              {article.processing_error}
            </span>
          )}
          {article.status === "published" && (
            <MetricList items={newsReadMetrics(article)} className="mt-2" />
          )}
        </>
      }
    />
  );
}

function ArticleRow({ article, onOpen }: Readonly<ArticleViewProps>) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 border-b border-border/50 py-3 text-left transition-colors last:border-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60">
        <PostMediaPreview post={articleCover(article)} variant="thumb" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {newsArticleTitle(article)}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {[article.creator, article.category, articleWhen(article)]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      {article.status === "published" && (
        <MetricList
          items={newsReadMetrics(article)}
          className="hidden shrink-0 sm:flex"
        />
      )}
      <StatusBadge article={article} />
    </button>
  );
}

const NewsDesk = () => {
  const summary = useNewsDeskSummary();
  const [layout, setLayout] = useLayoutParam();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const articles = useNewsArticles({
    status: status === "all" ? undefined : status,
    category: category === ALL_CATEGORIES ? undefined : category,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const counts = summary.data?.byStatus;
  const items = articles.data?.items ?? [];
  const total = articles.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = status !== "all" || category !== ALL_CATEGORIES || !!search;

  const applyStatus = (next: StatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  const showQueued = () => {
    setCategory(ALL_CATEGORIES);
    setSearchInput("");
    applyStatus("draft");
    requestAnimationFrame(() =>
      document
        .getElementById("news-articles")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const clearFilters = () => {
    setStatus("all");
    setCategory(ALL_CATEGORIES);
    setSearchInput("");
    setPage(1);
  };

  const inPipeline = (counts?.draft ?? 0) + (counts?.processing ?? 0);
  const needsFix = (counts?.failed ?? 0) + (summary.data?.stuck ?? 0);
  const views = summary.data?.views ?? 0;
  const reads = summary.data?.reads ?? 0;

  const stats: StripStat[] = [
    {
      label: "Published",
      value: String(counts?.published ?? 0),
      icon: Newspaper,
      tone: (counts?.published ?? 0) > 0 ? "success" : "default",
      hint: `${compactNumber(views)} views · ${compactNumber(reads)} reads`,
      onSelect: () => applyStatus("published"),
    },
    {
      label: "In the pipeline",
      value: String(inPipeline),
      icon: Clock,
      hint: `${counts?.processing ?? 0} being enhanced now`,
      onSelect: () => applyStatus("draft"),
    },
    {
      label: "Needs a fix",
      value: String(needsFix),
      icon: AlertCircle,
      tone: needsFix > 0 ? "danger" : "default",
      hint:
        (summary.data?.stuck ?? 0) > 0
          ? `${summary.data?.stuck} stuck mid-run`
          : "Failed enhancements",
      onSelect: () => applyStatus("failed"),
    },
    {
      label: "Read to the end",
      value: views > 0 ? `${Math.round((reads / views) * 100)}%` : "—",
      icon: BookCheck,
      hint: "Of readers who opened an article",
    },
  ];

  const statusOptions = STATUS_FILTERS.map((value) => ({
    value,
    label:
      value === "all"
        ? `All (${summary.data?.total ?? 0})`
        : `${NEWS_STATUS_LABELS[value]} (${counts?.[value] ?? 0})`,
  }));

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="News Desk"
        subtitle="The news agent reads African business and tech feeds, lets GPT-4o judge and rewrite what matters, draws a cover and publishes it to the website."
      />

      <StatStrip variant="tiles" stats={stats} loading={summary.isLoading} />

      <NewsAgentPanel
        summary={summary.data}
        loading={summary.isLoading}
        onShowQueued={showQueued}
      />

      <Card id="news-articles" className="scroll-mt-4">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {articles.isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {`${total.toLocaleString()} ${total === 1 ? "article" : "articles"}${filtered ? " match" : ""}`}
              </p>
            )}
            <LayoutToggle value={layout} onChange={setLayout} />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search headlines, summaries or sources…"
                className="pl-9"
                aria-label="Search articles"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  aria-label="Clear search"
                  onClick={() => setSearchInput("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-48" aria-label="Category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                {(summary.data?.categories ?? []).map((name) => (
                  <SelectItem key={name} value={name} className="capitalize">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SegmentedControl
            options={statusOptions}
            value={status}
            onChange={applyStatus}
          />

          {articles.isLoading &&
            (layout === "grid" ? (
              <MediaCardGridSkeleton count={8} label="Loading articles" />
            ) : (
              <ListSkeleton rows={6} thumb label="Loading articles" />
            ))}

          {articles.isError && (
            <EmptyState
              icon={ServerCrash}
              title="Could not load the news desk"
              description={describeNewsError(articles.error)}
              action={
                <Button variant="outline" onClick={() => articles.refetch()}>
                  Try again
                </Button>
              }
            />
          )}

          {!articles.isLoading && !articles.isError && items.length === 0 && (
            <EmptyState
              icon={filtered ? SearchX : Newspaper}
              title={filtered ? "No articles match" : "No articles yet"}
              description={
                filtered
                  ? "Try another search, category or status."
                  : "The news agent adds articles here each time it fetches the feeds. Run it now from the panel above."
              }
              action={
                filtered && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          )}

          {items.length > 0 &&
            (layout === "grid" ? (
              <ul
                className={cn(
                  MEDIA_CARD_GRID,
                  articles.isFetching && "opacity-70 transition-opacity",
                )}
              >
                {items.map((article) => (
                  <li key={article.id} className="min-w-0">
                    <ArticleCard
                      article={article}
                      onOpen={() => setOpenId(article.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className={cn(
                  articles.isFetching && "opacity-70 transition-opacity",
                )}
              >
                {items.map((article) => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    onOpen={() => setOpenId(article.id)}
                  />
                ))}
              </div>
            ))}

          {items.length > 0 && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NewsArticleDialog articleId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

export default NewsDesk;
