import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const saveCredentials = useSaveIntegrationCredentials();
  const updateCredentials = useUpdateIntegrationCredentials();

  const isEditing = !!platform?.appId;
  const submitting = saveCredentials.isPending || updateCredentials.isPending;

  useEffect(() => {
    if (platform) {
      setAppId(platform.appId ?? "");
      setAppSecret("");
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
                "rounded-md px-2 py-1 text-[11px] font-bold",
                platform.tone,
              )}
            >
              {platform.short}
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
            <label className="mb-1.5 block text-xs font-bold">
              {platform.displayName} App ID / Client ID
            </label>
            <Input
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1234567890123456"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold">
              App Secret / Client Secret
            </label>
            <Input
              type="password"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder={
                isEditing
                  ? "Leave blank to keep the current secret"
                  : "••••••••••••••••••••"
              }
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-t border-border pt-3.5">
          <span className="flex-1 text-xs text-dim-4">
            {ready ? "Credentials ready" : "App ID is required"}
          </span>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button disabled={!ready || submitting} onClick={handleSave}>
            {submitting ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
