import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Settings,
  Smartphone,
  Monitor,
  Router,
  Plus,
  Download,
  Trash2,
  Wifi,
  WifiOff,
  Mail,
  Calendar,
  Database,
  Shield,
  Clock,
  Ban,
  Check,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import { VPNUser, VPNDevice, VPNServer } from "@/types/vpn";
import { formatDistanceToNow, format } from "date-fns";
import {
  useCreateDevice,
  useDeviceConfig,
  useDeleteDevice,
} from "@/hooks/useVPN";
import { toast } from "sonner";

interface UserDetailsSheetProps {
  user: VPNUser | null;
  servers?: VPNServer[];
  isOpen: boolean;
  onClose: () => void;
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

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  router: Router,
  unknown: Monitor,
  other: Monitor,
};

const osLabels: Record<string, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  ios: "iOS",
  android: "Android",
  other: "Other",
};

export function UserDetailsSheet({
  user,
  servers,
  isOpen,
  onClose,
  onGenerateConfig,
}: UserDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deviceConfigDialogOpen, setDeviceConfigDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<VPNDevice | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<
    "wireguard" | "openvpn" | "ikev2"
  >("wireguard");
  const [editMode, setEditMode] = useState(false);

  // Device creation form state
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState<
    "desktop" | "mobile" | "router" | "unknown" | "other"
  >("desktop");

  const createDeviceMutation = useCreateDevice();
  const deviceConfigMutation = useDeviceConfig();
  const deleteDeviceMutation = useDeleteDevice();

  if (!user) return null;

  const dataUsagePercent = user.dataLimit
    ? ((user.dataUsed ?? 0) / user.dataLimit) * 100
    : 0;
  const onlineServers = servers?.filter((s) => s.status === "active") ?? [];
  const connectedDevices = user.devices.filter((d) => d.isConnected);

  const handleGenerateConfig = () => {
    if (selectedDevice && selectedServer && onGenerateConfig) {
      onGenerateConfig(selectedDevice.id, selectedServer, selectedProtocol);
    }
    setConfigDialogOpen(false);
  };

  const openConfigDialog = (device: VPNDevice) => {
    setSelectedDevice(device);
    setSelectedServer("");
    setSelectedProtocol("wireguard");
    setConfigDialogOpen(true);
  };

  const handleAddDevice = async () => {
    if (!deviceName.trim()) {
      toast.error("Device name is required");
      return;
    }

    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      await createDeviceMutation.mutateAsync({
        userId: user.id,
        deviceData: {
          deviceName: deviceName.trim(),
          deviceType,
        },
      });

      toast.success("Device created successfully!");
      setAddDeviceOpen(false);
      setDeviceName("");
      setDeviceType("desktop");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create device",
      );
    }
  };

  const handleDownloadDeviceConfig = async () => {
    if (!selectedDevice || !selectedServer || !user?.id) {
      toast.error("Please select a device and server");
      return;
    }

    try {
      const config = await deviceConfigMutation.mutateAsync({
        userId: user.id,
        deviceId: selectedDevice.id,
        serverId: selectedServer,
      });

      // Download the config file
      const deviceName =
        selectedDevice.name || selectedDevice.deviceName || "device";
      const fileName = `${deviceName.toLowerCase().replace(/\s+/g, "-")}-config.conf`;
      const blob = new Blob([config], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Configuration downloaded: ${fileName}`);
      setDeviceConfigDialogOpen(false);
      setSelectedServer("");
      setSelectedDevice(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download configuration",
      );
    }
  };

  const openDeviceConfigDialog = (device: VPNDevice) => {
    setSelectedDevice(device);
    setSelectedServer("");
    setDeviceConfigDialogOpen(true);
  };

  const handleDeleteDevice = async (device: VPNDevice) => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      await deleteDeviceMutation.mutateAsync({
        userId: user.id,
        deviceId: device.id,
      });
      toast.success(`Device "${device.name}" deleted successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete device",
      );
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-left">{user.name}</SheetTitle>
                  <SheetDescription className="text-left flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </SheetDescription>
                </div>
              </div>
              <Badge variant="outline" className={statusColors[user.status]}>
                {user.status}
              </Badge>
            </div>
          </SheetHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden mt-6"
          >
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Devices</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {user.devices.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="mt-0 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-xs">Devices</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {user.devices.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {connectedDevices.length} online
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Database className="h-4 w-4" />
                        <span className="text-xs">Data Usage</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {user.dataUsed.toFixed(1)} GB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.dataLimit
                          ? `of ${user.dataLimit} GB`
                          : "Unlimited"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Usage Bar */}
                {user.dataLimit && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Data Quota</span>
                        <span className="text-sm text-muted-foreground">
                          {dataUsagePercent.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={dataUsagePercent}
                        className="h-2"
                        indicatorClassName={
                          dataUsagePercent > 90
                            ? "bg-destructive"
                            : dataUsagePercent > 70
                              ? "bg-amber-500"
                              : undefined
                        }
                      />
                      {dataUsagePercent > 90 && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          User is approaching data limit
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Account Details */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium text-sm">Account Details</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Member since
                        </span>
                        <span>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Last connection
                        </span>
                        <span>
                          {user.lastConnection
                            ? formatDistanceToNow(
                                new Date(user.lastConnection),
                                { addSuffix: true },
                              )
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Expires
                        </span>
                        <span>
                          {user.expiresAt
                            ? format(new Date(user.expiresAt), "MMM d, yyyy")
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connected Devices Preview */}
                {connectedDevices.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">
                          Currently Online
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("devices")}
                        >
                          View all
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {connectedDevices.slice(0, 3).map((device) => {
                          const DeviceIcon =
                            deviceIcons[device.type] || Monitor;
                          const osLabel = device.os
                            ? osLabels[device.os]
                            : "Unknown OS";
                          return (
                            <div
                              key={device.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                            >
                              <DeviceIcon className="h-4 w-4 text-emerald-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {device.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {osLabel}
                                </p>
                              </div>
                              <Wifi className="h-4 w-4 text-emerald-500" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="devices" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {user.devices.length} device
                    {user.devices.length !== 1 ? "s" : ""} registered
                  </p>
                  <Dialog open={addDeviceOpen} onOpenChange={setAddDeviceOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Device
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Device for {user.name}</DialogTitle>
                        <DialogDescription>
                          Register a new device for this user.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Device Name</Label>
                          <Input
                            placeholder="e.g. MacBook Pro"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            disabled={createDeviceMutation.isPending}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Device Type</Label>
                            <Select
                              value={deviceType}
                              onValueChange={(value) =>
                                setDeviceType(
                                  value as
                                    | "desktop"
                                    | "mobile"
                                    | "router"
                                    | "other"
                                    | "unknown",
                                )
                              }
                            >
                              <SelectTrigger
                                disabled={createDeviceMutation.isPending}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desktop">Desktop</SelectItem>
                                <SelectItem value="mobile">Mobile</SelectItem>
                                <SelectItem value="router">Router</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>
                              Operating System{" "}
                              <span className="text-xs text-muted-foreground">
                                (optional)
                              </span>
                            </Label>
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder="Auto-detected" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="windows">Windows</SelectItem>
                                <SelectItem value="macos">macOS</SelectItem>
                                <SelectItem value="linux">Linux</SelectItem>
                                <SelectItem value="ios">iOS</SelectItem>
                                <SelectItem value="android">Android</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAddDeviceOpen(false);
                            setDeviceName("");
                            setDeviceType("desktop");
                          }}
                          disabled={createDeviceMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleAddDevice}
                          disabled={
                            createDeviceMutation.isPending || !deviceName.trim()
                          }
                        >
                          {createDeviceMutation.isPending
                            ? "Creating..."
                            : "Add Device"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {user.devices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No devices registered</p>
                    <p className="text-sm">
                      Add a device to generate VPN configurations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.devices.map((device) => {
                      const DeviceIcon = deviceIcons[device.type] || Monitor;
                      const osLabel = device.os
                        ? osLabels[device.os]
                        : "Unknown OS";
                      return (
                        <Card key={device.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className={`p-2.5 rounded-lg flex-shrink-0 ${device.isConnected ? "bg-emerald-500/10" : "bg-muted"}`}
                                >
                                  <DeviceIcon
                                    className={`h-5 w-5 ${device.isConnected ? "text-emerald-500" : "text-muted-foreground"}`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">
                                      {device.name}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`flex-shrink-0 ${
                                        device.isConnected
                                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {device.isConnected ? (
                                        <>
                                          <Wifi className="h-3 w-3 mr-1" />{" "}
                                          Online
                                        </>
                                      ) : (
                                        <>
                                          <WifiOff className="h-3 w-3 mr-1" />{" "}
                                          Offline
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {osLabel} • {device.type}
                                  </p>
                                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                    {device.lastIp && (
                                      <p>IP: {device.lastIp}</p>
                                    )}
                                    <p>
                                      Last seen:{" "}
                                      {device.lastSeen
                                        ? formatDistanceToNow(
                                            new Date(device.lastSeen),
                                            { addSuffix: true },
                                          )
                                        : "Never"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => openDeviceConfigDialog(device)}
                                disabled={
                                  deviceConfigMutation.isPending ||
                                  deleteDeviceMutation.isPending
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {deviceConfigMutation.isPending
                                  ? "Downloading..."
                                  : "Download Config"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteDevice(device)}
                                disabled={deleteDeviceMutation.isPending}
                                title="Delete device"
                              >
                                {deleteDeviceMutation.isPending ? (
                                  <div className="h-4 w-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">User Settings</h4>
                      <Button
                        variant={editMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? (
                          <>
                            <Check className="h-4 w-4 mr-2" /> Save
                          </>
                        ) : (
                          <>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            defaultValue={user.name}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            defaultValue={user.email}
                            disabled={!editMode}
                            type="email"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data Limit (GB)</Label>
                          <Input
                            defaultValue={user.dataLimit?.toString() ?? ""}
                            disabled={!editMode}
                            placeholder="Leave empty for unlimited"
                            type="number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Status</Label>
                          <Select
                            disabled={!editMode}
                            defaultValue={user.status}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">
                                Suspended
                              </SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Reset Password
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Database className="h-4 w-4 mr-2" />
                        Reset Data Usage
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Clock className="h-4 w-4 mr-2" />
                        Extend Subscription
                      </Button>
                      <Button
                        variant="outline"
                        className={`justify-start ${user.status === "suspended" ? "text-emerald-600" : "text-destructive"}`}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {user.status === "suspended"
                          ? "Reactivate User"
                          : "Suspend User"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-destructive mb-2">
                      Danger Zone
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete this user and all associated devices.
                    </p>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Config Generation Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate VPN Configuration</DialogTitle>
            <DialogDescription>
              Create a configuration file for {selectedDevice?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Server</Label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a server" />
                </SelectTrigger>
                <SelectContent>
                  {onlineServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name} - {server.location}, {server.country} (
                      {server.load}% load)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select
                value={selectedProtocol}
                onValueChange={(v: "wireguard" | "openvpn" | "ikev2") =>
                  setSelectedProtocol(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wireguard">
                    WireGuard (Recommended)
                  </SelectItem>
                  <SelectItem value="openvpn">OpenVPN</SelectItem>
                  <SelectItem value="ikev2">IKEv2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleGenerateConfig}
              disabled={!selectedServer}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate & Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Device Config Download Dialog */}
      <Dialog
        open={deviceConfigDialogOpen}
        onOpenChange={setDeviceConfigDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Device Configuration</DialogTitle>
            <DialogDescription>
              Download VPN configuration for {selectedDevice?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Server</Label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a server" />
                </SelectTrigger>
                <SelectContent>
                  {onlineServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name} - {server.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeviceConfigDialogOpen(false)}
              disabled={deviceConfigMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDownloadDeviceConfig}
              disabled={!selectedServer || deviceConfigMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              {deviceConfigMutation.isPending ? "Downloading..." : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
