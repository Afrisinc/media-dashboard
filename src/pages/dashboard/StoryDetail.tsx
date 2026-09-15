import { StoryEpisodeReview } from "@/components/dashboard/StoryEpisodeReview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateEpisode, useStory } from "@/hooks/useStoryAgent";
import { STORY_STATUS_LABELS, STORY_STATUS_VARIANT } from "@/types/story";
import { ArrowLeft, BookOpen, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: story, isLoading, isError } = useStory(id);
  const generate = useGenerateEpisode();
  const [instructions, setInstructions] = useState("");
  const [directing, setDirecting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-up">
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
      />
    );
  }

  const episodes = [...(story.episodes ?? [])].sort(
    (a, b) => b.episodeNumber - a.episodeNumber,
  );
  const nextEpisodeNumber = (story.episodes?.length ?? 0) + 1;

  return (
    <div className="space-y-4 animate-fade-up">
      <Link
        to="/stories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All stories
      </Link>

      <PageHeader
        title={story.title}
        subtitle={story.premise}
        action={
          <Badge variant={STORY_STATUS_VARIANT[story.status]}>
            {STORY_STATUS_LABELS[story.status]}
          </Badge>
        }
      />

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Episode {nextEpisodeNumber}</p>
            <Button
              size="sm"
              onClick={() => setDirecting((open) => !open)}
              variant={directing ? "outline" : "default"}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              {directing ? "Cancel" : "Generate next episode"}
            </Button>
          </div>

          {directing && (
            <div className="space-y-3 border-t border-border/50 pt-3">
              <Textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Optional direction for this episode — a plot beat to hit, a character to introduce…"
                maxLength={1000}
                rows={2}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={generate.isPending}
                  onClick={() =>
                    generate.mutate(
                      {
                        storyId: story.id,
                        instructions: instructions.trim() || undefined,
                      },
                      {
                        onSuccess: () => {
                          setInstructions("");
                          setDirecting(false);
                        },
                      },
                    )
                  }
                >
                  {generate.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {generate.isPending ? "Writing…" : "Write it"}
                </Button>
              </div>
              {generate.isPending && (
                <p className="text-xs text-muted-foreground">
                  Drafting with ChatGPT, falling back to Claude and then a local
                  model if a provider is unavailable — this can take a moment.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {episodes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No episodes yet"
          description="Generate episode one above to get the series started."
        />
      ) : (
        <div className="space-y-4">
          {episodes.map((episode) => (
            <StoryEpisodeReview
              key={episode.id}
              storyId={story.id}
              episode={episode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryDetail;
