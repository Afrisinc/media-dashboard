import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SocialPlatformKey, ScopeDef } from "@/config/socialPlatforms";
import {
  useSaveIntegrationCredentials,
  useAddSocialMediaAccount,
  useAddAccountFromFacebookPage,
  useSocialMediaIntegrations,
  useAvailablePages,
  type FacebookPage,
  type OAuthCallbackResponse,
} from "@/hooks/useSocialMediaIntegrations";
import { PageSelectionDialog } from "./PageSelectionDialog";

export interface ConnectPlatform {
  key: SocialPlatformKey;
  displayName: string;
  short: string;
  tone: string;
  scopes: ScopeDef[];
}

interface ConnectPlatformDialogProps {
  platform: ConnectPlatform | null;
  onClose: () => void;
  onConnected?: () => void;
}

const stepLabels = [
  "Credentials",
  "Authorize",
  "Select Pages",
  "Confirm",
  "Done",
];

export function ConnectPlatformDialog({
  platform,
  onClose,
  onConnected,
}: ConnectPlatformDialogProps) {
  const { data: integrations } = useSocialMediaIntegrations();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [oauthState, setOauthState] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(
    new Set(),
  );
  const [optionalScopes, setOptionalScopes] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const saveCredentials = useSaveIntegrationCredentials();
  const addAccount = useAddSocialMediaAccount();
  const addPageAccount = useAddAccountFromFacebookPage();
  const { data: availablePages, refetch: refetchPages } = useAvailablePages(
    platform?.key,
  );

  useEffect(() => {
    if (!platform) return;

    // Set default callback URL
    const baseUrl = window.location.origin;
    setCallbackUrl(`${baseUrl}/oauth/callback/${platform.key}`);

    // If platform is already connected with credentials, skip to page selection
    const integration = integrations?.find((i) => i.platform === platform.key);
    if (integration?.appId && integration?.connected) {
      setAppId(integration.appId);
      setStep(2); // Jump to Select Pages (step 2)
      refetchPages();
    }
  }, [platform, integrations, refetchPages]);

  useEffect(() => {
    // When starting at step 2 (already connected), populate pages from availablePages
    if (step === 2 && availablePages?.available) {
      setPages(availablePages.available);
    }
  }, [step, availablePages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pagesParam = params.get("pages");
    const platformParam = params.get("platform");

    if (pagesParam && platformParam === platform?.key) {
      try {
        const fetchedPages = JSON.parse(pagesParam);
        setPages(fetchedPages);
        setStep(2); // Move to page selection
        window.history.replaceState({}, "", window.location.pathname);
      } catch (e) {
        console.error("Failed to parse pages from URL", e);
      }
    }
  }, [platform]);

  const handleClose = () => {
    onClose();
    setStep(0);
    setAppId("");
    setAppSecret("");
    setAccountId(null);
    setOauthState(null);
    setPages([]);
    setSelectedPageIds(new Set());
    setOptionalScopes(new Set());
  };

  if (!platform) return null;

  const credsReady =
    appId.trim().length > 3 &&
    appSecret.trim().length > 5 &&
    callbackUrl.trim().length > 10;

  const toggleScope = (id: string) => {
    setOptionalScopes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePageId = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const handleSaveCredentials = async () => {
    setSubmitting(true);
    try {
      await saveCredentials.mutateAsync({
        platform: platform.key,
        appId: appId.trim(),
        appSecret: appSecret.trim(),
        callbackUrl: callbackUrl.trim(),
      });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthorize = async () => {
    setSubmitting(true);
    try {
      const scopes = platform.scopes
        .filter((scope) => scope.required || optionalScopes.has(scope.id))
        .map((scope) => scope.id);

      const result = await addAccount.mutateAsync({
        platform: platform.key,
        name: platform.displayName,
        scopes,
      });

      setAccountId(result.id);
      setOauthState(result.oauthState || result.state);

      // Build OAuth URL
      const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
      authUrl.searchParams.append("client_id", appId.trim());
      authUrl.searchParams.append("redirect_uri", callbackUrl.trim());
      authUrl.searchParams.append("state", result.oauthState || result.state);
      authUrl.searchParams.append("scope", scopes.join(","));
      authUrl.searchParams.append("response_type", "code");

      window.location.href = authUrl.toString();
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPages = async () => {
    setSubmitting(true);
    try {
      const scopes = platform.scopes
        .filter((scope) => scope.required || optionalScopes.has(scope.id))
        .map((scope) => scope.id);

      for (const pageId of selectedPageIds) {
        const page = pages.find((p) => p.id === pageId);
        if (!page) {
          console.error(`[OAuth] Page not found: ${pageId}`);
          continue;
        }

        if (!page.access_token) {
          console.error(`[OAuth] Page ${page.name} missing access_token`, page);
          throw new Error(
            `Page "${page.name}" is missing access token from Facebook`,
          );
        }

        console.log(`[OAuth] Adding page: ${page.name} (${pageId})`);

        await addPageAccount.mutateAsync({
          platform: platform.key,
          pageId,
          pageName: page.name,
          scopes,
          accessToken: page.access_token,
        });

        console.log(`[OAuth] Successfully added page: ${page.name}`);
      }

      console.log("[OAuth] All pages connected successfully");
      onConnected?.();
      setStep(4); // Done
    } catch (error) {
      console.error("[OAuth] Error connecting pages:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (step === 0) {
      await handleSaveCredentials();
      return;
    }

    if (step === 1) {
      await handleAuthorize();
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      await handleConfirmPages();
      return;
    }

    handleClose();
  };

  const isInstagram = platform.key === "instagram";
  const eligiblePageCount = isInstagram
    ? pages.filter((page) => page.instagramBusinessAccount).length
    : pages.length;

  const primaryDisabled =
    submitting ||
    (step === 0 && !credsReady) ||
    (step === 3 && selectedPageIds.size === 0);

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
                {step === 4
                  ? `${platform.displayName} connected`
                  : `Connect ${platform.displayName}`}
              </DialogTitle>
              <DialogDescription>
                Step {step + 1} of {stepLabels.length} — {stepLabels[step]}
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
            <p className="text-xs text-muted-foreground">
              {isInstagram
                ? "Instagram uses your Facebook app — the same App ID and secret. Add the Instagram product to it in the Meta App Dashboard."
                : `Create an app in the ${platform.displayName} developer portal, then paste its credentials here.`}
            </p>
            {isInstagram && (
              <div className="rounded-lg border border-border bg-inset p-3">
                <p className="text-xs font-bold">Before you connect</p>
                <ul className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground">
                  <li>
                    • Your Instagram account must be a Business or Creator
                    account
                  </li>
                  <li>• It must be linked to a Facebook Page you administer</li>
                  <li>
                    • If that Page requires Page Publishing Authorization,
                    complete it first — publishing fails until you do
                  </li>
                </ul>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-bold">
                App ID / Client ID
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
                placeholder="••••••••••••••••••••"
                className="font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">
                OAuth Callback URL
              </label>
              <Input
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                placeholder="https://yourdomain.com/oauth/callback/facebook"
                className="font-mono text-xs"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Must match your app settings in {platform.displayName}
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3.5">
            <p className="text-xs text-muted-foreground">
              Review the permissions Afrisinc will request. Publishing rights
              are required.
            </p>
            <div className="flex flex-col gap-2">
              {platform.scopes.map((scope) => (
                <div
                  key={scope.label}
                  className="flex items-start gap-2.5 rounded-lg border border-border bg-inset px-3 py-2.5"
                >
                  <Checkbox
                    checked={scope.required || optionalScopes.has(scope.id)}
                    disabled={scope.required}
                    onCheckedChange={() => toggleScope(scope.id)}
                    className="mt-0.5"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold">
                      {scope.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
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
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              {isInstagram
                ? "Instagram publishes through the Facebook Page it is linked to. Only Pages with a linked professional account can be connected."
                : `Select which ${platform.displayName} pages to connect`}
            </p>
            {pages.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading pages...
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {pages.map((page) => {
                  const instagram = page.instagramBusinessAccount;
                  const eligible = !isInstagram || !!instagram;

                  return (
                    <label
                      key={page.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border border-border transition-colors",
                        eligible
                          ? "hover:bg-inset cursor-pointer"
                          : "opacity-60 cursor-not-allowed",
                      )}
                    >
                      <Checkbox
                        checked={selectedPageIds.has(page.id)}
                        onCheckedChange={() => togglePageId(page.id)}
                        disabled={!eligible}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {isInstagram && instagram?.username
                            ? `@${instagram.username}`
                            : page.name}
                        </p>
                        {isInstagram ? (
                          <p className="text-xs text-muted-foreground">
                            {eligible
                              ? `via ${page.name}`
                              : `${page.name} — no Instagram professional account linked`}
                          </p>
                        ) : (
                          page.category && (
                            <p className="text-xs text-muted-foreground">
                              {page.category}
                            </p>
                          )
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {isInstagram && pages.length > 0 && eligiblePageCount === 0 && (
              <p className="text-xs text-muted-foreground">
                None of your Pages have a linked Instagram professional account.
                In Instagram, switch the account to Business or Creator, then
                link it to a Facebook Page from Page settings.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Confirm the {selectedPageIds.size} page
              {selectedPageIds.size === 1 ? "" : "s"} you want to connect
            </p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {Array.from(selectedPageIds).map((pageId) => {
                const page = pages.find((p) => p.id === pageId);
                if (!page) return null;
                return (
                  <div
                    key={pageId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-inset"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{page.name}</p>
                      {page.category && (
                        <p className="text-xs text-muted-foreground">
                          {page.category}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/15 text-emerald">
              <Check className="h-6 w-6" />
            </span>
            <p className="text-base font-extrabold">
              {selectedPageIds.size} page{selectedPageIds.size === 1 ? "" : "s"}{" "}
              connected
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Your pages are now ready to use with Afrisinc.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2.5 border-t border-border pt-4">
          <span className="flex-1 text-xs text-muted-foreground">
            {step === 0 &&
              (credsReady ? "Credentials ready" : "All fields required")}
            {step === 1 &&
              `${optionalScopes.size} optional permission${optionalScopes.size === 1 ? "" : "s"}`}
            {step === 2 &&
              (selectedPageIds.size === 0
                ? "Select at least one page"
                : `${selectedPageIds.size} page${selectedPageIds.size === 1 ? "" : "s"} selected`)}
            {step === 3 &&
              `Connecting ${selectedPageIds.size} page${selectedPageIds.size === 1 ? "" : "s"}`}
            {step === 4 && "Complete"}
          </span>
          {(step === 1 || step === 2 || step === 3) && (
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
          )}
          <Button disabled={primaryDisabled} onClick={handlePrimaryAction}>
            {step === 0 && (submitting ? "Saving..." : "Continue")}
            {step === 1 &&
              (submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Authorize with Facebook"
              ))}
            {step === 2 && "Continue"}
            {step === 3 &&
              (submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Pages"
              ))}
            {step === 4 && "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
