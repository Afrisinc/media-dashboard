import apiClient from "./apiClient";

// Service endpoints for notification product
export const notificationProductService = {
  // Analytics Endpoints
  getAnalyticsOverview: async () => {
    const { data } = await apiClient().get("/notifications/analytics/overview");
    return data;
  },

  getAnalyticsUsers: async () => {
    const { data } = await apiClient().get("/notifications/analytics/users");
    return data;
  },

  getAnalyticsAccounts: async () => {
    const { data } = await apiClient().get("/notifications/analytics/accounts");
    return data;
  },

  getAnalyticsGrowth: async () => {
    const { data } = await apiClient().get("/notifications/analytics/growth");
    return data;
  },

  // Users Endpoints
  getAllUsers: async () => {
    const { data } = await apiClient().get("/notifications/users");
    return data;
  },

  getUserById: async (userId: string) => {
    const { data } = await apiClient().get(`/notifications/users/${userId}`);
    return data;
  },

  // Security Endpoints
  getSecurityOverview: async () => {
    const { data } = await apiClient().get("/notifications/security/overview");
    return data;
  },

  getSecurityLoginEvents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const { data } = await apiClient().get(
      "/notifications/security/loginevents",
      { params },
    );
    return data;
  },
};
