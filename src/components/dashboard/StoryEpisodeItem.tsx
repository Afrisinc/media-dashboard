import { ArrowRight, AlertTriangle, BookCheck, Eye } from "lucide-react";
import {
  EpisodeActions,
  EpisodePromotion,
} from "@/components/dashboard/StoryEpisodeReview";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MetricList } from "@/components/ui/metric-list";
import { formatDateShort } from "@/lib/dateFormat";
import { episodeNeedsYou } from "@/lib/storyEpisode";
import { cn } from "@/lib/utils";
import {
  EPISODE_STATUS_LABELS,
  EPISODE_STATUS_VARIANT,
  PROVIDER_LABELS,
  type StoryEpisode,
  type StoryEpisodeStatus,
} from "@/types/story";

const NUMBER_TONE: Record<StoryEpisodeStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  GENERATING: "animate-pulse bg-amber/15 text-amber",
  READY_FOR_REVIEW: "bg-primary/15 text-primary",
  APPROVED: "bg-emerald/15 text-emerald",
  PUBLISHED: "bg-muted text-foreground",
  FAILED: "bg-destructive/15 text-destructive",
};

const WORDS_PER_MINUTE = 200;

const episodeMeta = (episode: StoryEpisode) =>
  [
    `${episode.wordCount.toLocaleString()} words`,
    `${Math.max(1, Math.round(episode.wordCount / WORDS_PER_MINUTE))} min read`,
    episode.llmProvider &&
      `by ${PROVIDER_LABELS[episode.llmProvider] ?? episode.llmProvider}`,
    episode.publishedAt
      ? `published ${formatDateShort(episode.publishedAt)}`
      : `written ${formatDateShort(episode.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");

interface StoryEpisodeItemProps {
  storyId: string;
  episode: StoryEpisode;
}

export function StoryEpisodeItem({ storyId, episode }: StoryEpisodeItemProps) {
  const published = episode.status === "PUBLISHED";

  return (
    <AccordionItem value={episode.id} className="border-border/60">
      <AccordionTrigger className="group gap-3 px-4 py-4 text-left text-base font-normal leading-normal tracking-normal hover:bg-muted/40 hover:no-underline sm:px-5">
        <span className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
              NUMBER_TONE[episode.status],
            )}
            aria-hidden
          >
            {String(episode.episodeNumber).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1 space-y-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-foreground">
                <span className="sr-only">
                  Episode {episode.episodeNumber}:{" "}
                </span>
                {episode.title}
              </span>
              {episodeNeedsYou(episode) && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Needs you
                </span>
              )}
            </span>
            <span className="line-clamp-1 block text-sm font-normal italic text-muted-foreground group-data-[state=open]:hidden">
              {episode.hook}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">
              {episodeMeta(episode)}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
          {published && (
            <MetricList
              className="hidden sm:flex"
              items={[
                { label: "Views", value: episode.viewCount, icon: Eye },
                {
                  label: "Reads",
                  value: episode.completedReads,
                  icon: BookCheck,
                },
              ]}
            />
          )}
          <Badge variant={EPISODE_STATUS_VARIANT[episode.status]}>
            {EPISODE_STATUS_LABELS[episode.status]}
          </Badge>
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-6 sm:px-5 sm:pl-[4.75rem]">
        <div className="max-w-3xl space-y-5">
          <p className="border-l-2 border-primary/60 pl-4 font-display text-lg italic leading-snug text-foreground">
            {episode.hook}
          </p>

          <div className="whitespace-pre-line text-[15px] leading-7 text-foreground/90">
            {episode.body}
          </div>

          {episode.cliffhanger && (
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Leads into
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {episode.cliffhanger}
                </p>
              </div>
            </div>
          )}

          {(episode.themes.length > 0 ||
            episode.contentWarnings.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {episode.themes.map((theme) => (
                <Badge key={theme} variant="outline" className="font-normal">
                  {theme}
                </Badge>
              ))}
              {episode.contentWarnings.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {episode.contentWarnings.join(", ")}
                </span>
              )}
            </div>
          )}

          {published && (
            <MetricList
              className="sm:hidden"
              items={[
                { label: "Views", value: episode.viewCount, icon: Eye },
                {
                  label: "Reads",
                  value: episode.completedReads,
                  icon: BookCheck,
                },
              ]}
            />
          )}

          {(episode.promotionCaption ||
            episode.promotionStatus ||
            episodeNeedsYou(episode)) && (
            <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
              <EpisodePromotion storyId={storyId} episode={episode} />
              <EpisodeActions
                storyId={storyId}
                episode={episode}
                className="justify-end border-t border-border/50 pt-4 first:border-0 first:pt-0"
              />
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
