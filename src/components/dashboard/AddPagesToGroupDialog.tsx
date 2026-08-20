import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PLATFORM_CATALOG,
  type SocialPlatformKey,
} from "@/config/socialPlatforms";
import { useAddPagesToBrand } from "@/hooks/useAccountGroups";
import {
  useAvailablePages,
  useInstalledAccounts,
  type FacebookPage,
} from "@/hooks/useSocialMediaIntegrations";
import { cn } from "@/lib/utils";
import type { AccountGroup } from "@/types/accountGroup";
import type { InstallPageParams } from "@/services/socialAccountService";
import { Loader2, PlugZap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface AddPagesToGroupDialogProps {
  open: boolean;
  group: AccountGroup | null;
  onClose: () => void;
}

/** A row the user can tick, whether it is already installed or not yet. */
interface Selectable {
  key: string;
  platform: SocialPlatformKey;
  title: string;
  detail: string;
  eligible: boolean;
  install?: InstallPageParams;
}

function requiredScopes(platform: SocialPlatformKey): string[] {
  return PLATFORM_CATALOG[platform].scopes
    .filter((scope) => scope.required)
    .map((scope) => scope.id);
}

/**
 * Instagram publishes through the Facebook Page it is linked to, so a Page with
 * no linked professional account can never be installed as an Instagram account.
 */
function toSelectable(
  platform: SocialPlatformKey,
  page: FacebookPage,
): Selectable {
  const instagram = page.instagramBusinessAccount;
  const isInstagram = platform === "instagram";
  const eligible = (!isInstagram || !!instagram) && !!page.access_token;

  return {
    key: `${platform}:${page.id}`,
    platform,
    title:
      isInstagram && instagram?.username ? `@${instagram.username}` : page.name,
    detail: isInstagram
      ? instagram
        ? `via ${page.name}`
        : `${page.name} — no Instagram professional account linked`
      : (page.category ?? "Facebook Page"),
    eligible,
    install: {
      platform,
      pageId: page.id,
      pageName: page.name,
      scopes: requiredScopes(platform),
      accessToken: page.access_token ?? "",
    },
  };
}

function SelectableRow({
  item,
  checked,
  onToggle,
}: {
  item: Selectable;
  checked: boolean;
  onToggle: () => void;
}) {
  const catalog = PLATFORM_CATALOG[item.platform];

  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border p-3 transition-colors",
        item.eligible
          ? "cursor-pointer hover:bg-inset"
          : "cursor-not-allowed opacity-60",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        disabled={!item.eligible}
        className="mt-1"
      />
      <span
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10.5px] font-bold",
          catalog.tone,
        )}
      >
        {catalog.short}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </div>
    </label>
  );
}

export function AddPagesToGroupDialog({
  open,
  group,
  onClose,
}: AddPagesToGroupDialogProps) {
  const { accounts, isLoading: accountsLoading } = useInstalledAccounts();
  const facebook = useAvailablePages(open ? "facebook" : undefined);
  const instagram = useAvailablePages(open ? "instagram" : undefined);
  const addPages = useAddPagesToBrand();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setSelected(new Set());
  }, [open]);

  const alreadyIn = new Set(
    group?.members.map((member) => member.accountId) ?? [],
  );

  const workspace: Selectable[] = accounts
    .filter((account) => !alreadyIn.has(account.id))
    .map((account) => ({
      key: account.id,
      platform: account.platform,
      title: account.name,
      detail: account.meta
        ? `${PLATFORM_CATALOG[account.platform].displayName} · ${account.meta}`
        : PLATFORM_CATALOG[account.platform].displayName,
      eligible: true,
    }));

  const notInstalled: Selectable[] = [
    ...(facebook.data?.available ?? []).map((page) =>
      toSelectable("facebook", page),
    ),
    ...(instagram.data?.available ?? []).map((page) =>
      toSelectable("instagram", page),
    ),
  ];

  const everything = [...workspace, ...notInstalled];
  const chosen = everything.filter((item) => selected.has(item.key));
  const toInstall = chosen.filter((item) => item.install);
  const pagesLoading = facebook.isLoading || instagram.isLoading;

  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  const onConfirm = () => {
    if (!group || chosen.length === 0) return;

    addPages.mutate(
      {
        groupId: group.id,
        accountIds: chosen
          .filter((item) => !item.install)
          .map((item) => item.key),
        install: toInstall.map((item) => item.install as InstallPageParams),
      },
      { onSuccess: onClose },
    );
  };

  const nothingAnywhere =
    !accountsLoading && !pagesLoading && everything.length === 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add pages to {group?.name}</DialogTitle>
          <DialogDescription>
            Every page you add here publishes when this brand posts. Pages you
            have not connected yet are connected as part of adding them.
          </DialogDescription>
        </DialogHeader>

        {accountsLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your pages…
          </div>
        )}

        {nothingAnywhere && (
          <EmptyState
            icon={PlugZap}
            title={
              accounts.length === 0
                ? "No pages found"
                : "Every page you have is already in this brand"
            }
            description={
              accounts.length === 0
                ? "Save your Facebook or Instagram app credentials in Settings and connect your account — the Pages you manage will then show up here."
                : "Connect another Page on Facebook or Instagram to add more."
            }
          />
        )}

        {workspace.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              In your workspace
            </p>
            {workspace.map((item) => (
              <SelectableRow
                key={item.key}
                item={item}
                checked={selected.has(item.key)}
                onToggle={() => toggle(item.key)}
              />
            ))}
          </div>
        )}

        {(pagesLoading || notInstalled.length > 0) && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Available on Facebook / Instagram
              {pagesLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </p>
            {notInstalled.map((item) => (
              <SelectableRow
                key={item.key}
                item={item}
                checked={selected.has(item.key)}
                onToggle={() => toggle(item.key)}
              />
            ))}
          </div>
        )}

        {facebook.isError && instagram.isError && !accountsLoading && (
          <p className="rounded-lg border border-border bg-inset px-3 py-2 text-[11px] text-gold">
            Could not reach Facebook or Instagram to list your Pages. You can
            still add pages already in your workspace, or check your app
            credentials in{" "}
            <Link to="/settings" className="font-semibold underline">
              Settings
            </Link>
            .
          </p>
        )}

        <div className="flex items-center gap-2.5 border-t border-border pt-4">
          <span className="flex-1 text-xs text-muted-foreground">
            {chosen.length === 0
              ? "Select at least one page"
              : `${chosen.length} selected${
                  toInstall.length
                    ? ` · ${toInstall.length} will be connected`
                    : ""
                }`}
          </span>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={addPages.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={chosen.length === 0 || addPages.isPending}
          >
            {addPages.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {addPages.isPending ? "Adding…" : "Add to brand"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
