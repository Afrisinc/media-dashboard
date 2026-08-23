import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiUsageSummary } from "@/hooks/useAiUsage";
import { compactNumber } from "@/lib/numberFormat";
import type { UsageBreakdown } from "@/services/aiUsageService";
import { Bot, Coins, Cpu, Hash } from "lucide-react";

function money(usd: number): string {
  if (usd === 0) {
    return "$0";
  }
  return usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`;
}

function Breakdown({ title, rows }: { title: string; rows: UsageBreakdown[] }) {
  if (rows.length === 0) {
    return null;
  }

  const most = Math.max(...rows.map((row) => row.costUsd), 0.000001);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-dim-5">
        {title}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-3">
            <span className="w-28 flex-shrink-0 truncate text-xs">
              {row.key}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(row.costUsd / most) * 100}%` }}
              />
            </span>
            <span className="w-14 flex-shrink-0 text-right text-[11px] tabular-nums text-dim-5">
              {row.calls} calls
            </span>
            <span className="w-16 flex-shrink-0 text-right text-xs font-bold tabular-nums">
              {money(row.costUsd)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiUsagePanel({ days }: { days: number }) {
  const from = new Date(Date.now() - days * 86400000).toISOString();
  const { data, isLoading, isError } = useAiUsageSummary({ from });

  if (isLoading) {
    return <Skeleton className="h-44 w-full" />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={Bot}
        title="Could not load AI usage"
        description="content-service is not answering. Check that it is running, then reload."
      />
    );
  }

  const stats: StripStat[] = [
    { label: "AI calls", value: compactNumber(data.totals.calls), icon: Bot },
    {
      label: "Spend",
      value: money(data.totals.costUsd),
      icon: Coins,
      tone: data.totals.costUsd > 0 ? "attention" : "default",
    },
    {
      label: "Tokens in",
      value: compactNumber(data.totals.inputTokens),
      icon: Hash,
    },
    {
      label: "Tokens out",
      value: compactNumber(data.totals.outputTokens),
      icon: Cpu,
    },
  ];

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm font-bold">What the agents cost</p>

        <StatStrip stats={stats} />

        {data.totals.calls === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            No AI call recorded in this window. Every copy, digest and image
            generation lands here as it runs.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Breakdown title="By model" rows={data.byModel} />
            <Breakdown title="By agent" rows={data.byNode} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
