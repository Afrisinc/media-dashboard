import { IconBox, type IconBoxTone } from "@/components/ui/icon-box";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

export interface StripStat {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Draws the eye only when it matters — a queue that needs someone, say. */
  tone?: "default" | "success" | "attention" | "danger";
  onSelect?: () => void;
  hint?: string;
}

const toneClass = {
  default: "text-foreground",
  success: "text-emerald",
  attention: "text-gold",
  danger: "text-destructive",
} as const;

const iconTone: Record<NonNullable<StripStat["tone"]>, IconBoxTone> = {
  default: "muted",
  success: "success",
  attention: "gold",
  danger: "destructive",
};

function StatTile({ stat, loading }: { stat: StripStat; loading: boolean }) {
  const tone = stat.tone ?? "default";
  const interactive = !!stat.onSelect && !loading;

  const body = (
    <>
      <IconBox icon={stat.icon} tone={iconTone[tone]} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase leading-snug tracking-wider text-muted-foreground">
          {stat.label}
        </p>
        {loading ? (
          <>
            <Skeleton className="mt-1.5 h-7 w-12" />
            <Skeleton className="mt-1.5 h-3 w-20" />
          </>
        ) : (
          <>
            <p
              className={cn(
                "text-2xl font-bold leading-tight tabular-nums",
                toneClass[tone],
              )}
            >
              {stat.value}
            </p>
            {stat.hint && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {stat.hint}
              </p>
            )}
          </>
        )}
      </div>
      {interactive && (
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground opacity-0 sm:block transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" />
      )}
    </>
  );

  const tileClass =
    "flex min-w-0 flex-col items-start gap-2 bg-card p-3.5 text-left sm:flex-row sm:items-center sm:gap-3 sm:p-4";

  return interactive ? (
    <button
      type="button"
      onClick={stat.onSelect}
      className={cn(
        tileClass,
        "group transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      )}
    >
      {body}
    </button>
  ) : (
    <div className={tileClass}>{body}</div>
  );
}

/**
 * Headline numbers on one line. Four numbers do not need four tall cards — that
 * is a screenful of chrome for sixteen characters of information.
 */
export function StatStrip({
  stats,
  loading = false,
  variant = "inline",
}: {
  stats: StripStat[];
  loading?: boolean;
  variant?: "inline" | "tiles";
}) {
  if (variant === "tiles") {
    return (
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} stat={stat} loading={loading} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border border-border bg-card px-5 py-3.5">
      {stats.map((stat) => {
        const body = (
          <>
            <stat.icon
              className={cn(
                "h-4 w-4 flex-shrink-0",
                toneClass[stat.tone ?? "default"],
              )}
            />
            <div className="text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-dim-5">
                {stat.label}
              </p>
              {loading ? (
                <Skeleton className="mt-1 h-4 w-8" />
              ) : (
                <p
                  className={cn(
                    "text-base font-bold leading-tight tabular-nums",
                    toneClass[stat.tone ?? "default"],
                  )}
                >
                  {stat.value}
                </p>
              )}
            </div>
          </>
        );

        return stat.onSelect && !loading ? (
          <button
            key={stat.label}
            type="button"
            onClick={stat.onSelect}
            className="-mx-2 -my-1 flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {body}
          </button>
        ) : (
          <div key={stat.label} className="flex items-center gap-2.5">
            {body}
          </div>
        );
      })}
    </div>
  );
}
