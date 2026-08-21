import { AddPagesToGroupDialog } from "@/components/dashboard/AddPagesToGroupDialog";
import { AutomationModeCard } from "@/components/dashboard/AutomationModeCard";
import { BrandGroupCard } from "@/components/dashboard/BrandGroupCard";
import { BrandGroupDialog } from "@/components/dashboard/BrandGroupDialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import { useInstalledAccounts } from "@/hooks/useSocialMediaIntegrations";
import type { AccountGroup } from "@/types/accountGroup";
import { Bot, Building2, Plus, Radio, ServerCrash, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const DashboardBrands = () => {
  const { data: groups, isLoading, isError } = useAccountGroups();
  const { accounts } = useInstalledAccounts();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AccountGroup | null>(null);
  const [addingTo, setAddingTo] = useState<AccountGroup | null>(null);

  const brands = groups ?? [];
  const livePages = brands.reduce(
    (total, group) => total + group.activeMemberCount,
    0,
  );
  const onAutopilot = brands.filter((group) => group.autopilotEnabled).length;
  const grouped = new Set(
    brands.flatMap((group) => group.members.map((m) => m.accountId)),
  );
  const ungrouped = accounts.filter(
    (account) => !grouped.has(account.id),
  ).length;

  const stats: StripStat[] = [
    { label: "Brands", value: String(brands.length), icon: Building2 },
    {
      label: "Live pages",
      value: String(livePages),
      icon: Radio,
      tone: livePages > 0 ? "success" : "default",
    },
    { label: "On autopilot", value: String(onAutopilot), icon: Bot },
    {
      label: "Ungrouped",
      value: String(ungrouped),
      icon: Users,
      // A page in no brand publishes nowhere, which is worth noticing.
      tone: ungrouped > 0 ? "attention" : "default",
    },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="Brands & Accounts"
        subtitle="Group the pages you publish to, then decide who drives — you or the agents."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New brand
          </Button>
        }
      />

      <AutomationModeCard />

      {isError && (
        <EmptyState
          icon={ServerCrash}
          title="Could not reach content-service"
          description="The brands live in content-service. Check that it is up, then reload."
        />
      )}

      {!isError && (
        <>
          <StatStrip stats={stats} />

          {isLoading && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-72 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
          )}

          {!isLoading && brands.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No brands yet"
              description={
                accounts.length === 0
                  ? "Connect a Facebook Page or Instagram account in Settings first, then group them into a brand here."
                  : `You have ${accounts.length} connected page${accounts.length === 1 ? "" : "s"}. Group them into a brand so the agents know where to publish.`
              }
            />
          )}

          {!isLoading && brands.length === 0 && accounts.length === 0 && (
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/settings">Connect a page in Settings</Link>
              </Button>
            </div>
          )}

          {!isLoading && brands.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {brands.map((group) => (
                <BrandGroupCard
                  key={group.id}
                  group={group}
                  onEdit={() => setEditing(group)}
                  onAddPages={() => setAddingTo(group)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <BrandGroupDialog open={creating} onClose={() => setCreating(false)} />
      <BrandGroupDialog
        open={editing !== null}
        group={editing}
        onClose={() => setEditing(null)}
      />
      <AddPagesToGroupDialog
        open={addingTo !== null}
        group={addingTo}
        onClose={() => setAddingTo(null)}
      />
    </div>
  );
};

export default DashboardBrands;
