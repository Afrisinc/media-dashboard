import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconBox } from "@/components/ui/icon-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import {
  useActiveAgentRun,
  useRunAutomationNow,
  useUpdateAutomationPolicy,
} from "@/hooks/useAutomation";
import { cn } from "@/lib/utils";
import { useElapsed } from "@/hooks/useElapsed";
import { formatDateShort, formatDurationMs } from "@/lib/dateFormat";
import { Bot, Hand, Loader2, Play } from "lucide-react";

const MODES = [
  {
    value: "manual" as const,
    label: "I drive",
    icon: Hand,
    blurb:
      "You brief the agents. Every draft waits in review, and nothing publishes until you say so.",
  },
  {
    value: "autopilot" as const,
    label: "Agents drive",
    icon: Bot,
    blurb:
      "The agents pick topics, write, render and publish to every switched-on page on their own — while you are away.",
  },
];

export function AutomationModeCard() {
  const { mode, policy, isLoading, isSaving, setAutopilot } = useAutopilot();
  const { data: groups } = useAccountGroups();
  const updatePolicy = useUpdateAutomationPolicy();
  const runNow = useRunAutomationNow();
  // Global, not local: the pass lives on the server, so the button reads the
  // same state whether you started it here, in another tab, or an hour ago.
  const { data: activeRun } = useActiveAgentRun();
  const elapsed = useElapsed(activeRun?.startedAt ?? null, Boolean(activeRun));

  if (isLoading) {
    return <Skeleton className="h-56 w-full" />;
  }

  const autopilotGroups = policy?.autopilotGroupCount ?? 0;
  const activeAccounts = policy?.activeAccountCount ?? 0;
  const cap = policy?.maxPostsPerDay ?? 3;
  const usedToday = policy?.postsUsedToday ?? 0;
  const budgetLeft = Math.max(cap - usedToday, 0);
  // A spent budget skips every brand, so the trigger would report success and do
  // nothing at all. Say so up front instead.
  const ready = autopilotGroups > 0 && activeAccounts > 0 && budgetLeft > 0;

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {MODES.map((option) => {
          const selected = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={isSaving}
              onClick={() => setAutopilot(option.value === "autopilot")}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                selected
                  ? "border-primary/45 bg-primary/5"
                  : "border-border bg-inset hover:bg-inset-2",
              )}
            >
              <div className="flex items-center gap-3">
                <IconBox
                  icon={option.icon}
                  size="sm"
                  tone={selected ? "primary" : "muted"}
                />
                <span className="text-sm font-bold">{option.label}</span>
                {selected && (
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
                    On
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">
                {option.blurb}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border/50 px-5 py-4">
        <div className="min-w-[180px] flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-dim-5">
            {mode === "autopilot" ? "Running on" : "Ready to run"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {autopilotGroups} brand{autopilotGroups === 1 ? "" : "s"} ·{" "}
            {activeAccounts} live page
            {activeAccounts === 1 ? "" : "s"}
            {policy?.lastRunAt
              ? ` · last run ${formatDateShort(policy.lastRunAt)}`
              : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="max-per-day"
            className="text-[11px] font-bold uppercase tracking-wider text-dim-5"
          >
            Cap
          </label>
          <Select
            value={String(policy?.maxPostsPerDay ?? 3)}
            onValueChange={(value) =>
              updatePolicy.mutate({ maxPostsPerDay: Number(value) })
            }
          >
            <SelectTrigger id="max-per-day" className="h-8 w-[132px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 5, 8, 10, 20].map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count}/day
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span
            className={cn(
              "text-[11px] font-bold tabular-nums",
              budgetLeft === 0 ? "text-gold" : "text-dim-5",
            )}
          >
            {usedToday}/{cap} used
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="default-brand"
            className="text-[11px] font-bold uppercase tracking-wider text-dim-5"
          >
            Default brand
          </label>
          <Select
            value={policy?.defaultGroupId ?? "none"}
            onValueChange={(value) =>
              updatePolicy.mutate({
                defaultGroupId: value === "none" ? null : value,
              })
            }
          >
            <SelectTrigger id="default-brand" className="h-8 w-[160px]">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">First brand</SelectItem>
              {(groups ?? []).map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={!ready || runNow.isPending || Boolean(activeRun)}
          onClick={() => runNow.mutate()}
          title={
            activeRun
              ? "A run is already going"
              : ready
                ? undefined
                : "Switch the agents on for at least one brand first"
          }
        >
          {runNow.isPending || activeRun ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="mr-1.5 h-3.5 w-3.5" />
          )}
          {activeRun ? "Agents running…" : "Run agents now"}
        </Button>
      </div>

      {activeRun && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border/50 bg-primary/5 px-5 py-2.5">
          <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-primary" />
          <span className="min-w-[140px] flex-1 truncate text-xs font-semibold text-primary">
            {activeRun.steps.find((step) => step.status === "running")?.label ??
              "Starting"}
            {activeRun.topic ? ` · ${activeRun.topic}` : ""}
          </span>
          <span className="text-xs tabular-nums text-primary/80">
            {formatDurationMs(elapsed)}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-dim-5">
            keeps going if you leave
          </span>
        </div>
      )}

      {budgetLeft === 0 && (
        <p className="border-t border-border/50 bg-gold/5 px-5 py-2.5 text-[11px] text-gold">
          Today’s limit of {cap} post{cap === 1 ? "" : "s"} is already used, so
          a run would skip every brand. Raise the cap, or wait until tomorrow.
        </p>
      )}

      {mode === "autopilot" && budgetLeft > 0 && !ready && (
        <p className="border-t border-border/50 bg-gold/5 px-5 py-2.5 text-[11px] text-gold">
          Autopilot is on, but no brand is set up to run. Switch the agents on
          for a brand that has topics and at least one live page.
        </p>
      )}
    </Card>
  );
}
