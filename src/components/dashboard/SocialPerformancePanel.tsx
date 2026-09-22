import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";
import { compactNumber } from "@/lib/numberFormat";
import { cn } from "@/lib/utils";
import type { PlatformTotals, RankedPost } from "@/services/analyticsService";
import { BarChart3, Radio, Share2 } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
  twitter: "X",
  website: "Website",
};

const PLATFORM_DOT: Record<string, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-[#E1306C]",
  tiktok: "bg-[#25F4EE]",
  youtube: "bg-[#FF0000]",
  linkedin: "bg-[#0A66C2]",
  x: "bg-foreground",
  twitter: "bg-foreground",
  website: "bg-emerald",
};

function label(platform: string): string {
  return PLATFORM_LABEL[platform] ?? platform;
}

const CHART_CONFIG = {
  websiteViews: { label: "Website views", color: "hsl(var(--primary))" },
  socialEngagements: {
    label: "Social engagement",
    color: "hsl(var(--emerald))",
  },
};

function TrendChart({
  series,
}: {
  series: Array<{
    date: string;
    websiteViews: number;
    socialEngagements: number;
  }>;
}) {
  const measured = series.some(
    (point) => point.websiteViews > 0 || point.socialEngagements > 0,
  );

  if (!measured) {
    return (
      <EmptyState
        icon={BarChart3}
        variant="compact"
        title="No day in this window has recorded traffic yet."
      />
    );
  }

  return (
    <ChartContainer config={CHART_CONFIG} className="mt-3.5 h-56">
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          minTickGap={24}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          width={36}
          allowDecimals={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="websiteViews"
          stroke="var(--color-websiteViews)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="socialEngagements"
          stroke="var(--color-socialEngagements)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

function TopMedia({ posts }: { posts: RankedPost[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Share2}
        variant="compact"
        title="Nothing published in this window has reported engagement yet."
      />
    );
  }

  return (
    <div className="mt-3 space-y-1.5">
      {posts.map((post, index) => (
        <ListRow
          key={post.id}
          className="rounded-lg border border-border bg-inset px-3 py-2"
        >
          <span className="w-4 flex-shrink-0 text-xs tabular-nums text-dim-6">
            {index + 1}
          </span>
          {post.mediaType && (
            <Badge
              variant="secondary"
              className="flex-shrink-0 text-[10px] uppercase"
            >
              {post.mediaType}
            </Badge>
          )}
          <div className="min-w-[120px] flex-1">
            {post.postUrl ? (
              <a
                href={post.postUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-xs font-bold hover:underline"
              >
                {post.title}
              </a>
            ) : (
              <p className="truncate text-xs font-bold">{post.title}</p>
            )}
            <p className="mt-0.5 text-[11px] text-dim-5">
              {label(post.platform)} · {compactNumber(post.reach)} reach
            </p>
          </div>
          <span className="flex-shrink-0 text-xs font-bold tabular-nums">
            {compactNumber(post.engagements)}
          </span>
        </ListRow>
      ))}
    </div>
  );
}

function PlatformGrid({ platforms }: { platforms: PlatformTotals[] }) {
  if (platforms.length === 0) {
    return (
      <EmptyState
        icon={Radio}
        variant="compact"
        title="No social account is connected yet — install one from Settings to see it here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {platforms.map((platform) => (
        <Card key={platform.platform} className="p-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                PLATFORM_DOT[platform.platform] ?? "bg-muted-foreground",
              )}
            />
            {label(platform.platform)}
          </div>
          <p className="mt-2 text-lg font-extrabold tabular-nums">
            {compactNumber(platform.reach)}
          </p>
          <p className="mt-0.5 text-xs text-dim-4">
            {compactNumber(platform.engagements)} engagement · {platform.posts}{" "}
            post{platform.posts === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 text-[11px] text-dim-6">
            {platform.followers === null
              ? "followers not yet pulled"
              : `${compactNumber(platform.followers)} followers`}
          </p>
        </Card>
      ))}
    </div>
  );
}

export function SocialPerformancePanel({ days }: { days: number }) {
  const from = new Date(Date.now() - days * 86400000)
    .toISOString()
    .slice(0, 10);
  const { data, isLoading, isError } = useAnalyticsOverview({ from });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Could not load performance"
        description="content-service is not answering. Check that it is running, then reload."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-bold">Engagement over time</p>
            <TrendChart series={data.series} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-bold">Top performing media</p>
            <TopMedia posts={data.topMedia} />
          </CardContent>
        </Card>
      </div>

      <PlatformGrid platforms={data.platforms} />
    </div>
  );
}
