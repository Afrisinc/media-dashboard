import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  rows?: number;
  thumb?: boolean;
  trailing?: boolean;
  label?: string;
  className?: string;
}

export function ListSkeleton({
  rows = 5,
  thumb = false,
  trailing = true,
  label = "Loading",
  className,
}: ListSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn("divide-y divide-border/50", className)}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-3" aria-hidden>
          {thumb && <Skeleton className="h-12 w-12 shrink-0 rounded-md" />}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 max-w-md" />
            <Skeleton className="h-3 w-2/5 max-w-xs" />
          </div>
          {trailing && (
            <Skeleton className="hidden h-6 w-20 shrink-0 rounded-full sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}
