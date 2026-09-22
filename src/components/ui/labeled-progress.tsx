import { Progress } from "@/components/ui/progress";

interface LabeledProgressProps {
  label: string;
  valueLabel: string;
  value: number;
  indicatorClassName?: string;
  className?: string;
}

export function LabeledProgress({
  label,
  valueLabel,
  value,
  indicatorClassName,
  className,
}: LabeledProgressProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-medium">{label}</span>
        <span className="shrink-0 text-sm font-bold">{valueLabel}</span>
      </div>
      <Progress value={value} indicatorClassName={indicatorClassName} />
    </div>
  );
}
