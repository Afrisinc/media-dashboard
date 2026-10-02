import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  action,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Label htmlFor={htmlFor} className="text-xs font-bold">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
