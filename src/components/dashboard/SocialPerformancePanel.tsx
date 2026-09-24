import { Badge } from "@/components/ui/badge";
import { BarList } from "@/components/ui/bar-list";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { RankedList } from "@/components/ui/ranked-list";
import { SectionCard, SectionCardSkeleton } from "@/components/ui/section-card";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";
import { windowStartDate } from "@/lib/analyticsWindow";
import { compactNumber } from "@/lib/numberFormat";
import { platformLabel } from "@/lib/platforms";
import type { SeriesPoint } from "@/services/analyticsService";
import { Activity, Radio, Trophy } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const LOAD_ERROR =
  "content-service is not answering. Check that it is running.";

const CHART_CONFIG = {
  websiteViews: { label: "Website views", color: "hsl(var(--primary))" },
  socialEngagements: {
    label: "Social engagement",
    color: "hsl(var(--emerald))",
  },
};

function useOverview(days: number) {
  return useAnalyticsOverview({ from: windowStartDate(days) });
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TrendChart({ series }: Readonly<{ series: SeriesPoint[] }>) {
  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto h-64 w-full">
      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} className="stroke-border/60" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickFormatter={shortDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          allowDecimals={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickFormatter={(value: number) => compactNumber(value)}
        />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={shortDate} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="websiteViews"
          stroke="var(--color-websiteViews)"
          fill="var(--color-websiteViews)"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="socialEngagements"
          stroke="var(--color-socialEngagements)"
          fill="var(--color-socialEngagements)"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function EngagementTrendPanel({
  days,
  className,
}: Readonly<{
  days: number;
  className?: string;
}>) {
  const query = useOverview(days);

  if (query.isLoading) {
    return <SectionCardSkeleton rows={6} className={className} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard
        title="Engagement over time"
        icon={Activity}
        className={className}
      >
        <ErrorState
          title="Could not load the trend"
          description={LOAD_ERROR}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const series = query.data.series;
  const measured = series.some(
    (point) => point.websiteViews > 0 || point.socialEngagements > 0,
  );

  return (
    <SectionCard
      title="Engagement over time"
      icon={Activity}
      iconTone="primary"
      description="Website views against social engagement, day by day"
      className={className}
    >
      {measured ? (
        <TrendChart series={series} />
      ) : (
        <EmptyState
          icon={Activity}
          variant="compact"
          title="No day in this window has recorded traffic yet."
        />
      )}
    </SectionCard>
  );
}

export function PlatformBreakdownPanel({
  days,
  className,
}: Readonly<{
  days: number;
  className?: string;
}>) {
  const query = useOverview(days);

  if (query.isLoading) {
    return <SectionCardSkeleton rows={6} className={className} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="Reach by platform" icon={Radio} className={className}>
        <ErrorState
          title="Could not load platforms"
          description={LOAD_ERROR}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const platforms = [...query.data.platforms].sort((a, b) => b.reach - a.reach);

  return (
    <SectionCard
      title="Reach by platform"
      icon={Radio}
      iconTone="primary"
      description="People reached, with engagement and posts"
      className={className}
    >
      {platforms.length === 0 ? (
        <EmptyState
          icon={Radio}
          variant="compact"
          title="No social account is connected yet. Connect one from Settings to see it here."
        />
      ) : (
        <BarList
          items={platforms.map((platform) => ({
            key: platform.platform,
            label: platformLabel(platform.platform),
            leading: (
              <PlatformIcon
                platform={platform.platform}
                className="h-3.5 w-3.5 flex-shrink-0"
              />
            ),
            value: platform.reach,
            display: compactNumber(platform.reach),
            meta: `${compactNumber(platform.engagements)} eng · ${platform.posts} ${platform.posts === 1 ? "post" : "posts"}`,
          }))}
        />
      )}
    </SectionCard>
  );
}

export function TopMediaPanel({ days }: Readonly<{ days: number }>) {
  const query = useOverview(days);

  if (query.isLoading) {
    return <SectionCardSkeleton rows={5} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="Top performing media" icon={Trophy}>
        <ErrorState
          title="Could not load top media"
          description={LOAD_ERROR}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const posts = query.data.topMedia;

  return (
    <SectionCard
      title="Top performing media"
      icon={Trophy}
      iconTone="gold"
      description="Ranked by engagement across every platform"
    >
      {posts.length === 0 ? (
        <EmptyState
          icon={Trophy}
          variant="compact"
          title="Nothing published in this window has reported engagement yet."
        />
      ) : (
        <RankedList
          items={posts.map((post) => ({
            key: post.id,
            title: post.title,
            href: post.postUrl,
            leading: (
              <PlatformIcon
                platform={post.platform}
                className="flex-shrink-0"
              />
            ),
            meta: (
              <>
                {platformLabel(post.platform)} · {compactNumber(post.reach)}{" "}
                reach
                {post.mediaType && (
                  <Badge
                    variant="outline"
                    className="ml-2 px-1.5 py-0 text-[10px] font-normal capitalize"
                  >
                    {post.mediaType}
                  </Badge>
                )}
              </>
            ),
            value: compactNumber(post.engagements),
            valueLabel: "engagement",
          }))}
        />
      )}
    </SectionCard>
  );
}

export function SocialPerformancePanel({ days }: Readonly<{ days: number }>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EngagementTrendPanel days={days} className="lg:col-span-2" />
        <PlatformBreakdownPanel days={days} />
      </div>
      <TopMediaPanel days={days} />
    </div>
  );
}
