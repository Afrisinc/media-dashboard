import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StripStat {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Draws the eye only when it matters — a queue that needs someone, say. */
  tone?: "default" | "success" | "attention" | "danger";
}

const toneClass = {
  default: "text-foreground",
  success: "text-emerald",
  attention: "text-gold",
  danger: "text-destructive",
} as const;

/**
 * Headline numbers on one line. Four numbers do not need four tall cards — that
 * is a screenful of chrome for sixteen characters of information.
 */
export function StatStrip({ stats }: { stats: StripStat[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border border-border bg-card px-5 py-3.5">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2.5">
          <stat.icon
            className={cn(
              "h-4 w-4 flex-shrink-0",
              toneClass[stat.tone ?? "default"],
            )}
          />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-dim-5">
              {stat.label}
            </p>
            <p
              className={cn(
                "text-base font-bold leading-tight tabular-nums",
                toneClass[stat.tone ?? "default"],
              )}
            >
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
