import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, Hand, Images, Plug, Users } from "lucide-react";
import { BrandAssetsManager } from "@/components/dashboard/BrandAssetsManager";
import {
  ConnectPlatformDialog,
  type ConnectPlatform,
} from "@/components/dashboard/ConnectPlatformDialog";
import {
  EditCredentialsDialog,
  type EditCredentialsPlatform,
} from "@/components/dashboard/EditCredentialsDialog";
import {
  PlatformConnectionList,
  type PlatformConnectionRow,
} from "@/components/dashboard/PlatformConnectionList";
import { PublishingModeCard } from "@/components/dashboard/PublishingModeCard";
import { SettingsLinks } from "@/components/dashboard/SettingsLinks";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PLATFORM_CATALOG,
  SOCIAL_PLATFORMS,
  type SocialPlatformKey,
} from "@/config/socialPlatforms";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { useSocialMediaIntegrations } from "@/hooks/useSocialMediaIntegrations";

const SETTINGS_TABS = [
  { value: "publishing", label: "Publishing" },
  { value: "platforms", label: "Platforms" },
  { value: "assets", label: "Brand assets" },
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];

function isSettingsTab(value: string | null): value is SettingsTab {
  return SETTINGS_TABS.some((tab) => tab.value === value);
}

const DashboardSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: SettingsTab = isSettingsTab(tabParam) ? tabParam : "publishing";
  const setTab = (next: string) =>
    setSearchParams(
      (params) => {
        params.set("tab", next);
        return params;
      },
      { replace: true },
    );

  const { autopilot, isLoading: autopilotLoading } = useAutopilot();
  const integrations = useSocialMediaIntegrations();
  const { data: groups } = useAccountGroups();
  const brandAssets = useBrandAssets();
  const [connectingKey, setConnectingKey] = useState<SocialPlatformKey | null>(
    null,
  );
  const [editingKey, setEditingKey] = useState<SocialPlatformKey | null>(null);

  const rows: PlatformConnectionRow[] = SOCIAL_PLATFORMS.map((key) => {
    const integration = integrations.data?.find((row) => row.platform === key);
    return {
      key,
      catalog: PLATFORM_CATALOG[key],
      appId: integration?.appId ?? null,
      connected: integration?.connected ?? false,
      syncedAt: integration?.syncedAt ?? null,
      accounts: integration?.accounts ?? [],
    };
  });

  const connectedCount = rows.filter((row) => row.connected).length;
  const pageCount = rows.reduce((total, row) => total + row.accounts.length, 0);
  const assets = brandAssets.data ?? [];
  const approvedAssets = assets.filter((asset) => asset.approved).length;
  const photographs = assets.reduce(
    (total, asset) => total + asset.images.length,
    0,
  );

  const overview: StripStat[] = [
    {
      label: "Autopilot",
      value: autopilot ? "On" : "Off",
      icon: autopilot ? Bot : Hand,
      tone: autopilot ? "success" : "default",
      hint: autopilot
        ? "Agents publish with no approval step"
        : "Every post waits for your approval",
      onSelect: () => setTab("publishing"),
    },
    {
      label: "Platforms",
      value: `${connectedCount}/${rows.length}`,
      icon: Plug,
      tone: connectedCount === 0 ? "attention" : "default",
      hint:
        connectedCount === rows.length
          ? "Every platform connected"
          : `${rows.length - connectedCount} not connected`,
      onSelect: () => setTab("platforms"),
    },
    {
      label: "Pages",
      value: String(pageCount),
      icon: Users,
      hint:
        pageCount === 0
          ? "Nothing to publish to yet"
          : `Across ${connectedCount} ${connectedCount === 1 ? "platform" : "platforms"}`,
      onSelect: () => setTab("platforms"),
    },
    {
      label: "Brand assets",
      value: `${approvedAssets}/${assets.length}`,
      icon: Images,
      tone: assets.length > 0 && approvedAssets === 0 ? "attention" : "default",
      hint: `${photographs} ${photographs === 1 ? "photograph" : "photographs"} in the library`,
      onSelect: () => setTab("assets"),
    },
  ];

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
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        eyebrow="Settings"
        title="Workspace"
        subtitle="How the agents publish, where they publish to, and the photographs they build posts from."
      />

      <StatStrip
        variant="tiles"
        stats={overview}
        loading={
          autopilotLoading || integrations.isLoading || brandAssets.isLoading
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto sm:w-auto">
          {SETTINGS_TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="publishing" className="mt-0 space-y-4">
          <PublishingModeCard />
          <SettingsLinks />
        </TabsContent>

        <TabsContent value="platforms" className="mt-0">
          <SectionCard
            title="Connected platforms"
            icon={Plug}
            iconTone="primary"
            description={`${connectedCount} of ${rows.length} connected · tokens refresh automatically · open a platform to manage its pages`}
            contentClassName="px-0 pb-0 pt-3"
          >
            {integrations.isError ? (
              <ErrorState
                title="Could not load your platforms"
                description="content-service is not answering. Check that it is running."
                onRetry={() => integrations.refetch()}
                retrying={integrations.isFetching}
                className="border-t border-border/60"
              />
            ) : (
              <div className="border-t border-border/60">
                <PlatformConnectionList
                  rows={rows}
                  groups={groups ?? []}
                  loading={integrations.isLoading}
                  onConnect={setConnectingKey}
                  onEditCredentials={setEditingKey}
                />
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="assets" className="mt-0">
          <BrandAssetsManager />
        </TabsContent>
      </Tabs>

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
