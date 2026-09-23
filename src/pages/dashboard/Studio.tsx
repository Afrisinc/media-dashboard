import { AgentRunTimeline } from "@/components/dashboard/AgentRunTimeline";
import { LayoutToggle } from "@/components/dashboard/LayoutToggle";
import { MediaLightbox } from "@/components/dashboard/MediaLightbox";
import { PostMediaPreview } from "@/components/dashboard/PostMediaPreview";
import { PostBriefForm } from "@/components/dashboard/PostBriefForm";
import { PostDraftReview } from "@/components/dashboard/PostDraftReview";
import PostsTable from "@/components/dashboard/PostsTable";
import SocialMediaPostForm from "@/components/dashboard/SocialMediaPostForm";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
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
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLatestAgentRun } from "@/hooks/useAutomation";
import { useLayoutParam } from "@/hooks/useLayoutParam";
import { usePostDrafts } from "@/hooks/usePostAgent";
import { formatDateShort } from "@/lib/dateFormat";
import { isRunWorthWatching } from "@/types/accountGroup";
import {
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
  type PostDraftStatus,
} from "@/types/postAgent";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  FileText,
  Globe,
  Inbox,
  Send,
  ServerCrash,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const REVIEW_STATUS: PostDraftStatus = "awaiting_approval";

/** The two ways to make a post, in descending order of how much the agents do. */
const COMPOSERS = [
  {
    value: "agent",
    label: "Agent post",
    icon: Sparkles,
    blurb:
      "Brief the agent. It writes the copy, art-directs the frames, renders and queues them for you.",
  },
  {
    value: "manual",
    label: "Manual",
    icon: Send,
    blurb: "Write it yourself and publish to the pages you pick.",
  },
] as const;

const VIEWS = ["posts", "drafts", "review"] as const;
type StudioView = (typeof VIEWS)[number];

const isStudioView = (value: string | null): value is StudioView =>
  VIEWS.some((view) => view === value);

interface ViewTabProps {
  value: StudioView;
  label: string;
  shortLabel: string;
  icon: typeof Inbox;
  count?: number;
  attention?: boolean;
}

