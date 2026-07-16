import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Users, Wifi, Activity } from "lucide-react";
import { VPNStats } from "@/types/vpn";

interface VPNStatsCardsProps {
  stats?: VPNStats;
  isLoading: boolean;
}

export function VPNStatsCards({ stats, isLoading }: VPNStatsCardsProps) {
  const cards = [
    {
      title: "Total Servers",
      value: stats?.onlineServers ?? 0,
      subtitle: `${stats?.totalServers ?? 0} total`,
      icon: Server,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers ?? 0,
      subtitle: `${stats?.totalUsers ?? 0} registered`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Live Connections",
      value: stats?.activeConnections ?? 0,
      subtitle: "Currently connected",
      icon: Wifi,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Bandwidth",
      value: `${((stats?.totalBandwidth.download ?? 0) / 1000).toFixed(1)} Gbps`,
      subtitle: `↑ ${((stats?.totalBandwidth.upload ?? 0) / 1000).toFixed(1)} Gbps`,
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
