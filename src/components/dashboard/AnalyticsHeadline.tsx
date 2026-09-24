import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import {
  useAnalyticsOverview,
  useAnalyticsSummary,
} from "@/hooks/useAnalytics";
import { percent, windowStartDate } from "@/lib/analyticsWindow";
import { compactNumber } from "@/lib/numberFormat";
import { BookOpenCheck, Eye, HeartHandshake, Radio } from "lucide-react";

const UNAVAILABLE = "—";

export function AnalyticsHeadline({ days }: Readonly<{ days: number }>) {
  const from = windowStartDate(days);
  const summary = useAnalyticsSummary({ from });
  const overview = useAnalyticsOverview({ from });

  const website = summary.data;
  const platforms = overview.data?.platforms ?? [];
  const reach = platforms.reduce((total, row) => total + row.reach, 0);
  const engagements = platforms.reduce(
    (total, row) => total + row.engagements,
    0,
  );
  const socialLoaded = overview.data !== undefined;

  const stats: StripStat[] = [
    {
      label: "Website views",
      value: website ? compactNumber(website.views) : UNAVAILABLE,
      icon: Eye,
      hint: website
        ? `${compactNumber(website.uniqueViews)} unique readers`
        : "Website numbers unavailable",
    },
    {
      label: "Read through",
      value: website ? percent(website.readCompletionRate) : UNAVAILABLE,
      icon: BookOpenCheck,
      tone:
        website && website.readCompletionRate >= 0.4 ? "success" : "default",
      hint: website
        ? `${compactNumber(website.readCompletions)} finished an article`
        : "Website numbers unavailable",
    },
    {
      label: "Social reach",
      value: socialLoaded ? compactNumber(reach) : UNAVAILABLE,
      icon: Radio,
      hint: socialLoaded
        ? `Across ${platforms.length} ${platforms.length === 1 ? "platform" : "platforms"}`
        : "Social numbers unavailable",
    },
    {
      label: "Social engagement",
      value: socialLoaded ? compactNumber(engagements) : UNAVAILABLE,
      icon: HeartHandshake,
      tone: engagements > 0 ? "success" : "default",
      hint:
        socialLoaded && reach > 0
          ? `${percent(engagements / reach)} of people reached`
          : "Likes, comments, shares and saves",
    },
  ];

  return (
    <StatStrip
      variant="tiles"
      stats={stats}
      loading={summary.isLoading || overview.isLoading}
    />
  );
}
