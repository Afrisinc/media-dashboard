import { useEffect, useId, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { cn } from "@/lib/utils";
import type { SocialPlatformKey } from "@/config/socialPlatforms";
import {
  useSaveIntegrationCredentials,
  useUpdateIntegrationCredentials,
} from "@/hooks/useSocialMediaIntegrations";

export interface EditCredentialsPlatform {
  key: SocialPlatformKey;
  displayName: string;
  short: string;
  tone: string;
  appId: string | null;
}

interface EditCredentialsDialogProps {
  platform: EditCredentialsPlatform | null;
  onClose: () => void;
}

export function EditCredentialsDialog({
  platform,
  onClose,
}: EditCredentialsDialogProps) {
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const appIdField = useId();
  const secretField = useId();

  const saveCredentials = useSaveIntegrationCredentials();
  const updateCredentials = useUpdateIntegrationCredentials();

  const isEditing = !!platform?.appId;
  const submitting = saveCredentials.isPending || updateCredentials.isPending;

  useEffect(() => {
    if (platform) {
      setAppId(platform.appId ?? "");
      setAppSecret("");
      setShowSecret(false);
    }
  }, [platform]);

  const handleClose = () => {
    onClose();
    setAppId("");
    setAppSecret("");
  };

  if (!platform) return null;

  const ready = isEditing
    ? appId.trim().length > 3
    : appId.trim().length > 3 && appSecret.trim().length > 5;

  const handleSave = async () => {
    if (isEditing) {
      await updateCredentials.mutateAsync({
        platform: platform.key,
        appId: appId.trim(),
        appSecret: appSecret.trim() || undefined,
      });
    } else {
      await saveCredentials.mutateAsync({
        platform: platform.key,
        appId: appId.trim(),
        appSecret: appSecret.trim(),
      });
    }
    handleClose();
  };

  return (
    <Dialog open={!!platform} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                platform.tone,
              )}
            >
              <PlatformIcon platform={platform.key} className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>{platform.displayName} credentials</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the app credentials used to publish to this platform."
                  : "Save app credentials before connecting an account."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5">
          <div>
            <label
              htmlFor={appIdField}
              className="mb-1.5 block text-xs font-bold"
            >
              {platform.displayName} App ID / Client ID
            </label>
            <Input
              id={appIdField}
              autoComplete="off"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1234567890123456"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label
              htmlFor={secretField}
              className="mb-1.5 block text-xs font-bold"
            >
              App Secret / Client Secret
            </label>
            <div className="relative">
              <Input
                id={secretField}
                type={showSecret ? "text" : "password"}
                autoComplete="new-password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder={
                  isEditing
                    ? "Leave blank to keep the current secret"
                    : "••••••••••••••••••••"
                }
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowSecret((value) => !value)}
                aria-label={showSecret ? "Hide the secret" : "Show the secret"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <KeyRound className="h-3 w-3" aria-hidden />
              Stored encrypted. It is never shown again after saving.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-3.5">
          <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">
            {ready
              ? "Ready to save"
              : isEditing
                ? "The App ID is required"
                : "Both the App ID and the secret are required"}
          </span>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button disabled={!ready || submitting} onClick={handleSave}>
            {submitting && (
              <Loader2
                className="mr-1.5 h-3.5 w-3.5 animate-spin"
                aria-hidden
              />
            )}
            {isEditing ? "Update credentials" : "Save credentials"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
