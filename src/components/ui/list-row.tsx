import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListRowProps {
  children: ReactNode;
  className?: string;
}

/** Shared responsive shell for icon/title/metadata rows — wraps onto multiple lines instead of overflowing on narrow screens. */
export function ListRow({ children, className }: ListRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}
