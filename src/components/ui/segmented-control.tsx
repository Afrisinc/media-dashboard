import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  // NoInfer keeps a `Dispatch<SetStateAction<T>>` handler from widening T to
  // string: SetStateAction includes an updater function, which is not a string,
  // so inferring from this position falls back to the constraint.
  onChange: (value: NoInfer<T>) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("flex gap-1 rounded-lg bg-muted p-1", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
