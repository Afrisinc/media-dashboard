import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  description?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = "default",
  className,
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <p
        className={cn(
          "py-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {title}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-12 text-center",
        className,
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground opacity-50" />
      {title && <h3 className="font-medium">{title}</h3>}
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
