import { useState } from "react";
import { usePlatformOverview, useGrowthData } from "@/hooks/usePlatform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Users,
  Building2,
  Layers,
  CreditCard,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PIE_COLORS = ["hsl(36, 60%, 50%)", "hsl(160, 40%, 25%)"];

export default function PlatformOverview() {
  const { data, isLoading } = usePlatformOverview();
  const [growthRange, setGrowthRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data: growthData, isLoading: growthLoading } =
    useGrowthData(growthRange);

  const stats = [
    {
      label: "Total Users",
      value: data?.totalUsers,
      icon: Users,
      iconTone: "primary" as const,
    },
    {
      label: "Total Accounts",
      value: data?.totalAccounts,
      icon: CreditCard,
      iconTone: "secondary" as const,
    },
    {
      label: "Organizations",
      value: data?.totalOrganizations,
      icon: Building2,
      iconTone: "primary" as const,
    },
    {
      label: "Total Enrollments",
      value: data?.totalEnrollments,
      icon: Layers,
      iconTone: "primary" as const,
    },
    {
      label: "Active Users",
      value: data?.activeUsers,
      icon: TrendingUp,
      iconTone: "secondary" as const,
    },
    {
      label: "Suspended",
      value: data?.suspendedUsers,
      icon: AlertTriangle,
      iconTone: "destructive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        subtitle="Global analytics for the Afrisinc Auth platform"
      />

      {/* Metric Cards */}
      <StatGrid columns={6}>
        {stats.map((s) =>
          isLoading ? (
            <Card key={s.label}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ) : (
            <StatCard
              key={s.label}
              size="sm"
              label={s.label}
              value={s.value?.toLocaleString() ?? "—"}
              icon={s.icon}
              iconTone={s.iconTone}
            />
          ),
        )}
      </StatGrid>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollments by Product */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Enrollments by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer
                config={{
                  count: { label: "Enrollments", color: "hsl(var(--primary))" },
                }}
                className="h-64"
              >
                <BarChart data={data?.enrollmentsByProduct}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="product"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Account Type Split */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Account Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.accountTypeSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="count"
                      nameKey="type"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {data?.accountTypeSplit.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Growth Metrics
          </CardTitle>
          <SegmentedControl
            value={growthRange}
            onChange={setGrowthRange}
            options={[
              { label: "7 Days", value: "7d" },
              { label: "30 Days", value: "30d" },
              { label: "90 Days", value: "90d" },
            ]}
          />
        </CardHeader>
        <CardContent>
          {growthLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ChartContainer
              config={{
                newUsers: { label: "New Users", color: "hsl(var(--primary))" },
                newAccounts: {
                  label: "New Accounts",
                  color: "hsl(var(--secondary))",
                },
                newEnrollments: {
                  label: "New Enrollments",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-80"
            >
              <LineChart data={growthData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="hsl(var(--primary))"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newAccounts"
                  stroke="hsl(var(--secondary))"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newEnrollments"
                  stroke="hsl(var(--accent))"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
