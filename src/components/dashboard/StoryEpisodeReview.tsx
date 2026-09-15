import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useApproveStoryEpisode,
  usePublishStoryEpisode,
  useRegenerateEpisode,
  useRetryEpisodePromotion,
} from "@/hooks/useStoryAgent";
import {
  EPISODE_STATUS_LABELS,
  EPISODE_STATUS_VARIANT,
  PROVIDER_LABELS,
  type StoryEpisode,
} from "@/types/story";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  storyId: string;
  episode: StoryEpisode;
}

export function StoryEpisodeReview({ storyId, episode }: Props) {
  const approve = useApproveStoryEpisode();
  const publish = usePublishStoryEpisode();
  const regenerate = useRegenerateEpisode();
  const retryPromotion = useRetryEpisodePromotion();

  const canApprove =
    episode.status === "READY_FOR_REVIEW" && !approve.isPending;
  const canPublish = episode.status === "APPROVED" && !publish.isPending;
  const canRegenerate =
    episode.status === "READY_FOR_REVIEW" && !regenerate.isPending;
  const canRetryPromotion =
    episode.status === "PUBLISHED" &&
    episode.promotionStatus === "failed" &&
    !retryPromotion.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate">
            Episode {episode.episodeNumber} — {episode.title}
          </CardTitle>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{episode.wordCount.toLocaleString()} words</span>
            {episode.llmProvider && (
              <>
                <span>·</span>
                <span>
                  written by{" "}
                  {PROVIDER_LABELS[episode.llmProvider] ?? episode.llmProvider}
                  {episode.llmAttempts > 1
                    ? ` after ${episode.llmAttempts} attempts`
                    : ""}
                </span>
              </>
            )}
          </p>
        </div>
        <Badge variant={EPISODE_STATUS_VARIANT[episode.status]}>
          {EPISODE_STATUS_LABELS[episode.status]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm font-medium italic text-muted-foreground">
          {episode.hook}
        </p>

        <div className="max-h-64 overflow-y-auto rounded-md border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-line">
          {episode.body}
        </div>

        {episode.cliffhanger && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Leads into: </span>
            {episode.cliffhanger}
          </p>
        )}

        {episode.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {episode.themes.map((theme) => (
              <Badge key={theme} variant="outline" className="font-normal">
                {theme}
              </Badge>
            ))}
          </div>
        )}

        {episode.contentWarnings.length > 0 && (
          <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {episode.contentWarnings.join(", ")}
          </p>
        )}

        <Separator />

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Promo caption
          </p>
          <p className="text-sm">{episode.promotionCaption}</p>
          {episode.promotionHashtags.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {episode.promotionHashtags.join(" ")}
            </p>
          )}
        </div>

        {episode.status === "PUBLISHED" && episode.promotionStatus && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {episode.promotionStatus === "failed" ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  The promo post could not be queued: {episode.promotionError}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Promo post{" "}
                  {episode.promotionStatus === "queued"
                    ? "queued"
                    : "awaiting review"}{" "}
                  in{" "}
                  <Link
                    to="/studio"
                    className="font-medium text-primary hover:underline"
                  >
                    Post Studio
                  </Link>
                  .
                </>
              )}
            </p>
            {episode.promotionStatus === "failed" && (
              <Button
                variant="outline"
                size="sm"
                disabled={!canRetryPromotion}
                onClick={() =>
                  retryPromotion.mutate({ storyId, episodeId: episode.id })
                }
              >
                <RefreshCw
                  className={`mr-2 h-3.5 w-3.5 ${retryPromotion.isPending ? "animate-spin" : ""}`}
                />
                Retry promotion
              </Button>
            )}
          </div>
        )}

        {(canApprove || canPublish) && (
          <div className="flex justify-end gap-2 pt-2">
            {episode.status === "READY_FOR_REVIEW" && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!canRegenerate}
                onClick={() =>
                  regenerate.mutate({ storyId, episodeId: episode.id })
                }
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${regenerate.isPending ? "animate-spin" : ""}`}
                />
                Try again
              </Button>
            )}
            {episode.status === "READY_FOR_REVIEW" && (
              <Button
                size="sm"
                disabled={!canApprove}
                onClick={() =>
                  approve.mutate({ storyId, episodeId: episode.id })
                }
              >
                {approve.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Approve
              </Button>
            )}
            {episode.status === "APPROVED" && (
              <Button
                size="sm"
                disabled={!canPublish}
                onClick={() =>
                  publish.mutate({ storyId, episodeId: episode.id })
                }
              >
                {publish.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
