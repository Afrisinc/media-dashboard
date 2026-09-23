import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  ServerCrash,
  Sparkles,
} from "lucide-react";
import { LayoutToggle } from "@/components/dashboard/LayoutToggle";
import { PostMediaPreview } from "@/components/dashboard/PostMediaPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import {
  MEDIA_CARD_GRID,
  MediaCard,
  MediaCardGridSkeleton,
} from "@/components/ui/media-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayoutParam } from "@/hooks/useLayoutParam";
import { useStories } from "@/hooks/useStoryAgent";
import { formatDateShort } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
import { describeStoryError } from "@/services/storyService";
import {
  STORY_STATUS_LABELS,
  STORY_STATUS_VARIANT,
  type Story,
  type StoryStatus,
} from "@/types/story";

const PAGE_SIZE = 12;

const STATUS_FILTERS: { label: string; value: StoryStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: STORY_STATUS_LABELS.ACTIVE, value: "ACTIVE" },
  { label: STORY_STATUS_LABELS.DRAFT, value: "DRAFT" },
  { label: STORY_STATUS_LABELS.COMPLETED, value: "COMPLETED" },
  { label: STORY_STATUS_LABELS.ARCHIVED, value: "ARCHIVED" },
];

const storyCover = (story: Story) => ({
  mediaUrls: story.coverImageUrl ? [story.coverImageUrl] : [],
  mediaType: "image",
  altText: story.title,
  message: story.title,
});

const storyMeta = (story: Story) =>
  [story.genre, story.language.toUpperCase()].filter(Boolean).join(" · ");

const StoryStatusBadge = ({
  story,
  overlay = false,
}: {
  story: Story;
  overlay?: boolean;
}) => (
  <Badge
    variant={STORY_STATUS_VARIANT[story.status]}
    className={cn(
      "shrink-0",
      overlay && "shadow-sm",
      overlay &&
        STORY_STATUS_VARIANT[story.status] === "outline" &&
        "bg-background/85 backdrop-blur",
    )}
  >
    {STORY_STATUS_LABELS[story.status]}
  </Badge>
);

const AutoPromoteMark = () => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
    <Sparkles className="h-3 w-3" />
    Auto-promotes
  </span>
);

interface StoryCardProps {
  story: Story;
  onOpen: () => void;
}

function StoryCard({ story, onOpen }: StoryCardProps) {
  return (
    <MediaCard
      media={
        <PostMediaPreview post={storyCover(story)} emptyLabel="No cover" />
      }
      mediaLabel={`Open ${story.title}`}
      onMediaClick={onOpen}
      topLeft={<StoryStatusBadge story={story} overlay />}
      title={story.title}
      onTitleClick={onOpen}
      meta={
        <>
          {storyMeta(story) && (
            <Badge variant="outline" className="font-medium">
              {storyMeta(story)}
            </Badge>
          )}
          {story.autoPromote && <AutoPromoteMark />}
        </>
      }
      caption={
        <>
          <span className="line-clamp-2">{story.premise}</span>
          <span className="mt-1 block">
            Started {formatDateShort(story.createdAt)}
          </span>
        </>
      }
    />
  );
}

function StoryRow({ story, onOpen }: StoryCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 border-b border-border/50 py-3 text-left transition-colors last:border-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60">
        <PostMediaPreview post={storyCover(story)} variant="thumb" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {story.title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {[storyMeta(story), `Started ${formatDateShort(story.createdAt)}`]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      <StoryStatusBadge story={story} />
    </button>
  );
}

export function StoriesPanel() {
  const navigate = useNavigate();
  const [layout, setLayout] = useLayoutParam();
  const [status, setStatus] = useState<StoryStatus | "all">("all");
  const [page, setPage] = useState(1);

  const stories = useStories({
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const items = stories.data?.items ?? [];
  const total = stories.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const openStory = (story: Story) => navigate(`/stories/${story.id}`);
  const startStory = () => navigate("/stories");

  const changeStatus = (next: StoryStatus | "all") => {
    setStatus(next);
    setPage(1);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {stories.isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {`${total.toLocaleString()} ${total === 1 ? "story" : "stories"}`}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={startStory}>
              <Plus className="mr-1.5 h-4 w-4" />
              New story
            </Button>
            <LayoutToggle value={layout} onChange={setLayout} />
          </div>
        </div>

        <SegmentedControl
          options={STATUS_FILTERS}
          value={status}
          onChange={changeStatus}
        />

        {stories.isLoading &&
          (layout === "grid" ? (
            <MediaCardGridSkeleton count={4} label="Loading stories" />
          ) : (
            <ListSkeleton rows={4} thumb label="Loading stories" />
          ))}

        {stories.isError && (
          <EmptyState
            icon={ServerCrash}
            title="Could not load stories"
            description={describeStoryError(stories.error)}
            action={
              <Button variant="outline" onClick={() => stories.refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {!stories.isLoading && !stories.isError && items.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title={status === "all" ? "No stories yet" : "No stories here"}
            description={
              status === "all"
                ? "Serialised stories your agents write, episode by episode, collect here."
                : "Nothing matches this status right now."
            }
            action={
              status === "all" ? (
                <Button onClick={startStory}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Start a story
                </Button>
              ) : (
                <Button variant="outline" onClick={() => changeStatus("all")}>
                  Show all stories
                </Button>
              )
            }
          />
        )}

        {items.length > 0 &&
          (layout === "grid" ? (
            <ul className={MEDIA_CARD_GRID}>
              {items.map((story) => (
                <li key={story.id} className="min-w-0">
                  <StoryCard story={story} onOpen={() => openStory(story)} />
                </li>
              ))}
            </ul>
          ) : (
            <div>
              {items.map((story) => (
                <StoryRow
                  key={story.id}
                  story={story}
                  onOpen={() => openStory(story)}
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
                disabled={page === 1 || stories.isFetching}
                onClick={() => setPage((current) => current - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || stories.isFetching}
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
  );
}
