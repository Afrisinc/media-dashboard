import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ConnectivityBadge } from "@/components/ui/connectivity-badge";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { SectionLabel } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PlatformCatalogEntry,
  SocialPlatformKey,
} from "@/config/socialPlatforms";
import {
  useAddAccountFromFacebookPage,
  useAvailablePages,
  useDeleteAccount,
  type FacebookPage,
} from "@/hooks/useSocialMediaIntegrations";
import { cn } from "@/lib/utils";
import { groupTone, type AccountGroup } from "@/types/accountGroup";

export interface PlatformConnectionRow {
  key: SocialPlatformKey;
  catalog: PlatformCatalogEntry;
  appId: string | null;
  connected: boolean;
  syncedAt: string | null;
  accounts: Array<{ id: string; name: string; meta?: string | null }>;
}

interface PlatformConnectionListProps {
  rows: PlatformConnectionRow[];
  groups: AccountGroup[];
  loading: boolean;
  onConnect: (key: SocialPlatformKey) => void;
  onEditCredentials: (key: SocialPlatformKey) => void;
}

function syncedAgo(iso: string | null): string {
  if (!iso) return "not synced yet";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "synced just now";
  if (minutes < 60) return `synced ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `synced ${hours}h ago`;
  return `synced ${Math.round(hours / 24)}d ago`;
}

function initials(name: string): string {
  return (
    name
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function rowDetail(row: PlatformConnectionRow): string {
  if (row.connected) {
    const pages = `${row.accounts.length} ${row.accounts.length === 1 ? "page" : "pages"}`;
    return [pages, syncedAgo(row.syncedAt), row.catalog.scopeSummary].join(
      " · ",
    );
  }
  return row.appId
    ? "Credentials saved. Connect an account to start publishing."
    : "Save the app credentials, then connect an account.";
}

function PlatformMark({
  platform,
  tone,
  size = "md",
}: Readonly<{
  platform: SocialPlatformKey;
  tone: string;
  size?: "sm" | "md";
}>) {
  return (
    <span
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-lg",
        size === "md" ? "h-10 w-10" : "h-8 w-8",
        tone,
      )}
    >
      <PlatformIcon
        platform={platform}
        className={size === "md" ? "h-5 w-5" : "h-4 w-4"}
      />
    </span>
  );
}

function PageRow({
  name,
  meta,
  tone,
  muted = false,
  children,
}: Readonly<{
  name: string;
  meta?: string | null;
  tone: string;
  muted?: boolean;
  children: ReactNode;
}>) {
  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5",
        muted && "opacity-60",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
          tone,
        )}
      >
        {initials(name)}
      </span>
      <div className="min-w-[140px] flex-1">
        <p className="truncate text-sm font-medium" title={name}>
          {name}
        </p>
        {meta && (
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        )}
      </div>
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 sm:flex-shrink-0">
        {children}
      </div>
    </li>
  );
}

function BrandBadges({
  accountId,
  groups,
}: Readonly<{ accountId: string; groups: AccountGroup[] }>) {
  const memberships = groups.flatMap((group) =>
    group.members
      .filter((member) => member.accountId === accountId)
      .map((member) => ({ group, isActive: member.isActive })),
  );

  if (memberships.length === 0) {
    return (
      <Link
        to="/brands"
        className="rounded-full bg-gold/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold hover:bg-gold/20"
        title="This page publishes under no brand. Add it to one on Brands."
      >
        No brand
      </Link>
    );
  }

  return (
    <span className="flex min-w-0 max-w-full flex-wrap gap-1">
      {memberships.map(({ group, isActive }) => (
        <span
          key={group.id}
          title={
            isActive
              ? `Publishing under ${group.name}`
              : `Paused in ${group.name}`
          }
          className={cn(
            "max-w-full truncate rounded-full sm:max-w-[12rem] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            isActive ? groupTone(group.color) : "bg-track text-dim-6",
          )}
        >
          {group.name}
        </span>
      ))}
    </span>
  );
}

function PlatformPages({
  row,
  groups,
}: Readonly<{ row: PlatformConnectionRow; groups: AccountGroup[] }>) {
  const { data: pages, isLoading } = useAvailablePages(row.key);
  const deleteAccount = useDeleteAccount();
  const addAccount = useAddAccountFromFacebookPage();
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(
    null,
  );

  const isInstagram = row.key === "instagram";
  const addingPageId = addAccount.isPending
    ? addAccount.variables?.pageId
    : undefined;

  const handleAdd = (page: FacebookPage) => {
    if (!page.access_token) return;
    addAccount.mutate({
      platform: row.key,
      pageId: page.id,
      pageName: page.name,
      scopes: row.catalog.scopes
        .filter((scope) => scope.required)
        .map((scope) => scope.id),
      accessToken: page.access_token,
    });
  };

  const available = pages?.available ?? [];

  return (
    <div className="space-y-4 border-t border-border/60 bg-inset/60 px-4 py-4 sm:px-5 sm:pl-[4.75rem]">
      {row.accounts.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>Connected pages</SectionLabel>
          <ul className="space-y-1.5">
            {row.accounts.map((account) => (
              <PageRow
                key={account.id}
                name={account.name}
                meta={account.meta}
                tone={row.catalog.tone}
              >
                <BrandBadges accountId={account.id} groups={groups} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    setRemoving({ id: account.id, name: account.name })
                  }
                  disabled={deleteAccount.isPending}
                  title={`Disconnect ${account.name}`}
                  aria-label={`Disconnect ${account.name}`}
                >
                  {deleteAccount.isPending &&
                  deleteAccount.variables === account.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </PageRow>
            ))}
          </ul>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-1.5" aria-label="Looking for pages">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : (
        available.length > 0 && (
          <div className="space-y-2">
            <SectionLabel>Ready to add</SectionLabel>
            <ul className="space-y-1.5">
              {available.map((page) => {
                const instagram = page.instagramBusinessAccount;
                const eligible = !isInstagram || !!instagram;
                const displayName =
                  isInstagram && instagram?.username
                    ? `@${instagram.username}`
                    : page.name;
                const meta = isInstagram
                  ? eligible
                    ? `Linked to ${page.name}`
                    : `${page.name} has no Instagram professional account linked`
                  : page.category;
                const adding = addingPageId === page.id;

                return (
                  <PageRow
                    key={page.id}
                    name={displayName}
                    meta={meta}
                    tone={row.catalog.tone}
                    muted={!eligible}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdd(page)}
                      disabled={!eligible || addAccount.isPending}
                    >
                      {adding ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Add
                    </Button>
                  </PageRow>
                );
              })}
            </ul>
          </div>
        )
      )}

      {!isLoading && row.connected && available.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Every {row.catalog.displayName} page you manage is already connected.
        </p>
      )}

      {!isLoading && !row.connected && available.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {row.appId
            ? "Connect an account to see the pages you can publish to."
            : "Save the app credentials and connect an account to see the pages you can publish to."}
        </p>
      )}

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Disconnect ${removing?.name ?? "this page"}?`}
        description="The agents stop publishing to it and any brand using it loses the page. You can add it back later."
        confirmLabel="Disconnect"
        destructive
        onConfirm={() => removing && deleteAccount.mutate(removing.id)}
      />
    </div>
  );
}

