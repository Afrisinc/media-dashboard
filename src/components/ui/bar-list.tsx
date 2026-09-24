import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BarListItem {
  key: string;
  label: ReactNode;
  value: number;
  display?: string;
  meta?: string;
  leading?: ReactNode;
}

type BarTone = "primary" | "emerald" | "gold";

interface BarListProps {
  items: BarListItem[];
  tone?: BarTone;
  max?: number;
  className?: string;
}

const BAR_TONE: Record<BarTone, string> = {
  primary: "bg-primary",
  emerald: "bg-emerald",
  gold: "bg-gold",
};

export function BarList({
  items,
  tone = "primary",
  max,
  className,
}: BarListProps) {
  const ceiling = max ?? Math.max(...items.map((item) => item.value), 0);

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => {
        const width =
          ceiling > 0 ? Math.max((item.value / ceiling) * 100, 2) : 0;
        return (
          <li key={item.key} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2">
                {item.leading}
                <span className="truncate font-medium">{item.label}</span>
              </span>
              <span className="flex flex-shrink-0 items-baseline gap-2 tabular-nums">
                {item.meta && (
                  <span className="text-[11px] text-muted-foreground">
                    {item.meta}
                  </span>
                )}
                <span className="font-semibold">
                  {item.display ?? item.value.toLocaleString()}
                </span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-track">
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  BAR_TONE[tone],
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
