import { BrandSelect } from "@/components/dashboard/BrandSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { usePostingPlan, useSuggestPostIdeas } from "@/hooks/useAnalytics";
import { describeApiError } from "@/lib/apiFetch";
import { windowStartDate } from "@/lib/analyticsWindow";
import { platformLabel } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { FORMAT_LABELS, type PostFormatName } from "@/types/postAgent";
import type {
  PlanConfidence,
  PlannedSlot,
  PostIdea,
  Recommendation,
  ScoreMetric,
} from "@/services/analyticsService";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Clock,
  Layers,
  Loader2,
  Radio,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const RECOMMENDATION_ICON = {
  timing: Clock,
  format: Layers,
  platform: Radio,
  volume: BarChart3,
  intent: Bookmark,
} as const;

const MAX_BRIEF_TOPIC = 200;

const scoreLabel = (value: number, metric: ScoreMetric) =>
  metric === "rate"
    ? `${(value * 100).toFixed(1)}% eng. rate`
    : `${Math.round(value)} / post`;

function briefTopic(idea: PostIdea) {
  const full = `${idea.hook} — ${idea.angle}`;
  return full.length <= MAX_BRIEF_TOPIC ? full : idea.hook;
}

function writeLink(idea: PostIdea, groupId: string | undefined) {
  const params = new URLSearchParams({
    compose: "agent",
    topic: briefTopic(idea),
    format: idea.format,
  });
  if (groupId) params.set("groupId", groupId);
  return `/studio?${params.toString()}`;
}

const MIN_POSTS_FOR_SUGGESTIONS = 6;

const formatLabel = (format: string) =>
  FORMAT_LABELS[format as PostFormatName] ?? format;

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

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
  idea,
  groupId,
}: Readonly<{
  slot: PlannedSlot;
  timeZone: string;
  idea?: PostIdea;
  groupId?: string;
}>) {
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
            className="px-1.5 py-0 text-[10px] font-normal"
          >
            {formatLabel(slot.format)}
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
        {idea && (
          <div className="mt-2 space-y-1 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2">
            <p className="text-sm font-semibold leading-snug">“{idea.hook}”</p>
            <p className="text-xs text-muted-foreground">{idea.angle}</p>
            <Button
              asChild
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
            >
              <Link to={writeLink(idea, groupId)}>
                Write this post
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

function Insights({
  recommendations,
  postsAnalysed,
}: Readonly<{ recommendations: Recommendation[]; postsAnalysed: number }>) {
  if (recommendations.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {postsAnalysed < MIN_POSTS_FOR_SUGGESTIONS
          ? `Suggestions start once ${MIN_POSTS_FOR_SUGGESTIONS} posts have two days of numbers behind them. ${plural(postsAnalysed, "post")} so far.`
          : "Nothing stands out yet: no time, format or platform is clearly ahead of the rest. Keep posting on the plan and this will sharpen."}
      </p>
    );
  }

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

function IdeasControl({
  hasIdeas,
  pending,
  error,
  onSuggest,
}: Readonly<{
  hasIdeas: boolean;
  pending: boolean;
  error: unknown;
  onSuggest: (refresh: boolean) => void;
}>) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        variant={hasIdeas ? "outline" : "default"}
        disabled={pending}
        onClick={() => onSuggest(hasIdeas)}
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : hasIdeas ? (
          <RefreshCw className="mr-2 h-4 w-4" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {hasIdeas ? "Fresh ideas" : "Suggest an opening line for each post"}
      </Button>
      {error ? (
        <p className="text-xs text-destructive">{describeApiError(error)}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {hasIdeas
            ? "Written from your brand and these numbers. Check any claim before it goes out."
            : "AI drafts a hook and angle for each slot, grounded in your brand and results."}
        </p>
      )}
    </div>
  );
}

export function PostingPlanPanel({ days }: Readonly<{ days: number }>) {
  const [groupId, setGroupId] = useState("");
  const from = windowStartDate(days);
  const query = usePostingPlan({ from, groupId: groupId || undefined });
  const ideas = useSuggestPostIdeas();
  const [ideasFor, setIdeasFor] = useState("");
  const planKey = `${groupId}|${from}`;
  const currentIdeas = ideasFor === planKey ? ideas.data?.ideas : undefined;

  const suggest = (refresh: boolean) => {
    setIdeasFor(planKey);
    ideas.mutate({ from, groupId: groupId || undefined, refresh });
  };

  const brandPicker = (
    <BrandSelect
      value={groupId}
      onChange={setGroupId}
      defaultLabel="Default brand"
      showLivePages={false}
      ariaLabel="Brand to plan for"
      triggerClassName="h-8 w-[160px] text-xs"
    />
  );

  if (query.isLoading) {
    return <SectionCardSkeleton rows={4} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard
        title="What to post next"
        icon={Sparkles}
        iconTone="gold"
        action={brandPicker}
      >
        <ErrorState
          title="Could not build a plan"
          description={describeApiError(query.error)}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const data = query.data;
  const metric = data.metric ?? "count";
  const confidence = CONFIDENCE_COPY[data.confidence];
  const collecting =
    (data.postsPublished ?? data.postsAnalysed) - data.postsAnalysed;
  const posts = `${plural(data.postsAnalysed, "post")} with settled numbers${collecting > 0 ? ` (${collecting} newer still collecting)` : ""}`;
  const ideaFor = new Map(
    (currentIdeas ?? []).map((idea) => [idea.slot, idea]),
  );

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
        <div className="flex flex-wrap items-center gap-2">
          {brandPicker}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              confidence.tone,
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            {confidence.label}
          </span>
        </div>
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
        <div className="space-y-3">
          <ol className="divide-y divide-border/60">
            {data.slots.map((slot, index) => (
              <SlotRow
                key={`${slot.when}-${slot.platform}-${index}`}
                slot={slot}
                timeZone={data.timeZone}
                idea={ideaFor.get(index)}
                groupId={groupId || data.brand?.id}
              />
            ))}
          </ol>
          {data.brand && (
            <IdeasControl
              hasIdeas={Boolean(currentIdeas?.length)}
              pending={ideas.isPending}
              error={ideasFor === planKey ? ideas.error : null}
              onSuggest={suggest}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 border-t border-border/60 pt-5 lg:grid-cols-2">
        {data.topics.length > 0 && (
          <div className="space-y-3">
            <SectionLabel>What has been landing</SectionLabel>
            <BarList
              tone="emerald"
              items={data.topics.map((topic) => {
                const score = topic.score ?? topic.averageEngagement;
                return {
                  key: topic.topic,
                  label: topic.topic,
                  value: score,
                  display: scoreLabel(
                    score,
                    topic.score === undefined ? "count" : metric,
                  ),
                  meta: plural(topic.posts, "post"),
                };
              })}
            />
          </div>
        )}

        <div className="space-y-3">
          <SectionLabel className="text-gold">
            What the numbers suggest
          </SectionLabel>
          <Insights
            recommendations={data.recommendations}
            postsAnalysed={data.postsAnalysed}
          />
        </div>
      </div>
    </SectionCard>
  );
}
