import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS } from "@/types/accountGroup";

interface WeekdayPickerProps {
  value: number[];
  onToggle: (day: number) => void;
  disabled?: boolean;
  className?: string;
}

export function WeekdayPicker({
  value,
  onToggle,
  disabled = false,
  className,
}: Readonly<WeekdayPickerProps>) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {WEEKDAY_LABELS.map((label, day) => (
        <button
          key={label}
          type="button"
          aria-pressed={value.includes(day)}
          disabled={disabled}
          onClick={() => onToggle(day)}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors disabled:pointer-events-none disabled:opacity-50",
            value.includes(day)
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-dim-5 hover:bg-inset-2",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
