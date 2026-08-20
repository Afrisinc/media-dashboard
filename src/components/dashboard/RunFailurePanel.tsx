import { Button } from "@/components/ui/button";
import { useResumeAgentRun } from "@/hooks/useAutomation";
import {
  completedSteps,
  failedStep,
  type AgentRun,
} from "@/types/accountGroup";
import { AlertTriangle, ImageIcon, Loader2, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Failures the user can actually do something about get a way through, not just
 * a message. Matched on the message the service raises.
 */
const FIXES: Array<{
  match: RegExp;
  label: string;
  to: string;
  icon: typeof ImageIcon;
}> = [
  {
    match: /approved photograph|brand asset/i,
    label: "Add a brand photo",
    to: "/settings",
    icon: ImageIcon,
  },
  {
    match: /no live page|no connected page|switched-on account/i,
    label: "Switch a page on",
    to: "/brands",
    icon: ImageIcon,
  },
];

export function RunFailurePanel({ run }: { run: AgentRun }) {
  const resume = useResumeAgentRun();

  const stopped = failedStep(run);
  const reused = completedSteps(run).length;
  const message =
    run.errorMessage ?? stopped?.errorMessage ?? "The run did not finish.";
  const fix = FIXES.find((entry) => entry.match.test(message));

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />

        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-bold text-destructive">
            Stopped at {stopped?.label ?? "an unknown stage"}
          </p>
          <p className="mt-1 text-xs text-foreground">{message}</p>

          {run.resumable ? (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Fix the cause, then pick it back up — the {reused} stage
              {reused === 1 ? "" : "s"} that already passed{" "}
              {reused === 1 ? "is" : "are"} reused, not redone.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">
              This run is too old to resume — its working state has expired.
              Brief it again.
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-wrap gap-2">
          {fix && (
            <Button asChild size="sm" variant="outline">
              <Link to={fix.to}>
                <fix.icon className="mr-1.5 h-3.5 w-3.5" />
                {fix.label}
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            disabled={!run.resumable || resume.isPending}
            onClick={() => resume.mutate(run.id)}
            title={
              run.resumable
                ? undefined
                : "The working state for this run has expired"
            }
          >
            {resume.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
