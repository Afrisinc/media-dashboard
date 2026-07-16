import { useSecurityOverview } from "@/hooks/usePlatform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ShieldCheck, Key, AlertTriangle } from "lucide-react";
import { LoginEventsTable } from "@/components/platform/LoginEventsTable";

export default function PlatformSecurity() {
  const { data, isLoading } = useSecurityOverview();

  const stats = [
    {
      label: "Failed Logins (24h)",
      value: data?.failedLogins24h,
      icon: ShieldAlert,
      color: "text-destructive",
    },
    {
      label: "Token Issuance",
      value: data?.tokenIssuanceCount,
      icon: Key,
      color: "text-primary",
    },
    {
      label: "Suspicious Activity",
      value: data?.suspiciousActivity ? "Detected" : "None",
      icon: data?.suspiciousActivity ? AlertTriangle : ShieldCheck,
      color: data?.suspiciousActivity ? "text-destructive" : "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor login attempts, tokens, and suspicious activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
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
                    {typeof s.value === "number"
                      ? s.value.toLocaleString()
                      : s.value}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top IPs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top IP Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="text-right">Attempts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topIPs.map((ip) => (
                    <TableRow key={ip.ip}>
                      <TableCell className="font-mono text-sm">
                        {ip.ip}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            ip.attempts > 10 ? "destructive" : "secondary"
                          }
                        >
                          {ip.attempts}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent failed logins */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.failedLogins.slice(0, 8).map((fl) => (
                    <TableRow key={fl.id}>
                      <TableCell className="text-sm">{fl.email}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {fl.ip}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {fl.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(fl.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* login events table  */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Login Events</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginEventsTable />
        </CardContent>
      </Card>
    </div>
  );
}
