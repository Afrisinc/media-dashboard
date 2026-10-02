import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectivityBadge } from "@/components/ui/connectivity-badge";
import { IconBox } from "@/components/ui/icon-box";
import { ListRow } from "@/components/ui/list-row";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { AI_PROVIDER_CATALOG, type AiProviderSlot } from "@/config/aiProviders";
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
      <ListSkeleton
        rows={slots.length}
        label="Loading AI provider settings"
        className="px-5"
      />
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {slots.map((slot) => {
        const config = configs.find(
          (row) =>
            row.provider === slot.provider && row.purpose === slot.purpose,
        );

        const brand = AI_PROVIDER_CATALOG[slot.provider];

        return (
          <li key={`${slot.provider}:${slot.purpose}`}>
            <ListRow className="px-5 py-3.5">
              <IconBox
                icon={brand.icon}
                tone={brand.tone}
                size="sm"
                className={brand.iconClassName}
              />
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
