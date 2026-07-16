import type {
  PlatformOverview,
  PlatformUser,
  PlatformAccount,
  PlatformOrganization,
  OrganizationMember,
  ProductEnrollment,
  GrowthData,
  SecurityOverview,
  PaginatedResponse,
  UserAccountsResponse,
  AccountProduct,
  AccountProductEnrollment,
} from "@/types/platform";

import apiClient from "./apiClient";
import { QueryParams } from "@/types/shared";
import { LoginEventResponse } from "@/types/auth.security";

/* eslint-disable @typescript-eslint/no-explicit-any, no-useless-catch */

// Service functions

export async function fetchPlatformOverview(): Promise<PlatformOverview> {
  try {
    const { data } = await apiClient().get("/platform/analytics/overview");

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    const apiData = data.data;

    return {
      totalUsers: Number(apiData.total_users || 0),
      totalAccounts: Number(apiData.total_accounts || 0),
      totalOrganizations: Number(apiData.total_organizations || 0),
      totalEnrollments: Number(apiData.total_enrollments || 0),
      activeUsers: Number(apiData.active_enrollments || 0),
      suspendedUsers: Number(apiData.suspended_enrollments || 0),
      enrollmentsByProduct: (Array.isArray(apiData.products)
        ? apiData.products
        : []
      ).map((p: Record<string, unknown>) => ({
        product: String(p.product_code || "").toUpperCase(),
        count: Number(p.total_enrollments || 0),
      })),
      accountTypeSplit: [
        { type: "Individual", count: Number(apiData.individual_accounts || 0) },
        {
          type: "Organization",
          count: Number(apiData.organization_accounts || 0),
        },
      ],
    };
  } catch (error) {
    throw error;
  }
}

export async function fetchPlatformUsers(params: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<PlatformUser>> {
  try {
    const { limit = 10, offset = 0, search, status } = params;

    // Convert offset to page for API
    const page = Math.floor(offset / limit) + 1;

    // Call API
    const { data } = await apiClient().get("/users", {
      params: {
        page,
        limit,
        ...(search && { search }),
        ...(status && status !== "ALL" && { status }),
      },
    });

    // Validate response structure
    if (!data.success || !data.data?.data || !data.data?.pagination) {
      throw new Error("Invalid API response format");
    }

    // Map API response to PlatformUser interface
    const users: PlatformUser[] = data.data.data.map(
      (user: Omit<PlatformUser, "fullName">) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        location: user.location,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt,
        // Computed fullName for backward compatibility
        fullName:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          undefined,
      }),
    );

    // Convert API pagination to offset-based pagination
    const { pagination } = data.data;

    return {
      data: users,
      meta: {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        total: pagination.totalItems,
      },
    };
  } catch {
    // Error Error fetching users:", error);
    throw error;
  }
}

export async function fetchPlatformUserAccounts(
  user_id: string,
): Promise<UserAccountsResponse> {
  try {
    const { data } = await apiClient().get(`/accounts/user/${user_id}`);

    if (!data.success || !data.data?.accounts) {
      throw new Error("Invalid API response format");
    }

    return {
      accounts: data.data.accounts.map((account: Record<string, unknown>) => ({
        id: account.id as string,
        type: account.type as "INDIVIDUAL" | "ORGANIZATION",
        owner_user_id: account.owner_user_id as string,
        organization_id: account.organization_id as string | null,
        products: (account.products as AccountProduct[]) || [],
      })),
    };
  } catch {
    // Error Error fetching user accounts:", error);
    throw error;
  }
}

