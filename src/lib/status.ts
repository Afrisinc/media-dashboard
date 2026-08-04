export type EntityStatusVariant = "default" | "destructive" | "secondary";

export function entityStatusVariant(status?: string): EntityStatusVariant {
  if (status === "ACTIVE") return "default";
  if (status === "SUSPENDED") return "destructive";
  return "secondary";
}

export const connectivityToneClass: Record<"online" | "offline", string> = {
  online: "bg-emerald/10 text-emerald border-emerald/20",
  offline: "bg-muted text-muted-foreground border-transparent",
};
