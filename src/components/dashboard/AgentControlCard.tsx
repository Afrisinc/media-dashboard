import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  History,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconBox } from "@/components/ui/icon-box";
import { Switch } from "@/components/ui/switch";
import type { AgentStatusPill, AgentStatusTone } from "@/lib/agents";
import { cn } from "@/lib/utils";

export interface AgentMetric {
  label: string;
  value: string;
  tone?: "default" | "attention" | "danger" | "success";
}

interface AgentSwitchControl {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

interface AgentLink {
  label: string;
  to: string;
}

interface AgentControlCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  tags: string[];
  status: AgentStatusPill;
  switchControl?: AgentSwitchControl;
  schedule: string;
  metrics: AgentMetric[];
  lastRun: string;
  lastRunFailed?: boolean;
  primaryLink?: AgentLink;
  runsLink?: string;
  recentWork?: ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const PILL_TONE: Record<AgentStatusTone, string> = {
  running: "border-emerald/30 bg-emerald/10 text-emerald",
  waiting: "border-amber/30 bg-amber/10 text-amber",
  off: "border-border bg-muted text-muted-foreground",
  server: "border-border bg-muted text-muted-foreground",
  idle: "border-primary/30 bg-primary/10 text-primary",
};

const DOT_TONE: Record<AgentStatusTone, string> = {
  running: "bg-emerald",
  waiting: "bg-amber",
  off: "bg-muted-foreground/60",
  server: "bg-muted-foreground/60",
  idle: "bg-primary",
};

const METRIC_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

const METRIC_TONE: Record<NonNullable<AgentMetric["tone"]>, string> = {
  default: "text-foreground",
  attention: "text-gold",
  danger: "text-destructive",
  success: "text-emerald",
};

function StatusPill({ status }: { status: AgentStatusPill }) {
  const live = status.tone === "running";
  return (
    <span
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        PILL_TONE[status.tone],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          DOT_TONE[status.tone],
          live && "animate-pulse",
        )}
        aria-hidden
      />
      {status.label}
    </span>
  );
}

function MetricHighlights({ metrics }: { metrics: AgentMetric[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {metrics.map((metric) => (
        <span key={metric.label} className="inline-flex items-baseline gap-1">
          <span
            className={cn(
              "font-semibold tabular-nums",
              METRIC_TONE[metric.tone ?? "default"],
            )}
          >
            {metric.value}
          </span>
          <span className="text-muted-foreground">
            {metric.label.toLowerCase()}
          </span>
        </span>
      ))}
    </span>
  );
}

export function AgentControlCard({
  icon,
  name,
  description,
  tags,
  status,
  switchControl,
  schedule,
  metrics,
  lastRun,
  lastRunFailed = false,
  primaryLink,
  runsLink,
  recentWork,
  expanded = true,
  onExpandedChange,
}: Readonly<AgentControlCardProps>) {
  const [open, setOpen] = useState(false);
  const switchId = useId();
  const workId = useId();
  const detailsId = useId();
  const live = status.tone === "running";
  const collapsible = onExpandedChange !== undefined;
  const showDetails = !collapsible || expanded;

  const summary = (
    <>
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold leading-tight">{name}</span>
        <StatusPill status={status} />
      </span>
      {showDetails ? (
        <span className="line-clamp-2 block text-sm text-muted-foreground">
          {description}
        </span>
      ) : (
        <>
          {metrics.length > 0 && <MetricHighlights metrics={metrics} />}
          <span
            className={cn(
              "block truncate text-xs",
              lastRunFailed ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {lastRun}
          </span>
        </>
      )}
    </>
  );

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-colors",
        live && "border-emerald/30",
      )}
    >
      <div
        className={cn(
          "flex items-start gap-3",
          showDetails ? "p-5 pb-4" : "p-4",
        )}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={() => onExpandedChange(!expanded)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="-m-1 flex min-w-0 flex-1 items-start gap-3 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight
              className={cn(
                "mt-3 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90",
              )}
              aria-hidden
            />
            <IconBox icon={icon} tone={live ? "primary" : "muted"} />
            <span className="min-w-0 flex-1 space-y-1.5">{summary}</span>
          </button>
        ) : (
          <>
            <IconBox icon={icon} tone={live ? "primary" : "muted"} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor={switchControl ? switchId : undefined}
                  className="text-base font-semibold leading-tight"
                >
                  {name}
                </label>
                <StatusPill status={status} />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </>
        )}
        {switchControl && (
          <Switch
            id={switchId}
            checked={switchControl.checked}
            disabled={switchControl.disabled}
            onCheckedChange={switchControl.onChange}
            aria-label={`${name} ${switchControl.checked ? "on" : "off"}`}
            className="mt-0.5 flex-shrink-0"
          />
        )}
      </div>

      {showDetails && (
        <div id={detailsId} className="flex flex-1 flex-col">
          {tags.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-1.5 px-5 pb-4",
                collapsible ? "sm:pl-[6.25rem]" : "sm:pl-[4.5rem]",
              )}
            >
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {metrics.length > 0 && (
            <dl
              className={cn(
                "grid gap-px border-y border-border/50 bg-border/50",
                METRIC_COLUMNS[Math.min(metrics.length, 4)],
              )}
            >
              {metrics.map((metric) => (
                <div key={metric.label} className="bg-card px-5 py-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {metric.label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 text-lg font-bold tabular-nums",
                      METRIC_TONE[metric.tone ?? "default"],
                    )}
                  >
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex-1 space-y-1 px-5 py-3">
            <p className="text-xs text-muted-foreground">{schedule}</p>
            <p
              className={cn(
                "line-clamp-2 text-xs",
                lastRunFailed ? "text-destructive" : "text-foreground/80",
              )}
            >
              {lastRun}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-2.5">
            {primaryLink && (
              <Button asChild size="sm">
                <Link to={primaryLink.to}>
                  {primaryLink.label}
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            )}
            {runsLink && (
              <Button asChild size="sm" variant="ghost">
                <Link to={runsLink}>
                  <History className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Runs
                </Link>
              </Button>
            )}
            {recentWork && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                aria-expanded={open}
                aria-controls={workId}
                onClick={() => setOpen((value) => !value)}
              >
                Recent work
                <ChevronDown
                  className={cn(
                    "ml-1 h-3.5 w-3.5 transition-transform",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </Button>
            )}
          </div>

          {recentWork && open && (
            <div id={workId} className="border-t border-border/50 px-5 py-3">
              {recentWork}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
