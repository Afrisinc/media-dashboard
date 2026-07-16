import { useState } from "react";
import { usePlatformOverview, useGrowthData } from "@/hooks/usePlatform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
      color: "text-primary",
    },
    {
      label: "Total Accounts",
      value: data?.totalAccounts,
      icon: CreditCard,
      color: "text-secondary",
    },
    {
      label: "Organizations",
      value: data?.totalOrganizations,
      icon: Building2,
      color: "text-accent",
    },
    {
      label: "Total Enrollments",
      value: data?.totalEnrollments,
      icon: Layers,
      color: "text-primary",
    },
    {
      label: "Active Users",
      value: data?.activeUsers,
      icon: TrendingUp,
      color: "text-secondary",
    },
    {
      label: "Suspended",
      value: data?.suspendedUsers,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">
          Global analytics for the Afrisinc Auth platform
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-xs text-muted-foreground font-medium">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">
                    {s.value?.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
          <div className="flex gap-2">
            <Button
              variant={growthRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setGrowthRange("7d")}
            >
              7 Days
            </Button>
            <Button
              variant={growthRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setGrowthRange("30d")}
            >
              30 Days
            </Button>
            <Button
              variant={growthRange === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setGrowthRange("90d")}
            >
              90 Days
            </Button>
          </div>
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
