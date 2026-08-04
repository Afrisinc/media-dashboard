import { Badge, type BadgeProps } from "@/components/ui/badge";
import { entityStatusVariant } from "@/lib/status";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status?: string;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={entityStatusVariant(status)} {...props}>
      {status || "ACTIVE"}
    </Badge>
  );
}
