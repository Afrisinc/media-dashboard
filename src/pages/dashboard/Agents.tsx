import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBox } from "@/components/ui/icon-box";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { usePostDrafts } from "@/hooks/usePostAgent";
import {
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
  type PostDraftStatus,
} from "@/types/postAgent";
import { MediaLightbox } from "@/components/dashboard/MediaLightbox";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ServerCrash,
  Inbox,
} from "lucide-react";
import { Link } from "react-router-dom";

const RECENT_LIMIT = 8;

function countBy(drafts: PostDraft[], status: PostDraftStatus): number {
  return drafts.filter((draft) => draft.status === status).length;
}

function relativeTime(value: string): string {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

const DashboardAgents = () => {
  const { data, isLoading, isError } = usePostDrafts({ limit: 50 });
  const drafts = data?.items ?? [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const inReview = countBy(drafts, "awaiting_approval");
  const scheduled = countBy(drafts, "scheduled");
  const failed = countBy(drafts, "failed") + countBy(drafts, "rendered");
  const lastRun = drafts[0]?.createdAt;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agents"
        subtitle="What the agents have been doing and what is waiting on you."
      />

      {isError && (
        <EmptyState
          icon={ServerCrash}
          title="Could not reach content-service"
          description="The agent is running inside content-service. Check that it and the render service are up."
        />
      )}

      {!isError && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
            <div className="flex items-center gap-3">
              <IconBox icon={Bot} />
              <div>
                <CardTitle>Post agent</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Writes the copy, art-directs the frames, renders and queues
                  them for review.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={inReview > 0 ? "default" : "secondary"}>
                {inReview > 0 ? "Waiting on you" : "Idle"}
              </Badge>
              <Button asChild size="sm">
                <Link to="/post-studio">Open Post Studio</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <StatGrid>
                <StatCard
                  label="In review"
                  value={String(inReview)}
                  icon={Inbox}
                />
                <StatCard
                  label="Scheduled"
                  value={String(scheduled)}
                  icon={CalendarClock}
                />
                <StatCard
                  label="Needs a fix"
                  value={String(failed)}
                  icon={AlertTriangle}
                />
                <StatCard
                  label="Last run"
                  value={lastRun ? relativeTime(lastRun) : "never"}
                  icon={CheckCircle2}
                />
              </StatGrid>
            )}

            <div>
              <h2 className="mb-3 text-sm font-semibold">Recent work</h2>

              {isLoading && <Skeleton className="h-32 w-full" />}

              {!isLoading && drafts.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  variant="compact"
                  description="Nothing drafted yet. Brief the agent from Post Studio."
                />
              )}

              {drafts.slice(0, RECENT_LIMIT).map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between gap-4 border-b py-3 last:border-0"
                >
                  {draft.slideUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDraftId(draft.id);
                        setLightboxOpen(true);
                      }}
                      className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <img
                        src={draft.slideUrls[0]}
                        alt={draft.topic}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {draft.topic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {FORMAT_LABELS[draft.format]} · {draft.slideUrls.length}{" "}
                      {draft.slideUrls.length === 1 ? "frame" : "frames"} ·{" "}
                      {relativeTime(draft.createdAt)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[draft.status]}>
                    {STATUS_LABELS[draft.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox for viewing slides */}
      {selectedDraftId && (
        <MediaLightbox
          images={drafts.find((d) => d.id === selectedDraftId)?.slideUrls || []}
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
