import { useEffect, useId, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconBox } from "@/components/ui/icon-box";
import { Input } from "@/components/ui/input";
import { SecretInput } from "@/components/ui/secret-input";
import { Switch } from "@/components/ui/switch";
import { AI_PROVIDER_CATALOG, type AiProviderSlot } from "@/config/aiProviders";
import { useSaveAiProviderConfig } from "@/hooks/useAiProviderConfigs";
import type { AiProviderConfig } from "@/types/aiProviderConfig";

const MIN_API_KEY_LENGTH = 8;

interface AiProviderConfigDialogProps {
  slot: AiProviderSlot | null;
  config: AiProviderConfig | undefined;
  onClose: () => void;
}

function blankToNull(value: string): string | null {
  return value.trim() || null;
}

export function AiProviderConfigDialog({
  slot,
  config,
  onClose,
}: AiProviderConfigDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const keyField = useId();
  const modelField = useId();
  const baseUrlField = useId();
  const organizationField = useId();
  const projectField = useId();
  const activeField = useId();

  const save = useSaveAiProviderConfig();
  const isEditing = Boolean(config);

  useEffect(() => {
    if (slot) {
      setApiKey("");
      setModel(config?.model ?? "");
      setBaseUrl(config?.baseUrl ?? "");
      setOrganizationId(config?.organizationId ?? "");
      setProjectId(config?.projectId ?? "");
      setIsActive(config?.isActive ?? true);
    }
  }, [slot, config]);

  if (!slot) return null;

  const catalog = AI_PROVIDER_CATALOG[slot.provider];
  const ready = isEditing || apiKey.trim().length >= MIN_API_KEY_LENGTH;

  const handleSave = async () => {
    await save.mutateAsync({
      provider: slot.provider,
      purpose: slot.purpose,
      apiKey: apiKey.trim() || undefined,
      model: blankToNull(model),
      baseUrl: blankToNull(baseUrl),
      ...(catalog.supportsOrganization && {
        organizationId: blankToNull(organizationId),
        projectId: blankToNull(projectId),
      }),
      isActive,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <IconBox
              icon={catalog.icon}
              tone={catalog.tone}
              className={catalog.iconClassName}
            />
            <div>
              <DialogTitle>{slot.title}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the settings. Leave the key blank to keep the current one."
                  : "Save a key so the agents stop reading it from the server environment."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div>
            <label
              htmlFor={keyField}
              className="mb-1.5 block text-xs font-bold"
            >
              API key
            </label>
            <SecretInput
              id={keyField}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={
                isEditing
                  ? `Current key ${config?.apiKeyHint} — leave blank to keep`
                  : catalog.keyPlaceholder
              }
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <KeyRound className="h-3 w-3" aria-hidden />
              Stored encrypted. It is never shown again after saving.
            </p>
          </div>

          <div>
            <label
              htmlFor={modelField}
              className="mb-1.5 block text-xs font-bold"
            >
              Model
            </label>
            <Input
              id={modelField}
              autoComplete="off"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder={
                catalog.modelPlaceholder[slot.purpose] || "Provider default"
              }
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label
              htmlFor={baseUrlField}
              className="mb-1.5 block text-xs font-bold"
            >
              Base URL{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id={baseUrlField}
              type="url"
              autoComplete="off"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://gateway.example.com/v1"
              className="font-mono text-xs"
            />
          </div>

          {catalog.supportsOrganization && (
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={organizationField}
                  className="mb-1.5 block text-xs font-bold"
                >
                  Organization ID
                </label>
                <Input
                  id={organizationField}
                  autoComplete="off"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                  placeholder="org-…"
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label
                  htmlFor={projectField}
                  className="mb-1.5 block text-xs font-bold"
                >
                  Project ID
                </label>
                <Input
                  id={projectField}
                  autoComplete="off"
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  placeholder="proj_…"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-inset px-3.5 py-2.5">
            <label htmlFor={activeField} className="min-w-0 flex-1">
              <span className="block text-xs font-bold">
                Use the stored key
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Turn off to fall back to the server environment.
              </span>
            </label>
            <Switch
              id={activeField}
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-3.5">
          <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">
            {ready ? "Ready to save" : "A new config needs an API key"}
          </span>
          <Button variant="outline" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button disabled={!ready || save.isPending} onClick={handleSave}>
            {save.isPending && (
              <Loader2
                className="mr-1.5 h-3.5 w-3.5 animate-spin"
                aria-hidden
              />
            )}
            {isEditing ? "Save changes" : "Save key"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
