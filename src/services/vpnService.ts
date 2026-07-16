import {
  VPNServer,
  VPNUser,
  VPNDevice,
  VPNConnection,
  VPNStats,
} from "@/types/vpn";

// API Response Types
interface VPNServerResponse {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  publicIp: string;
  agentUrl: string;
  wireguardPort: number;
  serverPublicKey: string;
  networkCidr: string;
  maxClients: number;
  currentClients: number;
  status: string;
  healthStatus: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface VPNServersApiResponse {
  success: boolean;
  message: string;
  data: VPNServerResponse[];
}

interface VPNDeviceResponse {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ip: string;
  publicKey: string;
  status: string;
  isConnected: boolean;
  lastConnected?: string | null;
  createdAt: string;
}

interface VPNUsageInfo {
  totalBytesSent: number;
  totalBytesReceived: number;
  totalBytes: number;
  totalGB: number;
  limitGB: number;
  usedPercentage: number;
  remainingGB: number;
}

interface VPNUserResponse {
  userId: string;
  email: string;
  ip: string;
  publicKey: string;
  status: string;
  dataUsageLimit: number;
  createdAt: string;
  updatedAt: string;
  lastConnected: string | null;
  deviceCount: number;
  connectedCount: number;
  devices: VPNDeviceResponse[];
  usageInfo: VPNUsageInfo;
}

interface VPNUsersApiResponse {
  success: boolean;
  message: string;
  data: VPNUserResponse[];
}

export interface CreateVPNServerRequest {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  regionCode: string;
  publicIp: string;
  agentUrl: string;
  agentApiKey: string;
  wireguardPort: number;
  serverPublicKey: string;
  networkCidr: string;
  maxClients: number;
  bandwidthLimitMbps: number;
  latitude: number;
  longitude: number;
}

export interface CreateVPNDeviceRequest {
  deviceName: string;
  deviceType: "desktop" | "mobile" | "router" | "unknown" | "other";
}

interface CreateVPNDeviceResponse {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ip: string;
  status: string;
  isConnected: boolean;
  lastConnected?: string | null;
  createdAt: string;
}

export async function fetchVPNStats(): Promise<VPNStats> {
  // Fetch real servers and users data from API
  const servers = await fetchServers();
  const users = await fetchUsers();

  const onlineServers = servers.filter((s) => s.status === "active").length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const activeConnections = users.reduce(
    (acc, u) => acc + (u.connectedCount || 0),
    0,
  );

  return {
    totalServers: servers.length,
    onlineServers,
    totalUsers: users.length,
    activeUsers,
    activeConnections,
    totalBandwidth: { upload: 0, download: 0 },
  };
}

export async function fetchServers(): Promise<VPNServer[]> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/vpn/admin/servers`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch servers: ${response.statusText}`);
  }

  const data: VPNServersApiResponse = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("Invalid API response format");
  }

  // Map API response to VPNServer type with backward compatibility
  return data.data.map((server) => {
    const healthStatus = (server.healthStatus || "healthy") as
      | "healthy"
      | "degraded"
      | "unhealthy";
    return {
      id: server.id,
      name: server.name,
      location: server.location,
      countryCode: server.countryCode,
      publicIp: server.publicIp,
      agentUrl: server.agentUrl,
      wireguardPort: server.wireguardPort,
      serverPublicKey: server.serverPublicKey,
      networkCidr: server.networkCidr,
      maxClients: server.maxClients,
      currentClients: server.currentClients,
      status: server.status === "active" ? "active" : "inactive",
      healthStatus,
      latitude: server.latitude,
      longitude: server.longitude,
      createdAt: server.createdAt,
      updatedAt: server.updatedAt,
      // Legacy fields for backward compatibility
      ip: server.publicIp,
      port: server.wireguardPort,
      country: server.location,
      protocol: "wireguard",
      load: 0,
      maxConnections: server.maxClients,
      currentConnections: server.currentClients,
      bandwidth: { upload: 0, download: 0 },
      lastHeartbeat: server.updatedAt,
    };
  });
}

