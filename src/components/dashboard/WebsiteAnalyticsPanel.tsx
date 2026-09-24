import { BarList } from "@/components/ui/bar-list";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { RankedList } from "@/components/ui/ranked-list";
import {
  SectionCard,
  SectionCardSkeleton,
  SectionLabel,
} from "@/components/ui/section-card";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { percent, windowStartDate } from "@/lib/analyticsWindow";
import { compactNumber } from "@/lib/numberFormat";
import type {
  AnalyticsSummary,
  SharePlatform,
  ViewSource,
} from "@/services/analyticsService";
import { BookOpenCheck, Globe } from "lucide-react";

const SOURCE_LABELS: Record<ViewSource, string> = {
  direct: "Direct",
  search: "Search",
  social: "Social",
  newsletter: "Newsletter",
  referral: "Referral",
};

const SHARE_LABELS: Record<SharePlatform, string> = {
  facebook: "Facebook",
  twitter: "X",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Other",
};

const SHARE_ICON: Record<SharePlatform, string> = {
  facebook: "facebook",
  twitter: "x",
  linkedin: "linkedin",
  whatsapp: "whatsapp",
  other: "other",
};

const LOAD_ERROR =
  "content-service is not answering. Check that it is running.";

function shareTotal(summary: AnalyticsSummary): number {
  return Object.values(summary.shares).reduce(
    (total, value) => total + value,
    0,
  );
}

function useWebsiteSummary(days: number) {
  return useAnalyticsSummary({ from: windowStartDate(days) });
}

export function WebsiteTrafficPanel({ days }: Readonly<{ days: number }>) {
  const query = useWebsiteSummary(days);

  if (query.isLoading) {
    return <SectionCardSkeleton rows={5} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="Website traffic" icon={Globe}>
        <ErrorState
          title="Could not load website traffic"
          description={LOAD_ERROR}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const data = query.data;
  const shares = shareTotal(data);
  const sources = (Object.entries(data.sources) as Array<[ViewSource, number]>)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
  const shareRows = (
    Object.entries(data.shares) as Array<[SharePlatform, number]>
  )
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <SectionCard
      title="Website traffic"
      icon={Globe}
      iconTone="primary"
      description={`${compactNumber(data.uniqueViews)} unique readers · ${data.articlesPublished} articles published · ${compactNumber(shares)} shares`}
    >
      {data.views === 0 && shares === 0 ? (
        <EmptyState
          icon={Globe}
          variant="compact"
          title="No readership recorded in this window yet. The website reports views as readers arrive."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <SectionLabel>Where readers came from</SectionLabel>
            {sources.length === 0 ? (
              <p className="text-xs text-muted-foreground">No views yet.</p>
            ) : (
              <BarList
                max={data.views}
                items={sources.map(([key, value]) => ({
                  key,
                  label: SOURCE_LABELS[key],
                  value,
                  display: compactNumber(value),
                  meta:
                    data.views > 0 ? percent(value / data.views) : undefined,
                }))}
              />
            )}
          </div>
          <div className="space-y-3">
            <SectionLabel>Where it was shared</SectionLabel>
            {shareRows.length === 0 ? (
              <p className="text-xs text-muted-foreground">No shares yet.</p>
            ) : (
              <BarList
                tone="emerald"
                max={shares}
                items={shareRows.map(([key, value]) => ({
                  key,
                  label: SHARE_LABELS[key],
                  value,
                  display: compactNumber(value),
                  leading: (
                    <PlatformIcon
                      platform={SHARE_ICON[key]}
                      className="h-3.5 w-3.5"
                    />
                  ),
                }))}
              />
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

export function BestReadPanel({ days }: Readonly<{ days: number }>) {
  const query = useWebsiteSummary(days);

  if (query.isLoading) {
    return <SectionCardSkeleton rows={5} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="Best read on the website" icon={BookOpenCheck}>
        <ErrorState
          title="Could not load the best read articles"
          description={LOAD_ERROR}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const posts = query.data.topPosts;

  return (
    <SectionCard
      title="Best read on the website"
      icon={BookOpenCheck}
      iconTone="success"
      description="Ranked by views in this window"
    >
      {posts.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          variant="compact"
          title="No article has been read in this window yet."
        />
      ) : (
        <RankedList
          items={posts.map((row) => ({
            key: row.mediaPostId,
            title: row.post?.title ?? "Untitled",
            meta: [
              `${compactNumber(row.uniqueViews)} unique`,
              `${percent(row.completionRate)} read through`,
              `${compactNumber(row.shares)} shares`,
            ].join(" · "),
            value: compactNumber(row.views),
            valueLabel: "views",
          }))}
        />
      )}
    </SectionCard>
  );
}

export function WebsiteAnalyticsPanel({ days }: Readonly<{ days: number }>) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <WebsiteTrafficPanel days={days} />
      <BestReadPanel days={days} />
    </div>
  );
}
