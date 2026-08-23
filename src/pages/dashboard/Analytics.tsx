import { AiUsagePanel } from "@/components/dashboard/AiUsagePanel";
import { ConnectedAccountsPanel } from "@/components/dashboard/ConnectedAccountsPanel";
import { PostingPlanPanel } from "@/components/dashboard/PostingPlanPanel";
import { SocialPerformancePanel } from "@/components/dashboard/SocialPerformancePanel";
import { WebsiteAnalyticsPanel } from "@/components/dashboard/WebsiteAnalyticsPanel";
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
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="line-accent">Analytics</p>
          <h1 className="heading-section font-display italic mt-2">
            Proof the machine works
          </h1>
          <p className="text-secondary mt-1">
            Every number here is measured — readership as it happens, social
            performance as each platform reports it back.
          </p>
        </div>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[...ranges]}
        />
      </div>

      <WebsiteAnalyticsPanel days={days} />
      <PostingPlanPanel days={days} />
      <ConnectedAccountsPanel days={days} />
      <SocialPerformancePanel days={days} />
      <AiUsagePanel days={days} />
    </div>
  );
};

export default DashboardAnalytics;