export async function fetchUsers(): Promise<VPNUser[]> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/vpn/users`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  const data: VPNUsersApiResponse = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("Invalid API response format");
  }

  // Map API response to VPNUser type
  return data.data.map((user) => {
    // Map devices
    const devices: VPNDevice[] = user.devices.map((device) => ({
      id: device.deviceId,
      deviceId: device.deviceId,
      userId: user.userId,
      name: device.deviceName,
      deviceName: device.deviceName,
      type: mapDeviceType(device.deviceType),
      deviceType: device.deviceType,
      ip: device.ip,
      status: device.status as "active" | "disconnected",
      isConnected: device.isConnected,
      lastConnected: device.lastConnected,
      lastSeen: device.lastConnected,
      createdAt: device.createdAt,
    }));

    return {
      id: user.userId,
      userId: user.userId,
      email: user.email,
      ip: user.ip,
      publicKey: user.publicKey,
      status:
        user.status === "active"
          ? "active"
          : user.status === "disconnected"
            ? "disconnected"
            : "pending",
      dataUsageLimit: user.dataUsageLimit,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastConnected: user.lastConnected,
      deviceCount: user.deviceCount,
      connectedCount: user.connectedCount,
      devices,
      usageInfo: user.usageInfo,
      // Legacy fields for backward compatibility
      name: user.email.split("@")[0],
      dataUsed: user.usageInfo.totalGB,
      dataLimit: user.dataUsageLimit > 0 ? user.dataUsageLimit : null,
      expiresAt: null,
      lastConnection: user.lastConnected,
    };
  });
}

export async function fetchDevices(): Promise<VPNDevice[]> {
  const users = await fetchUsers();
  return users.flatMap((user) => user.devices);
}

export async function fetchUserDevices(userId: string): Promise<VPNDevice[]> {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Use port 8080 for admin operations
  const adminUrl = apiUrl.replace(":8091", ":8080");
  const response = await fetch(`${adminUrl}/vpn/users/${userId}/devices`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user devices: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("Invalid API response format");
  }

  // Map API response to VPNDevice type
  return data.data.map((device: VPNDeviceResponse) => ({
    id: device.deviceId,
    deviceId: device.deviceId,
    userId,
    name: device.deviceName,
    deviceName: device.deviceName,
    type: mapDeviceType(device.deviceType),
    deviceType: device.deviceType,
    ip: device.ip,
    publicKey: device.publicKey,
    status: device.status as "active" | "disconnected",
    isConnected: device.status === "active",
    lastConnected: device.lastConnected,
    lastSeen: device.lastConnected,
    createdAt: device.createdAt,
  }));
}

export async function fetchConnections(): Promise<VPNConnection[]> {
  // TODO: Enable this endpoint when it's ready
  // For now, return empty array to prevent API errors
  return [];
}

export async function generateConfig(
  deviceId: string,
  serverId: string,
  protocol: "wireguard" | "openvpn" | "ikev2",
): Promise<string> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/vpn/config/generate`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId,
        serverId,
        protocol,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate config: ${response.statusText}`);
    }

    const data = await response.json();

    if (typeof data.config !== "string") {
      throw new TypeError("Invalid config response");
    }

    return data.config;
  } catch (error) {
    // Fallback: Generate template config if API endpoint doesn't exist
    const servers = await fetchServers();
    const server = servers.find((s) => s.id === serverId);

    if (!server) {
      throw new Error("Server not found");
    }

    if (protocol === "wireguard") {
      return `[Interface]
PrivateKey = YOUR_PRIVATE_KEY_HERE
Address = 10.8.0.${Math.floor(Math.random() * 200) + 10}/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${server.serverPublicKey}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${server.publicIp}:${server.wireguardPort}
PersistentKeepalive = 25`;
    }

    if (protocol === "openvpn") {
      return `client
dev tun
proto udp
remote ${server.publicIp} ${server.wireguardPort}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth SHA256
cipher AES-256-GCM
verb 3

