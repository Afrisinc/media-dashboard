import { PostMediaPreview } from "@/components/dashboard/PostMediaPreview";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { StoryEpisodeItem } from "@/components/dashboard/StoryEpisodeItem";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBox } from "@/components/ui/icon-box";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateEpisode, useStory } from "@/hooks/useStoryAgent";
import { compactNumber } from "@/lib/numberFormat";
import { coverTint } from "@/lib/storyCover";
import { episodeNeedsYou } from "@/lib/storyEpisode";
import {
  STORY_STATUS_LABELS,
  STORY_STATUS_VARIANT,
  type Story,
  type StoryEpisode,
} from "@/types/story";
import {
  ArrowLeft,
  BookCheck,
  BookOpen,
  Eye,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const EPISODE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Needs you", value: "needs-you" },
  { label: "Published", value: "published" },
] as const;

type EpisodeFilter = (typeof EPISODE_FILTERS)[number]["value"];

const FILTER_EMPTY_COPY: Record<
  EpisodeFilter,
  { title: string; description: string }
> = {
  all: {
    title: "No episodes yet",
    description: "Write episode one to get the series started.",
  },
  "needs-you": {
    title: "Nothing needs you",
    description: "Every episode is reviewed and its promotion is on track.",
  },
  published: {
    title: "No published episodes yet",
    description:
      "Approve and publish an episode to put it in front of readers.",
  },
};

const defaultOpenEpisodes = (
  needsYou: StoryEpisode[],
  latest: StoryEpisode | undefined,
) => {
  if (needsYou.length > 0) return needsYou.map((episode) => episode.id);
  if (latest) return [latest.id];
  return [];
};

const nextEpisodeHint = (latest: StoryEpisode | undefined) => {
  if (latest?.cliffhanger) return `Picks up from: ${latest.cliffhanger}`;
  if (latest) return "The writer continues from where the last episode ended.";
  return "The writer starts from the premise above.";
};

interface NextEpisodeCardProps {
  storyId: string;
  episodeNumber: number;
  latest: StoryEpisode | undefined;
}

function NextEpisodeCard({
  storyId,
  episodeNumber,
  latest,
}: Readonly<NextEpisodeCardProps>) {
  const generate = useGenerateEpisode();
  const [instructions, setInstructions] = useState("");
  const [directing, setDirecting] = useState(false);

  const writeEpisode = () =>
    generate.mutate(
      { storyId, instructions: instructions.trim() || undefined },
      {
        onSuccess: () => {
          setInstructions("");
          setDirecting(false);
        },
      },
    );

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <IconBox icon={Sparkles} tone="primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              Episode {episodeNumber} is next
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {nextEpisodeHint(latest)}
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            {!directing && (
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => setDirecting(true)}
                disabled={generate.isPending}
              >
                Add direction
              </Button>
            )}
            <Button
              className="flex-1 sm:flex-none"
              onClick={writeEpisode}
              disabled={generate.isPending}
            >
              {generate.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              {generate.isPending ? "Writing…" : "Write episode"}
            </Button>
          </div>
        </div>

        {directing && (
          <div className="space-y-2 border-t border-border/50 pt-4">
            <Textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Optional direction for this episode — a plot beat to hit, a character to introduce…"
              maxLength={1000}
              rows={3}
              autoFocus
            />
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{instructions.length} / 1000</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDirecting(false);
                  setInstructions("");
                }}
              >
                Remove direction
              </Button>
            </div>
          </div>
        )}

        {generate.isPending && (
          <p className="text-xs text-muted-foreground">
            Drafting with ChatGPT, falling back to Claude and then a local model
            if a provider is unavailable — this can take a moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading story">
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-5">
        <Skeleton className="aspect-[4/5] w-16 shrink-0 rounded-xl sm:w-32" />
        <div className="flex-1 space-y-3 pt-1">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Card>
        <CardContent className="p-4 sm:p-5">
          <ListSkeleton rows={4} thumb />
        </CardContent>
      </Card>
    </div>
  );
}

