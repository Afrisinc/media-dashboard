import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import {
  useActiveAgentRun,
  useRunAutomationNow,
  useUpdateAutomationPolicy,
} from "@/hooks/useAutomation";
import { useElapsed } from "@/hooks/useElapsed";
import { formatDateShort, formatDurationMs } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
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

/** One compact control bar: who drives, the limits, and the trigger. */
export function AutomationModeCard() {
  const { mode, policy, isLoading, isSaving, setAutopilot } = useAutopilot();
  const { data: groups } = useAccountGroups();
  const updatePolicy = useUpdateAutomationPolicy();
  const runNow = useRunAutomationNow();
  const { data: activeRun } = useActiveAgentRun();
  const elapsed = useElapsed(activeRun?.startedAt ?? null, Boolean(activeRun));

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const autopilotGroups = policy?.autopilotGroupCount ?? 0;
  const activeAccounts = policy?.activeAccountCount ?? 0;
  const cap = policy?.maxPostsPerDay ?? 3;
  const usedToday = policy?.postsUsedToday ?? 0;
  const budgetLeft = Math.max(cap - usedToday, 0);
  const ready = autopilotGroups > 0 && activeAccounts > 0 && budgetLeft > 0;

  // One click is not one post. A brand with postsPerRun: 3 produces three runs,
  // which looked like the system starting work on its own until it was named.
  const plannedPosts = (groups ?? [])
    .filter((group) => group.autopilotEnabled)
    .reduce((total, group) => total + Math.min(group.postsPerRun, cap), 0);
  const willDraft = Math.min(plannedPosts, budgetLeft);
  const current = MODES.find((option) => option.value === mode) ?? MODES[0];

  const blocker =
    budgetLeft === 0
      ? `Today’s limit of ${cap} is used — raise the cap or wait until tomorrow.`
      : autopilotGroups === 0
        ? "No brand has its agents switched on."
        : activeAccounts === 0
          ? "No live page to publish to."
          : null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-4">
        {/* The mode is a binary choice; a segmented switch says that in one line. */}
        <div className="flex flex-shrink-0 rounded-lg bg-muted p-1">
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
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                  selected
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="min-w-[220px] flex-1 text-xs text-muted-foreground">
          {current.blurb}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Select
            value={String(cap)}
            onValueChange={(value) =>
              updatePolicy.mutate({ maxPostsPerDay: Number(value) })
            }
          >
            <SelectTrigger
              aria-label="Posts per day"
              className="h-8 w-[124px] text-xs"
            >
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

          <Select
            value={policy?.defaultGroupId ?? "none"}
            onValueChange={(value) =>
              updatePolicy.mutate({
                defaultGroupId: value === "none" ? null : value,
              })
            }
          >
            <SelectTrigger
              aria-label="Brand a hand-written brief lands on"
              className="h-8 w-[150px] text-xs"
            >
              <SelectValue placeholder="First brand" />
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

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="sm"
                  disabled={!ready || runNow.isPending || Boolean(activeRun)}
                  onClick={() => runNow.mutate(undefined)}
                >
                  {runNow.isPending || activeRun ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {activeRun
                    ? "Running…"
                    : ready && willDraft > 1
                      ? `Run agents (${willDraft} posts)`
                      : "Run agents now"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {activeRun
                ? "A run is already going"
                : (blocker ??
                  `Drafts ${willDraft} post${willDraft === 1 ? "" : "s"} across ${autopilotGroups} switched-on brand${autopilotGroups === 1 ? "" : "s"}`)}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* One quiet line of state, rather than a block of stat cards. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 px-4 py-2 text-[11px]">
        <span className="text-dim-5">
          {autopilotGroups} brand{autopilotGroups === 1 ? "" : "s"} ·{" "}
          {activeAccounts} live page{activeAccounts === 1 ? "" : "s"}
        </span>
        <span
          className={cn(
            "font-bold tabular-nums",
            budgetLeft === 0 ? "text-gold" : "text-dim-5",
          )}
        >
          {usedToday}/{cap} used today
        </span>
        {policy?.lastRunAt && (
          <span className="text-dim-6">
            last run {formatDateShort(policy.lastRunAt)}
          </span>
        )}
        {activeRun && (
          <span className="ml-auto flex items-center gap-2 font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {activeRun.steps.find((step) => step.status === "running")?.label ??
              "Starting"}
            <span className="tabular-nums opacity-80">
              {formatDurationMs(elapsed)}
            </span>
          </span>
        )}
        {!activeRun && blocker && (
          <span className="ml-auto text-gold">{blocker}</span>
        )}
      </div>
    </Card>
  );
}
