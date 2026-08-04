import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconBox, type IconBoxTone } from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconTone?: IconBoxTone;
  delta?: { value: string; direction: "up" | "down" };
  subtitle?: string;
  size?: "sm" | "md";
  /** "top" places the icon top-right of the label/value; "inline" places it left of them. */
  layout?: "top" | "inline";
  /** Extra classes for the value text, e.g. to tint it (text-emerald, text-destructive). */
  valueClassName?: string;
  className?: string;
  style?: CSSProperties;
}

export function StatCard({
  label,
  value,
  icon,
  iconTone = "primary",
  delta,
  subtitle,
  size = "md",
  layout = "top",
  valueClassName,
  className,
  style,
}: StatCardProps) {
  const body = (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          size === "sm" ? "text-2xl font-bold" : "text-3xl font-bold",
          valueClassName,
        )}
      >
        {value}
      </span>
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
      {delta && (
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            delta.direction === "up" ? "text-emerald" : "text-destructive",
          )}
        >
          {delta.direction === "up" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {delta.value}
        </span>
      )}
    </div>
  );

  const iconBox = icon && (
    <IconBox icon={icon} tone={iconTone} size={size === "sm" ? "sm" : "md"} />
  );

  return (
    <Card className={className} style={style}>
      <CardContent className={size === "sm" ? "p-4" : "pt-6"}>
        {layout === "inline" ? (
          <div className="flex items-center gap-4">
            {iconBox}
            {body}
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            {body}
            {iconBox}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const gridColsClass = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  6: "sm:grid-cols-3 lg:grid-cols-6",
} as const;

interface StatGridProps {
  children: ReactNode;
  columns?: keyof typeof gridColsClass;
  className?: string;
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        gridColsClass[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
