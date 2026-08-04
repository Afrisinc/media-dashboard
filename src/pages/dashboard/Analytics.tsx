import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const kpis = [
  { label: "Reach", value: "2.4M", delta: "+12%" },
  { label: "Engagement", value: "156K", delta: "+3%" },
  { label: "Followers", value: "42.3K", delta: "+8%" },
  { label: "Conversions", value: "1,245", delta: "+22%" },
  { label: "Revenue", value: "$34.5K", delta: "+18%" },
  { label: "ROI", value: "287%", delta: "+41%" },
];

const engagementData = [
  { date: "2026-07-03", value: 32 },
  { date: "2026-07-10", value: 41 },
  { date: "2026-07-17", value: 38 },
  { date: "2026-07-24", value: 55 },
  { date: "2026-07-31", value: 68 },
];

const topContent = [
  {
    rank: 1,
    kind: "Video",
    title: "Why 2026 is the year of autonomous marketing",
    metric: "128K",
  },
  {
    rank: 2,
    kind: "Story",
    title: "Poll series: what should our AI make next?",
    metric: "31K",
  },
  {
    rank: 3,
    kind: "Video",
    title: "Product tour: the automation engine",
    metric: "54K",
  },
  {
    rank: 4,
    kind: "Article",
    title: "AI marketing in Africa: the 2026 playbook",
    metric: "4.2K",
  },
  {
    rank: 5,
    kind: "Podcast",
    title: "Ep. 11 — Scaling content without a team",
    metric: "9.8K",
  },
];

const platformBreakdown = [
  {
    name: "Instagram",
    tone: "bg-platform-instagram",
    reach: "1.2M",
    eng: "78K",
  },
  { name: "Facebook", tone: "bg-platform-facebook", reach: "834K", eng: "42K" },
  { name: "TikTok", tone: "bg-platform-tiktok", reach: "612K", eng: "51K" },
  { name: "YouTube", tone: "bg-platform-youtube", reach: "388K", eng: "29K" },
  { name: "X", tone: "bg-ink-f", reach: "245K", eng: "18K" },
  { name: "LinkedIn", tone: "bg-platform-linkedin", reach: "198K", eng: "15K" },
  { name: "Website", tone: "bg-forest", reach: "164K", eng: "11K" },
];

const ranges = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
] as const;

const DashboardAnalytics = () => {
  const [range, setRange] = useState<(typeof ranges)[number]["value"]>("30d");

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="line-accent">Analytics</p>
          <h1 className="heading-section font-display italic mt-2">
            Proof the machine works
          </h1>
          <p className="text-secondary mt-1">
            Every metric below was earned by automated media — no human posted a
            thing.
          </p>
        </div>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[...ranges]}
        />
      </div>

      <StatGrid columns={6}>
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            size="sm"
            label={kpi.label}
            value={kpi.value}
            delta={{ value: kpi.delta, direction: "up" }}
          />
        ))}
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-bold">Engagement over time</p>
            <ChartContainer
              config={{
                value: { label: "Engagement", color: "hsl(var(--primary))" },
              }}
              className="mt-3.5 h-56"
            >
              <LineChart data={engagementData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
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
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-bold">Top performing media</p>
            <div className="mt-3.5 flex flex-col gap-2.5">
              {topContent.map((item) => (
                <div key={item.rank} className="flex items-center gap-2.5">
                  <span className="w-4 flex-shrink-0 text-xs font-extrabold text-dim-7">
                    {item.rank}
                  </span>
                  <Badge
                    variant="outline"
                    className="flex-shrink-0 text-[9.5px] uppercase"
                  >
                    {item.kind}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                    {item.title}
                  </span>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {item.metric}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border/50 pt-3.5">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-gold">
                AI recommendations
              </p>
              <div className="flex flex-col gap-1.5 text-xs text-mut-2">
                <span>
                  · Best window:{" "}
                  <b className="text-ink-c">Wed 14:00–16:00 WAT</b>
                </span>
                <span>
                  · Video earns <b className="text-ink-c">45% more</b>{" "}
                  engagement
                </span>
                <span>· LinkedIn audience underused — 3 posts/week added</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StatGrid columns={6}>
        {platformBreakdown.map((platform) => (
          <Card key={platform.name} className="p-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`h-2 w-2 rounded-full ${platform.tone}`} />
              {platform.name}
            </div>
            <p className="mt-2 text-lg font-extrabold">{platform.reach}</p>
            <p className="mt-0.5 text-xs text-dim-4">
              {platform.eng} engagement
            </p>
          </Card>
        ))}
      </StatGrid>
    </div>
  );
};

export default DashboardAnalytics;
