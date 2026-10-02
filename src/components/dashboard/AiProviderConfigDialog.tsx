import { useEffect, useId, useState } from "react";
import { ChevronDown, ExternalLink, KeyRound, Loader2 } from "lucide-react";
import { ModelSelect } from "@/components/dashboard/ModelSelect";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { IconBox } from "@/components/ui/icon-box";
import { Input } from "@/components/ui/input";
import { SecretInput } from "@/components/ui/secret-input";
import { Switch } from "@/components/ui/switch";
import { AI_PROVIDER_CATALOG, type AiProviderSlot } from "@/config/aiProviders";
import { useSaveAiProviderConfig } from "@/hooks/useAiProviderConfigs";
import { formatDateProfessional } from "@/lib/dateFormat";
import { cn } from "@/lib/utils";
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
  const [advancedOpen, setAdvancedOpen] = useState(false);
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
      setAdvancedOpen(
        Boolean(config?.baseUrl || config?.organizationId || config?.projectId),
      );
    }
  }, [slot, config]);

  if (!slot) return null;

  const catalog = AI_PROVIDER_CATALOG[slot.provider];
  const modelOptions = catalog.models[slot.purpose];
  const keyReady = isEditing || apiKey.trim().length >= MIN_API_KEY_LENGTH;

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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <IconBox
              icon={catalog.icon}
              tone={catalog.tone}
              size="lg"
              className={catalog.iconClassName}
            />
            <div className="min-w-0">
              <DialogTitle>{slot.title}</DialogTitle>
              <DialogDescription>{slot.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <FormField
            label={isEditing ? "New API key" : "API key"}
            htmlFor={keyField}
            action={
              <a
                href={catalog.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Get a key from the {catalog.keyUrlLabel}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            }
            hint={
              <p className="flex flex-wrap items-center gap-1.5">
                <KeyRound className="h-3 w-3" aria-hidden />
                {config ? (
                  <>
                    Current key{" "}
                    <span className="font-mono">{config.apiKeyHint}</span>
                    <span aria-hidden>·</span>
                    rotated{" "}
                    {formatDateProfessional(config.lastRotatedAt, "relative")}
                  </>
                ) : (
                  "Stored encrypted. It is never shown again after saving."
                )}
              </p>
            }
          >
            <SecretInput
              id={keyField}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={
                isEditing
                  ? "Leave blank to keep the current key"
                  : catalog.keyPlaceholder
              }
            />
          </FormField>

          {modelOptions.length > 0 && (
            <FormField label="Model" htmlFor={modelField}>
              <ModelSelect
                id={modelField}
                value={model}
                onChange={setModel}
                options={modelOptions}
              />
            </FormField>
          )}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md py-1 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Advanced
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  advancedOpen && "rotate-180",
                )}
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3.5 pt-3">
              <FormField label="Base URL" htmlFor={baseUrlField}>
                <Input
                  id={baseUrlField}
                  type="url"
                  autoComplete="off"
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="Only for a gateway or proxy"
                  className="font-mono text-xs"
                />
              </FormField>
              {catalog.supportsOrganization && (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <FormField
                    label="Organization ID"
                    htmlFor={organizationField}
                  >
                    <Input
                      id={organizationField}
                      autoComplete="off"
                      value={organizationId}
                      onChange={(event) =>
                        setOrganizationId(event.target.value)
                      }
                      placeholder="org-…"
                      className="font-mono text-xs"
                    />
                  </FormField>
                  <FormField label="Project ID" htmlFor={projectField}>
                    <Input
                      id={projectField}
                      autoComplete="off"
                      value={projectId}
                      onChange={(event) => setProjectId(event.target.value)}
                      placeholder="proj_…"
                      className="font-mono text-xs"
                    />
                  </FormField>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {isEditing && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-inset px-3.5 py-2.5">
              <label htmlFor={activeField} className="min-w-0 flex-1">
                <span className="block text-xs font-bold">
                  Use the stored key
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Turn off to fall back to the server environment key.
                </span>
              </label>
              <Switch
                id={activeField}
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-3.5">
          {!keyReady && (
            <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">
              Paste an API key to continue
            </span>
          )}
          <Button variant="outline" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button disabled={!keyReady || save.isPending} onClick={handleSave}>
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