function PlatformRow({
  row,
  groups,
  expanded,
  onToggle,
  onConnect,
  onEditCredentials,
}: Readonly<{
  row: PlatformConnectionRow;
  groups: AccountGroup[];
  expanded: boolean;
  onToggle: () => void;
  onConnect: () => void;
  onEditCredentials: () => void;
}>) {
  const pagesId = `platform-pages-${row.key}`;

  return (
    <li>
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={pagesId}
          className="-m-1 flex w-full min-w-0 items-center gap-3 rounded-lg p-1 text-left sm:w-auto sm:flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90",
            )}
            aria-hidden
          />
          <PlatformMark platform={row.key} tone={row.catalog.tone} />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                {row.catalog.displayName}
              </span>
              <ConnectivityBadge connected={row.connected} />
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground sm:truncate">
              {rowDetail(row)}
            </span>
          </span>
        </button>

        <div className="flex flex-shrink-0 items-center gap-2 pl-[4.75rem] sm:pl-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditCredentials}
            aria-label={`${row.catalog.displayName} app credentials`}
            title="App credentials"
          >
            <KeyRound className="h-3.5 w-3.5 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">
              {row.appId ? "Credentials" : "Add credentials"}
            </span>
          </Button>
          <Button
            variant={row.connected ? "outline" : "default"}
            size="sm"
            onClick={onConnect}
          >
            {row.connected ? (
              <>
                <Plus className="mr-1 h-3.5 w-3.5" aria-hidden />
                Add account
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div id={pagesId}>
          <PlatformPages row={row} groups={groups} />
        </div>
      )}
    </li>
  );
}

export function PlatformConnectionList({
  rows,
  groups,
  loading,
  onConnect,
  onEditCredentials,
}: Readonly<PlatformConnectionListProps>) {
  const [expandedKey, setExpandedKey] = useState<SocialPlatformKey | null>(
    null,
  );

  if (loading) {
    return (
      <ul className="divide-y divide-border/60" aria-label="Loading platforms">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-24" />
          </li>
        ))}
      </ul>
    );
  }

  const ordered = [...rows].sort(
    (a, b) => Number(b.connected) - Number(a.connected),
  );

  return (
    <ul className="divide-y divide-border/60">
      {ordered.map((row) => (
        <PlatformRow
          key={row.key}
          row={row}
          groups={groups}
          expanded={expandedKey === row.key}
          onToggle={() =>
            setExpandedKey((current) => (current === row.key ? null : row.key))
          }
          onConnect={() => onConnect(row.key)}
          onEditCredentials={() => onEditCredentials(row.key)}
        />
      ))}
    </ul>
  );
}
