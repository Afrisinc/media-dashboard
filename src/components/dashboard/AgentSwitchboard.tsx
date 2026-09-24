import { ArrowRight, ServerCrash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconBox } from "@/components/ui/icon-box";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { Switch } from "@/components/ui/switch";
import { useAgents, useUpdateAgent } from "@/hooks/useAutomation";
import { AGENT_ICONS, describeTrigger } from "@/lib/agents";
import { describeCron } from "@/lib/cron";
import { formatDateShort } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
import { describeError } from "@/services/accountGroupService";
import {
  AGENT_SCOPE_LABELS,
  type AgentKey,
  type AgentLastRun,
  type AgentStatus,
} from "@/types/agents";

const LAST_RUN_TONE: Record<AgentLastRun["status"], string> = {
  running: "text-primary",
  succeeded: "text-foreground/80",
  failed: "text-destructive",
  skipped: "text-muted-foreground",
};

function LastRunLine({
  run,
  runsToday,
  onShow,
}: Readonly<{
  run: AgentLastRun | null;
  runsToday: number;
  onShow: () => void;
}>) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
      <p
        className={cn(
          "min-w-0 text-xs",
          run ? LAST_RUN_TONE[run.status] : "text-muted-foreground",
        )}
      >
        {run
          ? [
              run.status === "running"
                ? "Running now"
                : `Last run ${formatDateShort(run.finishedAt ?? run.startedAt)}`,
              describeTrigger(run.trigger).toLowerCase(),
              run.summary,
            ]
              .filter(Boolean)
              .join(" · ")
          : "No runs yet"}
      </p>
      {run && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={onShow}
        >
          {runsToday > 0 ? `View runs (${runsToday} today)` : "View runs"}
          <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
        </Button>
      )}
    </div>
  );
}

interface StatusLine {
  label: string;
  dot: string;
  text: string;
}

function statusLine(agent: AgentStatus): StatusLine {
  if (agent.active) {
    return agent.enabled
      ? { label: "Running", dot: "bg-emerald", text: "text-emerald" }
      : {
          label: "Running — switched on by someone else in the workspace",
          dot: "bg-emerald",
          text: "text-emerald",
        };
  }
  switch (agent.blockedBy) {
    case "server":
      return {
        label: "Turned off on the server",
        dot: "bg-muted-foreground",
        text: "text-muted-foreground",
      };
    case "autopilot":
      return {
        label: "Waiting for Agents drive",
        dot: "bg-amber",
        text: "text-amber",
      };
    default:
      return {
        label: "Off",
        dot: "bg-muted-foreground/60",
        text: "text-muted-foreground",
      };
  }
}

interface AgentRowProps {
  agent: AgentStatus;
  saving: boolean;
  onToggle: (enabled: boolean) => void;
  onShowRuns: () => void;
}

function AgentRow({
  agent,
  saving,
  onToggle,
  onShowRuns,
}: Readonly<AgentRowProps>) {
  const status = statusLine(agent);
  const switchId = `agent-switch-${agent.key}`;

  return (
    <li className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <IconBox
        icon={AGENT_ICONS[agent.key]}
        tone={agent.active ? "primary" : "muted"}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={switchId} className="font-semibold">
            {agent.name}
          </label>
          <Badge variant="outline" className="font-normal">
            {AGENT_SCOPE_LABELS[agent.scope]}
          </Badge>
          {agent.requiresAutopilot && (
            <Badge variant="secondary" className="font-normal">
              Needs Agents drive
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
        <p className="text-xs text-muted-foreground">
          {agent.schedules
            .map(
              (schedule) => `${schedule.label} ${describeCron(schedule.cron)}`,
            )
            .join(" · ")}
        </p>
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            status.text,
          )}
          aria-live="polite"
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
            aria-hidden
          />
          {status.label}
        </p>
        <LastRunLine
          run={agent.lastRun}
          runsToday={agent.runsToday}
          onShow={onShowRuns}
        />
      </div>
      <Switch
        id={switchId}
        checked={agent.enabled}
        disabled={!agent.allowedByServer || saving}
        onCheckedChange={onToggle}
        aria-describedby={`${switchId}-hint`}
        className="mt-1"
      />
      <span id={`${switchId}-hint`} className="sr-only">
        {status.label}
      </span>
    </li>
  );
}

interface AgentSwitchboardProps {
  onShowRuns: (key: AgentKey) => void;
}

export function AgentSwitchboard({
  onShowRuns,
}: Readonly<AgentSwitchboardProps>) {
  const { data: agents, isLoading, isError, error } = useAgents();
  const update = useUpdateAgent();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border/50 px-4 py-4 sm:px-5">
        <p className="font-semibold">Agents</p>
        <p className="text-sm text-muted-foreground">
          Choose which agents run. Agents marked “Needs Agents drive” only work
          while the workspace is on autopilot.
        </p>
      </div>

      {isLoading && (
        <div className="px-4 sm:px-5">
          <ListSkeleton rows={4} thumb label="Loading agents" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={ServerCrash}
          title="Could not load the agents"
          description={describeError(error)}
        />
      )}

      {agents && (
        <ul className="divide-y divide-border/50">
          {agents.map((agent) => (
            <AgentRow
              key={agent.key}
              agent={agent}
              saving={update.isPending}
              onToggle={(enabled) => update.mutate({ key: agent.key, enabled })}
              onShowRuns={() => onShowRuns(agent.key)}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
