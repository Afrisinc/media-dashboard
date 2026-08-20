import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCancelAgentRun } from "@/hooks/useAutomation";
import { useElapsed } from "@/hooks/useElapsed";
import { formatDurationMs } from "@/lib/dateFormat";
import { runningStep, SLOW_STEP_MS, type AgentRun } from "@/types/accountGroup";
import { Hourglass, Loader2, StopCircle } from "lucide-react";

/**
 * A run holds the workspace's one run slot, so a stalled stage blocks everything
 * until the server's stale-run sweep catches it. Saying so, and offering a way
 * out, beats watching a counter climb.
 */
export function RunStallNotice({ run }: { run: AgentRun }) {
  const cancel = useCancelAgentRun();
  const current = runningStep(run);
  const elapsed = useElapsed(current?.startedAt ?? null, Boolean(current));

  if (!current || elapsed === null || elapsed < SLOW_STEP_MS) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-gold/35 bg-gold/5 p-4">
      <Hourglass className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />

      <div className="min-w-[200px] flex-1">
        <p className="text-xs font-bold text-gold">
          {current.label} has been going for {formatDurationMs(elapsed)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Longer than this stage usually takes. It will give up on its own, but
          until it does nothing else can run.
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={cancel.isPending}>
            {cancel.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
            )}
            Stop it
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop this run?</AlertDialogTitle>
            <AlertDialogDescription>
              {run.cancellable
                ? "The stage in flight is abandoned and the run is marked stopped. Whatever already finished is kept, so you can resume it afterwards."
                : "This run is executing on another instance, so it cannot be interrupted from here. It will be marked stopped and the slot freed, but the work may continue there."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Leave it running</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancel.mutate(run.id)}>
              Stop the run
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