<ca>
-----BEGIN CERTIFICATE-----
YOUR_CA_CERTIFICATE_HERE
-----END CERTIFICATE-----
</ca>

<cert>
-----BEGIN CERTIFICATE-----
YOUR_CLIENT_CERTIFICATE_HERE
-----END CERTIFICATE-----
</cert>

<key>
-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
</key>`;
    }

    return `# IKEv2 Configuration for ${server.name}
# Server: ${server.publicIp}
# Import this profile into your device settings`;
  }
}

function mapDeviceType(type: string): VPNDevice["type"] {
  const normalized = type.toLowerCase();
  if (["desktop", "mobile", "router"].includes(normalized)) {
    return normalized as "desktop" | "mobile" | "router";
  }
  return normalized === "unknown" ? "unknown" : "other";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export async function createDevice(
  userId: string,
  deviceData: CreateVPNDeviceRequest,
): Promise<VPNDevice> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/vpn/users/${userId}/devices`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create device: ${response.statusText}`,
      );
    }

    const apiResponse: CreateVPNDeviceResponse = await response.json();

    // Map response to VPNDevice type
    const deviceType = apiResponse.deviceType || deviceData.deviceType;
    return {
      id: apiResponse.deviceId,
      deviceId: apiResponse.deviceId,
      userId,
      name: apiResponse.deviceName,
      deviceName: apiResponse.deviceName,
      type: ["desktop", "mobile", "router", "unknown"].includes(
        deviceType.toLowerCase(),
      )
        ? (deviceType.toLowerCase() as
            | "desktop"
            | "mobile"
            | "router"
            | "unknown")
        : "other",
      deviceType: deviceType,
      ip: apiResponse.ip,
      status: apiResponse.status as "active" | "disconnected",
      isConnected: apiResponse.isConnected,
      lastConnected: apiResponse.lastConnected,
      lastSeen: apiResponse.lastConnected,
      createdAt: apiResponse.createdAt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create device";
    throw new Error(message);
  }
}

export async function createServer(
  serverData: CreateVPNServerRequest,
): Promise<VPNServer> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/vpn/admin/servers`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serverData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create server: ${response.statusText}`,
      );
    }

    const responseData = await response.json();

    // Map response to VPNServer type with backward compatibility
    const server = responseData.data || responseData;
    return {
      id: server.id,
      name: server.name,
      location: server.location,
      countryCode: server.countryCode,
      publicIp: server.publicIp,
      agentUrl: server.agentUrl,
      wireguardPort: server.wireguardPort,
      serverPublicKey: server.serverPublicKey,
      networkCidr: server.networkCidr,
      maxClients: server.maxClients,
      currentClients: server.currentClients || 0,
      status: server.status === "active" ? "active" : "inactive",
      healthStatus: server.healthStatus || "healthy",
      latitude: server.latitude,
      longitude: server.longitude,
      createdAt: server.createdAt || new Date().toISOString(),
      updatedAt: server.updatedAt || new Date().toISOString(),
      regionCode: server.regionCode,
      bandwidthLimitMbps: server.bandwidthLimitMbps,
      // Legacy fields for backward compatibility
      ip: server.publicIp,
      port: server.wireguardPort,
      country: server.location,
      protocol: "wireguard",
      load: 0,
      maxConnections: server.maxClients,
      currentConnections: server.currentClients || 0,
      bandwidth: { upload: 0, download: 0 },
      lastHeartbeat: server.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create server";
    throw new Error(message);
  }
}

export async function fetchDeviceConfig(
  userId: string,
  deviceId: string,
  serverId: string,
): Promise<string> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(
    `${apiUrl}/vpn/users/${userId}/devices/${deviceId}/config?serverId=${serverId}`,
    {
      method: "GET",
      headers: {
        accept: "text/plain",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch device config: ${response.statusText}`);
  }

  return await response.text();
}

export async function deleteDevice(
  userId: string,
  deviceId: string,
): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(
    `${apiUrl}/vpn/users/${userId}/devices/${deviceId}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete device: ${response.statusText}`);
  }
}
