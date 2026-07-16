export interface VPNServer {
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
  status: "active" | "inactive" | "maintenance";
  healthStatus: "healthy" | "degraded" | "unhealthy";
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;

  // Server creation fields
  regionCode?: string;
  bandwidthLimitMbps?: number;
  agentApiKey?: string;

  // Legacy fields for backward compatibility
  ip?: string;
  port?: number;
  country?: string;
  protocol?: "wireguard" | "openvpn" | "ikev2";
  load?: number;
  maxConnections?: number;
  currentConnections?: number;
  bandwidth?: {
    upload: number;
    download: number;
  };
  lastHeartbeat?: string;
}

export interface VPNUser {
  id: string;
  email: string;
  status: "active" | "suspended" | "disconnected" | "pending";
  devices: VPNDevice[];
  createdAt: string;

  // API fields
  userId?: string;
  ip?: string;
  publicKey?: string;
  dataUsageLimit?: number;
  updatedAt?: string;
  lastConnected?: string | null;
  deviceCount?: number;
  connectedCount?: number;
  usageInfo?: {
    totalBytesSent: number;
    totalBytesReceived: number;
    totalBytes: number;
    totalGB: number;
    limitGB: number;
    usedPercentage: number;
    remainingGB: number;
  };

  // Legacy fields for backward compatibility
  name?: string;
  dataUsed?: number;
  dataLimit?: number | null;
  expiresAt?: string | null;
  lastConnection?: string | null;
}

export interface VPNDevice {
  id: string;
  userId: string;
  name: string;
  type: "desktop" | "mobile" | "router" | "unknown" | "other";
  isConnected: boolean;
  createdAt: string;

  // API fields
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  ip?: string;
  status?: "active" | "disconnected";
  lastConnected?: string | null;

  // Legacy fields for backward compatibility
  os?: "windows" | "macos" | "linux" | "ios" | "android" | "other";
  publicKey?: string;
  lastIp?: string | null;
  lastSeen?: string | null;
}

export interface VPNConnection {
  id: string;
  userId: string;
  userName: string;
  deviceId: string;
  deviceName: string;
  serverId: string;
  serverName: string;
  serverLocation: string;
  protocol: "wireguard" | "openvpn" | "ikev2";
  clientIp: string;
  assignedIp: string;
  bytesIn: number;
  bytesOut: number;
  connectedAt: string;
  duration: number; // seconds
}

export interface VPNConfig {
  id: string;
  deviceId: string;
  serverId: string;
  protocol: "wireguard" | "openvpn" | "ikev2";
  config: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface VPNStats {
  totalServers: number;
  onlineServers: number;
  totalUsers: number;
  activeUsers: number;
  activeConnections: number;
  totalBandwidth: {
    upload: number;
    download: number;
  };
}
