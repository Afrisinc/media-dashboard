import { AiUsagePanel } from "@/components/dashboard/AiUsagePanel";
import { AnalyticsHeadline } from "@/components/dashboard/AnalyticsHeadline";
import { ConnectedAccountsPanel } from "@/components/dashboard/ConnectedAccountsPanel";
import { PostingPlanPanel } from "@/components/dashboard/PostingPlanPanel";
import {
  EngagementTrendPanel,
  PlatformBreakdownPanel,
  TopMediaPanel,
} from "@/components/dashboard/SocialPerformancePanel";
import {
  BestReadPanel,
  WebsiteTrafficPanel,
} from "@/components/dashboard/WebsiteAnalyticsPanel";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useState } from "react";

const ranges = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
] as const;

const DashboardAnalytics = () => {
  const [range, setRange] = useState<(typeof ranges)[number]["value"]>("30d");
  const days = Number(range.replace("d", ""));

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        eyebrow="Analytics"
        title="Proof the machine works"
        titleClassName="font-display italic"
        subtitle={`Measured readership and social performance for the last ${days} days.`}
        action={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[...ranges]}
          />
        }
      />

      <AnalyticsHeadline days={days} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EngagementTrendPanel days={days} className="lg:col-span-2" />
        <PlatformBreakdownPanel days={days} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopMediaPanel days={days} />
        <BestReadPanel days={days} />
      </div>

      <WebsiteTrafficPanel days={days} />
      <ConnectedAccountsPanel days={days} />
      <PostingPlanPanel days={days} />
      <AiUsagePanel days={days} />
    </div>
  );
};

export default DashboardAnalytics;
