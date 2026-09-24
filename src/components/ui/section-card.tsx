import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  iconTone?: IconBoxTone;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  icon,
  iconTone = "muted",
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && <IconBox icon={icon} tone={iconTone} size="sm" />}
          <div className="flex min-h-8 min-w-0 flex-col justify-center">
            <h2 className="text-sm font-semibold leading-snug">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex flex-shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
      <div className={cn("flex-1 px-5 pb-5 pt-4", contentClassName)}>
        {children}
      </div>
    </Card>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionCardSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <Card className={cn("space-y-4 p-5", className)} aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    </Card>
  );
}
