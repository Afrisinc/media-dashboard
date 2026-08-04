import { cn } from "@/lib/utils";

interface ConnectivityBadgeProps {
  connected: boolean;
  connectedLabel?: string;
  disconnectedLabel?: string;
  className?: string;
}

export function ConnectivityBadge({
  connected,
  connectedLabel = "Connected",
  disconnectedLabel = "Not connected",
  className,
}: ConnectivityBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
        connected ? "bg-emerald/13 text-emerald" : "bg-track text-dim-6",
        className,
      )}
    >
      {connected ? connectedLabel : disconnectedLabel}
    </span>
  );
}
