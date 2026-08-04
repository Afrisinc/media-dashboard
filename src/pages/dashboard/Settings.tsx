import { useState } from "react";
import { ChevronRight, KeyRound } from "lucide-react";
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
  PlatformCatalogDialog,
  type CatalogPlatform,
} from "@/components/dashboard/PlatformCatalogDialog";

type SettingsPlatform = ConnectPlatform & {
  connected: boolean;
  scopeSummary: string;
  displayName?: string;
};

function platformDetail(platform: SettingsPlatform) {
  if (!platform.connected) return "Add app credentials, then connect";
  const names = platform.accounts.map((a) => a.name).join(" · ");
  return `${names} · synced 4m ago`;
}

const scopes = [
  {
    label: "Publish posts & media",
    desc: "Post on your behalf — the core of autopilot.",
    required: true,
  },
  {
    label: "Read insights",
    desc: "Pull reach, engagement and follower data for analytics.",
    required: true,
  },
  {
    label: "Manage comments & DMs",
    desc: "Let the Community Manager agent reply for you.",
    required: false,
  },
  {
    label: "Read profile",
    desc: "Confirm the account identity and avatar.",
    required: true,
  },
];

const webScopes = [
  {
    label: "Publish articles & pages",
    desc: "Create and update posts directly in your CMS.",
    required: true,
  },
  {
    label: "Upload media",
    desc: "Push generated images and video to your media library.",
    required: true,
  },
  {
    label: "Read analytics",
    desc: "Pull page views and reading time back into reports.",
    required: false,
  },
];

const initialPlatforms: SettingsPlatform[] = [
  {
    name: "Website",
    displayName: "Website (CMS)",
    short: "WEB",
    tone: "text-forest bg-forest/10",
    connected: true,
    scopeSummary: "Publish, media",
    accounts: [
      { name: "afrisinc.com", meta: "Production site · API key" },
      { name: "blog.afrisinc.com", meta: "Staging site · API key" },
    ],
    scopes: webScopes,
  },
  {
    name: "Facebook",
    short: "FB",
    tone: "text-platform-facebook bg-platform-facebook/10",
    connected: true,
    scopeSummary: "Publish, insights",
    accounts: [
      { name: "Afrisinc", meta: "Page · 18.2K followers" },
      { name: "Afrisinc Careers", meta: "Page · 2.1K followers" },
    ],
    scopes,
  },
  {
    name: "Instagram",
    short: "IG",
    tone: "text-platform-instagram bg-platform-instagram/10",
    connected: true,
    scopeSummary: "Publish, DMs, insights",
    accounts: [
      { name: "@afrisinc", meta: "Business · 24.6K followers" },
      { name: "@afrisinc.studio", meta: "Creator · 3.4K followers" },
    ],
    scopes,
  },
  {
    name: "TikTok",
    short: "TT",
    tone: "text-platform-tiktok bg-platform-tiktok/10",
    connected: true,
    scopeSummary: "Publish, insights",
    accounts: [{ name: "@afrisinc", meta: "Business · 41.9K followers" }],
    scopes,
  },
  {
    name: "YouTube",
    short: "YT",
    tone: "text-platform-youtube bg-platform-youtube/10",
    connected: true,
    scopeSummary: "Upload, insights",
    accounts: [
      { name: "Afrisinc", meta: "Brand channel · 12.4K subs" },
      { name: "Afrisinc Radio", meta: "Brand channel · 1.9K subs" },
    ],
    scopes,
  },
  {
    name: "LinkedIn",
    short: "IN",
    tone: "text-platform-linkedin bg-platform-linkedin/10",
    connected: true,
    scopeSummary: "Publish, insights",
    accounts: [{ name: "Afrisinc", meta: "Company page · 8.7K followers" }],
    scopes,
  },
  {
    name: "X",
    short: "X",
    tone: "text-ink-f bg-ink-f/10",
    connected: false,
    scopeSummary: "—",
    accounts: [{ name: "@afrisinc", meta: "Verified organization" }],
    scopes,
  },
];

