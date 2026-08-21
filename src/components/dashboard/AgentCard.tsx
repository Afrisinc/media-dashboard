import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface AgentSummaryStat {
  label: string;
  value: string;
  /** Draws attention when it is not zero — a queue waiting on someone, say. */
  tone?: "default" | "attention" | "danger";
}

interface AgentCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  iconTone?: IconBoxTone;
  /** The one-line verdict: "Waiting on you", "Idle", "Running". */
  status: string;
  statusTone?: "default" | "secondary";
  stats: AgentSummaryStat[];
  open: boolean;
  onToggle: () => void;
  action?: ReactNode;
  children: ReactNode;
}

const statToneClass = {
  default: "text-foreground",
  attention: "text-gold",
  danger: "text-destructive",
} as const;

/**
 * One agent, collapsed to its name and headline numbers. A workspace will run
 * several of these, so the default is closed — the page has to stay readable at
 * ten agents, not just one.
 */
export function AgentCard({
  name,
  description,
  icon,
  iconTone = "primary",
  status,
  statusTone = "secondary",
  stats,
  open,
  onToggle,
  action,
  children,
}: AgentCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? "Hide" : "Show"} recent work for ${name}`}
          className="flex min-w-[180px] flex-1 items-center gap-3 text-left"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          <IconBox icon={icon} tone={iconTone} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{name}</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {description}
            </span>
          </span>
        </button>

        <div className="flex flex-shrink-0 items-center gap-3">
          <Badge variant={statusTone}>{status}</Badge>
          {action}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border/50 px-5 py-3.5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-dim-5">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-bold tabular-nums",
                statToneClass[stat.tone ?? "default"],
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}

        {!open && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto self-center text-xs"
            onClick={onToggle}
          >
            Recent work
          </Button>
        )}
      </div>

      {open && <div className="border-t border-border/50 p-5">{children}</div>}
    </Card>
  );
}
