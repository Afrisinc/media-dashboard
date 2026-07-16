import { useState } from "react";
import { useGrowthData } from "@/hooks/usePlatform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const RANGES = [
  { value: "7d" as const, label: "7 Days" },
  { value: "30d" as const, label: "30 Days" },
  { value: "90d" as const, label: "90 Days" },
];

export default function PlatformGrowth() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const { data, isLoading } = useGrowthData(range);

  const chartConfig = {
    newUsers: { label: "New Users", color: "hsl(var(--primary))" },
    newAccounts: { label: "New Accounts", color: "hsl(var(--secondary))" },
    newEnrollments: { label: "New Enrollments", color: "hsl(var(--accent))" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Growth Analytics</h1>
          <p className="text-muted-foreground">
            Track user, account, and enrollment growth over time
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {(["newUsers", "newAccounts", "newEnrollments"] as const).map(
            (key) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {chartConfig[key].label} per Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ [key]: chartConfig[key] }}
                    className="h-64"
                  >
                    <LineChart data={data}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                        tickFormatter={(v) =>
                          new Date(v).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey={key}
                        stroke={chartConfig[key].color}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
