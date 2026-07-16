import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPlatformOverview,
  fetchPlatformUsers,
  fetchPlatformAccounts,
  fetchPlatformOrganizations,
  fetchPlatformOrganizationDetails,
  fetchPlatformOrganizationMembers,
  fetchProductEnrollments,
  fetchProductAccounts,
  fetchGrowthData,
  fetchSecurityOverview,
  fetchPlatformUserAccounts,
  createPlatformOrganization,
  updatePlatformOrganization,
  addPlatformOrganizationMember,
  removePlatformOrganizationMember,
  suspendUser,
  reactivateUser,
  suspendAccount,
  enrollAccountInProduct,
  createProduct,
  getProductById,
  updateProduct,
  LoginEvents,
} from "@/services/platformService";
import { QueryParams } from "@/types/shared";

export const usePlatformOverview = () =>
  useQuery({
    queryKey: ["platform", "overview"],
    queryFn: fetchPlatformOverview,
  });

export const usePlatformUsers = (params: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) =>
  useQuery({
    queryKey: ["platform", "users", params],
    queryFn: () => fetchPlatformUsers(params),
  });

export const usePlatformAccounts = (params: {
  type?: string;
  limit?: number;
  offset?: number;
}) =>
  useQuery({
    queryKey: ["platform", "accounts", params],
    queryFn: () => fetchPlatformAccounts(params),
  });

export const usePlatformUserAccounts = (userId: string | null) =>
  useQuery({
    queryKey: ["platform", "user-accounts", userId],
    queryFn: () => fetchPlatformUserAccounts(userId!),
    enabled: !!userId,
  });

export const usePlatformOrganizations = (params: {
  limit?: number;
  offset?: number;
}) =>
  useQuery({
    queryKey: ["platform", "organizations", params],
    queryFn: () => fetchPlatformOrganizations(params),
  });

export const useProductEnrollments = () =>
  useQuery({
    queryKey: ["platform", "products"],
    queryFn: fetchProductEnrollments,
  });

export const useProductAccounts = (productId: string) =>
  useQuery({
    queryKey: ["platform", "product-accounts", productId],
    queryFn: () => fetchProductAccounts(productId),
    enabled: !!productId,
  });

export const useGrowthData = (range: "7d" | "30d" | "90d") =>
  useQuery({
    queryKey: ["platform", "growth", range],
    queryFn: () => fetchGrowthData(range),
  });

export const useSecurityOverview = () =>
  useQuery({
    queryKey: ["platform", "security"],
    queryFn: fetchSecurityOverview,
  });

export const useLoginEvents = (params?: QueryParams) =>
  useQuery({
    queryKey: ["platform", "login-events", params],
    queryFn: () => LoginEvents(params),
  });

export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suspendUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform", "users"] }),
  });
};

export const useReactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform", "users"] }),
  });
};

export const useSuspendAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: suspendAccount,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["platform", "accounts"] }),
  });
};

// Organization hooks
export const usePlatformOrganizationDetails = (organizationId: string | null) =>
  useQuery({
    queryKey: ["platform", "organization-details", organizationId],
    queryFn: () => fetchPlatformOrganizationDetails(organizationId!),
    enabled: !!organizationId,
  });

export const usePlatformOrganizationMembers = (organizationId: string | null) =>
  useQuery({
    queryKey: ["platform", "organization-members", organizationId],
    queryFn: () => fetchPlatformOrganizationMembers(organizationId!),
    enabled: !!organizationId,
  });

export const useCreatePlatformOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPlatformOrganization,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["platform", "organizations"] }),
  });
};

export const useUpdatePlatformOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      updateData,
    }: {
      organizationId: string;
      updateData: Parameters<typeof updatePlatformOrganization>[1];
    }) => updatePlatformOrganization(organizationId, updateData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform", "organizations"] });
      qc.invalidateQueries({ queryKey: ["platform", "organization-details"] });
    },
  });
};

export const useAddPlatformOrganizationMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      memberData,
    }: {
      organizationId: string;
      memberData: { user_id: string; role: "OWNER" | "ADMIN" | "MEMBER" };
    }) => addPlatformOrganizationMember(organizationId, memberData),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["platform", "organization-members"] }),
  });
};

export const useRemovePlatformOrganizationMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
    }: {
      organizationId: string;
      userId: string;
    }) => removePlatformOrganizationMember(organizationId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["platform", "organization-members"] }),
  });
};

// Account hooks
export const useEnrollAccountInProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      productData,
    }: {
      accountId: string;
      productData: {
        product_code: string;
        plan: "FREE" | "PRO" | "ENTERPRISE";
      };
    }) => enrollAccountInProduct(accountId, productData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform", "accounts"] });
    },
  });
};

// Product hooks
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productData: {
      name: string;
      code: string;
      description?: string;
    }) => createProduct(productData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform", "products"] });
    },
  });
};

export const useProductById = (productId: string | null) =>
  useQuery({
    queryKey: ["platform", "product-details", productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
  });

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      updateData,
    }: {
      productId: string;
      updateData: { name?: string; description?: string; status?: string };
    }) => updateProduct(productId, updateData),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({
        queryKey: ["platform", "product-details", productId],
      });
      qc.invalidateQueries({ queryKey: ["platform", "products"] });
    },
  });
};