function StoryHero({ story }: Readonly<{ story: Story }>) {
  const details = [story.genre, story.tone, story.audience].filter(
    (detail): detail is string => Boolean(detail),
  );

  return (
    <div className="flex items-start gap-4 sm:gap-6">
      <div className="aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border border-border/60 sm:w-32">
        <PostMediaPreview
          post={{
            mediaUrls: story.coverImageUrl ? [story.coverImageUrl] : [],
            mediaType: "image",
            altText: story.title,
            message: null,
          }}
          emptyLabel={story.genre ?? "Story"}
          emptyClassName={coverTint(story)}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STORY_STATUS_VARIANT[story.status]}>
            {STORY_STATUS_LABELS[story.status]}
          </Badge>
          {story.autoPromote && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Auto-promotes new episodes
            </span>
          )}
        </div>
        <h1 className="heading-subsection break-words">{story.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {story.premise}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {details.map((detail) => (
            <Badge key={detail} variant="outline" className="font-normal">
              {detail}
            </Badge>
          ))}
          <Badge variant="outline" className="font-normal uppercase">
            {story.language}
          </Badge>
        </div>
      </div>
    </div>
  );
}

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: story, isLoading, isError } = useStory(id);
  const [filter, setFilter] = useState<EpisodeFilter>("all");

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError || !story) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Couldn't load this story"
        description="It may have been removed, or you don't have access to it."
        action={
          <Button variant="outline" asChild>
            <Link to="/stories">Back to all stories</Link>
          </Button>
        }
      />
    );
  }

  const episodes = [...(story.episodes ?? [])].sort(
    (a, b) => b.episodeNumber - a.episodeNumber,
  );
  const nextEpisodeNumber = (story.episodes?.length ?? 0) + 1;
  const latest = episodes[0];

  const published = episodes.filter(
    (episode) => episode.status === "PUBLISHED",
  );
  const needsYou = episodes.filter(episodeNeedsYou);
  const views = published.reduce((sum, episode) => sum + episode.viewCount, 0);
  const reads = published.reduce(
    (sum, episode) => sum + episode.completedReads,
    0,
  );

  const episodesByFilter: Record<EpisodeFilter, StoryEpisode[]> = {
    all: episodes,
    "needs-you": needsYou,
    published,
  };
  const visible = episodesByFilter[filter];
  const filterOptions = EPISODE_FILTERS.map((option) => ({
    value: option.value,
    label: `${option.label} (${episodesByFilter[option.value].length})`,
  }));

  const stats: StripStat[] = [
    {
      label: "Episodes",
      value: String(episodes.length),
      icon: BookOpen,
      hint: `${episodes.length - published.length} not published yet`,
      onSelect: () => setFilter("all"),
    },
    {
      label: "Published",
      value: String(published.length),
      icon: Send,
      tone: published.length > 0 ? "success" : "default",
      hint: published.length > 0 ? "Live for readers" : "Nothing live yet",
      onSelect: () => setFilter("published"),
    },
    {
      label: "Views",
      value: compactNumber(views),
      icon: Eye,
      hint: "Readers who opened an episode",
    },
    {
      label: "Reads",
      value: compactNumber(reads),
      icon: BookCheck,
      hint:
        views > 0
          ? `${Math.round((reads / views) * 100)}% read to the end`
          : "Readers who finished an episode",
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <Link
        to="/stories"
        className="inline-flex items-center gap-1.5 py-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All stories
      </Link>

      <StoryHero story={story} />

      <StatStrip variant="tiles" stats={stats} />

      <NextEpisodeCard
        storyId={story.id}
        episodeNumber={nextEpisodeNumber}
        latest={latest}
      />

      <section className="space-y-3" aria-labelledby="episodes-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="episodes-heading" className="text-lg font-semibold">
            Episodes
          </h2>
          {episodes.length > 0 && (
            <SegmentedControl
              options={filterOptions}
              value={filter}
              onChange={setFilter}
            />
          )}
        </div>

        {visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={filter === "all" ? BookOpen : BookCheck}
              title={FILTER_EMPTY_COPY[filter].title}
              description={FILTER_EMPTY_COPY[filter].description}
              action={
                filter !== "all" && (
                  <Button variant="outline" onClick={() => setFilter("all")}>
                    Show all episodes
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Accordion
              type="multiple"
              defaultValue={defaultOpenEpisodes(needsYou, latest)}
              className="[&>*:last-child]:border-b-0"
            >
              {visible.map((episode) => (
                <StoryEpisodeItem
                  key={episode.id}
                  storyId={story.id}
                  episode={episode}
                />
              ))}
            </Accordion>
          </Card>
        )}
      </section>
    </div>
  );
};

export default StoryDetail;
