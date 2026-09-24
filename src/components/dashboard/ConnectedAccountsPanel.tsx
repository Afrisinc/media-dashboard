import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { SectionCard, SectionCardSkeleton } from "@/components/ui/section-card";
import { useConnectedAccounts } from "@/hooks/useAnalytics";
import { windowStartDate } from "@/lib/analyticsWindow";
import { formatDateProfessional } from "@/lib/dateFormat";
import { compactNumber } from "@/lib/numberFormat";
import { platformLabel } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type { ConnectedAccount } from "@/services/analyticsService";
import { Plus, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const METRIC_GRID =
  "grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-5 lg:flex-shrink-0 lg:grid-cols-[8.5rem_3.5rem_4.5rem_5.5rem_4.5rem]";

const METRIC_COLUMNS = [
  "Followers",
  "Posts",
  "Reach",
  "Engagement",
  "Eng. rate",
] as const;

function initials(name: string | null, platform: string): string {
  const source = (name ?? platform).replace(/^@/, "").trim() || platform;
  return source.slice(0, 2).toUpperCase();
}

function FollowerDelta({ change }: Readonly<{ change: number | null }>) {
  if (change === null || change === 0) {
    return null;
  }

  const Icon = change > 0 ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
        change > 0 ? "text-emerald" : "text-destructive",
      )}
      title={`${change > 0 ? "+" : ""}${change.toLocaleString()} followers in this window`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {change > 0 ? "+" : ""}
      {compactNumber(change)}
    </span>
  );
}

function AccountMetric({
  label,
  children,
}: Readonly<{
  label: string;
  children: ReactNode;
}>) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:sr-only">
        {label}
      </dt>
      <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-sm font-semibold tabular-nums lg:mt-0 lg:flex-nowrap">
        {children}
      </dd>
    </div>
  );
}

function AccountRow({ account }: Readonly<{ account: ConnectedAccount }>) {
  const rate =
    account.reach > 0
      ? `${Math.round((account.engagements / account.reach) * 100)}%`
      : "—";
  const name = account.pageName ?? account.pageId;

  return (
    <li className="flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10">
            {account.pageAvatar && (
              <AvatarImage src={account.pageAvatar} alt="" />
            )}
            <AvatarFallback className="text-xs font-semibold">
              {initials(account.pageName, account.platform)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card">
            <PlatformIcon platform={account.platform} className="h-3 w-3" />
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" title={name}>
            {name}
          </p>
          <p className="text-xs text-muted-foreground">
            {platformLabel(account.platform)}
            {!account.metricsSupported && " · metrics not synced yet"}
          </p>
        </div>
      </div>

      <dl className={METRIC_GRID}>
        <AccountMetric label="Followers">
          {account.followers === null ? "—" : compactNumber(account.followers)}
          <FollowerDelta change={account.followerChange} />
        </AccountMetric>
        <AccountMetric label="Posts">{account.posts}</AccountMetric>
        <AccountMetric label="Reach">
          {compactNumber(account.reach)}
        </AccountMetric>
        <AccountMetric label="Engagement">
          {compactNumber(account.engagements)}
        </AccountMetric>
        <AccountMetric label="Eng. rate">{rate}</AccountMetric>
      </dl>
    </li>
  );
}

export function ConnectedAccountsPanel({ days }: Readonly<{ days: number }>) {
  const query = useConnectedAccounts({ from: windowStartDate(days) });

  if (query.isLoading) {
    return <SectionCardSkeleton rows={3} />;
  }

  if (query.isError || !query.data) {
    return (
      <SectionCard title="Connected accounts" icon={Users}>
        <ErrorState
          title="Could not load connected accounts"
          description="content-service is not answering. Check that it is running."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SectionCard>
    );
  }

  const { accounts, lastSyncedAt } = query.data;

  return (
    <SectionCard
      title="Connected accounts"
      icon={Users}
      iconTone="primary"
      description={
        lastSyncedAt
          ? `Platforms last read ${formatDateProfessional(lastSyncedAt, "relative")}`
          : "Platforms are first read a day after a post goes out"
      }
      action={
        <Button asChild size="sm" variant="ghost">
          <Link to="/settings">
            <Plus className="h-3.5 w-3.5 sm:mr-1" aria-hidden />
            <span className="sr-only sm:not-sr-only">Connect</span>
          </Link>
        </Button>
      }
      contentClassName="pt-2"
    >
      {accounts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No account connected yet"
          description="Connect a Facebook page or Instagram account to start tracking how it performs."
          action={
            <Button asChild size="sm">
              <Link to="/settings">Connect an account</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div
            className="hidden items-center gap-6 border-b border-border/60 pb-2 lg:flex"
            aria-hidden
          >
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Account
            </span>
            <div className={METRIC_GRID}>
              {METRIC_COLUMNS.map((column) => (
                <span
                  key={column}
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {column}
                </span>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-border/60">
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
