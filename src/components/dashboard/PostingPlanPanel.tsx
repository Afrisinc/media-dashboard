import { Badge } from "@/components/ui/badge";
import { BarList } from "@/components/ui/bar-list";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconBox } from "@/components/ui/icon-box";
import { PlatformIcon } from "@/components/ui/platform-icon";
import {
  SectionCard,
  SectionCardSkeleton,
  SectionLabel,
} from "@/components/ui/section-card";
import { usePostingPlan } from "@/hooks/useAnalytics";
import { windowStartDate } from "@/lib/analyticsWindow";
import { platformLabel } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type {
  PlanConfidence,
  PlannedSlot,
  Recommendation,
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
    none: {
      label: "Not enough evidence",
      tone: "border-border bg-muted text-muted-foreground",
    },
    low: { label: "Early signal", tone: "border-gold/30 bg-gold/10 text-gold" },
    good: {
      label: "Backed by the numbers",
      tone: "border-emerald/30 bg-emerald/10 text-emerald",
    },
  };

function slotParts(iso: string, timeZone: string) {
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) =>
    date.toLocaleString(undefined, { timeZone, ...options });
  return {
    month: part({ month: "short" }),
    day: part({ day: "numeric" }),
    weekday: part({ weekday: "long" }),
    time: part({ hour: "2-digit", minute: "2-digit" }),
  };
}

function SlotRow({
  slot,
  timeZone,
}: Readonly<{ slot: PlannedSlot; timeZone: string }>) {
  const when = slotParts(slot.when, timeZone);

  return (
    <li className="flex gap-4 py-3">
      <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-inset">
        <span className="text-[10px] font-bold uppercase leading-none text-primary">
          {when.month}
        </span>
        <span className="mt-0.5 text-lg font-bold leading-none tabular-nums">
          {when.day}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-semibold">
            {when.weekday} · {when.time}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <PlatformIcon platform={slot.platform} className="h-3.5 w-3.5" />
            {platformLabel(slot.platform)}
          </span>
          <Badge
            variant="outline"
            className="px-1.5 py-0 text-[10px] font-normal capitalize"
          >
            {slot.format}
          </Badge>
        </div>
        <p
          className={cn(
            "line-clamp-2 text-sm",
            slot.topic ? "font-medium" : "italic text-muted-foreground",
          )}
        >
          {slot.topic ?? "Topic not decided yet"}
        </p>
        <p className="text-xs text-muted-foreground">{slot.reason}</p>
      </div>
    </li>
  );
}

function Insights({
  recommendations,
}: Readonly<{ recommendations: Recommendation[] }>) {
  return (
    <ul className="space-y-3">
      {recommendations.map((entry) => (
        <li key={entry.kind} className="flex items-start gap-3">
          <IconBox
            icon={RECOMMENDATION_ICON[entry.kind]}
            tone="gold"
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">{entry.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {entry.detail}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PostingPlanPanel({ days }: Readonly<{ days: number }>) {
  const query = usePostingPlan({ from: windowStartDate(days) });

  if (query.isLoading) {
    return <SectionCardSkeleton rows={4} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="What to post next" icon={Sparkles} iconTone="gold">
        <ErrorState
          title="Could not build a plan"
          description="content-service is not answering. Check that it is running."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const data = query.data;
  const confidence = CONFIDENCE_COPY[data.confidence];
  const posts = `${data.postsAnalysed} published ${data.postsAnalysed === 1 ? "post" : "posts"}`;

  return (
    <SectionCard
      title="What to post next"
      icon={Sparkles}
      iconTone="gold"
      description={
        data.brand
          ? `On ${data.brand.name}'s cadence, learned from ${posts} · times in ${data.timeZone}`
          : "Create a brand to lay a plan on its posting cadence."
      }
      action={
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            confidence.tone,
          )}
        >
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {confidence.label}
        </span>
      }
      contentClassName="space-y-6 pt-2"
    >
      {data.confidence === "none" && (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
          The plan keeps the brand on its configured cadence. Topic and format
          picks stay provisional until enough posts have reported back to tell
          one from another.
        </p>
      )}

      {data.slots.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          variant="compact"
          title={
            data.brand
              ? "No posting day is set on this brand, so there is nothing to plan on."
              : "No brand yet. A plan needs a cadence to sit on."
          }
        />
      ) : (
        <ol className="divide-y divide-border/60">
          {data.slots.map((slot) => (
            <SlotRow
              key={`${slot.when}-${slot.platform}-${slot.topic}`}
              slot={slot}
              timeZone={data.timeZone}
            />
          ))}
        </ol>
      )}

      {(data.topics.length > 0 || data.recommendations.length > 0) && (
        <div className="grid grid-cols-1 gap-6 border-t border-border/60 pt-5 lg:grid-cols-2">
          {data.topics.length > 0 && (
            <div className="space-y-3">
              <SectionLabel>What has been landing</SectionLabel>
              <BarList
                tone="emerald"
                items={data.topics.map((topic) => ({
                  key: topic.topic,
                  label: topic.topic,
                  value: topic.averageEngagement,
                  display: `${Math.round(topic.averageEngagement)} / post`,
                  meta: `${topic.posts} ${topic.posts === 1 ? "post" : "posts"}`,
                }))}
              />
            </div>
          )}

          {data.recommendations.length > 0 && (
            <div className="space-y-3">
              <SectionLabel className="text-gold">
                What the numbers suggest
              </SectionLabel>
              <Insights recommendations={data.recommendations} />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
