import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  size?: "section" | "hero";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  size = "section",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div>
        <h1 className={size === "hero" ? "heading-hero" : "heading-section"}>
          {title}
        </h1>
        {subtitle && <p className="text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
