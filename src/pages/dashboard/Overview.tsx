import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,450",
    change: "+8.2%",
    up: true,
    icon: Users,
  },
  { title: "Products", value: "48", change: "+3", up: true, icon: Package },
  {
    title: "Growth Rate",
    value: "24.5%",
    change: "-2.1%",
    up: false,
    icon: TrendingUp,
  },
];

const activities = [
  {
    id: 1,
    action: "Nairobi team expanded by 3",
    time: "2 hours ago",
    icon: Users,
  },
  { id: 2, action: "VPN 2.0 went live", time: "4 hours ago", icon: Package },
  {
    id: 3,
    action: "$100K revenue reached",
    time: "6 hours ago",
    icon: DollarSign,
  },
  {
    id: 4,
    action: "Cloud infrastructure scaled",
    time: "1 day ago",
    icon: Zap,
  },
];

const DashboardOverview = () => (
  <div className="space-y-10">
    {/* Header */}
    <div className="space-y-3 animate-fade-in">
      <h1 className="heading-hero">Your Performance at a Glance</h1>
      <p className="text-muted-foreground max-w-2xl">
        The numbers that matter. See your revenue, user growth, product
        momentum, and trajectory — all updated live. Use these metrics to guide
        what comes next.
      </p>
    </div>

    {/* Stat Cards */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <Card
          key={stat.title}
          className="border-border hover:border-primary/25 hover:shadow-card-hover transition-all duration-300 animate-fade-up"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {stat.title}
                </span>
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div
                  className={`text-xs font-semibold flex items-center gap-1 ${stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {stat.up ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Activity & Actions */}
    <div className="grid lg:grid-cols-3 gap-6">
      <div
        className="lg:col-span-2 animate-fade-up"
        style={{ animationDelay: "400ms" }}
      >
        <Card>
          <CardHeader className="pb-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <CardTitle>What's Happening</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                <div className="p-1.5 rounded bg-muted flex-shrink-0 group-hover:bg-muted transition-colors">
                  <activity.icon className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.time}
                  </p>
                </div>
                <ArrowUpRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "500ms" }}>
        <Card className="h-full">
          <CardHeader className="pb-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <CardTitle>Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Button className="w-full bg-terra hover:bg-terra/90 shadow-primary font-semibold">
              Launch Product
            </Button>
            <Button variant="outline" className="w-full">
              See Full Report
            </Button>
            <Button variant="outline" className="w-full">
              Team & Access
            </Button>
            <Button variant="outline" className="w-full">
              Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default DashboardOverview;
