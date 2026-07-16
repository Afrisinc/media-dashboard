import { useQuery } from "@tanstack/react-query";
import { notificationProductService } from "@/services/notificationProduct";

// Analytics Hooks
export const useNotificationAnalyticsOverview = () =>
  useQuery({
    queryKey: ["notifications", "analytics", "overview"],
    queryFn: notificationProductService.getAnalyticsOverview,
  });

export const useNotificationAnalyticsUsers = () =>
  useQuery({
    queryKey: ["notifications", "analytics", "users"],
    queryFn: notificationProductService.getAnalyticsUsers,
  });

export const useNotificationAnalyticsAccounts = () =>
  useQuery({
    queryKey: ["notifications", "analytics", "accounts"],
    queryFn: notificationProductService.getAnalyticsAccounts,
  });

export const useNotificationAnalyticsGrowth = () =>
  useQuery({
    queryKey: ["notifications", "analytics", "growth"],
    queryFn: notificationProductService.getAnalyticsGrowth,
  });

// Users Hooks
export const useNotificationUsers = () =>
  useQuery({
    queryKey: ["notifications", "users"],
    queryFn: notificationProductService.getAllUsers,
  });

export const useNotificationUserById = (userId: string | null) =>
  useQuery({
    queryKey: ["notifications", "user", userId],
    queryFn: () => notificationProductService.getUserById(userId!),
    enabled: !!userId,
  });

// Security Hooks
export const useNotificationSecurityOverview = () =>
  useQuery({
    queryKey: ["notifications", "security", "overview"],
    queryFn: notificationProductService.getSecurityOverview,
  });

export const useNotificationSecurityLoginEvents = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: ["notifications", "security", "login-events", params],
    queryFn: () => notificationProductService.getSecurityLoginEvents(params),
  });