const brandSwatches = [
  { label: "Primary", className: "bg-primary" },
  { label: "Forest", className: "bg-forest" },
  { label: "Terra", className: "bg-terra" },
  { label: "Gold", className: "bg-gold" },
];

function fromCatalog(catalog: CatalogPlatform): SettingsPlatform {
  return {
    name: catalog.name,
    short: catalog.short,
    tone: catalog.tone,
    connected: false,
    scopeSummary: catalog.kinds,
    accounts: [{ name: "Afrisinc", meta: "Business account" }],
    scopes,
  };
}

const DashboardSettings = () => {
  const { autopilot, setAutopilot } = useAutopilot();
  const [platforms, setPlatforms] =
    useState<SettingsPlatform[]>(initialPlatforms);
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const connectedCount = platforms.filter((p) => p.connected).length;
  const notConnectedCount = platforms.length - connectedCount;
  const connectingPlatform =
    platforms.find((p) => p.name === connectingName) ?? null;

  const handleCatalogSelect = (catalog: CatalogPlatform) => {
    setCatalogOpen(false);
    if (!platforms.some((p) => p.name === catalog.name)) {
      setPlatforms((prev) => [...prev, fromCatalog(catalog)]);
    }
    setConnectingName(catalog.name);
  };

  const handleConnected = (name: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.name === name ? { ...p, connected: true } : p)),
    );
  };

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
              {connectedCount} of {platforms.length} platforms connected ·
              tokens refresh automatically
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {notConnectedCount > 0 && (
              <span className="rounded-full bg-gold/12 px-2.5 py-1 text-[11px] font-bold text-gold whitespace-nowrap">
                {notConnectedCount} not connected
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCatalogOpen(true)}
            >
              + Add platform
            </Button>
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {platforms.map((platform) => {
            const expanded = expandedName === platform.name;
            return (
              <div key={platform.name}>
                <div className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                  <button
                    onClick={() =>
                      setExpandedName(expanded ? null : platform.name)
                    }
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
                      platform.tone,
                    )}
                  >
                    {platform.short}
                  </span>
                  <div className="min-w-[150px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold">
                        {platform.displayName ?? platform.name}
                      </span>
                      <ConnectivityBadge connected={platform.connected} />
                    </div>
                    <p className="mt-0.5 truncate text-[11.5px] text-dim-5">
                      {platformDetail(platform)}
                    </p>
                  </div>
                  <span className="w-28 flex-shrink-0 text-xs text-muted-foreground">
                    {platform.scopeSummary}
                  </span>
                  <button
                    title="App credentials"
                    onClick={() => setConnectingName(platform.name)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border-3 bg-inset text-muted-foreground"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                  </button>
                  <Button
                    variant={platform.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => setConnectingName(platform.name)}
                  >
                    {platform.connected ? "Add account" : "Connect"}
                  </Button>
                </div>
                {expanded && (
                  <div className="flex flex-col gap-1.5 px-6 pb-4 pl-[70px]">
                    {platform.connected ? (
                      platform.accounts.map((account) => (
                        <div
                          key={account.name}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-inset px-3.5 py-2.5"
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10.5px] font-bold",
                              platform.tone,
                            )}
                          >
                            {account.name
                              .replace(/[^A-Za-z]/g, "")
                              .slice(0, 2)
                              .toUpperCase() || "AF"}
                          </span>
                          <div className="min-w-[120px] flex-1">
                            <p className="text-xs font-bold">{account.name}</p>
                            <p className="mt-0.5 text-[11px] text-dim-5">
                              {account.meta}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="px-0.5 text-xs text-dim-5">
                        No accounts linked yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

      <PlatformCatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        addedNames={platforms.map((p) => p.name)}
        onSelect={handleCatalogSelect}
      />

      <ConnectPlatformDialog
        platform={connectingPlatform}
        onClose={() => setConnectingName(null)}
        onConnected={() =>
          connectingPlatform && handleConnected(connectingPlatform.name)
        }
      />
    </div>
  );
};

export default DashboardSettings;
