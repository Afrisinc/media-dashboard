import { AgentRunRow } from "@/components/dashboard/AgentRunRow";
import { AgentRunTimeline } from "@/components/dashboard/AgentRunTimeline";
import { AutomationModeCard } from "@/components/dashboard/AutomationModeCard";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import {
  useActiveAgentRun,
  useAgentRuns,
  useAutomationSummary,
} from "@/hooks/useAutomation";
import { formatDurationMs } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
import {
  deservesDetail,
  describeCadence,
  groupTone,
  RUN_STATUS_DOT,
  RUN_STATUS_LABELS,
  RUN_STATUS_VARIANT,
} from "@/types/accountGroup";
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Radio,
  ServerCrash,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const RUN_LIMIT = 12;

const DashboardAutomation = () => {
  const { data: groups, isLoading: groupsLoading } = useAccountGroups();
  const {
    data: runPage,
    isLoading: runsLoading,
    isError,
  } = useAgentRuns({ limit: RUN_LIMIT });
  const { data: summary } = useAutomationSummary();
  const { data: activeRun } = useActiveAgentRun();

  const runs = runPage?.items ?? [];
  const liveRun =
    activeRun ?? runs.find((run) => run.status === "running") ?? runs[0];
  const autopilotGroups = (groups ?? []).filter(
    (group) => group.autopilotEnabled,
  );

  // Open when something is going or went wrong; a clean finish gets one line.
  // Derived rather than stored, so a new run reverts to the sensible default
  // while a deliberate toggle still sticks for the run it was made on.
  const [override, setOverride] = useState<{
    runId: string;
    open: boolean;
  } | null>(null);
  const showDetail =
    liveRun && override?.runId === liveRun.id
      ? override.open
      : Boolean(liveRun && deservesDetail(liveRun));

  const succeeded = summary?.succeeded ?? 0;
  const failed = summary?.failed ?? 0;
  const skipped = summary?.skipped ?? 0;
  const attempted = succeeded + failed;
  const successRate =
    attempted === 0 ? "—" : `${Math.round((succeeded / attempted) * 100)}%`;

  const stats: StripStat[] = [
    {
      label: "Shipped today",
      value: String(succeeded),
      icon: CheckCircle2,
      tone: succeeded > 0 ? "success" : "default",
    },
    { label: "Success rate", value: successRate, icon: Radio },
    {
      label: "Needs a look",
      value: String(failed),
      icon: AlertTriangle,
      tone: failed > 0 ? "danger" : "default",
    },
    { label: "Skipped", value: String(skipped), icon: Inbox },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="Automation"
        subtitle="What the agents run, when they run it, and where it lands."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/brands">
              <Building2 className="mr-1.5 h-4 w-4" />
              Manage brands
            </Link>
          </Button>
        }
      />

      <AutomationModeCard />
      <StatStrip stats={stats} />

      <Card className="overflow-hidden">
        {runsLoading && !liveRun && <Skeleton className="h-16 w-full" />}

        {!runsLoading && !liveRun && (
          <EmptyState
            icon={Workflow}
            variant="compact"
            title="No agent has run yet. Brief one from Post Studio, or hit “Run agents now”."
          />
        )}

        {liveRun && (
          <>
            <button
              type="button"
              onClick={() =>
                setOverride({ runId: liveRun.id, open: !showDetail })
              }
              aria-expanded={showDetail}
              className="flex w-full flex-wrap items-center gap-3 px-5 py-3.5 text-left hover:bg-inset"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
                  showDetail && "rotate-90",
                )}
              />
              <span
                className={cn(
                  "h-2 w-2 flex-shrink-0 rounded-full",
                  RUN_STATUS_DOT[liveRun.status],
                  liveRun.status === "running" && "animate-pulse",
                )}
              />
              <span className="min-w-[160px] flex-1">
                <span className="block truncate text-sm font-bold">
                  {liveRun.topic ?? "Latest run"}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-dim-5">
                  {liveRun.groupName ?? "—"} ·{" "}
                  {liveRun.trigger === "autopilot" ? "agents" : "you"} ·{" "}
                  {liveRun.steps.filter((s) => s.status === "succeeded").length}
                  /{liveRun.steps.length} stages
                </span>
              </span>
              <span className="flex-shrink-0 text-sm font-bold tabular-nums">
                {formatDurationMs(liveRun.durationMs)}
              </span>
              <Badge
                variant={RUN_STATUS_VARIANT[liveRun.status]}
                className="flex-shrink-0"
              >
                {RUN_STATUS_LABELS[liveRun.status]}
              </Badge>
            </button>

            {showDetail && (
              <div className="border-t border-border/50 px-5 py-4">
                <AgentRunTimeline run={liveRun} showHeader={false} />
              </div>
            )}
          </>
        )}
      </Card>

      {autopilotGroups.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {autopilotGroups.map((group) => (
            <Card
              key={group.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                  groupTone(group.color),
                )}
              >
                {group.name
                  .replace(/[^A-Za-z]/g, "")
                  .slice(0, 2)
                  .toUpperCase() || "BR"}
              </span>
              <div className="min-w-[110px] flex-1">
                <p className="truncate text-xs font-bold">{group.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-dim-5">
                  {describeCadence(group)}
                </p>
              </div>
              <span className="flex-shrink-0 text-[11px] text-dim-6">
                {group.topics.length} topics · {group.activeMemberCount} live
              </span>
            </Card>
          ))}
        </div>
      )}

      {!groupsLoading && autopilotGroups.length === 0 && (
        <EmptyState
          icon={Bot}
          variant="compact"
          title="No brand is running itself yet — switch the agents on for one with topics and a live page."
        />
      )}

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Recent runs</h2>
          <span className="text-xs text-dim-6">
            {runPage?.total ?? 0} logged
          </span>
        </div>

        {isError && (
          <EmptyState
            icon={ServerCrash}
            variant="compact"
            title="Could not load the run log."
          />
        )}

        {runsLoading && <Skeleton className="h-24 w-full" />}

        <div className="flex flex-col gap-1.5">
          {runs.map((run) => (
            <AgentRunRow key={run.id} run={run} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardAutomation;
