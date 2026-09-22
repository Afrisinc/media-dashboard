import { AiUsagePanel } from "@/components/dashboard/AiUsagePanel";
import { ConnectedAccountsPanel } from "@/components/dashboard/ConnectedAccountsPanel";
import { PostingPlanPanel } from "@/components/dashboard/PostingPlanPanel";
import { SocialPerformancePanel } from "@/components/dashboard/SocialPerformancePanel";
import { WebsiteAnalyticsPanel } from "@/components/dashboard/WebsiteAnalyticsPanel";
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
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Analytics"
        title="Proof the machine works"
        titleClassName="font-display italic"
        subtitle="Every number here is measured — readership as it happens, social performance as each platform reports it back."
        action={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[...ranges]}
          />
        }
      />

      <WebsiteAnalyticsPanel days={days} />
      <PostingPlanPanel days={days} />
      <ConnectedAccountsPanel days={days} />
      <SocialPerformancePanel days={days} />
      <AiUsagePanel days={days} />
    </div>
  );
};

export default DashboardAnalytics;
