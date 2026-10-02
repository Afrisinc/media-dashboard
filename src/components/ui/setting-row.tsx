import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  title: string;
  description?: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function SettingRow({
  title,
  description,
  htmlFor,
  className,
  children,
}: SettingRowProps) {
  const Text = htmlFor ? "label" : "div";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-inset px-3.5 py-2.5",
        className,
      )}
    >
      <Text {...(htmlFor ? { htmlFor } : {})} className="min-w-0 flex-1">
        <span className="block text-xs font-bold">{title}</span>
        {description && (
          <span className="block text-[11px] text-muted-foreground">
            {description}
          </span>
        )}
      </Text>
      {children}
    </div>
  );
}
