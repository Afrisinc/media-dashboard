import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectivityBadge } from "@/components/ui/connectivity-badge";
import { IconBox } from "@/components/ui/icon-box";
import { ListRow } from "@/components/ui/list-row";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiProviderSlot } from "@/config/aiProviders";
import { formatDateProfessional } from "@/lib/dateFormat";
import type { AiProviderConfig } from "@/types/aiProviderConfig";

interface AiProviderConfigListProps {
  slots: readonly AiProviderSlot[];
  configs: AiProviderConfig[];
  loading: boolean;
  onEdit: (slot: AiProviderSlot) => void;
}

function slotDetail(config: AiProviderConfig | undefined): string {
  if (!config) {
    return "No key saved. The server environment key is used.";
  }
  return [
    config.model ?? "Default model",
    `Key ${config.apiKeyHint}`,
    `Rotated ${formatDateProfessional(config.lastRotatedAt, "relative")}`,
  ].join(" · ");
}

export function AiProviderConfigList({
  slots,
  configs,
  loading,
  onEdit,
}: AiProviderConfigListProps) {
  if (loading) {
    return (
      <div className="divide-y divide-border/60" aria-hidden>
        {slots.map((slot) => (
          <div
            key={`${slot.provider}:${slot.purpose}`}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {slots.map((slot) => {
        const config = configs.find(
          (row) =>
            row.provider === slot.provider && row.purpose === slot.purpose,
        );

        return (
          <li key={`${slot.provider}:${slot.purpose}`}>
            <ListRow className="px-5 py-3.5">
              <IconBox icon={slot.icon} tone={slot.tone} size="sm" />
              <div className="min-w-[180px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{slot.title}</p>
                  <ConnectivityBadge
                    connected={config?.isActive ?? false}
                    connectedLabel="Stored key"
                    disconnectedLabel={config ? "Disabled" : "Environment"}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {slot.description}
                </p>
                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  {slotDetail(config)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(slot)}
                aria-label={`${config ? "Edit" : "Set up"} ${slot.title}`}
              >
                <KeyRound className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {config ? "Edit" : "Set up"}
              </Button>
            </ListRow>
          </li>
        );
      })}
    </ul>
  );
}
