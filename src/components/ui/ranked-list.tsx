import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RankedListItem {
  key: string;
  title: string;
  href?: string | null;
  meta?: ReactNode;
  value: string;
  valueLabel?: string;
  leading?: ReactNode;
}

interface RankedListProps {
  items: RankedListItem[];
  className?: string;
}

export function RankedList({ items, className }: RankedListProps) {
  return (
    <ol className={cn("divide-y divide-border/60", className)}>
      {items.map((item, index) => (
        <li key={item.key} className="flex items-center gap-3 py-2.5">
          <span
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums",
              index === 0
                ? "bg-gold/15 text-gold"
                : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </span>
          {item.leading}
          <div className="min-w-0 flex-1">
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex max-w-full items-center gap-1 text-sm font-medium hover:text-primary"
              >
                <span className="truncate">{item.title}</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden
                />
              </a>
            ) : (
              <p className="truncate text-sm font-medium">{item.title}</p>
            )}
            {item.meta && (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {item.meta}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums">{item.value}</p>
            {item.valueLabel && (
              <p className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
                {item.valueLabel}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
