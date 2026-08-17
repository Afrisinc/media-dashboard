import { useState } from "react";
import { ChevronRight, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConnectivityBadge } from "@/components/ui/connectivity-badge";
import { cn } from "@/lib/utils";
import { useAutopilot } from "@/contexts/AutopilotContext";
import {
  ConnectPlatformDialog,
  type ConnectPlatform,
} from "@/components/dashboard/ConnectPlatformDialog";
import {
  EditCredentialsDialog,
  type EditCredentialsPlatform,
} from "@/components/dashboard/EditCredentialsDialog";
import {
  SOCIAL_PLATFORMS,
  PLATFORM_CATALOG,
  type SocialPlatformKey,
} from "@/config/socialPlatforms";
import {
  useSocialMediaIntegrations,
  useAvailablePages,
  useDeleteAccount,
} from "@/hooks/useSocialMediaIntegrations";

function formatSyncedAgo(iso: string | null): string {
  if (!iso) return "not synced yet";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "synced just now";
  if (minutes < 60) return `synced ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `synced ${hours}h ago`;
  return `synced ${Math.round(hours / 24)}d ago`;
}

type ExpandedPlatformViewProps = {
  row: {
    key: SocialPlatformKey;
    catalog: (typeof PLATFORM_CATALOG)[SocialPlatformKey];
    connected: boolean;
    accounts: Array<{ id: string; name: string; meta?: string }>;
  };
};

function ExpandedPlatformView({ row }: ExpandedPlatformViewProps) {
  const { data: pages, isLoading } = useAvailablePages(row.key);
  const deleteAccount = useDeleteAccount();

  return (
    <div className="flex flex-col gap-2.5 px-6 pb-4 pl-[70px]">
      {row.connected && row.accounts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Connected Pages
          </p>
          {row.accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-inset px-3.5 py-2.5"
            >
              <span
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10.5px] font-bold",
                  row.catalog.tone,
                )}
              >
                {account.name
                  .replace(/[^A-Za-z]/g, "")
                  .slice(0, 2)
                  .toUpperCase() || "AF"}
              </span>
              <div className="min-w-[120px] flex-1">
                <p className="text-xs font-bold">{account.name}</p>
                {account.meta && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {account.meta}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => deleteAccount.mutate(account.id)}
                disabled={deleteAccount.isPending}
                title="Delete this account"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Fetching available pages…
        </div>
      ) : (
        pages &&
        pages.available.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Available Pages
            </p>
            {pages.available.map((page) => (
              <div
                key={page.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background px-3.5 py-2.5"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10.5px] font-bold",
                    row.catalog.tone,
                  )}
                >
                  {page.name
                    .replace(/[^A-Za-z]/g, "")
                    .slice(0, 2)
                    .toUpperCase() || "AF"}
                </span>
                <div className="min-w-[120px] flex-1">
                  <p className="text-xs font-bold">{page.name}</p>
                  {page.category && (
                    <p className="mt-0.5 text-[11px] text-dim-5">
                      {page.category}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-7 px-2 text-[10.5px]"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {!isLoading &&
        pages &&
        row.connected &&
        pages.available.length === 0 &&
        row.accounts.length > 0 && (
          <p className="px-0.5 text-xs text-dim-5">
            All your {row.catalog.displayName} pages are already connected.
          </p>
        )}

      {!isLoading && !row.connected && (
        <p className="px-0.5 text-xs text-dim-5">
          Add app credentials and connect your account to see available pages.
        </p>
      )}
    </div>
  );
}

const brandSwatches = [
  { label: "Primary", className: "bg-primary" },
  { label: "Forest", className: "bg-forest" },
  { label: "Terra", className: "bg-terra" },
  { label: "Gold", className: "bg-gold" },
];

const DashboardSettings = () => {
  const { autopilot, setAutopilot } = useAutopilot();
  const { data: integrations, isLoading } = useSocialMediaIntegrations();
  const [connectingKey, setConnectingKey] = useState<SocialPlatformKey | null>(
    null,
  );
  const [editingKey, setEditingKey] = useState<SocialPlatformKey | null>(null);
  const [expandedKey, setExpandedKey] = useState<SocialPlatformKey | null>(
    null,
  );

  const rows = SOCIAL_PLATFORMS.map((key) => {
    const catalog = PLATFORM_CATALOG[key];
    const integration = integrations?.find((row) => row.platform === key);
    return {
      key,
      catalog,
      appId: integration?.appId ?? null,
      connected: integration?.connected ?? false,
      syncedAt: integration?.syncedAt ?? null,
      accounts: integration?.accounts ?? [],
    };
  });

  const connectedCount = rows.filter((row) => row.connected).length;
  const notConnectedCount = rows.length - connectedCount;

  const connectingRow = rows.find((row) => row.key === connectingKey) ?? null;
  const connectingPlatform: ConnectPlatform | null = connectingRow
    ? {
        key: connectingRow.key,
        displayName: connectingRow.catalog.displayName,
        short: connectingRow.catalog.short,
        tone: connectingRow.catalog.tone,
        scopes: connectingRow.catalog.scopes,
      }
    : null;

  const editingRow = rows.find((row) => row.key === editingKey) ?? null;
  const editingPlatform: EditCredentialsPlatform | null = editingRow
    ? {
        key: editingRow.key,
        displayName: editingRow.catalog.displayName,
        short: editingRow.catalog.short,
        tone: editingRow.catalog.tone,
        appId: editingRow.appId,
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <div>
        <p className="line-accent">Settings</p>
        <h1 className="heading-section mt-2">Workspace</h1>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-bold">Fully automated publishing</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When on, media is generated, scheduled and published with no human
              approval step.
            </p>
          </div>
          <Switch checked={autopilot} onCheckedChange={setAutopilot} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
          <div>
            <p className="text-sm font-bold">Connected platforms</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {connectedCount} of {rows.length} platforms connected · tokens
              refresh automatically
            </p>
          </div>
          {notConnectedCount > 0 && (
            <span className="rounded-full bg-gold/12 px-2.5 py-1 text-[11px] font-bold text-gold whitespace-nowrap">
              {notConnectedCount} not connected
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading platforms…
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {rows.map((row) => {
              const expanded = expandedKey === row.key;
              const detail = row.connected
                ? `${row.accounts.map((a) => a.name).join(" · ")} · ${formatSyncedAgo(row.syncedAt)}`
                : "Add app credentials, then connect";

              return (
                <div key={row.key}>
                  <div className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                    <button
                      onClick={() => setExpandedKey(expanded ? null : row.key)}
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-transform",
                        expanded && "rotate-90",
                      )}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-[11px] font-bold",
                        row.catalog.tone,
                      )}
                    >
                      {row.catalog.short}
                    </span>
                    <div className="min-w-[150px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">
                          {row.catalog.displayName}
                        </span>
                        <ConnectivityBadge connected={row.connected} />
                      </div>
                      <p className="mt-0.5 truncate text-[11.5px] text-dim-5">
                        {detail}
                      </p>
                    </div>
                    <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">
                      {row.connected ? row.catalog.scopeSummary : "—"}
                    </span>
                    <button
                      title="App credentials"
                      onClick={() => setEditingKey(row.key)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border-3 bg-inset text-muted-foreground"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                    <Button
                      variant={row.connected ? "outline" : "default"}
                      size="sm"
                      onClick={() => setConnectingKey(row.key)}
                    >
                      {row.connected ? "Add account" : "Connect"}
                    </Button>
                  </div>
                  {expanded && <ExpandedPlatformView row={row} />}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-bold">Brand</p>
          <p className="mb-3.5 text-xs text-muted-foreground">
            Applied automatically to every generated asset.
          </p>
          <div className="flex gap-2">
            {brandSwatches.map((swatch) => (
              <span
                key={swatch.label}
                title={swatch.label}
                className={cn("h-9 w-9 rounded-lg", swatch.className)}
              />
            ))}
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-4 bg-card-hi-2 text-[10px] font-bold text-muted-foreground">
              Aa
            </span>
          </div>
        </CardContent>
      </Card>

      <ConnectPlatformDialog
        platform={connectingPlatform}
        onClose={() => setConnectingKey(null)}
      />

      <EditCredentialsDialog
        platform={editingPlatform}
        onClose={() => setEditingKey(null)}
      />
    </div>
  );
};

export default DashboardSettings;
