import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  media: ReactNode;
  mediaLabel: string;
  onMediaClick?: () => void;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  title: ReactNode;
  onTitleClick?: () => void;
  meta?: ReactNode;
  caption?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const overlayClass =
  "pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2";

export function MediaCard({
  media,
  mediaLabel,
  onMediaClick,
  topLeft,
  topRight,
  title,
  onTitleClick,
  meta,
  caption,
  footer,
  className,
}: MediaCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-border-4",
        className,
      )}
    >
      <div className="relative aspect-[4/5]">
        {onMediaClick ? (
          <button
            type="button"
            onClick={onMediaClick}
            className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={mediaLabel}
          >
            {media}
          </button>
        ) : (
          <div className="h-full w-full" aria-label={mediaLabel} role="img">
            {media}
          </div>
        )}
        {(topLeft || topRight) && (
          <div className={overlayClass}>
            <span>{topLeft}</span>
            <span>{topRight}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {onTitleClick ? (
          <button
            type="button"
            onClick={onTitleClick}
            className="rounded-sm text-left text-sm font-medium leading-snug text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="line-clamp-2">{title}</span>
          </button>
        ) : (
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {title}
          </p>
        )}
        {meta && (
          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
            {meta}
          </div>
        )}
        {caption && (
          <div
            className={cn("text-xs text-muted-foreground", !meta && "mt-auto")}
          >
            {caption}
          </div>
        )}
      </div>

      {footer && (
        <div className="border-t border-border/50 px-2 py-1">{footer}</div>
      )}
    </article>
  );
}

export function MediaCardOverlayChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-background/85 shadow-sm backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const MEDIA_CARD_GRID =
  "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
