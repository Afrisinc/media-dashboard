import { PostBriefForm } from "@/components/dashboard/PostBriefForm";
import { PostDraftReview } from "@/components/dashboard/PostDraftReview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePostDrafts } from "@/hooks/usePostAgent";
import {
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
  type PostDraftStatus,
} from "@/types/postAgent";
import { Inbox, ServerCrash } from "lucide-react";

const REVIEW_STATUS: PostDraftStatus = "awaiting_approval";

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
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{draft.topic}</p>
        <p className="text-xs text-muted-foreground">
          {FORMAT_LABELS[draft.format]} ·{" "}
          {new Date(draft.createdAt).toLocaleDateString()}
          {draft.errorMessage ? ` · ${draft.errorMessage}` : ""}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[draft.status]}>
        {STATUS_LABELS[draft.status]}
      </Badge>
    </div>
  );
}

export default function PostStudio() {
  const review = usePostDrafts({ status: REVIEW_STATUS, limit: 20 });
  const recent = usePostDrafts({ limit: 20 });

  const queue = review.data?.items ?? [];
  const history = (recent.data?.items ?? []).filter(
    (draft) => draft.status !== REVIEW_STATUS,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post Studio"
        subtitle="Brief the agent, then approve what it drafts. Nothing publishes without you."
      />

      <PostBriefForm />

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">
            In review{queue.length > 0 ? ` (${queue.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="history">Everything else</TabsTrigger>
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
            <EmptyState
              icon={Inbox}
              title="Nothing waiting on you"
              description="Brief the agent above and the draft will land here for review."
            />
          )}

          {queue.map((draft) => (
            <PostDraftReview key={draft.id} draft={draft} />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {recent.isLoading && <Skeleton className="h-32 w-full" />}
              {!recent.isLoading && history.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  variant="compact"
                  description="No drafts yet."
                />
              )}
              {history.map((draft) => (
                <HistoryRow key={draft.id} draft={draft} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
