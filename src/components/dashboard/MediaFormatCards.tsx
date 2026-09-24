import { Badge } from "@/components/ui/badge";
import { IconBox } from "@/components/ui/icon-box";
import { Skeleton } from "@/components/ui/skeleton";
import { MEDIA_FORMATS } from "@/config/mediaFormats";
import type { LiveMediaKind } from "@/lib/mediaLibrary";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface MediaFormatCardsProps {
  counts: Record<LiveMediaKind, number>;
  loading: boolean;
}

export function MediaFormatCards({
  counts,
  loading,
}: Readonly<MediaFormatCardsProps>) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
      {MEDIA_FORMATS.map((format) => {
        const live = format.href !== undefined;
        const body = (
          <>
            <span className="flex items-start justify-between gap-2">
              <IconBox icon={format.icon} tone={format.tone} size="sm" />
              {live ? (
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              ) : (
                <Badge
                  variant="outline"
                  className="whitespace-nowrap border-dashed px-1.5 text-[10px] font-normal text-muted-foreground"
                >
                  Coming soon
                </Badge>
              )}
            </span>
            <span className="block">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{format.title}</span>
                {live &&
                  (loading ? (
                    <Skeleton className="h-4 w-6" />
                  ) : (
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {counts[format.kind as LiveMediaKind]}
                    </span>
                  ))}
              </span>
              <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
                {format.description}
              </span>
            </span>
            {live && (
              <span className="mt-auto hidden text-xs font-medium text-primary sm:block">
                Open {format.studio}
              </span>
            )}
          </>
        );

        const cardClass =
          "group flex h-full flex-col gap-3 rounded-xl border p-3.5 text-left transition-colors sm:p-4";

        return (
          <li key={format.kind}>
            {live && format.href ? (
              <Link
                to={format.href}
                className={cn(
                  cardClass,
                  "border-border bg-card hover:border-primary/40 hover:bg-card-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {body}
              </Link>
            ) : (
              <div
                className={cn(
                  cardClass,
                  "border-dashed border-border bg-inset/40",
                )}
                aria-label={`${format.title}, coming soon`}
              >
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
