import type { ReactNode } from "react";
import { ArrowRight, Bot, Loader2, Play, Rss, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBox } from "@/components/ui/icon-box";
import { Skeleton } from "@/components/ui/skeleton";
import { useRunNewsAgentStage } from "@/hooks/useNewsDesk";
import { formatDateShort } from "@/lib/dateFormat";
import { describeCron } from "@/lib/newsDesk";
import type {
  NewsAgentStage,
  NewsAgentStageStatus,
  NewsDeskSummary,
  NewsEnhancementResult,
  NewsIngestionResult,
} from "@/types/newsDesk";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function ingestSummary(result: NewsIngestionResult) {
  return `${plural(result.fetched, "item")} read · ${result.created} new`;
}

function enhanceSummary(result: NewsEnhancementResult) {
  if (result.claimed === 0) return "Nothing was waiting";
  return [
    `${result.published} published`,
    `${result.rejected} rejected`,
    `${result.failed} failed`,
  ].join(" · ");
}

interface StageCardProps<T> {
  stage: NewsAgentStage;
  title: string;
  icon: typeof Rss;
  status: NewsAgentStageStatus<T>;
  summarize: (result: T) => string;
  detail?: (result: T) => ReactNode;
}

function StageCard<T>({
  stage,
  title,
  icon,
  status,
  summarize,
  detail,
}: Readonly<StageCardProps<T>>) {
  const run = useRunNewsAgentStage();
  const busy = status.running || run.isPending;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-4">
      <div className="flex items-start gap-3">
        <IconBox
          icon={icon}
          size="sm"
          tone={status.running ? "primary" : "muted"}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">
            Runs {describeCron(status.schedule)}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run.mutate(stage)}
        >
          {busy ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-1.5 h-4 w-4" />
          )}
          {status.running ? "Running…" : "Run now"}
        </Button>
      </div>

      <div className="space-y-1">
        {status.lastResult ? (
          <p className="text-xs text-foreground">
            {summarize(status.lastResult)}
            {status.lastFinishedAt && (
              <span className="text-muted-foreground">
                {" "}
                · {formatDateShort(status.lastFinishedAt)}
              </span>
            )}
          </p>
        ) : (
          !status.lastError && (
            <p className="text-xs text-muted-foreground">
              No run since the service last started.
            </p>
          )
        )}
        {status.lastResult && detail?.(status.lastResult)}
        {status.lastError && (
          <p className="text-xs text-destructive">{status.lastError}</p>
        )}
      </div>
    </div>
  );
}

interface NewsAgentPanelProps {
  summary: NewsDeskSummary | undefined;
  loading: boolean;
  onShowQueued: () => void;
}

export function NewsAgentPanel({
  summary,
  loading,
  onShowQueued,
}: Readonly<NewsAgentPanelProps>) {
  if (loading || !summary) {
    return <Skeleton className="h-44 w-full rounded-xl" />;
  }

  const { agent } = summary;

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <IconBox icon={Bot} tone={agent.enabled ? "primary" : "muted"} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">News agent</p>
              <Badge variant={agent.enabled ? "default" : "secondary"}>
                {agent.enabled ? "On schedule" : "Manual only"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {`Reads ${plural(agent.sources, "feed")}, publishes stories GPT-4o scores ${agent.minScore} or higher, ${agent.batchSize} at a time.`}
              {summary.lastIngestedAt &&
                ` Last new article ${formatDateShort(summary.lastIngestedAt)}.`}
            </p>
          </div>
        </div>

        {!agent.enabled && (
          <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Scheduled runs are off. Set{" "}
            <code className="font-mono text-foreground">
              NEWS_AGENT_ENABLED=true
            </code>{" "}
            on content-service to run on a schedule — each stage can still be
            run by hand below.
          </p>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <StageCard
            stage="ingest"
            title="Fetch feeds"
            icon={Rss}
            status={agent.ingest}
            summarize={ingestSummary}
            detail={(result) => (
              <>
                {summary.byStatus.draft > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={onShowQueued}
                  >
                    {`See the ${plural(summary.byStatus.draft, "article")} waiting for the AI editor`}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
                {result.failedSources.length > 0 && (
                  <ul className="space-y-0.5">
                    {result.failedSources.map((source) => (
                      <li key={source.name} className="text-xs text-amber">
                        <span className="font-medium">{source.name}</span>
                        {` failed: ${source.error}`}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          />
          <StageCard
            stage="enhance"
            title="Write & publish"
            icon={Sparkles}
            status={agent.enhance}
            summarize={enhanceSummary}
            detail={(result) =>
              result.recovered > 0 && (
                <p className="text-xs text-amber">
                  {`${plural(result.recovered, "interrupted article")} marked failed`}
                </p>
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
