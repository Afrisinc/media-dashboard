import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  RotateCcw,
  SkipForward,
  Sparkles,
  Star,
} from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { PostMediaPreview } from "@/components/dashboard/PostMediaPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkdownText } from "@/components/ui/markdown-text";
import { MetricList } from "@/components/ui/metric-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFeatureNewsArticle,
  useNewsArticle,
  useRequeueNewsArticle,
  useSkipNewsArticle,
} from "@/hooks/useNewsDesk";
import { formatDateShort } from "@/lib/dateFormat";
import {
  canRequeue,
  canSkip,
  isAiRejected,
  newsArticleCover,
  newsArticleTitle,
  newsReadMetrics,
} from "@/lib/newsDesk";
import { describeNewsError } from "@/services/newsDeskService";
import {
  NEWS_STATUS_LABELS,
  NEWS_STATUS_VARIANT,
  type NewsArticleDetail,
  type NewsGeneratedPost,
} from "@/types/newsDesk";

const socialUrl = (post: NewsGeneratedPost) =>
  post.fb_url ?? post.insta_url ?? post.twitter_url ?? post.linkedin_url;

function SocialPostRow({ post }: Readonly<{ post: NewsGeneratedPost }>) {
  const url = socialUrl(post);

  return (
    <li className="flex items-center gap-3 py-2.5">
      {post.platform ? (
        <PlatformIcon platform={post.platform} />
      ) : (
        <span className="h-4 w-4" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium capitalize">
          {post.platform ?? "Unknown platform"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {post.error_message ??
            formatDateShort(post.published_at ?? post.created_at)}
        </p>
      </div>
      <Badge
        variant={post.status === "failed" ? "destructive" : "outline"}
        className="capitalize"
      >
        {post.status}
      </Badge>
      {url && (
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the ${post.platform ?? "social"} post`}
            title="Open the post"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </li>
  );
}

function ArticleActions({ article }: Readonly<{ article: NewsArticleDetail }>) {
  const requeue = useRequeueNewsArticle();
  const skip = useSkipNewsArticle();
  const feature = useFeatureNewsArticle();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-4">
      <Button variant="ghost" size="sm" asChild className="mr-auto">
        <a href={article.source_url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1.5 h-4 w-4" />
          Original source
        </a>
      </Button>
      {canSkip(article) && (
        <Button
          variant="outline"
          size="sm"
          disabled={skip.isPending}
          onClick={() => skip.mutate(article.id)}
        >
          {skip.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <SkipForward className="mr-1.5 h-4 w-4" />
          )}
          Skip
        </Button>
      )}
      {canRequeue(article) && (
        <Button
          size="sm"
          disabled={requeue.isPending}
          onClick={() => requeue.mutate(article.id)}
        >
          {requeue.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-1.5 h-4 w-4" />
          )}
          Enhance again
        </Button>
      )}
      {article.status === "published" && (
        <Button
          variant={article.is_featured ? "outline" : "default"}
          size="sm"
          disabled={feature.isPending}
          onClick={() =>
            feature.mutate({ id: article.id, featured: !article.is_featured })
          }
        >
          {feature.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Star
              className={
                article.is_featured
                  ? "mr-1.5 h-4 w-4 fill-current"
                  : "mr-1.5 h-4 w-4"
              }
            />
          )}
          {article.is_featured ? "Unfeature" : "Feature on website"}
        </Button>
      )}
    </div>
  );
}

function ArticleBody({ article }: Readonly<{ article: NewsArticleDetail }>) {
  const enhanced = article.mediaPost;
  const cover = newsArticleCover(article);

  return (
    <div className="space-y-5">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border/60">
        <PostMediaPreview
          post={{
            mediaUrls: cover ? [cover] : [],
            mediaType: "image",
            altText: enhanced?.cover_alt ?? newsArticleTitle(article),
            message: newsArticleTitle(article),
          }}
          emptyLabel="No cover yet"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={NEWS_STATUS_VARIANT[article.status]}>
          {NEWS_STATUS_LABELS[article.status]}
        </Badge>
        {article.stuck && <Badge variant="destructive">Stuck</Badge>}
        {isAiRejected(article) && (
          <Badge variant="secondary">Rejected by AI</Badge>
        )}
        {article.is_featured && (
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        )}
        {article.category && (
          <Badge variant="outline" className="capitalize">
            {article.category}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {article.read_time} min read
        </span>
        {article.status === "published" && (
          <MetricList items={newsReadMetrics(article)} />
        )}
      </div>

      {isAiRejected(article) && (
        <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/50 p-3 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{article.processing_error}</p>
        </div>
      )}

      {!isAiRejected(article) &&
        (article.processing_error || article.stuck) && (
          <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {article.processing_error ??
                "The enhancement run stopped midway. Send it back to the queue to try again."}
            </p>
          </div>
        )}

      <Tabs defaultValue={enhanced ? "enhanced" : "original"}>
        <TabsList>
          <TabsTrigger value="enhanced" disabled={!enhanced}>
            AI article
          </TabsTrigger>
          <TabsTrigger value="original">Original</TabsTrigger>
          <TabsTrigger value="social">
            Social posts ({article.generatedPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="mt-4 space-y-4">
          {enhanced && (
            <>
              {enhanced.excerpt && (
                <p className="border-l-2 border-primary/60 pl-4 font-display text-lg italic leading-snug">
                  {enhanced.excerpt}
                </p>
              )}
              <MarkdownText source={enhanced.content} />
              {enhanced.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {enhanced.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag.replace(/^#/, "")}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {[
                  enhanced.word_count &&
                    `${enhanced.word_count.toLocaleString()} words`,
                  enhanced.ai_model && `written by ${enhanced.ai_model}`,
                  enhanced.published_at &&
                    `published ${formatDateShort(enhanced.published_at)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="original" className="mt-4 space-y-3">
          <p className="font-semibold">
            {article.source_headline ?? "(no headline)"}
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {article.source_summary ?? "The feed sent no summary."}
          </p>
          <p className="text-xs text-muted-foreground">
            {[
              article.creator,
              article.pub_date && formatDateShort(article.pub_date),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          {article.generatedPosts.length === 0 ? (
            <EmptyState
              icon={ExternalLink}
              variant="compact"
              title="No social posts were generated for this article yet."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {article.generatedPosts.map((post) => (
                <SocialPostRow key={post.id} post={post} />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <ArticleActions article={article} />
    </div>
  );
}

interface NewsArticleDialogProps {
  articleId: string | null;
  onClose: () => void;
}

export function NewsArticleDialog({
  articleId,
  onClose,
}: Readonly<NewsArticleDialogProps>) {
  const {
    data: article,
    isLoading,
    isError,
    error,
  } = useNewsArticle(articleId ?? undefined);

  return (
    <Dialog
      open={Boolean(articleId)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">
            {article ? newsArticleTitle(article) : "Article"}
          </DialogTitle>
          <DialogDescription>
            {article
              ? [article.creator, formatDateShort(article.created_at)]
                  .filter(Boolean)
                  .join(" · ")
              : "Loading the article"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {isError && (
          <EmptyState
            icon={AlertTriangle}
            title="Could not load this article"
            description={describeNewsError(error)}
          />
        )}

        {article && <ArticleBody article={article} />}
      </DialogContent>
    </Dialog>
  );
}
