import { AgentRunTimeline } from "@/components/dashboard/AgentRunTimeline";
import { Badge } from "@/components/ui/badge";
import { useElapsed } from "@/hooks/useElapsed";
import { formatDateShort, formatDurationMs } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
import {
  runProgress,
  RUN_STATUS_DOT,
  RUN_STATUS_LABELS,
  RUN_STATUS_VARIANT,
  type AgentRun,
} from "@/types/accountGroup";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

/** A run still going counts up; a finished one shows what it took. */
function RunDuration({ run }: { run: AgentRun }) {
  const active = run.status === "running";
  const live = useElapsed(run.startedAt, active);
  return (
    <span className="tabular-nums">
      {formatDurationMs(active ? live : run.durationMs)}
    </span>
  );
}

export function AgentRunRow({ run }: { run: AgentRun }) {
  const [open, setOpen] = useState(false);
  const active = run.status === "running";
  const progress = runProgress(run);
  const current = run.steps.find((step) => step.status === "running");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-sunk-2 transition-colors",
        active ? "border-primary/35" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-3 px-3.5 py-2.5 text-left hover:bg-inset"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
        />
        <span
          className={cn(
            "h-2 w-2 flex-shrink-0 rounded-full",
            RUN_STATUS_DOT[run.status],
            active && "animate-pulse",
          )}
        />

        <div className="min-w-[140px] flex-1">
          <p className="truncate text-xs font-semibold">
            {run.topic ?? `${run.agent} run`}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-dim-5">
            {active && current
              ? `${current.label}…`
              : run.errorMessage
                ? run.errorMessage
                : `${progress}% · ${run.steps.length} stages`}
          </p>
        </div>

        <span className="flex-shrink-0 text-xs text-dim-4">
          {run.groupName ?? "—"}
        </span>
        <span className="flex-shrink-0 text-xs text-dim-5">
          {run.postIds.length} post{run.postIds.length === 1 ? "" : "s"} ·{" "}
          {run.accountsTargeted} page{run.accountsTargeted === 1 ? "" : "s"}
        </span>
        <span className="w-16 flex-shrink-0 text-right text-xs text-dim-6">
          <RunDuration run={run} />
        </span>
        <span className="w-20 flex-shrink-0 text-right text-xs text-dim-6">
          {formatDateShort(run.startedAt)}
        </span>
        <Badge
          variant={RUN_STATUS_VARIANT[run.status]}
          className="flex-shrink-0"
        >
          {RUN_STATUS_LABELS[run.status]}
        </Badge>
      </button>

      {open && (
        <div className="border-t border-border/60 px-3.5 py-4">
          {run.steps.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              This run predates stage tracking, so there is nothing to break
              down.
            </p>
          ) : (
            <AgentRunTimeline run={run} showHeader={false} />
          )}
        </div>
      )}
    </div>
  );
}