// Get all accounts with pagination
export async function fetchPlatformAccounts(params: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<PlatformAccount>> {
  try {
    const { limit = 10, offset = 0 } = params;
    const page = Math.floor(offset / limit) + 1;

    const { data } = await apiClient().get("/accounts/all", {
      params: {
        page,
        limit,
      },
    });

    if (!data.success || !data.data?.data) {
      throw new Error("Invalid API response format");
    }

    const accounts: PlatformAccount[] = data.data.data.map(
      (account: Record<string, unknown>) => {
        // Extract owner details
        const ownerData = (account.owner as Record<string, unknown>) || {};
        const owner = {
          id: String(ownerData.id || ""),
          email: String(ownerData.email || ""),
          firstName: ownerData.firstName
            ? String(ownerData.firstName)
            : undefined,
          lastName: ownerData.lastName ? String(ownerData.lastName) : undefined,
        };

        // Extract products
        const products = (
          Array.isArray(account.products) ? account.products : []
        ).map((product: Record<string, unknown>) => {
          const productData =
            (product.product as Record<string, unknown>) || {};
          return {
            id: String(product.id || ""),
            account_id: String(product.account_id || ""),
            product_id: String(product.product_id || ""),
            status: (product.status || "ACTIVE") as
              | "ACTIVE"
              | "SUSPENDED"
              | "PENDING",
            plan: (product.plan || "FREE") as "FREE" | "PRO" | "ENTERPRISE",
            product: {
              id: String(productData.id || ""),
              name: String(productData.name || ""),
              code: String(productData.code || ""),
            },
          };
        });

        return {
          id: String(account.id || ""),
          type: (account.type || "INDIVIDUAL") as "INDIVIDUAL" | "ORGANIZATION",
          owner_user_id: String(account.owner_user_id || ""),
          organization_id: account.organization_id
            ? String(account.organization_id)
            : null,
          createdAt: String(account.createdAt || ""),
          updatedAt: account.updatedAt ? String(account.updatedAt) : undefined,
          owner,
          products,
        };
      },
    );

    const { pagination } = data.data;

    return {
      data: accounts,
      meta: {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        total: pagination.totalItems,
      },
    };
  } catch {
    // Error Error fetching accounts:", error);
    throw error;
  }
}

// Enroll account in a product
export async function enrollAccountInProduct(
  accountId: string,
  productData: { product_code: string; plan: "FREE" | "PRO" | "ENTERPRISE" },
): Promise<AccountProductEnrollment> {
  try {
    const { data } = await apiClient().post(
      `/accounts/${accountId}/enroll-product`,
      productData,
    );

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    return {
      id: data.data.id,
      account_id: data.data.account_id,
      product_id: data.data.product_id,
      status: data.data.status,
      plan: data.data.plan,
    };
  } catch {
    // Error Error enrolling account in product:", error);
    throw error;
  }
}

// Get all organizations with pagination
export async function fetchPlatformOrganizations(params: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<PlatformOrganization>> {
  try {
    const { limit = 10, offset = 0 } = params;
    const page = Math.floor(offset / limit) + 1;

    const { data } = await apiClient().get("/organizations", {
      params: {
        page,
        limit,
      },
    });

    if (!data.success || !data.data?.data) {
      throw new Error("Invalid API response format");
    }

    const organizations: PlatformOrganization[] = data.data.data.map(
      (org: Record<string, unknown>) => ({
        id: org.id,
        name: org.name,
        legal_name: org.legal_name,
        country: org.country,
        tax_id: org.tax_id,
        org_email: org.org_email,
        org_phone: org.org_phone,
        location: org.location,
        members: org.members || [],
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      }),
    );

    const { pagination } = data.data;

    return {
      data: organizations,
      meta: {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        total: pagination.totalItems,
      },
    };
  } catch {
    // Error Error fetching organizations:", error);
    throw error;
  }
}

// Get organization details
export async function fetchPlatformOrganizationDetails(
  organizationId: string,
): Promise<PlatformOrganization> {
  try {
    const { data } = await apiClient().get(`/organizations/${organizationId}`);

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    return {
      id: data.data.id,
      name: data.data.name,
      legal_name: data.data.legal_name,
      country: data.data.country,
      tax_id: data.data.tax_id,
      org_email: data.data.org_email,
      org_phone: data.data.org_phone,
      location: data.data.location,
      members: data.data.members || [],
      createdAt: data.data.createdAt,
      updatedAt: data.data.updatedAt,
    };
  } catch {
    // Error Error fetching organization details:", error);
    throw error;
  }
}

// Create organization
export async function createPlatformOrganization(organizationData: {
  name: string;
  legal_name: string;
  country: string;
  tax_id: string;
  org_email: string;
  org_phone: string;
  location: string;
}): Promise<{ organization_id: string; account_id: string; name: string }> {
  try {
    const { data } = await apiClient().post("/organizations", organizationData);

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    return {
      organization_id: data.data.organization_id,
      account_id: data.data.account_id,
      name: data.data.name,
    };
  } catch {
    // Error Error creating organization:", error);
    throw error;
  }
}

// Update organization
export async function updatePlatformOrganization(
  organizationId: string,
  updateData: Partial<{
    name: string;
    legal_name: string;
    country: string;
    tax_id: string;
    org_email: string;
    org_phone: string;
    location: string;
  }>,
): Promise<PlatformOrganization> {
  try {
    const { data } = await apiClient().put(
      `/organizations/${organizationId}`,
      updateData,
    );

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    return {
      id: data.data.id,
      name: data.data.name,
      legal_name: data.data.legal_name,
      country: data.data.country,
      tax_id: data.data.tax_id,
      org_email: data.data.org_email,
      org_phone: data.data.org_phone,
      location: data.data.location,
      members: data.data.members || [],
      createdAt: data.data.createdAt,
      updatedAt: data.data.updatedAt,
    };
  } catch {
    // Error Error updating organization:", error);
    throw error;
  }
}

// Get organization members
export async function fetchPlatformOrganizationMembers(
  organizationId: string,
): Promise<{ members: OrganizationMember[] }> {
  try {
    const { data } = await apiClient().get(
      `/organizations/${organizationId}/members`,
    );

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    const members: OrganizationMember[] = data.data.members.map(
      (member: Record<string, unknown>) => ({
        id: member.id as string,
        organization_id: member.organization_id as string,
        user_id: member.user_id as string,
        role: member.role as "OWNER" | "ADMIN" | "MEMBER",
        email: member.email as string,
        firstName: member.firstName as string,
        lastName: member.lastName as string,
        phone: member.phone as string,
        status: member.status as "ACTIVE" | "SUSPENDED" | "PENDING",
      }),
    );

    return { members };
  } catch {
    // Error Error fetching organization members:", error);
    throw error;
  }
}

// Add organization member
export async function addPlatformOrganizationMember(
  organizationId: string,
  memberData: { user_id: string; role: "OWNER" | "ADMIN" | "MEMBER" },
): Promise<OrganizationMember> {
  try {
    const { data } = await apiClient().post(
      `/organizations/${organizationId}/members`,
      memberData,
    );

    if (!data.success) {
      throw new Error("Invalid API response format");
    }

    return data.data;
  } catch {
    // Error Error adding organization member:", error);
    throw error;
  }
}

// Remove organization member
export async function removePlatformOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<void> {
  try {
    const { data } = await apiClient().delete(
      `/organizations/${organizationId}/members/${userId}`,
    );

    if (!data.success) {
      throw new Error("Invalid API response format");
    }
  } catch {
    // Error Error removing organization member:", error);
    throw error;
  }
}

export async function fetchProductEnrollments(): Promise<ProductEnrollment[]> {
  try {
    const { data } = await apiClient().get("/products/enrollments");

    if (!data.success || !Array.isArray(data.data)) {
      throw new Error("Invalid API response format");
    }

    // Map API response to ProductEnrollment interface
    const products: ProductEnrollment[] = data.data.map(
      (product: Record<string, unknown>) => ({
        productId: String(product.productId || ""),
        productName: String(product.productName || ""),
        totalEnrollments: Number(product.totalEnrollments || 0),
        active: Number(product.active || 0),
        suspended: Number(product.suspended || 0),
        plans: {
          FREE: Number((product.plans as Record<string, unknown>)?.FREE || 0),
          PRO: Number((product.plans as Record<string, unknown>)?.PRO || 0),
          ENTERPRISE: Number(
            (product.plans as Record<string, unknown>)?.ENTERPRISE || 0,
          ),
        },
      }),
    );

    return products;
  } catch {
    // Error Error fetching product enrollments:", error);
    throw error;
  }
}

export async function fetchProductAccounts(
  productId: string,
): Promise<PlatformAccount[]> {
  try {
    const { data } = await apiClient().get(`/products/${productId}/accounts`);

    if (!data.success || !data.data?.accounts) {
      throw new Error("Invalid API response format");
    }

    // Map API response to PlatformAccount interface
    const accounts: PlatformAccount[] = data.data.accounts.map(
      (account: Record<string, unknown>) => {
        const ownerData = (account.owner as Record<string, unknown>) || {};

        return {
          id: String(account.id || ""),
          type: (account.type || "INDIVIDUAL") as "INDIVIDUAL" | "ORGANIZATION",
          owner_user_id: String(account.owner_user_id || ""),
          organization_id: account.organization_id
            ? String(account.organization_id)
            : null,
          createdAt: String(account.createdAt || ""),
          updatedAt: account.updatedAt ? String(account.updatedAt) : undefined,
          owner: {
            id: String(ownerData.id || ""),
            email: String(ownerData.email || ""),
            firstName: ownerData.firstName
              ? String(ownerData.firstName)
              : undefined,
            lastName: ownerData.lastName
              ? String(ownerData.lastName)
              : undefined,
          },
          // Include backward compatibility field for ownerName
          ownerName:
            [ownerData.firstName, ownerData.lastName]
              .filter(Boolean)
              .join(" ") || undefined,
          status: (account.status || "ACTIVE") as "ACTIVE" | "SUSPENDED",
          products: undefined, // Not needed for drill-down view
        };
      },
    );

    return accounts;
  } catch {
    // Error Error fetching product accounts:", error);
    throw error;
  }
}

// Create a new product
export async function createProduct(productData: {
  name: string;
  code: string;
  description?: string;
}): Promise<{
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}> {
  try {
    const { data } = await apiClient().post("/products", productData);

    if (!data.success) {
      const errorMessage = data.resp_msg || "Failed to create product";
      const error = new Error(errorMessage);
      (error as any).resp_code = data.resp_code;
      throw error;
    }

    if (!data.data) {
      throw new Error("Invalid API response format");
    }

    return {
      id: String(data.data.id || ""),
      name: String(data.data.name || ""),
      code: String(data.data.code || ""),
      description: data.data.description
        ? String(data.data.description)
        : undefined,
      createdAt: String(data.data.createdAt || ""),
      updatedAt: String(data.data.updatedAt || ""),
    };
  } catch (error: any) {
    // Handle Axios error responses
    if (error.response?.data?.resp_msg) {
      const err = new Error(error.response.data.resp_msg);
      (err as any).resp_code = error.response.data.resp_code;
      throw err;
    }

    // Re-throw other errors
    throw error;
  }
}

export async function fetchGrowthData(
  range: "7d" | "30d" | "90d",
): Promise<GrowthData[]> {
  try {
    const { data } = await apiClient().get("/platform/analytics/growth", {
      params: { range },
    });

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    const apiData = data.data;

    // Combine users, accounts, and enrollments data by date
    const dateMap = new Map<string, GrowthData>();

    // Process users data
    if (Array.isArray(apiData.users)) {
      apiData.users.forEach((item: Record<string, unknown>) => {
        const date = String(item.date || "");
        const existing = dateMap.get(date) || {
          date,
          newUsers: 0,
          newAccounts: 0,
          newEnrollments: 0,
        };
        existing.newUsers = Number(item.count || 0);
        dateMap.set(date, existing);
      });
    }

    // Process accounts data
    if (Array.isArray(apiData.accounts)) {
      apiData.accounts.forEach((item: Record<string, unknown>) => {
        const date = String(item.date || "");
        const existing = dateMap.get(date) || {
          date,
          newUsers: 0,
          newAccounts: 0,
          newEnrollments: 0,
        };
        existing.newAccounts = Number(item.count || 0);
        dateMap.set(date, existing);
      });
    }

    // Process enrollments data
    if (Array.isArray(apiData.enrollments)) {
      apiData.enrollments.forEach((item: Record<string, unknown>) => {
        const date = String(item.date || "");
        const existing = dateMap.get(date) || {
          date,
          newUsers: 0,
          newAccounts: 0,
          newEnrollments: 0,
        };
        existing.newEnrollments = Number(item.count || 0);
        dateMap.set(date, existing);
      });
    }

    // Convert map to sorted array
    const growthData = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return growthData;
  } catch {
    // Error Error fetching growth data:", error);
    throw error;
  }
}

export async function fetchSecurityOverview(): Promise<SecurityOverview> {
  try {
    const { data } = await apiClient().get("/platform/security/overview");

    if (!data.success || !data.data) {
      throw new Error("Invalid API response format");
    }

    const apiData = data.data;

    return {
      failedLogins24h: Number(apiData.failedLogins24h || 0),
      topIPs: (Array.isArray(apiData.topIPs) ? apiData.topIPs : []).map(
        (ip: Record<string, unknown>) => ({
          ip: String(ip.ip || ""),
          attempts: Number(ip.attempts || 0),
        }),
      ),
      tokenIssuanceCount: Number(apiData.tokenIssuanceCount || 0),
      suspiciousActivity: Boolean(apiData.suspiciousActivity || false),
      failedLogins: (Array.isArray(apiData.failedLogins)
        ? apiData.failedLogins
        : []
      ).map((fl: Record<string, unknown>) => ({
        id: String(fl.id || ""),
        email: String(fl.email || ""),
        ip: String(fl.ip || ""),
        timestamp: String(fl.timestamp || ""),
        reason: String(fl.reason || ""),
      })),
    };
  } catch {
    // Error Error fetching security overview:", error);
    throw error;
  }
}

export async function suspendUser(userId: string): Promise<void> {
  try {
    const { data } = await apiClient().post(`/users/${userId}/suspend`);

    if (!data.success) {
      throw new Error("Failed to suspend user");
    }
  } catch {
    // Error Error suspending user:", error);
    throw error;
  }
}

export async function reactivateUser(userId: string): Promise<void> {
  try {
    const { data } = await apiClient().post(`/users/${userId}/reactivate`);

    if (!data.success) {
      throw new Error("Failed to reactivate user");
    }
  } catch {
    // Error Error reactivating user:", error);
    throw error;
  }
}

export async function suspendAccount(accountId: string): Promise<void> {
  try {
    const { data } = await apiClient().post(`/accounts/${accountId}/suspend`);

    if (!data.success) {
      throw new Error("Failed to suspend account");
    }
  } catch {
    // Error Error suspending account:", error);
    throw error;
  }
}

export async function LoginEvents(
  params?: QueryParams,
): Promise<PaginatedResponse<LoginEventResponse>> {
  try {
    const { page = 1, limit = 10, search, sortBy = "desc" } = params || {};

    const { data } = await apiClient().get("/platform/security/loginevents", {
      params: {
        page,
        limit,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
      },
    });

    if (!data.success) {
      throw new Error("Failed to fetch login events");
    }

    const { pagination } = data.data;

    return {
      data: data.data.data,
      meta: {
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        total: pagination.total,
      },
    };
  } catch {
    // Error Error fetching login events:", error);
    throw error;
  }
}

// Get product by ID
export async function getProductById(productId: string): Promise<{
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}> {
  try {
    const { data } = await apiClient().get(`/products/${productId}`);

    if (!data.success || !data.data) {
      throw new Error("Failed to fetch product details");
    }

    return {
      id: String(data.data.id || ""),
      name: String(data.data.name || ""),
      code: String(data.data.code || ""),
      description: data.data.description
        ? String(data.data.description)
        : undefined,
      status: String(data.data.status || "ACTIVE"),
      createdAt: String(data.data.createdAt || ""),
      updatedAt: String(data.data.updatedAt || ""),
    };
  } catch (error) {
    throw error;
  }
}

// Update product
export async function updateProduct(
  productId: string,
  updateData: {
    name?: string;
    description?: string;
    status?: string;
  },
): Promise<{
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  updatedAt: string;
}> {
  try {
    const { data } = await apiClient().put(
      `/products/${productId}`,
      updateData,
    );

    if (!data.success) {
      const errorMessage = data.resp_msg || "Failed to update product";
      const error = new Error(errorMessage);
      (error as any).resp_code = data.resp_code;
      throw error;
    }

    if (!data.data) {
      throw new Error("Invalid API response format");
    }

    return {
      id: String(data.data.id || ""),
      name: String(data.data.name || ""),
      code: String(data.data.code || ""),
      description: data.data.description
        ? String(data.data.description)
        : undefined,
      status: String(data.data.status || "ACTIVE"),
      updatedAt: String(data.data.updatedAt || ""),
    };
  } catch (error: any) {
    // Handle Axios error responses
    if (error.response?.data?.resp_msg) {
      const err = new Error(error.response.data.resp_msg);
      (err as any).resp_code = error.response.data.resp_code;
      throw err;
    }

    // Re-throw other errors
    throw error;
  }
}
