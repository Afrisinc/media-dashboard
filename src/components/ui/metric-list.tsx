import type { LucideIcon } from "lucide-react";
import { compactNumber } from "@/lib/numberFormat";
import { cn } from "@/lib/utils";

export interface MetricItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

interface MetricListProps {
  items: MetricItem[];
  className?: string;
}

export function MetricList({ items, className }: MetricListProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="inline-flex items-center gap-1 tabular-nums"
          title={`${item.value.toLocaleString()} ${item.label.toLowerCase()}`}
        >
          <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="font-medium text-foreground">
            {compactNumber(item.value)}
          </span>
          <span className="sr-only">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
