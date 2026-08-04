import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ConnectPlatform {
  name: string;
  short: string;
  tone: string;
  accounts: { name: string; meta: string }[];
  scopes: { label: string; desc: string; required: boolean }[];
}

interface ConnectPlatformDialogProps {
  platform: ConnectPlatform | null;
  onClose: () => void;
  /** Fired once the user authorizes the connection (entering the "Done" step). */
  onConnected?: () => void;
}

const stepLabels = ["App credentials", "Choose account", "Permissions", "Done"];

export function ConnectPlatformDialog({
  platform,
  onClose,
  onConnected,
}: ConnectPlatformDialogProps) {
  const [step, setStep] = useState(0);
  const [accountIdx, setAccountIdx] = useState(0);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");

  const handleClose = () => {
    onClose();
    setStep(0);
    setAccountIdx(0);
    setAppId("");
    setAppSecret("");
  };

  if (!platform) return null;

  const credsReady = appId.trim().length > 3 && appSecret.trim().length > 5;
  const account = platform.accounts[accountIdx];

  return (
    <Dialog open={!!platform} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
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
              <DialogTitle>
                {step === 3
                  ? `${platform.name} connected`
                  : `Connect ${platform.name}`}
              </DialogTitle>
              <DialogDescription>
                Step {step + 1} of 4 — {stepLabels[step]}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-1.5">
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex-1">
              <div
                className={cn(
                  "h-[3px] rounded-full",
                  idx <= step ? "bg-primary" : "bg-track",
                )}
              />
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-3.5">
            <p className="text-xs text-mut-2">
              Create an app in the {platform.name} developer portal, then paste
              its credentials here. Afrisinc uses them to request publishing
              access on your behalf.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-bold">
                {platform.name} App ID / Client ID
              </label>
              <Input
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1234567890123456"
                className="font-mono text-xs"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold">
                  App Secret / Client Secret
                </label>
              </div>
              <Input
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">
                Redirect / callback URI
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://app.afrisinc.com/oauth/${platform.name.toLowerCase()}/callback`}
                  className="bg-sunk-2 font-mono text-xs text-muted-foreground"
                />
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs text-mut-2">
              You’re signed in as Afrisinc — pick the destination.
            </p>
            {platform.accounts.map((acc, idx) => (
              <button
                key={acc.name}
                onClick={() => setAccountIdx(idx)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left",
                  idx === accountIdx
                    ? "border-primary/55 bg-primary/[0.08]"
                    : "border-border bg-inset",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10.5px] font-bold",
                    platform.tone,
                  )}
                >
                  {acc.name
                    .replace(/[^A-Za-z]/g, "")
                    .slice(0, 2)
                    .toUpperCase() || "AF"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{acc.name}</span>
                  <span className="block text-xs text-dim-4">{acc.meta}</span>
                </span>
                {idx === accountIdx && (
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs text-mut-2">
              Afrisinc will use these permissions on {account.name}. Publishing
              rights are required — that's what lets your AI team post without
              you.
            </p>
            {platform.scopes.map((scope) => (
              <div
                key={scope.label}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-inset px-3 py-2.5"
              >
                <span className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold">{scope.label}</span>
                  <span className="mt-0.5 block text-[11px] text-dim-4">
                    {scope.desc}
                  </span>
                </span>
                <Badge
                  variant={scope.required ? "default" : "secondary"}
                  className="flex-shrink-0 text-[9.5px] uppercase"
                >
                  {scope.required ? "Required" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/15 text-emerald">
              <Check className="h-6 w-6" />
            </span>
            <p className="text-base font-extrabold">{account.name} is live</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Afrisinc can now publish to {platform.name} without you. It
              appears everywhere media is routed.
            </p>
            <div className="mt-1 flex w-full flex-col gap-1.5 text-left">
              {[
                `Added to the ${platform.name} channel in the ⌘K composer`,
                "Workflows fan out to it on the next run",
                "Reach and engagement start flowing into Analytics",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-inset px-3 py-2.5"
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span className="text-xs text-mut-3">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 border-t border-border pt-3.5">
          <span className="flex-1 text-xs text-dim-4">
            {step === 0 &&
              (credsReady ? "Credentials ready" : "Both fields are required")}
            {step === 1 && account.name}
            {step === 2 && "2 optional permissions included"}
            {step === 3 && "Synced just now"}
          </span>
          {(step === 1 || step === 2) && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            disabled={step === 0 && !credsReady}
            onClick={() => {
              if (step === 3) {
                handleClose();
                return;
              }
              if (step === 2) onConnected?.();
              setStep((s) => s + 1);
            }}
          >
            {step === 0 && "Continue"}
            {step === 1 && "Continue"}
            {step === 2 && "Authorize & connect"}
            {step === 3 && "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
