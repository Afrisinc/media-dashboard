import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  size?: "section" | "hero";
  /** Small accent label above the title, rendered with `line-accent`. */
  eyebrow?: string;
  /** Extra classes for the heading, e.g. `font-display italic`. */
  titleClassName?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  size = "section",
  eyebrow,
  titleClassName,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="line-accent">{eyebrow}</p>}
        <h1
          className={cn(
            size === "hero" ? "heading-hero" : "heading-section",
            "break-words",
            eyebrow && "mt-2",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {subtitle && <p className="text-secondary mt-1">{subtitle}</p>}
      </div>
      {action && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
