import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { BarList } from "@/components/ui/bar-list";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  SectionCard,
  SectionCardSkeleton,
  SectionLabel,
} from "@/components/ui/section-card";
import { useAiUsageSummary } from "@/hooks/useAiUsage";
import { windowStartInstant } from "@/lib/analyticsWindow";
import { compactNumber } from "@/lib/numberFormat";
import type { UsageBreakdown } from "@/services/aiUsageService";
import { Bot, Coins, Cpu, Hash } from "lucide-react";

function money(usd: number): string {
  if (usd === 0) {
    return "$0";
  }
  return usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`;
}

function CostBreakdown({
  title,
  rows,
}: Readonly<{
  title: string;
  rows: UsageBreakdown[];
}>) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <SectionLabel>{title}</SectionLabel>
      <BarList
        items={[...rows]
          .sort((a, b) => b.costUsd - a.costUsd)
          .map((row) => ({
            key: row.key,
            label: row.key,
            value: row.costUsd,
            display: money(row.costUsd),
            meta: `${compactNumber(row.calls)} ${row.calls === 1 ? "call" : "calls"}`,
          }))}
      />
    </div>
  );
}

export function AiUsagePanel({ days }: Readonly<{ days: number }>) {
  const query = useAiUsageSummary({ from: windowStartInstant(days) });

  if (query.isLoading) {
    return <SectionCardSkeleton rows={4} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="What the agents cost" icon={Coins} iconTone="gold">
        <ErrorState
          title="Could not load AI usage"
          description="content-service is not answering. Check that it is running."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const { totals, byModel, byNode } = query.data;
  const perCall = totals.calls > 0 ? totals.costUsd / totals.calls : 0;

  const stats: StripStat[] = [
    { label: "AI calls", value: compactNumber(totals.calls), icon: Bot },
    {
      label: "Spend",
      value: money(totals.costUsd),
      icon: Coins,
      tone: totals.costUsd > 0 ? "attention" : "default",
    },
    {
      label: "Tokens in",
      value: compactNumber(totals.inputTokens),
      icon: Hash,
    },
    {
      label: "Tokens out",
      value: compactNumber(totals.outputTokens),
      icon: Cpu,
    },
  ];

  return (
    <SectionCard
      title="What the agents cost"
      icon={Coins}
      iconTone="gold"
      description={
        totals.calls > 0
          ? `About ${money(perCall)} per call across every model`
          : "Every copy, digest and image generation lands here as it runs"
      }
      contentClassName="space-y-6"
    >
      <StatStrip stats={stats} />

      {totals.calls === 0 ? (
        <EmptyState
          icon={Bot}
          variant="compact"
          title="No AI call recorded in this window."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CostBreakdown title="By model" rows={byModel} />
          <CostBreakdown title="By agent" rows={byNode} />
        </div>
      )}
    </SectionCard>
  );
}
