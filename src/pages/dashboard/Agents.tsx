import { useState } from "react";
import {
  AgentCard,
  type AgentSummaryStat,
} from "@/components/dashboard/AgentCard";
import { MediaLightbox } from "@/components/dashboard/MediaLightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentRuns } from "@/hooks/useAutomation";
import { usePostDrafts } from "@/hooks/usePostAgent";
import { formatDateShort } from "@/lib/dateFormat";
import {
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
  type PostDraftStatus,
} from "@/types/postAgent";
import { Bot, Inbox, Mail, ServerCrash } from "lucide-react";
import { Link } from "react-router-dom";

const RECENT_LIMIT = 8;

function countBy(drafts: PostDraft[], status: PostDraftStatus): number {
  return drafts.filter((draft) => draft.status === status).length;
}

function DraftRow({
  draft,
  onOpen,
}: {
  draft: PostDraft;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0">
      {draft.slideUrls.length > 0 ? (
        <button
          type="button"
          onClick={() => onOpen(draft.id)}
          aria-label={`Open the frames for ${draft.topic}`}
          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-80"
        >
          <img
            src={draft.slideUrls[0]}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
      ) : (
        <span className="h-12 w-12 flex-shrink-0 rounded-md border border-border bg-inset" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{draft.topic}</p>
        <p className="text-xs text-muted-foreground">
          {FORMAT_LABELS[draft.format]} · {draft.slideUrls.length}{" "}
          {draft.slideUrls.length === 1 ? "frame" : "frames"} ·{" "}
          {formatDateShort(draft.createdAt)}
        </p>
      </div>

      <Badge variant={STATUS_VARIANT[draft.status]}>
        {STATUS_LABELS[draft.status]}
      </Badge>
    </div>
  );
}

const DashboardAgents = () => {
  const { data, isLoading, isError } = usePostDrafts({ limit: 50 });
  const { data: runPage } = useAgentRuns({ limit: 1 });

  const drafts = data?.items ?? [];
  const [openAgent, setOpenAgent] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const inReview = countBy(drafts, "awaiting_approval");
  const scheduled = countBy(drafts, "scheduled");
  const needsFix = countBy(drafts, "failed") + countBy(drafts, "rendered");
  const lastRun = drafts[0]?.createdAt;
  const running = runPage?.items[0]?.status === "running";

  const toggle = (id: string) =>
    setOpenAgent((current) => (current === id ? null : id));

  const postAgentStats: AgentSummaryStat[] = [
    {
      label: "In review",
      value: String(inReview),
      tone: inReview > 0 ? "attention" : "default",
    },
    { label: "Scheduled", value: String(scheduled) },
    {
      label: "Needs a fix",
      value: String(needsFix),
      tone: needsFix > 0 ? "danger" : "default",
    },
    { label: "Last run", value: lastRun ? formatDateShort(lastRun) : "never" },
  ];

  const openFrames = (id: string) => {
    setSelectedDraftId(id);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="AI Agents"
        subtitle="What the agents have been doing and what is waiting on you."
      />

      {isError && (
        <EmptyState
          icon={ServerCrash}
          title="Could not reach content-service"
          description="The agents run inside content-service. Check that it and the render service are up."
        />
      )}

      {!isError && (
        <>
          <AgentCard
            name="Post agent"
            description="Writes the copy, art-directs the frames, renders and queues them."
            icon={Bot}
            status={
              running ? "Running" : inReview > 0 ? "Waiting on you" : "Idle"
            }
            statusTone={running || inReview > 0 ? "default" : "secondary"}
            stats={postAgentStats}
            open={openAgent === "post"}
            onToggle={() => toggle("post")}
            action={
              <Button asChild size="sm">
                <Link to="/studio">Open Post Studio</Link>
              </Button>
            }
          >
            {isLoading && <Skeleton className="h-32 w-full" />}

            {!isLoading && drafts.length === 0 && (
              <EmptyState
                icon={Inbox}
                variant="compact"
                title="Nothing drafted yet. Brief the agent from Post Studio."
              />
            )}

            {drafts.slice(0, RECENT_LIMIT).map((draft) => (
              <DraftRow key={draft.id} draft={draft} onOpen={openFrames} />
            ))}

            {drafts.length > RECENT_LIMIT && (
              <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                <Link to="/studio">See all {drafts.length} in Post Studio</Link>
              </Button>
            )}
          </AgentCard>

          <AgentCard
            name="Newsletter digest"
            description="Gathers the week's articles and drafts the digest."
            icon={Mail}
            iconTone="muted"
            status="Scheduled"
            stats={[{ label: "Runs", value: "On a cron" }]}
            open={openAgent === "digest"}
            onToggle={() => toggle("digest")}
          >
            <EmptyState
              icon={Mail}
              variant="compact"
              title="This agent runs on a schedule and does not report here yet."
            />
          </AgentCard>
        </>
      )}

      {selectedDraftId && (
        <MediaLightbox
          images={drafts.find((d) => d.id === selectedDraftId)?.slideUrls ?? []}
          index={0}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onIndexChange={() => {}}
        />
      )}
    </div>
  );
};

export default DashboardAgents;