function ViewTab({
  value,
  label,
  shortLabel,
  icon: Icon,
  count,
  attention,
}: ViewTabProps) {
  return (
    <TabsTrigger
      value={value}
      className="group h-9 min-w-0 gap-1.5 rounded-md px-2 sm:gap-2 sm:px-3.5 data-[state=active]:shadow-sm"
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70 group-data-[state=active]:opacity-100" />
      <span className="lg:hidden">{shortLabel}</span>
      <span className="hidden lg:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "min-w-5 rounded-full px-1.5 text-[11px] font-semibold leading-5 tabular-nums",
            attention
              ? "bg-amber/15 text-amber"
              : "bg-foreground/5 text-muted-foreground group-data-[state=active]:text-foreground",
          )}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((key) => (
        <Card key={key}>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-5 w-64 max-w-full" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((frame) => (
                <Skeleton key={frame} className="aspect-square rounded-md" />
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const DRAFT_FILTERS = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Needs a fix", value: "fix" },
] as const;

type DraftFilter = (typeof DRAFT_FILTERS)[number]["value"];

const NEEDS_FIX: PostDraftStatus[] = ["failed", "rendered"];

const matchesDraftFilter = (draft: PostDraft, filter: DraftFilter) => {
  if (filter === "scheduled") return draft.status === "scheduled";
  if (filter === "fix") return NEEDS_FIX.includes(draft.status);
  return true;
};

const draftMedia = (draft: PostDraft) => ({
  mediaUrls: draft.slideUrls,
  mediaType: "image",
  altText: draft.topic,
  message: draft.caption ?? draft.topic,
});

interface DraftCardProps {
  draft: PostDraft;
  onOpenSlides: () => void;
}

function DraftCard({ draft, onOpenSlides }: DraftCardProps) {
  const hasSlides = draft.slideUrls.length > 0;

  return (
    <MediaCard
      media={<PostMediaPreview post={draftMedia(draft)} />}
      mediaLabel={hasSlides ? "View slides full size" : "No slides rendered"}
      onMediaClick={hasSlides ? onOpenSlides : undefined}
      topLeft={
        <Badge variant={STATUS_VARIANT[draft.status]} className="shadow-sm">
          {STATUS_LABELS[draft.status]}
        </Badge>
      }
      title={draft.topic}
      meta={
        <Badge variant="outline" className="font-medium">
          {FORMAT_LABELS[draft.format]}
        </Badge>
      }
      caption={
        <>
          <span className="block">
            {draft.status === "scheduled" && draft.scheduledAt
              ? `Scheduled ${formatDateShort(draft.scheduledAt)}`
              : `Drafted ${formatDateShort(draft.createdAt)}`}
          </span>
          {draft.errorMessage && (
            <span className="mt-1 line-clamp-2 text-destructive">
              {draft.errorMessage}
            </span>
          )}
        </>
      }
    />
  );
}

function HistoryRow({
  draft,
  onOpenSlides,
}: {
  draft: PostDraft;
  onOpenSlides?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      {onOpenSlides !== undefined && (
        <button
          type="button"
          onClick={onOpenSlides}
          disabled={draft.slideUrls.length === 0}
          className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
          aria-label="View slides full size"
        >
          <PostMediaPreview post={draftMedia(draft)} variant="thumb" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{draft.topic}</p>
        <p className="text-xs text-muted-foreground">
          {FORMAT_LABELS[draft.format]} · {formatDateShort(draft.createdAt)}
          {draft.errorMessage ? ` · ${draft.errorMessage}` : ""}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[draft.status]}>
        {STATUS_LABELS[draft.status]}
      </Badge>
    </div>
  );
}

const Studio = () => {
  const review = usePostDrafts({ status: REVIEW_STATUS, limit: 20 });
  const recent = usePostDrafts({ limit: 20 });
  const { run } = useLatestAgentRun();
  const [composer, setComposer] = useState<string>("agent");
  // The queue is what you came for; composing is a deliberate act, so it starts
  // closed and the page opens on "what is waiting on me".
  const [composing, setComposing] = useState(false);
  const [draftFilter, setDraftFilter] = useState<DraftFilter>("all");
  const [layout, setLayout] = useLayoutParam();
  const [slides, setSlides] = useState<{ urls: string[]; index: number }>({
    urls: [],
    index: 0,
  });
  const [slidesOpen, setSlidesOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get("view");
  const view: StudioView = isStudioView(viewParam) ? viewParam : "posts";
  const setView = (next: string) => {
    if (!isStudioView(next)) return;
    setSearchParams(
      (params) => {
        if (next === "posts") params.delete("view");
        else params.set("view", next);
        return params;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (!composing) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setComposing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composing]);

  const queue = review.data?.items ?? [];
  const drafts = recent.data?.items ?? [];
  const history = drafts.filter((draft) => draft.status !== REVIEW_STATUS);
  const visibleDrafts = history.filter((draft) =>
    matchesDraftFilter(draft, draftFilter),
  );

  const showDrafts = (filter: DraftFilter) => {
    setDraftFilter(filter);
    setView("drafts");
  };

  const openComposer = () => {
    setComposing(true);
    requestAnimationFrame(() =>
      document
        .getElementById("composer")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const openSlides = (draft: PostDraft) => {
    setSlides({ urls: draft.slideUrls, index: 0 });
    setSlidesOpen(true);
  };

  // The agent takes about a minute. Showing the pipeline while it works is the
  // difference between a spinner and knowing what is happening.
  const watching = run && isRunWorthWatching(run) ? run : undefined;

  const scheduledDrafts = drafts.filter((d) => d.status === "scheduled");
  const scheduled = scheduledDrafts.length;
  const nextScheduledAt = scheduledDrafts
    .map((d) => d.scheduledAt)
    .filter((at): at is string => !!at)
    .sort()[0];
  const needsFix = drafts.filter(
    (d) => d.status === "failed" || d.status === "rendered",
  ).length;

  const stats: StripStat[] = [
    {
      label: "Waiting on you",
      value: String(queue.length),
      icon: Inbox,
      tone: queue.length > 0 ? "attention" : "default",
      onSelect: () => setView("review"),
      hint: queue.length > 0 ? "Ready for your review" : "All clear",
    },
    {
      label: "Scheduled",
      value: String(scheduled),
      icon: CalendarClock,
      tone: scheduled > 0 ? "success" : "default",
      onSelect: () => showDrafts("scheduled"),
      hint: nextScheduledAt
        ? `Next ${formatDateShort(nextScheduledAt)}`
        : "Nothing queued",
    },
    {
      label: "Needs a fix",
      value: String(needsFix),
      icon: AlertCircle,
      tone: needsFix > 0 ? "danger" : "default",
      onSelect: () => showDrafts("fix"),
      hint: needsFix > 0 ? "Failed or not queued" : "Nothing broken",
    },
    {
      label: "Drafted",
      value: String(recent.data?.total ?? drafts.length),
      icon: CheckCircle2,
      onSelect: () => showDrafts("all"),
      hint: "Written by your agents",
    },
  ];

  const active = COMPOSERS.find((option) => option.value === composer);

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="Post Studio"
        subtitle="Brief an agent, write a quick post, or publish by hand — everything lands in one queue."
        action={
          <Button
            onClick={() => (composing ? setComposing(false) : openComposer())}
            variant={composing ? "outline" : "default"}
            aria-expanded={composing}
            aria-controls="composer"
          >
            {composing ? (
              <>
                <X className="mr-1.5 h-4 w-4" />
                Close
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                Create post
              </>
            )}
          </Button>
        }
      />

      <StatStrip
        variant="tiles"
        stats={stats}
        loading={review.isLoading || recent.isLoading}
      />

      {watching && (
        <Card>
          <CardContent className="pt-6">
            <AgentRunTimeline run={watching} />
          </CardContent>
        </Card>
      )}

      {composing && (
        <Card id="composer" className="overflow-hidden animate-fade-up">
          <Tabs value={composer} onValueChange={setComposer}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/50 px-5 py-3">
              <TabsList>
                {COMPOSERS.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="gap-1.5"
                  >
                    <option.icon className="h-3.5 w-3.5" />
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <p className="min-w-[220px] flex-1 text-xs text-muted-foreground">
                {active?.blurb}
              </p>
            </div>

            <TabsContent value="agent" className="m-0 p-5">
              <PostBriefForm />
            </TabsContent>

            <TabsContent value="manual" className="m-0 p-5">
              <SocialMediaPostForm />
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-lg sm:inline-flex sm:w-auto border border-border/50 bg-muted/60 p-1">
          <ViewTab
            value="posts"
            label="Everything published"
            shortLabel="Published"
            icon={Globe}
          />
          <ViewTab
            value="drafts"
            label="Agent drafts"
            shortLabel="Drafts"
            icon={FileText}
            count={history.length}
          />
          <ViewTab
            value="review"
            label="Waiting on you"
            shortLabel="Review"
            icon={Inbox}
            count={queue.length}
            attention
          />
        </TabsList>

        <TabsContent value="review" className="mt-4 space-y-4">
          {review.isLoading && <QueueSkeleton />}

          {review.isError && (
            <Card>
              <EmptyState
                icon={ServerCrash}
                title="Could not reach the agent"
                description="content-service is not answering. Check that it and the render service are running."
                action={
                  <Button variant="outline" onClick={() => review.refetch()}>
                    Try again
                  </Button>
                }
              />
            </Card>
          )}

          {!review.isLoading && !review.isError && queue.length === 0 && (
            <Card>
              <EmptyState
                icon={Inbox}
                title="Nothing waiting on you"
                description="Brief an agent and the draft lands here for review."
                action={
                  !composing && (
                    <Button onClick={openComposer}>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Create post
                    </Button>
                  )
                }
              />
            </Card>
          )}

          {queue.map((draft) => (
            <PostDraftReview key={draft.id} draft={draft} />
          ))}
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SegmentedControl
                  options={[...DRAFT_FILTERS]}
                  value={draftFilter}
                  onChange={setDraftFilter}
                />
                <LayoutToggle value={layout} onChange={setLayout} />
              </div>

              {recent.isLoading &&
                (layout === "grid" ? (
                  <MediaCardGridSkeleton count={4} label="Loading drafts" />
                ) : (
                  <ListSkeleton rows={4} thumb label="Loading drafts" />
                ))}

              {recent.isError && (
                <EmptyState
                  icon={ServerCrash}
                  title="Could not load drafts"
                  description="content-service is not answering. Check that it is running."
                  action={
                    <Button variant="outline" onClick={() => recent.refetch()}>
                      Try again
                    </Button>
                  }
                />
              )}

              {!recent.isLoading &&
                !recent.isError &&
                visibleDrafts.length === 0 && (
                  <EmptyState
                    icon={FileText}
                    title={
                      history.length === 0
                        ? "No drafts yet"
                        : "No drafts in this view"
                    }
                    description={
                      history.length === 0
                        ? "Drafts the agents write, render and schedule collect here."
                        : "Nothing matches this filter right now."
                    }
                    action={
                      history.length === 0 ? (
                        !composing && (
                          <Button onClick={openComposer}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create post
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setDraftFilter("all")}
                        >
                          Show all drafts
                        </Button>
                      )
                    }
                  />
                )}

              {visibleDrafts.length > 0 &&
                (layout === "grid" ? (
                  <ul className={MEDIA_CARD_GRID}>
                    {visibleDrafts.map((draft) => (
                      <li key={draft.id} className="min-w-0">
                        <DraftCard
                          draft={draft}
                          onOpenSlides={() => openSlides(draft)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    {visibleDrafts.map((draft) => (
                      <HistoryRow
                        key={draft.id}
                        draft={draft}
                        onOpenSlides={() => openSlides(draft)}
                      />
                    ))}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <PostsTable onCreate={composing ? undefined : openComposer} />
        </TabsContent>
      </Tabs>

      <MediaLightbox
        images={slides.urls}
        index={slides.index}
        open={slidesOpen}
        onOpenChange={setSlidesOpen}
        onIndexChange={(index) => setSlides((prev) => ({ ...prev, index }))}
      />
    </div>
  );
};

export default Studio;
