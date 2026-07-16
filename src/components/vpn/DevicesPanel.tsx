import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Smartphone,
  Monitor,
  Router,
  Plus,
  Download,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { VPNDevice, VPNServer } from "@/types/vpn";
import { formatDistanceToNow } from "date-fns";

interface DevicesPanelProps {
  devices?: VPNDevice[];
  servers?: VPNServer[];
  isLoading: boolean;
  onGenerateConfig?: (
    deviceId: string,
    serverId: string,
    protocol: "wireguard" | "openvpn" | "ikev2",
  ) => void;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  router: Router,
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

export function DevicesPanel({
  devices,
  servers,
  isLoading,
  onGenerateConfig,
}: DevicesPanelProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<VPNDevice | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<
    "wireguard" | "openvpn" | "ikev2"
  >("wireguard");

  const handleGenerateConfig = () => {
    if (selectedDevice && selectedServer && onGenerateConfig) {
      onGenerateConfig(selectedDevice.id, selectedServer, selectedProtocol);
    }
    setConfigDialogOpen(false);
  };

  const openConfigDialog = (device: VPNDevice) => {
    setSelectedDevice(device);
    setConfigDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Devices ({devices?.length ?? 0})
            </CardTitle>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Device</DialogTitle>
                  <DialogDescription>
                    Register a new device for VPN access.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Device Name</Label>
                    <Input placeholder="e.g. MacBook Pro" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Device Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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
                      <Label>Operating System</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select OS" />
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
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Add Device
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {devices?.map((device) => {
              const DeviceIcon = deviceIcons[device.type];
              return (
                <div
                  key={device.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${device.isConnected ? "bg-emerald-500/10" : "bg-muted"}`}
                      >
                        <DeviceIcon
                          className={`h-5 w-5 ${device.isConnected ? "text-emerald-500" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {osLabels[device.os]}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        device.isConnected
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {device.isConnected ? (
                        <>
                          <Wifi className="h-3 w-3 mr-1" /> Online
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 mr-1" /> Offline
                        </>
                      )}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    {device.lastIp && <p>Last IP: {device.lastIp}</p>}
                    <p>
                      Last seen:{" "}
                      {device.lastSeen
                        ? formatDistanceToNow(new Date(device.lastSeen), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openConfigDialog(device)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Config
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {devices?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No devices registered</p>
              <p className="text-sm">
                Add a device to generate VPN configurations
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  {servers
                    ?.filter((s) => s.status === "online")
                    .map((server) => (
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
    </>
  );
}
