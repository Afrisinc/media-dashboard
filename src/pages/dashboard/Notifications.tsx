import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Lock, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { formatDateProfessional } from "@/lib/dateFormat";
import {
  useNotificationAnalyticsOverview,
  useNotificationAnalyticsUsers,
  useNotificationAnalyticsAccounts,
  useNotificationAnalyticsGrowth,
  useNotificationSecurityOverview,
  useNotificationSecurityLoginEvents,
  useNotificationUsers,
} from "@/hooks/useNotificationProduct";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardNotifications = () => {
  const [loginEventsLimit, setLoginEventsLimit] = useState(10);

  // Analytics Queries
  const { data: analyticsOverview, isLoading: overviewLoading } =
    useNotificationAnalyticsOverview();
  const { data: analyticsUsers, isLoading: usersLoading } =
    useNotificationAnalyticsUsers();
  const { data: analyticsAccounts, isLoading: accountsLoading } =
    useNotificationAnalyticsAccounts();
  const { data: analyticsGrowth, isLoading: growthLoading } =
    useNotificationAnalyticsGrowth();

  // Users Query
  const { data: usersData, isLoading: usersDataLoading } =
    useNotificationUsers();

  // Security Queries
  const { data: securityOverview, isLoading: securityLoading } =
    useNotificationSecurityOverview();
  const { data: loginEvents, isLoading: loginEventsLoading } =
    useNotificationSecurityLoginEvents({
      page: 1,
      limit: loginEventsLimit,
    });

  const renderSkeleton = () => <Skeleton className="h-12 w-full" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-section">Notifications Product</h1>
        <p className="text-secondary">
          Monitor and manage notification analytics and security events
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              renderSkeleton()
            ) : analyticsOverview?.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users:</span>
                  <span className="font-semibold">
                    {analyticsOverview.data.total_users || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Organizations:
                  </span>
                  <span className="font-semibold">
                    {analyticsOverview.data.total_organizations || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Active Enrollments:
                  </span>
                  <span className="font-semibold">
                    {analyticsOverview.data.active_enrollments || 0}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              renderSkeleton()
            ) : analyticsGrowth?.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Users (Latest):</span>
                  <span className="font-semibold">
                    {analyticsGrowth.data.users?.[
                      analyticsGrowth.data.users.length - 1
                    ]?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Accounts (Latest):
                  </span>
                  <span className="font-semibold">
                    {analyticsGrowth.data.accounts?.[
                      analyticsGrowth.data.accounts.length - 1
                    ]?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latest Date:</span>
                  <span className="font-semibold text-xs">
                    {analyticsGrowth.data.users?.[0]?.date || "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users & Accounts Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Users Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              renderSkeleton()
            ) : analyticsUsers?.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users:</span>
                  <span className="font-semibold">
                    {analyticsUsers.data.total_users || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span className="font-semibold text-green-600">
                    {analyticsUsers.data.active_users_in_range || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suspended:</span>
                  <span className="font-semibold text-red-600">
                    {analyticsUsers.data.suspended_users || 0}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Accounts Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              renderSkeleton()
            ) : analyticsAccounts?.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Accounts:</span>
                  <span className="font-semibold">
                    {analyticsAccounts.data.total_accounts || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Individual:</span>
                  <span className="font-semibold">
                    {analyticsAccounts.data.individual_accounts || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="font-semibold">
                    {analyticsAccounts.data.organization_accounts || 0}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : securityOverview?.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Failed Logins (24h)
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {securityOverview.data.failedLogins24h || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Token Issuance
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {securityOverview.data.tokenIssuanceCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Suspicious Activity
                  </p>
                  <p className="text-2xl font-bold">
                    <span
                      className={
                        securityOverview.data.suspiciousActivity
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {securityOverview.data.suspiciousActivity ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              </div>

              {securityOverview.data.topIPs &&
                securityOverview.data.topIPs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-semibold mb-2">Top IPs</p>
                    <div className="space-y-2">
                      {securityOverview.data.topIPs.map(
                        (
                          ipData: { ip: string; attempts: number },
                          idx: number,
                        ) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm p-2 bg-muted/50 rounded"
                          >
                            <span className="font-mono">{ipData.ip}</span>
                            <span className="text-muted-foreground">
                              {ipData.attempts} attempt(s)
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No security data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Notification Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersDataLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : usersData?.data &&
            Array.isArray(usersData.data) &&
            usersData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Accounts</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.data.map(
                  (user: {
                    id: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                    phone?: string;
                    accounts?: unknown[];
                    verifiedAt?: string;
                    lastActiveAt?: string;
                  }) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">
                        {user.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {user.accounts?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.emailVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.emailVerified ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateProfessional(user.lastActivity)}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No users available</p>
          )}
        </CardContent>
      </Card>

      {/* Login Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Login Events ({loginEvents?.data?.pagination?.total || 0} total)
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={String(loginEventsLimit)}
                onValueChange={(val) => setLoginEventsLimit(parseInt(val))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loginEventsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : loginEvents?.data?.data &&
            Array.isArray(loginEvents.data.data) &&
            loginEvents.data.data.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginEvents.data.data.map(
                    (event: {
                      id: string;
                      name?: string;
                      email?: string;
                      phone?: string;
                      ip?: string;
                      status?: string;
                      timestamp?: string;
                      createdAt?: string;
                    }) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.email || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.phone || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {event.ip || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {event.status || "unknown"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateProfessional(event.createdAt)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
              {loginEvents.data.pagination && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Page {loginEvents.data.pagination.page} of{" "}
                  {loginEvents.data.pagination.pages}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No login events available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardNotifications;
