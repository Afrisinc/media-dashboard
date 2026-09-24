import { EmptyState } from "@/components/ui/empty-state";
import { IconBox } from "@/components/ui/icon-box";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveMediaKind } from "@/lib/mediaLibrary";
import { BookOpen, Factory, FileText, Images, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface ProductionItem {
  id: string;
  kind: LiveMediaKind;
  title: string;
  stage: string;
  meta: string;
  href: string;
}

const KIND_ICON: Record<LiveMediaKind, LucideIcon> = {
  post: Images,
  article: FileText,
  story: BookOpen,
};

interface ProductionQueueProps {
  items: ProductionItem[];
  loading: boolean;
  autopilot: boolean;
}

export function ProductionQueue({
  items,
  loading,
  autopilot,
}: Readonly<ProductionQueueProps>) {
  const live = items.length > 0;

  return (
    <SectionCard
      title="In production now"
      icon={Factory}
      iconTone={live ? "primary" : "muted"}
      description={
        live
          ? `${items.length} ${items.length === 1 ? "piece" : "pieces"} being made · ${autopilot ? "publishes on its own when ready" : "waits for your approval when ready"}`
          : "What the agents are working on right now"
      }
      action={
        live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              aria-hidden
            />
            Working
          </span>
        ) : undefined
      }
      contentClassName="pt-2"
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !live ? (
        <EmptyState
          icon={Factory}
          variant="compact"
          title="Nothing in production right now. The agents pick up new work on their schedule."
          className="py-4"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.href}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconBox icon={KIND_ICON[item.kind]} tone="primary" size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.meta}
                  </span>
                </span>
                <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin text-primary"
                    aria-hidden
                  />
                  {item.stage}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
