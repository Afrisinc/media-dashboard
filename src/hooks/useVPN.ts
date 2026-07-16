import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchVPNStats,
  fetchServers,
  fetchUsers,
  fetchDevices,
  fetchConnections,
  generateConfig,
  createServer,
  createDevice,
  fetchDeviceConfig,
  deleteDevice,
  CreateVPNServerRequest,
  CreateVPNDeviceRequest,
} from "@/services/vpnService";

export function useVPNStats() {
  return useQuery({
    queryKey: ["vpn", "stats"],
    queryFn: fetchVPNStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useVPNServers() {
  return useQuery({
    queryKey: ["vpn", "servers"],
    queryFn: fetchServers,
    refetchInterval: 60000,
  });
}

export function useVPNUsers() {
  return useQuery({
    queryKey: ["vpn", "users"],
    queryFn: fetchUsers,
  });
}

export function useVPNDevices() {
  return useQuery({
    queryKey: ["vpn", "devices"],
    queryFn: fetchDevices,
  });
}

export function useVPNConnections() {
  return useQuery({
    queryKey: ["vpn", "connections"],
    queryFn: fetchConnections,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

export function useGenerateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      serverId,
      protocol,
    }: {
      deviceId: string;
      serverId: string;
      protocol: "wireguard" | "openvpn" | "ikev2";
    }) => generateConfig(deviceId, serverId, protocol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vpn"] });
    },
  });
}

export function useCreateServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serverData: CreateVPNServerRequest) =>
      createServer(serverData),
    onSuccess: async () => {
      // Refetch queries to immediately show the newly created server
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["vpn", "servers"] }),
        queryClient.refetchQueries({ queryKey: ["vpn", "stats"] }),
      ]);
    },
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      deviceData,
    }: {
      userId: string;
      deviceData: CreateVPNDeviceRequest;
    }) => createDevice(userId, deviceData),
    onSuccess: async () => {
      // Refetch queries to immediately show the newly created device
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["vpn", "users"] }),
        queryClient.refetchQueries({ queryKey: ["vpn", "devices"] }),
        queryClient.refetchQueries({ queryKey: ["vpn", "stats"] }),
      ]);
    },
  });
}

export function useDeviceConfig() {
  return useMutation({
    mutationFn: ({
      userId,
      deviceId,
      serverId,
    }: {
      userId: string;
      deviceId: string;
      serverId: string;
    }) => fetchDeviceConfig(userId, deviceId, serverId),
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, deviceId }: { userId: string; deviceId: string }) =>
      deleteDevice(userId, deviceId),
    onSuccess: async () => {
      // Refetch queries to immediately reflect device deletion
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["vpn", "users"] }),
        queryClient.refetchQueries({ queryKey: ["vpn", "devices"] }),
        queryClient.refetchQueries({ queryKey: ["vpn", "stats"] }),
      ]);
    },
  });
}
