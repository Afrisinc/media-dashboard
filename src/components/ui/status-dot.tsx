import { cn } from "@/lib/utils";

const toneClass = {
  emerald: "bg-emerald",
  destructive: "bg-destructive",
  amber: "bg-amber",
  primary: "bg-primary",
  muted: "bg-muted-foreground",
} as const;

interface StatusDotProps {
  tone?: keyof typeof toneClass;
  pulse?: boolean;
  label?: string;
  className?: string;
}

export function StatusDot({
  tone = "muted",
  pulse,
  label,
  className,
}: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          toneClass[tone],
          pulse && "animate-pulse",
        )}
      />
      {label && <span className="text-sm capitalize">{label}</span>}
    </span>
  );
}
