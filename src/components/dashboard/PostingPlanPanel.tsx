import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostingPlan } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import type {
  PlanConfidence,
  PlannedSlot,
  Recommendation,
  TopicPerformance,
} from "@/services/analyticsService";
import {
  BarChart3,
  Clock,
  Layers,
  Radio,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const RECOMMENDATION_ICON = {
  timing: Clock,
  format: Layers,
  platform: Radio,
  volume: BarChart3,
} as const;

const CONFIDENCE_COPY: Record<PlanConfidence, { label: string; tone: string }> =
  {
    none: { label: "Not enough evidence", tone: "text-dim-5" },
    low: { label: "Early signal", tone: "text-gold" },
    good: { label: "Backed by the numbers", tone: "text-emerald" },
  };

function whenLabel(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleString(undefined, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SlotRow({ slot, timeZone }: { slot: PlannedSlot; timeZone: string }) {
  return (
    <ListRow className="rounded-lg border border-border bg-inset px-3 py-2">
      <span className="w-32 flex-shrink-0 text-xs font-bold tabular-nums">
        {whenLabel(slot.when, timeZone)}
      </span>
      <Badge
        variant="secondary"
        className="flex-shrink-0 text-[10px] uppercase"
      >
        {slot.platform}
      </Badge>
      <Badge variant="outline" className="flex-shrink-0 text-[10px] uppercase">
        {slot.format}
      </Badge>
      <div className="min-w-[140px] flex-1">
        <p className="truncate text-xs font-bold">
          {slot.topic ?? "Topic not decided yet"}
        </p>
        <p className="mt-0.5 text-[11px] text-dim-5">{slot.reason}</p>
      </div>
    </ListRow>
  );
}

function TopicList({ topics }: { topics: TopicPerformance[] }) {
  if (topics.length === 0) {
    return null;
  }

  const best = topics[0].averageEngagement || 1;

  return (
    <div className="space-y-1.5">
      {topics.map((topic) => (
        <div key={topic.topic} className="flex items-center gap-3">
          <span className="w-24 flex-shrink-0 truncate text-xs">
            {topic.topic}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
            <span
              className="block h-full rounded-full bg-emerald"
              style={{ width: `${(topic.averageEngagement / best) * 100}%` }}
            />
          </span>
          <span className="w-16 flex-shrink-0 text-right text-[11px] tabular-nums text-dim-5">
            {Math.round(topic.averageEngagement)} / post
          </span>
        </div>
      ))}
    </div>
  );
}

function Insights({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {recommendations.map((entry) => {
        const Icon = RECOMMENDATION_ICON[entry.kind];
        return (
          <div key={entry.kind} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold" />
            <div>
              <p className="text-xs font-bold">{entry.title}</p>
              <p className="mt-0.5 text-[11px] text-dim-5">{entry.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PostingPlanPanel({ days }: { days: number }) {
  const from = new Date(Date.now() - days * 86400000)
    .toISOString()
    .slice(0, 10);
  const { data, isLoading, isError } = usePostingPlan({ from });

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Could not build a plan"
        description="content-service is not answering. Check that it is running, then reload."
      />
    );
  }

  const confidence = CONFIDENCE_COPY[data.confidence];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-gold" />
              What to post next
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.brand
                ? `On ${data.brand.name}'s cadence, from ${data.postsAnalysed} published post(s).`
                : "Create a brand to lay a plan on its posting cadence."}
            </p>
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider",
              confidence.tone,
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {confidence.label}
          </span>
        </div>

        {data.confidence === "none" && (
          <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            The plan below keeps the brand on its configured cadence. Topic and
            format picks stay provisional until enough posts have reported back
            to tell one from another.
          </div>
        )}

        {data.slots.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            variant="compact"
            title={
              data.brand
                ? "No posting day is set on this brand, so there is nothing to lay a plan on."
                : "No brand yet — a plan needs a cadence to sit on."
            }
          />
        ) : (
          <div className="mt-4 space-y-1.5">
            {data.slots.map((slot) => (
              <SlotRow
                key={`${slot.when}-${slot.platform}-${slot.topic}`}
                slot={slot}
                timeZone={data.timeZone}
              />
            ))}
          </div>
        )}

        {(data.topics.length > 0 || data.recommendations.length > 0) && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {data.topics.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-dim-5">
                  What has been landing
                </p>
                <div className="mt-2.5">
                  <TopicList topics={data.topics} />
                </div>
              </div>
            )}

            {data.recommendations.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  What the numbers suggest
                </p>
                <div className="mt-2.5">
                  <Insights recommendations={data.recommendations} />
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-5 text-[10px] text-dim-6">
          Times shown in {data.timeZone}.
        </p>
      </CardContent>
    </Card>
  );
}
