import { AgentRunRow } from "@/components/dashboard/AgentRunRow";
import { AgentRunTimeline } from "@/components/dashboard/AgentRunTimeline";
import { AutomationModeCard } from "@/components/dashboard/AutomationModeCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import {
  useActiveAgentRun,
  useAgentRuns,
  useAutomationSummary,
} from "@/hooks/useAutomation";
import { cn } from "@/lib/utils";
import { describeCadence, groupTone } from "@/types/accountGroup";
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  Inbox,
  Radio,
  ServerCrash,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

const RUN_LIMIT = 12;

/** The pipeline as it actually runs. The approval step only exists in manual mode. */
function pipelineSteps(autopilot: boolean) {
  return [
    {
      label: "Trigger",
      detail: autopilot ? "Cadence reached" : "You brief it",
      tone: "text-primary border-primary/40",
    },
    {
      label: "Write",
      detail: "Copy agent drafts",
      tone: "text-terra border-terra/40",
    },
    {
      label: "Render",
      detail: "Art direction + craft audit",
      tone: "text-indigo border-indigo/40",
    },
    autopilot
      ? {
          label: "Publish",
          detail: "Straight to the queue",
          tone: "text-forest border-forest/45",
        }
      : {
          label: "Approval",
          detail: "Waits for you",
          tone: "text-gold border-gold/40",
        },
    {
      label: "Fan out",
      detail: "Every live page",
      tone: "text-emerald border-emerald/40",
    },
  ];
}

const DashboardAutomation = () => {
  const { autopilot } = useAutopilot();
  const { data: groups, isLoading: groupsLoading } = useAccountGroups();
  const {
    data: runPage,
    isLoading: runsLoading,
    isError,
  } = useAgentRuns({ limit: RUN_LIMIT });
  const { data: summary } = useAutomationSummary();
  const { data: activeRun } = useActiveAgentRun();

  const runs = runPage?.items ?? [];
  // The server is the authority on what is in flight — that is what makes the
  // page resumable after leaving it, or opening it somewhere else.
  const liveRun =
    activeRun ?? runs.find((run) => run.status === "running") ?? runs[0];
  const autopilotGroups = (groups ?? []).filter(
    (group) => group.autopilotEnabled,
  );
  const steps = pipelineSteps(autopilot);

  const succeeded = summary?.succeeded ?? 0;
  const failed = summary?.failed ?? 0;
  const skipped = summary?.skipped ?? 0;
  const attempted = succeeded + failed;
  const successRate =
    attempted === 0 ? "—" : `${Math.round((succeeded / attempted) * 100)}%`;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        title="Automation"
        subtitle="What the agents run, when they run it, and where it lands."
        action={
          <Button asChild variant="outline">
            <Link to="/brands">
              <Building2 className="mr-1.5 h-4 w-4" />
              Manage brands
            </Link>
          </Button>
        }
      />

      <AutomationModeCard />

      <StatGrid>
        <StatCard
          label="Shipped today"
          value={String(succeeded)}
          icon={CheckCircle2}
          iconTone="success"
        />
        <StatCard label="Success rate" value={successRate} icon={Radio} />
        <StatCard
          label="Needs a look"
          value={String(failed)}
          icon={AlertTriangle}
          iconTone={failed > 0 ? "destructive" : "muted"}
        />
        <StatCard
          label="Skipped"
          value={String(skipped)}
          icon={Inbox}
          subtitle={skipped > 0 ? "Nothing to do, or capped" : undefined}
        />
      </StatGrid>

      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">
              {liveRun
                ? "Latest run"
                : autopilot
                  ? "Agents drive — end to end"
                  : "You drive — with one approval step"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {liveRun
                ? "Every stage, with what it took. Updates live while a run is going."
                : autopilot
                  ? "Nothing stops for a human. A draft that fails the craft audit still waits, so bad artwork never ships."
                  : "Every draft is held in review. Approve it and it releases to the publish queue."}
            </p>
          </div>
          <Badge variant={autopilot ? "default" : "secondary"}>
            {autopilot ? "Autopilot" : "Manual"}
          </Badge>
        </div>

        {runsLoading && !liveRun && <Skeleton className="h-40 w-full" />}

        {liveRun && <AgentRunTimeline run={liveRun} />}

        {!liveRun && !runsLoading && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1.5">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-[150px] flex-shrink-0 rounded-xl border bg-inset p-3.5",
                    step.tone,
                  )}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">
                    {step.label}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-foreground">
                    {step.detail}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-px w-8 flex-shrink-0 bg-border-6" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-bold">Brands on a schedule</h2>

        {groupsLoading && <Skeleton className="h-24 w-full" />}

        {!groupsLoading && autopilotGroups.length === 0 && (
          <EmptyState
            icon={Bot}
            title="No brand is running itself yet"
            description="Switch the agents on for a brand — it needs topics and at least one live page."
          />
        )}

        {autopilotGroups.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {autopilotGroups.map((group) => (
              <Card key={group.id} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold",
                      groupTone(group.color),
                    )}
                  >
                    {group.name
                      .replace(/[^A-Za-z]/g, "")
                      .slice(0, 2)
                      .toUpperCase() || "BR"}
                  </span>
                  <Badge
                    variant={
                      group.activeMemberCount > 0 ? "default" : "secondary"
                    }
                  >
                    {group.activeMemberCount > 0 ? "Active" : "No live pages"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-bold">{group.name}</p>
                <p className="mt-1 text-xs text-dim-4">
                  {describeCadence(group)}
                </p>
                <div className="mt-3.5 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="text-xs text-muted-foreground">
                    {group.topics.length} topic
                    {group.topics.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs text-dim-6">
                    {group.activeMemberCount} live page
                    {group.activeMemberCount === 1 ? "" : "s"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold">Recent runs</h2>
          <span className="text-xs text-dim-6">
            {runPage?.total ?? 0} run{runPage?.total === 1 ? "" : "s"} logged
          </span>
        </div>

        {isError && (
          <EmptyState
            icon={ServerCrash}
            variant="compact"
            title="Could not load the run log."
          />
        )}

        {runsLoading && <Skeleton className="h-32 w-full" />}

        {!runsLoading && !isError && runs.length === 0 && (
          <EmptyState
            icon={Workflow}
            variant="compact"
            title="No agent has run yet. Brief one from Post Studio, or hit “Run agents now”."
          />
        )}

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
