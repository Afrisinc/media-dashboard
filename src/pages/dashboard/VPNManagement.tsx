import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Users, Wifi, FileCode } from "lucide-react";
import { VPNStatsCards } from "@/components/vpn/VPNStatsCards";
import { ServersTable } from "@/components/vpn/ServersTable";
import { ConnectionsTable } from "@/components/vpn/ConnectionsTable";
import { UsersTable } from "@/components/vpn/UsersTable";
import { ConfigGenerator } from "@/components/vpn/ConfigGenerator";
import { QRCodeGenerator } from "@/components/vpn/QRCodeDialog";
import {
  useVPNStats,
  useVPNServers,
  useVPNUsers,
  useVPNDevices,
  useVPNConnections,
} from "@/hooks/useVPN";
import { generateConfig } from "@/services/vpnService";
import { toast } from "sonner";

export default function VPNManagement() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useVPNStats();
  const { data: servers, isLoading: serversLoading } = useVPNServers();
  const { data: users, isLoading: usersLoading } = useVPNUsers();
  const { data: devices, isLoading: devicesLoading } = useVPNDevices();
  const { data: connections, isLoading: connectionsLoading } =
    useVPNConnections();

  const handleGenerateConfig = async (
    deviceId: string,
    serverId: string,
    protocol: "wireguard" | "openvpn" | "ikev2",
  ) => {
    try {
      const config = await generateConfig(deviceId, serverId, protocol);
      const device = devices?.find((d) => d.id === deviceId);
      const server = servers?.find((s) => s.id === serverId);
      const fileName = `${device?.name.toLowerCase().replace(/\s+/g, "-")}-${server?.name.toLowerCase()}.${protocol === "wireguard" ? "conf" : protocol === "openvpn" ? "ovpn" : "mobileconfig"}`;

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
    } catch {
      toast.error("Failed to generate configuration");
    }
  };

  const handleGenerateConfigAsync = async (
    deviceId: string,
    serverId: string,
    protocol: "wireguard" | "openvpn" | "ikev2",
  ) => {
    return generateConfig(deviceId, serverId, protocol);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-section">VPN Management</h1>
        <p className="text-secondary">
          Manage servers, users, and connections for your VPN infrastructure
        </p>
      </div>

      {/* Stats Cards */}
      <VPNStatsCards stats={stats} isLoading={statsLoading} />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Connections</span>
          </TabsTrigger>
          <TabsTrigger value="servers" className="gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Servers</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <FileCode className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <ConnectionsTable
            connections={connections}
            isLoading={connectionsLoading}
          />
        </TabsContent>

        <TabsContent value="servers" className="space-y-6 mt-6">
          <ServersTable servers={servers} isLoading={serversLoading} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <UsersTable
            users={users}
            servers={servers}
            isLoading={usersLoading}
            onGenerateConfig={handleGenerateConfig}
          />
        </TabsContent>

        <TabsContent value="config" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ConfigGenerator
              servers={servers}
              devices={devices}
              isLoading={serversLoading || devicesLoading}
            />
            <QRCodeGenerator
              servers={servers}
              devices={devices}
              isLoading={serversLoading || devicesLoading}
              onGenerateConfig={handleGenerateConfigAsync}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
