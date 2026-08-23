import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary } from "@/services/analyticsService";
import { BookOpenCheck, Eye, LineChart, Share2, Users } from "lucide-react";

const SOURCE_LABELS: Record<keyof AnalyticsSummary["sources"], string> = {
  direct: "Direct",
  search: "Search",
  social: "Social",
  newsletter: "Newsletter",
  referral: "Referral",
};

const SHARE_LABELS: Record<keyof AnalyticsSummary["shares"], string> = {
  facebook: "Facebook",
  twitter: "X",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Other",
};

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function Breakdown({
  title,
  entries,
  total,
}: {
  title: string;
  entries: Array<[string, number]>;
  total: number;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-dim-5">
        {title}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {entries.map(([label, value]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-20 flex-shrink-0 text-xs text-muted-foreground">
              {label}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
              <span
                className="block h-full rounded-full bg-primary"
                style={{
                  width: total > 0 ? `${(value / total) * 100}%` : "0%",
                }}
              />
            </span>
            <span className="w-10 flex-shrink-0 text-right text-xs font-bold tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WebsiteAnalyticsPanel({ days }: { days: number }) {
  const from = new Date(Date.now() - days * 86400000)
    .toISOString()
    .slice(0, 10);
  const { data, isLoading, isError } = useAnalyticsSummary({ from });

  if (isLoading) {
    return <Skeleton className="h-56 w-full" />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={LineChart}
        title="Could not load analytics"
        description="content-service is not answering. Check that it is running, then reload."
      />
    );
  }

  const sources = Object.entries(data.sources) as Array<
    [keyof AnalyticsSummary["sources"], number]
  >;
  const shares = Object.entries(data.shares) as Array<
    [keyof AnalyticsSummary["shares"], number]
  >;
  const shareTotal = shares.reduce((total, [, value]) => total + value, 0);

  const stats: StripStat[] = [
    { label: "Views", value: String(data.views), icon: Eye },
    { label: "Unique", value: String(data.uniqueViews), icon: Users },
    {
      label: "Read through",
      value: percent(data.readCompletionRate),
      icon: BookOpenCheck,
      tone: data.readCompletionRate >= 0.4 ? "success" : "default",
    },
    { label: "Shares", value: String(shareTotal), icon: Share2 },
    {
      label: "Published",
      value: String(data.articlesPublished),
      icon: LineChart,
    },
  ];

  const measured = data.views > 0 || shareTotal > 0;

  return (
    <div className="space-y-4">
      <StatStrip stats={stats} />

      {!measured && (
        <div className="rounded-xl border border-dashed border-border px-5 py-4 text-xs text-muted-foreground">
          No website readership recorded in this window yet — the site reports
          views as readers arrive.
        </div>
      )}

      {measured && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <Breakdown
                title="Where readers came from"
                entries={sources.map(([key, value]) => [
                  SOURCE_LABELS[key],
                  value,
                ])}
                total={data.views}
              />
              <Breakdown
                title="Where it was shared"
                entries={shares.map(([key, value]) => [
                  SHARE_LABELS[key],
                  value,
                ])}
                total={shareTotal}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-dim-5">
                Best read
              </p>

              {data.topPosts.length === 0 && (
                <EmptyState
                  icon={BookOpenCheck}
                  variant="compact"
                  title="No post has been read yet in this window."
                />
              )}

              <div className="mt-2.5 space-y-1.5">
                {data.topPosts.map((row) => (
                  <ListRow
                    key={row.mediaPostId}
                    className="rounded-lg border border-border bg-inset px-3 py-2"
                  >
                    <div className="min-w-[120px] flex-1">
                      <p className="truncate text-xs font-bold">
                        {row.post?.title ?? "Untitled"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-dim-5">
                        {row.uniqueViews} unique · {percent(row.completionRate)}{" "}
                        read through
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {row.views} views
                    </Badge>
                    <span
                      className={cn(
                        "w-12 flex-shrink-0 text-right text-xs tabular-nums",
                        row.shares > 0 ? "text-emerald" : "text-dim-6",
                      )}
                    >
                      {row.shares} ↗
                    </span>
                  </ListRow>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
