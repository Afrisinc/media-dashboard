import { RunFailurePanel } from "@/components/dashboard/RunFailurePanel";
import { RunStallNotice } from "@/components/dashboard/RunStallNotice";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useElapsed } from "@/hooks/useElapsed";
import { formatDurationMs } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
import {
  runProgress,
  RUN_STATUS_LABELS,
  RUN_STATUS_VARIANT,
  STEP_STATUS_RAIL,
  STEP_STATUS_TONE,
  type AgentRun,
  type AgentRunStep,
} from "@/types/accountGroup";
import { AlertCircle, Check, Loader2, Minus } from "lucide-react";

function StepIcon({ status }: { status: AgentRunStep["status"] }) {
  if (status === "running") return <Loader2 className="h-3 w-3 animate-spin" />;
  if (status === "succeeded") return <Check className="h-3 w-3" />;
  if (status === "failed") return <AlertCircle className="h-3 w-3" />;
  if (status === "skipped") return <Minus className="h-3 w-3" />;
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}

/** A stage still going counts up live; a finished one shows what it took. */
function StepDuration({ step }: { step: AgentRunStep }) {
  const live = useElapsed(step.startedAt, step.status === "running");

  if (step.status === "running") {
    return <span className="tabular-nums">{formatDurationMs(live)}</span>;
  }
  if (step.durationMs !== null) {
    return (
      <span className="tabular-nums">{formatDurationMs(step.durationMs)}</span>
    );
  }
  return null;
}

function StepCard({ step }: { step: AgentRunStep }) {
  const body = step.errorMessage ?? step.detail;

  return (
    <div
      className={cn(
        "w-[164px] flex-shrink-0 rounded-xl border p-3.5 transition-colors",
        STEP_STATUS_TONE[step.status],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wider">
          {step.label}
        </p>
        <StepIcon status={step.status} />
      </div>

      <p
        className={cn(
          "mt-1.5 line-clamp-2 min-h-[2rem] text-xs font-semibold",
          step.errorMessage ? "text-destructive" : "text-foreground",
          !body && "text-dim-6",
        )}
      >
        {body ?? "—"}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-80">
        <StepDuration step={step} />
      </p>
    </div>
  );
}

interface AgentRunTimelineProps {
  run: AgentRun;
  /** Shown above the rail; omit when the surrounding card already says it. */
  showHeader?: boolean;
  className?: string;
}

export function AgentRunTimeline({
  run,
  showHeader = true,
  className,
}: AgentRunTimelineProps) {
  const active = run.status === "running";
  const liveTotal = useElapsed(run.startedAt, active);
  const total = active ? liveTotal : run.durationMs;
  const progress = runProgress(run);
  const steps = [...run.steps].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[180px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold">
                {run.topic ?? `${run.agent} run`}
              </p>
              <Badge variant={RUN_STATUS_VARIANT[run.status]}>
                {RUN_STATUS_LABELS[run.status]}
              </Badge>
              {active && (
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Live
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {run.groupName ? `${run.groupName} · ` : ""}
              {run.trigger === "autopilot" ? "agents" : "you"} ·{" "}
              {run.accountsTargeted > 0
                ? `${run.accountsTargeted} page${run.accountsTargeted === 1 ? "" : "s"}`
                : "no page yet"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">
              {formatDurationMs(total)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-dim-5">
              {active ? "elapsed" : "total"}
            </p>
          </div>
        </div>
      )}

      <Progress value={progress} className="h-1" />

      <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-2">
            <StepCard step={step} />
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 flex-shrink-0 transition-colors",
                  STEP_STATUS_RAIL[step.status],
                )}
              />
            )}
          </div>
        ))}
      </div>

      {active && <RunStallNotice run={run} />}

      {run.status === "failed" && <RunFailurePanel run={run} />}
    </div>
  );
}
