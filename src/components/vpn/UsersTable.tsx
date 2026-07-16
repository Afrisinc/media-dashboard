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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Users, ChevronRight, Smartphone } from "lucide-react";
import { VPNUser, VPNServer } from "@/types/vpn";
import { formatDistanceToNow } from "date-fns";
import { UserDetailsSheet } from "./UserDetailsSheet";

interface UsersTableProps {
  users?: VPNUser[];
  servers?: VPNServer[];
  isLoading: boolean;
  onGenerateConfig?: (
    deviceId: string,
    serverId: string,
    protocol: "wireguard" | "openvpn" | "ikev2",
  ) => void;
}

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export function UsersTable({
  users,
  servers,
  isLoading,
  onGenerateConfig,
}: UsersTableProps) {
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VPNUser | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUserClick = (user: VPNUser) => {
    setSelectedUser(user);
    setDetailsSheetOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({users?.length ?? 0})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new VPN user account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="e.g. John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          placeholder="e.g. john@example.com"
                          type="email"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Limit (GB)</Label>
                        <Input
                          placeholder="Leave empty for unlimited"
                          type="number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiration</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                            <SelectItem value="180">6 Months</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                            <SelectItem value="never">Never Expires</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setAddDialogOpen(false)}
                    >
                      Create User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Devices
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Data Usage
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Last Active
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => {
                  const connectedDevices = user.devices.filter(
                    (d) => d.isConnected,
                  ).length;
                  return (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleUserClick(user)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[user.status]}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.devices.length}</span>
                          {connectedDevices > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs h-5 px-1.5"
                            >
                              {connectedDevices} online
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">
                              {user.dataUsed.toFixed(1)} /{" "}
                              {user.dataLimit ? `${user.dataLimit} GB` : "∞"}
                            </span>
                          </div>
                          {user.dataLimit && (
                            <Progress
                              value={(user.dataUsed / user.dataLimit) * 100}
                              className="h-1.5"
                              indicatorClassName={
                                user.dataUsed > user.dataLimit
                                  ? "bg-destructive"
                                  : "bg-primary"
                              }
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {user.lastConnection
                            ? formatDistanceToNow(
                                new Date(user.lastConnection),
                                { addSuffix: true },
                              )
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user);
                          }}
                        >
                          <span className="hidden sm:inline">Manage</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailsSheet
        user={selectedUser}
        servers={servers}
        isOpen={detailsSheetOpen}
        onClose={() => setDetailsSheetOpen(false)}
        onGenerateConfig={onGenerateConfig}
      />
    </>
  );
}
