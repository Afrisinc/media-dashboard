// Platform Admin Types

export interface PlatformUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: string;
  lastLogin: string | null;
  updatedAt?: string;
  fullName?: string; // Computed from firstName + lastName
}

export interface AccountProduct {
  id: string;
  account_id: string;
  product_id: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  product: {
    id: string;
    name: string;
    code: string;
  };
}

export interface UserAccount {
  id: string;
  type: "INDIVIDUAL" | "ORGANIZATION";
  owner_user_id: string;
  organization_id: string | null;
  products: AccountProduct[];
}

export interface UserAccountsResponse {
  accounts: UserAccount[];
}

export interface AccountOwner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AccountProductEnrollment {
  id: string;
  account_id: string;
  product_id: string;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  product?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface PlatformAccount {
  id: string;
  type: "INDIVIDUAL" | "ORGANIZATION";
  owner_user_id: string;
  organization_id?: string | null;
  createdAt: string;
  updatedAt?: string;
  owner?: AccountOwner;
  products?: AccountProductEnrollment[];
  // Legacy fields for backward compatibility
  ownerEmail?: string;
  ownerName?: string;
  status?: "ACTIVE" | "SUSPENDED";
  enrolledProducts?: string[];
}

export interface OrganizationMember {
  id: string;
  organization_id?: string;
  user_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: "ACTIVE" | "SUSPENDED" | "PENDING";
  user?: {
    id: string;
    email: string;
  };
}

export interface PlatformOrganization {
  id: string;
  name: string;
  legal_name?: string;
  country?: string;
  tax_id?: string;
  org_email?: string;
  org_phone?: string;
  location?: string;
  members?: OrganizationMember[];
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  membersCount?: number;
  linkedAccountId?: string;
  linkedAccountName?: string;
  status?: "ACTIVE" | "SUSPENDED";
}

export interface ProductEnrollment {
  productId: string;
  productName: string;
  totalEnrollments: number;
  active: number;
  suspended: number;
  plans: { FREE: number; PRO: number; ENTERPRISE: number };
  accounts?: PlatformAccount[];
}

export interface PlatformOverview {
  totalUsers: number;
  totalAccounts: number;
  totalOrganizations: number;
  totalEnrollments: number;
  activeUsers: number;
  suspendedUsers: number;
  enrollmentsByProduct: { product: string; count: number }[];
  accountTypeSplit: { type: string; count: number }[];
}

export interface GrowthData {
  date: string;
  newUsers: number;
  newAccounts: number;
  newEnrollments: number;
}

export interface FailedLogin {
  id: string;
  email: string;
  ip: string;
  timestamp: string;
  reason: string;
}

export interface SecurityOverview {
  failedLogins24h: number;
  topIPs: { ip: string; attempts: number }[];
  tokenIssuanceCount: number;
  suspiciousActivity: boolean;
  failedLogins: FailedLogin[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { limit: number; offset: number; total: number };
}
