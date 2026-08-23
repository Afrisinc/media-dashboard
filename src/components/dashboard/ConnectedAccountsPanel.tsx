import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectedAccounts } from "@/hooks/useAnalytics";
import { formatDateProfessional } from "@/lib/dateFormat";
import { compactNumber } from "@/lib/numberFormat";
import { cn } from "@/lib/utils";
import type { ConnectedAccount } from "@/services/analyticsService";
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
  twitter: "X",
  website: "Website",
};

function initials(name: string | null, platform: string): string {
  const source = name?.trim() || platform;
  return source.slice(0, 2).toUpperCase();
}

function FollowerDelta({ change }: { change: number | null }) {
  if (change === null || change === 0) {
    return null;
  }

  const Icon = change > 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-bold tabular-nums",
        change > 0 ? "text-emerald" : "text-destructive",
      )}
    >
      <Icon className="h-3 w-3" />
      {change > 0 ? "+" : ""}
      {compactNumber(change)}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-dim-5">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

function AccountRow({ account }: { account: ConnectedAccount }) {
  const rate =
    account.reach > 0
      ? Math.round((account.engagements / account.reach) * 100)
      : null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex min-w-[180px] flex-1 items-center gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          {account.pageAvatar && (
            <AvatarImage src={account.pageAvatar} alt="" />
          )}
          <AvatarFallback className="text-[11px]">
            {initials(account.pageName, account.platform)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            {account.pageName ?? account.pageId}
          </p>
          <p className="text-[11px] text-dim-5">
            {PLATFORM_LABEL[account.platform] ?? account.platform}
            {!account.metricsSupported && " · not synced yet"}
          </p>
        </div>
      </div>

      <div className="min-w-[110px]">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-dim-5">
          Followers
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-sm font-bold tabular-nums">
            {account.followers === null
              ? "—"
              : compactNumber(account.followers)}
          </p>
          <FollowerDelta change={account.followerChange} />
        </div>
      </div>

      <Metric label="Posts" value={String(account.posts)} />
      <Metric label="Reach" value={compactNumber(account.reach)} />
      <Metric label="Engagement" value={compactNumber(account.engagements)} />
      <Metric label="Rate" value={rate === null ? "—" : `${rate}%`} />
    </div>
  );
}

export function ConnectedAccountsPanel({ days }: { days: number }) {
  const from = new Date(Date.now() - days * 86400000)
    .toISOString()
    .slice(0, 10);
  const { data, isLoading, isError } = useConnectedAccounts({ from });

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={Users}
        title="Could not load connected accounts"
        description="content-service is not answering. Check that it is running, then reload."
      />
    );
  }

  if (data.accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Users}
            title="No account connected yet"
            description="Install a Facebook page or Instagram account to start tracking how it performs."
          />
          <div className="flex justify-center">
            <Link
              to="/settings"
              className="text-xs font-bold text-primary hover:underline"
            >
              Connect an account →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold">Connected accounts</p>
        <p className="text-[11px] text-dim-5">
          {data.lastSyncedAt
            ? `Platforms last read ${formatDateProfessional(data.lastSyncedAt, "relative")}`
            : "Platforms not read back yet — the first sweep runs a day after a post goes out"}
        </p>
      </div>

      <div className="space-y-2">
        {data.accounts.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}
