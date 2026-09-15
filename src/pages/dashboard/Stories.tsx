import { StoryBriefForm } from "@/components/dashboard/StoryBriefForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { useStories } from "@/hooks/useStoryAgent";
import { formatDateShort } from "@/lib/dateFormat";
import {
  STORY_STATUS_LABELS,
  STORY_STATUS_VARIANT,
  type Story,
} from "@/types/story";
import {
  BookOpen,
  CheckCircle2,
  Plus,
  ServerCrash,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function StoriesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <Card key={key}>
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/stories/${story.id}`}>
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold">{story.title}</h3>
            <Badge variant={STORY_STATUS_VARIANT[story.status]}>
              {STORY_STATUS_LABELS[story.status]}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {story.premise}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {story.genre && <span>{story.genre}</span>}
            {story.genre && <span>·</span>}
            <span>Started {formatDateShort(story.createdAt)}</span>
            {story.autoPromote && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  auto-promotes
                </span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

const Stories = () => {
  const { data, isLoading, isError } = useStories({ limit: 50 });
  const [composing, setComposing] = useState(false);

  const stories = data?.items ?? [];
  const active = stories.filter((story) => story.status === "ACTIVE").length;
  const completed = stories.filter(
    (story) => story.status === "COMPLETED",
  ).length;

  const stats: StripStat[] = [
    { label: "Stories", value: String(stories.length), icon: BookOpen },
    {
      label: "Active",
      value: String(active),
      icon: Sparkles,
      tone: active > 0 ? "success" : "default",
    },
    { label: "Completed", value: String(completed), icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="Story Studio"
        subtitle="Brief a series once, then generate it episode by episode — chatgpt writes, claude and ollama back it up."
        action={
          <Button
            onClick={() => setComposing((open) => !open)}
            variant={composing ? "outline" : "default"}
            aria-expanded={composing}
            aria-controls="story-composer"
          >
            {composing ? (
              <>
                <X className="mr-1.5 h-4 w-4" />
                Close
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                New story
              </>
            )}
          </Button>
        }
      />

      <StatStrip stats={stats} />

      {composing && (
        <div id="story-composer" className="animate-fade-up">
          <StoryBriefForm />
        </div>
      )}

      {isLoading ? (
        <StoriesSkeleton />
      ) : isError ? (
        <EmptyState
          icon={ServerCrash}
          title="Couldn't load stories"
          description="Try refreshing the page."
        />
      ) : stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No stories yet"
          description="Start one above — a title and a premise is all it takes."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stories;
