import { AgentRunTimeline } from "@/components/dashboard/AgentRunTimeline";
import CreatePostForm from "@/components/dashboard/CreatePostForm";
import { PostBriefForm } from "@/components/dashboard/PostBriefForm";
import { PostDraftReview } from "@/components/dashboard/PostDraftReview";
import PostsTable from "@/components/dashboard/PostsTable";
import SocialMediaPostForm from "@/components/dashboard/SocialMediaPostForm";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLatestAgentRun } from "@/hooks/useAutomation";
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
  Inbox,
  Send,
  ServerCrash,
  Plus,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const REVIEW_STATUS: PostDraftStatus = "awaiting_approval";

/** The three ways to make a post, in descending order of how much the agents do. */
const COMPOSERS = [
  {
    value: "agent",
    label: "Agent post",
    icon: Sparkles,
    blurb:
      "Brief the agent. It writes the copy, art-directs the frames, renders and queues them for you.",
  },
  {
    value: "quick",
    label: "Quick post",
    icon: Wand2,
    blurb:
      "Generate the caption with AI and send it, without the frame pipeline.",
  },
  {
    value: "manual",
    label: "Manual",
    icon: Send,
    blurb: "Write it yourself and publish to the pages you pick.",
  },
] as const;

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((key) => (
        <Card key={key}>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-5 w-64" />
            <div className="flex gap-3">
              {[0, 1, 2, 3].map((frame) => (
                <Skeleton key={frame} className="h-40 w-40 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HistoryRow({ draft }: { draft: PostDraft }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      <div className="min-w-0">
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

  // The agent takes about a minute. Showing the pipeline while it works is the
  // difference between a spinner and knowing what is happening.
  const watching = run && isRunWorthWatching(run) ? run : undefined;

  const scheduled = drafts.filter((d) => d.status === "scheduled").length;
  const needsFix = drafts.filter(
    (d) => d.status === "failed" || d.status === "rendered",
  ).length;

  const stats: StripStat[] = [
    {
      label: "Waiting on you",
      value: String(queue.length),
      icon: Inbox,
      tone: queue.length > 0 ? "attention" : "default",
    },
    {
      label: "Scheduled",
      value: String(scheduled),
      icon: CalendarClock,
      tone: scheduled > 0 ? "success" : "default",
    },
    {
      label: "Needs a fix",
      value: String(needsFix),
      icon: AlertCircle,
      tone: needsFix > 0 ? "danger" : "default",
    },
    { label: "Drafted", value: String(drafts.length), icon: CheckCircle2 },
  ];

  const active = COMPOSERS.find((option) => option.value === composer);

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="Post Studio"
        subtitle="Brief an agent, write a quick post, or publish by hand — everything lands in one queue."
        action={
          <Button
            onClick={() => setComposing((open) => !open)}
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

      <StatStrip stats={stats} />

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

            <TabsContent value="quick" className="m-0 p-5">
              <CreatePostForm />
            </TabsContent>

            <TabsContent value="manual" className="m-0 p-5">
              <SocialMediaPostForm />
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">
            Waiting on you{queue.length > 0 ? ` (${queue.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="drafts">Agent drafts</TabsTrigger>
          <TabsTrigger value="posts">Everything published</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="mt-4 space-y-4">
          {review.isLoading && <QueueSkeleton />}

          {review.isError && (
            <EmptyState
              icon={ServerCrash}
              title="Could not reach the agent"
              description="content-service is not answering. Check that it and the render service are running."
            />
          )}

          {!review.isLoading && !review.isError && queue.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="font-medium">Nothing waiting on you</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Brief an agent and the draft lands here for review.
                </p>
                {!composing && (
                  <Button className="mt-1" onClick={() => setComposing(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {queue.map((draft) => (
            <PostDraftReview key={draft.id} draft={draft} />
          ))}
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {recent.isLoading && <Skeleton className="h-32 w-full" />}
              {!recent.isLoading && history.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  variant="compact"
                  title="No drafts yet."
                />
              )}
              {history.map((draft) => (
                <HistoryRow key={draft.id} draft={draft} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <PostsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Studio;
