import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Wifi, X, ArrowDownUp } from "lucide-react";
import { VPNConnection } from "@/types/vpn";
import { formatBytes, formatDuration } from "@/services/vpnService";

interface ConnectionsTableProps {
  connections?: VPNConnection[];
  isLoading: boolean;
}

export function ConnectionsTable({
  connections,
  isLoading,
}: ConnectionsTableProps) {
  const [search, setSearch] = useState("");

  const filteredConnections = connections?.filter(
    (conn) =>
      conn.userName.toLowerCase().includes(search.toLowerCase()) ||
      conn.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      conn.serverName.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Active Connections ({connections?.length ?? 0})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Device</TableHead>
                <TableHead>Server</TableHead>
                <TableHead className="hidden md:table-cell">Protocol</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <ArrowDownUp className="h-3 w-3" />
                    Traffic
                  </div>
                </TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConnections?.map((conn) => (
                <TableRow key={conn.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{conn.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {conn.clientIp}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div>
                      <p className="text-sm">{conn.deviceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {conn.assignedIp}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{conn.serverName}</p>
                      <p className="text-xs text-muted-foreground">
                        {conn.serverLocation}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="uppercase text-xs">
                      {conn.protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      <p className="text-primary">
                        ↓ {formatBytes(conn.bytesIn)}
                      </p>
                      <p className="text-muted-foreground">
                        ↑ {formatBytes(conn.bytesOut)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm">
                        {formatDuration(conn.duration)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredConnections?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No active connections found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
